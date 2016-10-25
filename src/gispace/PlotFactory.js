P.PlotFactory = {};

P.PlotFactory.createPlot = function (type, points, params) {
    if (!params) {
        params = {}
    }
    switch (type) {
        case P.PlotTypes.ARC:
            return new P.Plot.Arc(points, params);
        case P.PlotTypes.ELLIPSE:
            return new P.Plot.Ellipse(points, params);
        case P.PlotTypes.CURVE:
            return new P.Plot.Curve(points, params);
        case P.PlotTypes.CLOSED_CURVE:
            return new P.Plot.ClosedCurve(points, params);
        case P.PlotTypes.LUNE:
            return new P.Plot.Lune(points, params);
        case P.PlotTypes.SECTOR:
            return new P.Plot.Sector(points, params);
        case P.PlotTypes.GATHERING_PLACE:
            return new P.Plot.GatheringPlace(points, params);
        case P.PlotTypes.STRAIGHT_ARROW:
            return new P.Plot.StraightArrow(points, params);
        case P.PlotTypes.ASSAULT_DIRECTION:
            return new P.Plot.AssaultDirection(points, params);
        case P.PlotTypes.ATTACK_ARROW:
            return new P.Plot.AttackArrow(points, params);
        case P.PlotTypes.FINE_ARROW:
            return new P.Plot.FineArrow(points, params);
        case P.PlotTypes.CIRCLE:
            return new P.Plot.Circle(points, params);
        case P.PlotTypes.DOUBLE_ARROW:
            return new P.Plot.DoubleArrow(points, params);
        case P.PlotTypes.TAILED_ATTACK_ARROW:
            return new P.Plot.TailedAttackArrow(points, params);
        case P.PlotTypes.SQUAD_COMBAT:
            return new P.Plot.SquadCombat(points, params);
        case P.PlotTypes.TAILED_SQUAD_COMBAT:
            return new P.Plot.TailedSquadCombat(points, params);
        case P.PlotTypes.FREEHAND_LINE:
            return new P.Plot.FreehandLine(points, params);
        case P.PlotTypes.FREEHAND_POLYGON:
            return new P.Plot.FreehandPolygon(points, params);
        case P.PlotTypes.POLYGON:
            return new P.Plot.Polygon(points, params);
        case P.PlotTypes.POLYLINE:
            return new P.Plot.Polyline(points, params);
        case P.PlotTypes.Rectangle:
            return new P.Plot.Rectangle(points, params);
    }
    return null;
};