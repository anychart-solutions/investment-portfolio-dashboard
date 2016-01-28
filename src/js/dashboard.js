var groupsColors = ['#fb8c00', '#1976d2'];
var the_sum = 100000;
var path;
var stock_bonds_data;

function drawDonutChart(container_id) {
  var chart = anychart.pie();
  chart.interactivity('single');
  chart.legend(false);
  chart.radius('40%');
  chart.innerRadius('60%');
  chart.padding(0);
  chart.margin(0);
  chart.explode(0);
  chart.labels(false);
  var stage = anychart.graphics.create(container_id);
  chart.container(stage);
  path = stage.path().stroke(null).zIndex(10);
  chart.draw();
  return chart;
}

function changeDonutData(chart, data){

  chart.listen('pointshover', function (e) {
    drawHUINYA(e.point, chart, data)
  });
  function createChartLabel(index, anchor, groupName, groupColor) {
    var label = chart.label(index).useHtml(true);
    label.text(
      '<span style="font-size: 26px;">' + data.proportion[index][0] + '</span>' +
      '<br><span style="font-size: 15px; font-weight: normal">' + groupName.toUpperCase() + '</span>');
    label.position('center');
    label.fontColor(groupColor);
    label.anchor(anchor);
    label.offsetY(-10);
    label.offsetX(10);
    label.hAlign('center');
    label.listen('mouseOver', function () {
      document.body.style.cursor = 'pointer';
      var groupIndexes = [];
      for (i = 0; i < data['data'].length; i++){
        if (data['data'][i]["group"] == groupName) groupIndexes.push(i)
      }
      chart.unhover();
      chart.hover(groupIndexes);
      path.clear();
      for (var i = 0; i < groupIndexes.length; i++){
        drawHUINYA(chart.getPoint(groupIndexes[i]), chart, data, true);
      }
    });
    label.listen('mouseOut', function () {
      document.body.style.cursor = '';
      chart.unhover();
      path.clear();
    });
  }
  createChartLabel(0, 'left', 'stocks', '#ffa760');
  createChartLabel(1, 'right', 'bonds', '#6fc0fe');
  chart.data(data['data']);
}

function drawHUINYA(point, chart, data, needClear){
    var colorFill = '#ffa760';
    if (data['data'][point.index]['group'] == 'bonds') colorFill = '#6fc0fe';
    drawArc(point, chart, colorFill, path, !needClear)
}

function getDataInProportion(data, proportion){
  var sum_1 = (the_sum * proportion[0][0])/(proportion[0][0] + proportion[1][0]);
  var sum_2 = the_sum - sum_1;
  //console.log(sum_1, sum_2);
  //console.log(data.stocks.length);
  //console.log(data.bonds.length);
  // тут нужно рещить задачу о рюкзаке к данным добавить риски


  var result = {"data": [], "proportion": proportion};
  for (var j = 0; j < proportion.length; j++) {
    var group_palette = anychart.palettes.distinctColors(anychart.color.singleHueProgression(groupsColors[j], proportion[j][0] + 1));
    for (var i = 0; i < proportion[j][0]; i++) {
      var point = data[proportion[j][1]][i];
      point['name'] = data[proportion[j][1]][i]['ticker'];
      point['group'] = proportion[j][1];
      point['full_name'] = data[proportion[j][1]][i]['name'];
      point['fill'] = group_palette.colorAt(proportion[j][0] - i);
      point['hoverFill'] = anychart.color.lighten(anychart.color.lighten(group_palette.colorAt(proportion[j][0] - i)));
      point['stroke'] = null;
      point['hoverStroke'] = null;
      result["data"].push(point)
    }
  }
  return result
}

anychart.onDocumentReady(function () {
  var proportionsChange = function () {
    // todo: get 10?

    var stocks = Math.abs(proportionsResult.getValue());
    var bonds = (10 - Math.abs(proportionsResult.getValue()));
    if (proportionsResult.getValue() == 0) {
      stocks = 5;
      bonds = 5;
    }
    var data_adapted = getDataInProportion(stock_bonds_data, [[stocks, "stocks"], [bonds, "bonds"]]);
    changeDonutData(donutChart, data_adapted);
    $('#proportionsResults').html('<span class="pull-left">' + stocks + ' Stocks</span>'+
    '<span class="pull-right">' + bonds + ' Bonds</span>');
  };
  var proportionsResult = $('#proportionsSlider').slider()
      .on('change', proportionsChange)
      .data('slider');

  var timeLineChange = function () {

  };
  var timeLine = $('#timeLineSlider').slider()
      .on('change', timeLineChange)
      .data('slider');


  var donutChart =  drawDonutChart('container-1-1');
  $.getJSON("./src/data/StocksViaBonds.json", function (data) {
    stock_bonds_data = data;
    var data_adapted = getDataInProportion(stock_bonds_data, [[5, "stocks"], [5, "bonds"]]);
    changeDonutData(donutChart, data_adapted);
  });

});




