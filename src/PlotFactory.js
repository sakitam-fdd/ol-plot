olPlot.PlotFactory = {};
olPlot.PlotFactory.createPlot = function (type, points) {
  switch (type) {
    case olPlot.PlotTypes.ARC:
      return new olPlot.Plot.Arc(points);
    case olPlot.PlotTypes.ELLIPSE:
      return new olPlot.Plot.Ellipse(points);
    case olPlot.PlotTypes.CURVE:
      return new olPlot.Plot.Curve(points);
    case olPlot.PlotTypes.CLOSED_CURVE:
      return new olPlot.Plot.ClosedCurve(points);
    case olPlot.PlotTypes.LUNE:
      return new olPlot.Plot.Lune(points);
    case olPlot.PlotTypes.SECTOR:
      return new olPlot.Plot.Sector(points);
    case olPlot.PlotTypes.GATHERING_PLACE:
      return new olPlot.Plot.GatheringPlace(points);
    case olPlot.PlotTypes.STRAIGHT_ARROW:
      return new olPlot.Plot.StraightArrow(points);
    case olPlot.PlotTypes.ASSAULT_DIRECTION:
      return new olPlot.Plot.AssaultDirection(points);
    case olPlot.PlotTypes.ATTACK_ARROW:
      return new olPlot.Plot.AttackArrow(points);
    case olPlot.PlotTypes.FINE_ARROW:
      return new olPlot.Plot.FineArrow(points);
    case olPlot.PlotTypes.CIRCLE:
      return new olPlot.Plot.Circle(points);
    case olPlot.PlotTypes.DOUBLE_ARROW:
      return new olPlot.Plot.DoubleArrow(points);
    case olPlot.PlotTypes.TAILED_ATTACK_ARROW:
      return new olPlot.Plot.TailedAttackArrow(points);
    case olPlot.PlotTypes.SQUAD_COMBAT:
      return new olPlot.Plot.SquadCombat(points);
    case olPlot.PlotTypes.TAILED_SQUAD_COMBAT:
      return new olPlot.Plot.TailedSquadCombat(points);
    case olPlot.PlotTypes.FREEHAND_LINE:
      return new olPlot.Plot.FreehandLine(points);
    case olPlot.PlotTypes.FREEHAND_POLYGON:
      return new olPlot.Plot.FreehandPolygon(points);
    case olPlot.PlotTypes.POLYGON:
      return new olPlot.Plot.Polygon(points);
    case olPlot.PlotTypes.MARKER:
      return new olPlot.Plot.Marker(points);
    case olPlot.PlotTypes.RECTANGLE:
      return new olPlot.Plot.Rectangle(points);
    case olPlot.PlotTypes.POLYLINE:
      return new olPlot.Plot.Polyline(points);
  }
  return null;
}