// helper function to draw a beauty arc
function drawArc(point, chart, fillColor, path, needClear) {
    if (needClear) path.clear();
    // return if we unhover point
    if (!point.hovered()) return true;
    // set fill for path
    path.fill(fillColor);
    // some props to draw outer arc
    var start = point.getStartAngle();
    var sweep = point.getEndAngle() - start;
    var radius = chart.getPixelRadius();
    var explodeValue = chart.getPixelExplode();
    var exploded = point.exploded();
    var cx = chart.getCenterPoint().x;
    var cy = chart.getCenterPoint().y;
    // distance between pie and outer arc
    var innerR = radius + 3;
    // width (thickness) of outer arc
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



