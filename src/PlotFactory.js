
P.PlotFactory = {};

P.PlotFactory.createPlot = function(type, points){
    switch(type){
        case P.PlotTypes.ARC:
            return new P.Plot.Arc(points);
        case P.PlotTypes.ELLIPSE:
            return new P.Plot.Ellipse(points);
        case P.PlotTypes.CURVE:
            return new P.Plot.Curve(points);
        case P.PlotTypes.CLOSED_CURVE:
            return new P.Plot.ClosedCurve(points);
        case P.PlotTypes.LUNE:
            return new P.Plot.Lune(points);
        case P.PlotTypes.SECTOR:
            return new P.Plot.Sector(points);
        case P.PlotTypes.GATHERING_PLACE:
            return new P.Plot.GatheringPlace(points);
        case P.PlotTypes.STRAIGHT_ARROW:
            return new P.Plot.StraightArrow(points);
        case P.PlotTypes.ASSAULT_DIRECTION:
            return new P.Plot.AssaultDirection(points);
        case P.PlotTypes.ATTACK_ARROW:
            return new P.Plot.AttackArrow(points);
        case P.PlotTypes.FINE_ARROW:
            return new P.Plot.FineArrow(points);
        case P.PlotTypes.CIRCLE:
            return new P.Plot.Circle(points);
        case P.PlotTypes.DOUBLE_ARROW:
            return new P.Plot.DoubleArrow(points);
        case P.PlotTypes.TAILED_ATTACK_ARROW:
            return new P.Plot.TailedAttackArrow(points);
        case P.PlotTypes.SQUAD_COMBAT:
            return new P.Plot.SquadCombat(points);
        case P.PlotTypes.TAILED_SQUAD_COMBAT:
            return new P.Plot.TailedSquadCombat(points);
        case P.PlotTypes.FREEHAND_LINE:
            return new P.Plot.FreehandLine(points);
        case P.PlotTypes.FREEHAND_POLYGON:
            return new P.Plot.FreehandPolygon(points);
        case P.PlotTypes.POLYGON:
            return new P.Plot.Polygon(points);
        case P.PlotTypes.MARKER:
            return new P.Plot.Marker(points);
        case P.PlotTypes.RECTANGLE:
            return new P.Plot.Rectangle(points);
        case P.PlotTypes.POLYLINE:
            return new P.Plot.Polyline(points);
    }
    return null;
}