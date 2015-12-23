var groupsColors = ['#fb8c00', '#1976d2'];
var the_sum = 100000;
var path;

function drawDonutChart(container_id) {
  var chart = anychart.pie();
  chart.interactivity('single');
  chart.legend(false);
  chart.radius('40%');
  chart.innerRadius('60%');
  chart.padding(0);
  chart.margin(0);
  chart.labels(false);
  var stage = anychart.graphics.create(container_id);
  chart.container(stage);
  path = stage.path().stroke(null).zIndex(10);
  chart.draw();
  return chart;
}

function changeDonutData(chart, data){
  chart.listen('pointshover', function (e) {
    drawHUINYA(e.point, chart)
  });

  function createChartLabel(index, anchor, groupName, groupColor) {
    var label = chart.label(index).useHtml(true);
    label.text(
      '<span style="font-size: 26px;">' + 50 + '%</span>' +
      '<br><span style="font-size: 15px; font-weight: normal">' + groupName.toUpperCase() + '</span>');
    label.position('center');
    label.fontColor(groupColor);
    label.anchor(anchor);
    label.offsetY(-10);
    label.offsetX(10);
    label.hAlign('center');

    label.listen('mouseOver', function () {
      document.body.style.cursor = 'pointer';
      var groupIndexes = [0, 1, 2, 3, 4];
      chart.unhover();
      chart.hover(groupIndexes);
      path.clear();
      for(var i=0;i<groupIndexes.length;i++){
        drawHUINYA(chart.getPoint(i), chart, true);
      }
    });

    label.listen('mouseOut', function () {
      document.body.style.cursor = '';
      chart.unhover();
      path.clear();
    });
  }
  createChartLabel(0, 'left', 'bonds', '#ffa760');
  createChartLabel(1, 'right', 'stocks', '#6fc0fe');
  chart.data(data['data']);
  //console.log(data)
}

function drawHUINYA(point, chart, needClear){
    var colorFill = '#ffa760';
    //if (data['data'][point.index]['group'] == 'bonds') colorFill = '#6fc0fe';
    drawArc(point, chart, colorFill, path, !needClear)
}

function getDataInProportion(data, proportion){
  var result = {"data": []};
  for (var j = 0; j < proportion.length; j++) {
    var group_palette = anychart.palettes.distinctColors(anychart.color.singleHueProgression(groupsColors[j], proportion[j][0] + 1));

    for (var i = 0; i < proportion[j][0]; i++) {
      var point = data[proportion[j][1]][i];
      point['name'] = data[proportion[j][1]][i]['ticker'];
      point['group'] = proportion[j][1];
      point['full_name'] = data[proportion[j][1]][i]['name'];
      point['fill'] = group_palette.colorAt(proportion[j][0] - i);
      point['hoverFill'] = anychart.color.lighten(group_palette.colorAt(proportion[j][0] - i));
      //point['hoverFill'] = 'red';
      point['stroke'] = null;
      point['hoverStroke'] = null;

      result["data"].push(point)
    }
  }
  return result
}

anychart.onDocumentReady(function () {
  var donutChart =  drawDonutChart('container-1-1');
  $.getJSON("./src/data/StocksViaBonds.json", function (data) {
    var data_adapted = getDataInProportion(data, [[5, "stocks"], [5, "bonds"]]);
    changeDonutData(donutChart, data_adapted);
  });
});




