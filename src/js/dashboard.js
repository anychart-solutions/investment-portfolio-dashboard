var the_sum = 50000;
var groupsColors = ['#fb8c00', '#1976d2'];

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
  var dataset = anychart.data.set();
  chart.data(dataset);
  var stage = anychart.graphics.create(container_id);
  chart.container(stage);
  var path = stage.path().stroke(null).zIndex(10);
  chart.draw();
  return {'chart': chart, 'path': path, 'dataset': dataset};
}

function updateDonutListeners(donutData, instrumentsTable){
  var groupIndexes = [];
  donutData['chart'].listen('pointshover', function (e) {
        drawHoverArc(e.point, donutData['chart'], donutData['data'], donutData['path']);
        groupIndexes = [];
        var colorFill = '#ffa760';
        if (donutData['data'][e.point.index]['group'] == 'bonds') colorFill = '#6fc0fe';
        if ($('#table-container').is(':visible')) {
          groupIndexes = [e.point.index];
          highLightRowInTable(groupIndexes, instrumentsTable, colorFill + ' 0.3')
        }
      });
  donutData['chart'].listen('mouseout', function (e) {
        if ($('#table-container').is(':visible')) highLightRowInTable(groupIndexes, instrumentsTable, null);
      });

  function createChartLabel(index, anchor, groupName, groupColor) {
    var label = donutData['chart'].label(index).useHtml(true);
    label.position('center');
    label.fontColor(groupColor);
    label.anchor(anchor);
    label.offsetY(-10);
    label.offsetX(10);
    label.hAlign('center');
    label.listen('mouseOver', function () {
      document.body.style.cursor = 'pointer';
      groupIndexes = [];
      for (i = 0; i < donutData['data'].length; i++){
        if (donutData['data'][i]["group"] == groupName) groupIndexes.push(i)
      }
      if ($('#table-container').is(':visible')) highLightRowInTable(groupIndexes, instrumentsTable, groupColor + ' 0.3');

      donutData['chart'].unhover();
      donutData['chart'].hover(groupIndexes);
      donutData['path'].clear();
      for (var i = 0; i < groupIndexes.length; i++){
        drawHoverArc(donutData['chart'].getPoint(groupIndexes[i]), donutData['chart'], donutData['data'], donutData['path'], true);
      }
    });
    label.listen('mouseOut', function () {
      document.body.style.cursor = '';
      donutData['chart'].unhover();
      donutData['path'].clear();
      if ($('#table-container').is(':visible')) highLightRowInTable(groupIndexes, instrumentsTable, null);
    });
  }
  createChartLabel(0, 'left-center', 'stocks', '#ffa760');
  createChartLabel(1, 'right-center', 'bonds', '#6fc0fe');
}

function drawForecastChart(container_id) {
  var chart = anychart.area();
  chart.padding(20);
  chart.tooltip().useHtml(true);
  var lineDataset = anychart.data.set();
  chart.spline(lineDataset).stroke('#64b5f6').tooltip()
    .format(function(){
      return '<span style="color: #d9d9d9">Forecast:</span> $' + this.value.toLocaleString();
  });
  var rangeDataset = anychart.data.set();
  var series = chart.rangeSplineArea(rangeDataset);
  series
      .fill('#64b5f6 0.3')
      .highStroke(null)
      .lowStroke(null);
  series.hovered().markers(null);
  series.tooltip().format(function(){
    return '<br/><span style="color: #d9d9d9">High:</span> $' + this.high.toLocaleString() +
        '<br/><span style="color: #d9d9d9">Low:</span> $' + this.low.toLocaleString();
  });
  chart.tooltip().displayMode('union');
  chart.yAxis().labels().format(function(){return '$' + this.value.toLocaleString()});
  chart.container(container_id);
  chart.draw();
  return {'chart': chart, 'lineDataset': lineDataset, 'rangeDataset': rangeDataset};
}

function updateForecastData(forecastData){
  var time_data = [];
  var approximate_data = [];
  var year = new Date().getFullYear();
  for (var i = 0; i <= forecastData['length']; i++){
    var item = 0;
    for (var j = 0; j < forecastData['data'].length; j++){
      item = item + forecastData['data'][j]['value'] * Math.pow((1 + forecastData['data'][j]['coefficient'] / 100), i);
    }
    time_data.push({x: year + i, value: item.toFixed(2)});
    var shadow = i / 200;
    approximate_data.push({x: year + i, low: item.toFixed(2) * (1 - shadow), high: item.toFixed(2) * (1 + shadow)});
  }
  if (forecastData['length'] > 0) forecastData['chart'].xScale().ticks().interval(1);
  if (forecastData['length'] > 10) forecastData['chart'].xScale().ticks().interval(2);
  if (forecastData['length'] >= 20) forecastData['chart'].xScale().ticks().interval(5);
  forecastData['lineDataset'].data(time_data);
  forecastData['rangeDataset'].data(approximate_data);
}

function drawTable(container_id){
  var table = anychart.standalones.table();
  table.container(container_id);
  table.cellBorder(null);
  table.cellBorder().bottom('1px #dedede');
  table.fontSize(12).vAlign('middle').hAlign('left').fontColor('#212121');
  table.contents([['Name', 'Ticker', 'Percent', 'Price', 'Amount', 'Total Sum']]);
  table.getCol(0).fontSize(11);
  table.getRow(0).cellBorder().bottom('2px #dedede').fontColor('#7c868e').height(50).fontSize(12);
  table.getCol(1).width(60);
  table.getCol(2).width(60);
  table.getCol(3).width(75);
  table.getCol(4).width(60);
  table.getCol(5).width(90);
  table.draw();
  return table;
}

function updateTableData(table, data){
  var contents = [
    ['Name', 'Ticker', 'Percent', 'Price', 'Amount', 'Total Sum']
  ];
  for (var i = 0; i < data.length; i++){
    contents.push([
        data[i]['name'],
        data[i]['ticker'],
        data[i]['percent'] + '%',
        '$' + parseFloat(data[i]['price']).toLocaleString(),
        data[i]['amount'],
        '$' + parseFloat(data[i]['value']).toLocaleString()
    ]);
  }
  table.contents(contents);
  table.draw();
}

function highLightRowInTable(indexes, table, color){
  if (!indexes) return;
  for (var i = 0; i < indexes.length; i++){
    table.getRow(indexes[i] + 1).cellFill(color);
  }
}

function drawStockChart(container_id){
  var stock = anychart.stock();
  var plot = stock.plot();
  plot.yAxis(1).orientation('right');
  stock.padding()
      .top(0)
      .right(80)
      .left(70);

  stock.container(container_id);

  var mainTable = anychart.data.table('date');
  var mainMapping = mainTable.mapAs({'value': {'column': 'value', 'type': 'close'}});
  plot.line(mainMapping).name('Portfolio').stroke('2 #1976d2');

  var SP500Table = anychart.data.table('date');
  var SP500Mapping = SP500Table.mapAs({'value': {'column': 'value', 'type': 'close'}});
  var SP500Series = plot.line(SP500Mapping).name('S&P 500').stroke('1 #ef6c00');

  var DowTable = anychart.data.table('date');
  var DowMapping = DowTable.mapAs({'value': {'column': 'value', 'type': 'close'}});
  var DowSeries = plot.line(DowMapping).name('Dow').stroke('1 #ffa000');

  var NasdaqTable = anychart.data.table('date');
  var NasdaqMapping = NasdaqTable.mapAs({'value': {'column': 'value', 'type': 'close'}});
  var NasdaqSeries = plot.line(NasdaqMapping).name('NASDAQ').stroke('1 #ffd54f');

  stock.scroller().line(mainMapping);

  var rangeSelector = anychart.ui.rangeSelector();

  stock.draw();

  rangeSelector.render(stock);

  return {'stock': stock, 'mainTable': mainTable,
    'SP500Table': SP500Table, 'DowTable': DowTable, 'NasdaqTable': NasdaqTable,
    'SP500': SP500Series, 'Dow': DowSeries, 'NASDAQ': NasdaqSeries};
}

function changeStockChart(stockData){
  stockData['mainTable'].remove();
  var initial_sum = stockData['mainData'][stockData['mainData'].length - 1].value;
  stockData['mainTable'].addData(stockData['mainData']);
  stockData['SP500Table'].addData(calculateIndexPrices(stockData['indexesData']['S&P 500'], initial_sum));
  stockData['DowTable'].addData(calculateIndexPrices(stockData['indexesData']['Dow'], initial_sum));
  stockData['NasdaqTable'].addData(calculateIndexPrices(stockData['indexesData']['NASDAQ'], initial_sum));
}

function drawHoverArc(point, chart, data, path, needClear){
  var colorFill = '#ffa760';
  if (data[point.index]['group'] == 'bonds') colorFill = '#6fc0fe';
  drawArc(point, chart, colorFill, path, !needClear)
}

function getDataInProportion(data, proportion){
  var sumProp = (proportion[0][0] + proportion[1][0]);
  proportion[0][2] = the_sum * proportion[0][0] / sumProp;
  proportion[1][2] = the_sum * proportion[1][0] / sumProp;

  var consts = [[0, 1, 1, 2, 3, 3, 4, 6, 7, 8, 10], [0, 1, 2, 2, 3, 5, 6, 6, 7, 8, 10]];

  var result = {"data": [], "proportion": proportion};
  for (var group = 0; group < proportion.length; group++) {
    var group_palette = anychart.palettes.distinctColors(anychart.color.singleHueProgression(groupsColors[group], proportion[group][0] + 1));
    var groupName = proportion[group][1];
    var dataForGroup = data[groupName];
    var groupItemsCount = consts[group][proportion[group][0]];
    var totalRisk = 0;
    var tickerIndex;
    for (tickerIndex = 0; tickerIndex < groupItemsCount; tickerIndex++) {
      totalRisk += 1 / dataForGroup[tickerIndex]['risks'];
    }
    for (tickerIndex = 0; tickerIndex < groupItemsCount; tickerIndex++) {
      var dataPoint = dataForGroup[tickerIndex];
      var point = {};
      point['group'] = groupName;
      point['price'] = dataPoint['value'];
      point['coefficient'] = dataPoint['coefficient'];
      point['ticker'] = dataPoint['ticker'];
      point['name'] = dataPoint['name'];
      point['fill'] = group_palette.itemAt(proportion[group][0] - tickerIndex);
      point['stroke'] = null;
      point['hovered'] = {
        'fill': anychart.color.lighten(anychart.color.lighten(group_palette.itemAt(proportion[group][0] - tickerIndex))),
        'stroke': null
      };
      point['value'] = (proportion[group][2] / dataPoint['risks'] / totalRisk).toFixed(2);
      point['amount'] = Math.floor(point['value'] / point['price']);
      point['percent'] = (point['value'] * 100 / the_sum).toFixed(2);
      result["data"].push(point);
    }
  }

  return result
}

anychart.onDocumentReady(function () {
  var donutData, forecastData, instrumentsTable, stockData;

  var updateDonutData = function(data, stocks_amount, bonds_amount){
    var updateLabel = function (index) {
      donutData['chart'].label(index).text(
          '<span style="font-size: 24px;">' + donutData['proportion'][index][0] * 10 + '%</span><br/>' +
          '<span style="font-size: 14px; font-weight: normal">' + donutData['proportion'][index][1].toUpperCase() + '</span>');
    };
    var updated_data = getDataInProportion(data, [[stocks_amount, "stocks"], [bonds_amount, "bonds"]]);
    donutData['data'] = updated_data['data'];
    donutData['proportion'] = updated_data['proportion'];
    donutData['dataset'].data(updated_data['data']);
    updateLabel(0);
    updateLabel(1);
  };

  var proportionsChange = function () {
    var stocks = parseInt($('#proportionsSlider .slider-track .max-slider-handle').attr('aria-valuemax'))/10 +
        proportionsResult.getValue()/10;
    var bonds = donutData['initial_data']['stocks'].length - stocks;
    if (proportionsResult.getValue() == 0) {
      stocks = donutData['initial_data']['stocks'].length/2;
      bonds = donutData['initial_data']['stocks'].length/2;
    }
    updateDonutData(donutData['initial_data'], stocks, bonds);
    forecastData['length'] = timeLine.getValue();
    forecastData['data'] = donutData['data'];
    updateForecastData(forecastData);
    updateTableData(instrumentsTable, donutData['data']);
    stockData['mainData'] = calculateDataForStock(donutData['data'], stockData['historical']);
    changeStockChart(stockData);
  };
  var proportionsResult = $('#proportionsSlider').slider().on('change', proportionsChange).data('slider');

  var timeLineChange = function () {
    forecastData['length'] = timeLine.getValue();
    $('.time-value').text('(' + timeLine.getValue() + ' years)');
    if (timeLine.getValue() == 1) $('.time-value').text('(' + timeLine.getValue() + ' year)');
    updateForecastData(forecastData);
  };
  var timeLine = $('#timeLineSlider').slider().on('change', timeLineChange).data('slider');

  donutData = drawDonutChart('donut-chart-container');
  forecastData = drawForecastChart('forecast-chart-container');
  forecastData['length'] = timeLine.getValue();
  instrumentsTable = drawTable('table-container');
  $.getJSON("https://raw.githubusercontent.com/anychart-solutions/investment-portfolio-dashboard/master/src/data/financialQuotes.json", function (parsed_data) {
    stockData = drawStockChart('stock-container');
    stockData['indexesData'] = parsed_data;
  });

  $.getJSON("https://raw.githubusercontent.com/anychart-solutions/investment-portfolio-dashboard/master/src/data/StocksViaBonds.json", function (parsed_data) {
    donutData['initial_data'] = parsed_data;
    updateDonutListeners(donutData, instrumentsTable);
    updateDonutData(parsed_data, 5, 5);
    forecastData['data'] = donutData['data'];
    updateForecastData(forecastData);
    updateTableData(instrumentsTable, donutData['data']);
    $.getJSON("https://raw.githubusercontent.com/anychart-solutions/investment-portfolio-dashboard/master/src/data/historical.json", function (parsed_data) {
      stockData['historical'] = parsed_data;
      stockData['mainData'] = calculateDataForStock(donutData['data'], parsed_data);
      changeStockChart(stockData);
      stockData['stock'].selectRange("MTD");
    });
  });

  $('.tabsMenu li a').on('click', function(){
    $('.tab-dependent').hide();
    $('.visible-' + $(this).attr('id')).show();
  });

  $('.stock_quotes input[type=checkbox]').on('click', function(){
    if ($(this).attr('id') == 'log'){
      var plot = stockData['stock'].plot();
      if ($(this).prop('checked')) {
        plot.yScale('log');
      }
      else {
        plot.yScale('linear');
      }
      var seriesCount = plot.getSeriesCount();
      for (var i = 0; i < seriesCount; i++) {
        plot.getSeriesAt(i).yScale(plot.yScale());
      }
      plot.yAxis(0).scale(plot.yScale());
      plot.yAxis(1).scale(plot.yScale());
    } else {
      var series = stockData[$(this).attr('id')];
      series.enabled($(this).prop('checked'));
    }
  });
});

// helper function to draw a beauty arc
function drawArc(point, chart, fillColor, path, needClear) {
    if (needClear) path.clear();
    if (!point.hovered()) return true;
    path.fill(fillColor);
    var start = point.getStartAngle();
    var sweep = point.getEndAngle() - start;
    var radius = chart.getPixelRadius();
    var explodeValue = chart.getPixelExplode();
    var exploded = point.exploded();
    var cx = chart.getCenterPoint().x;
    var cy = chart.getCenterPoint().y;
    var innerR = radius + 3;
    var outerR = innerR + 5;
    var ex = 0;
    var ey = 0;
    if (exploded) {
        var angle = start + sweep / 2;
        var cos = Math.cos(toRadians(angle));
        var sin = Math.sin(toRadians(angle));
        ex = explodeValue * cos;
        ey = explodeValue * sin;
    }
    acgraph.vector.primitives.donut(path, cx + ex, cy + ey, outerR, innerR, start, sweep);
}

// helper function to convert degrees to radians
function toRadians(angleDegrees) {
    return angleDegrees * Math.PI / 180;
}

// helper function to calculate price of our portfolio based on historical prices for each instrument
function calculateDataForStock(proportion_data, historical_data){
  var result = [];
  var hist = historical_data[proportion_data[0]['ticker']];

  for (var i = 0; i < hist.length; i++){
      var sum = 0;
      for (var j = 0; j < proportion_data.length; j++){
          sum = sum + (parseFloat(proportion_data[j]['amount']) * parseFloat(historical_data[proportion_data[j]['ticker']][i]['value']))
      }
      result.push({'date': hist[i].date, 'value': sum});
  }
  return result;
}

// helper function to recalculate indexes
function calculateIndexPrices(data, initial_sum){
  var amount = parseFloat(initial_sum/data[data.length-1].value).toFixed(2);
  var result = [];
  for (var i = 0; i < data.length; i++){
      result.push({'date': data[i].date, 'value': data[i].value * amount});
  }
  return result
}
