import type Point from '../Geometry/Point/Point';
import type Pennant from '../Geometry/Point/Pennant';
import type Polyline from '../Geometry/Polyline/Polyline';
import type Arc from '../Geometry/Arc/Arc';
import type Circle from '../Geometry/Circle/Circle';
import type Curve from '../Geometry/Polyline/Curve';
import type FreeHandLine from '../Geometry/Polyline/FreeHandLine';
import type RectAngle from '../Geometry/Polygon/RectAngle';
import type Ellipse from '../Geometry/Circle/Ellipse';
import type Lune from '../Geometry/Polygon/Lune';
import type Sector from '../Geometry/Polygon/Sector';
import type ClosedCurve from '../Geometry/Polygon/ClosedCurve';
import type Polygon from '../Geometry/Polygon/Polygon';
import type FreePolygon from '../Geometry/Polygon/FreePolygon';
import type AttackArrow from '../Geometry/Arrow/AttackArrow';
import type DoubleArrow from '../Geometry/Arrow/DoubleArrow';
import type StraightArrow from '../Geometry/Arrow/StraightArrow';
import type FineArrow from '../Geometry/Arrow/FineArrow';
import type AssaultDirection from '../Geometry/Arrow/AssaultDirection';
import type TailedAttackArrow from '../Geometry/Arrow/TailedAttackArrow';
import type SquadCombat from '../Geometry/Arrow/SquadCombat';
import type TailedSquadCombat from '../Geometry/Arrow/TailedSquadCombat';
import type GatheringPlace from '../Geometry/Polygon/GatheringPlace';
import type RectFlag from '../Geometry/Flag/RectFlag';
import type TriangleFlag from '../Geometry/Flag/TriangleFlag';
import type CurveFlag from '../Geometry/Flag/CurveFlag';
// import type PlotTextBox from '../Geometry/Text/PlotTextBox';
import type RectInclined1 from '../Geometry/Polygon/Rectinclined1';
import type RectInclined2 from '../Geometry/Polygon/Rectinclined2';

export type PlotTypesSource =
  | Point
  | Pennant
  | Polyline
  | Arc
  | Circle
  | Curve
  | FreeHandLine
  | RectAngle
  | Ellipse
  | Lune
  | Sector
  | ClosedCurve
  | Polygon
  | FreePolygon
  | AttackArrow
  | DoubleArrow
  | StraightArrow
  | FineArrow
  | AssaultDirection
  | TailedAttackArrow
  | SquadCombat
  | TailedSquadCombat
  | GatheringPlace
  | RectFlag
  | TriangleFlag
  | CurveFlag
  // | PlotTextBox
  | RectInclined1
  | RectInclined2;

export enum PlotTypes {
  TEXTAREA = 'TextArea',
  ARC = 'Arc',
  CURVE = 'Curve',
  GATHERING_PLACE = 'GatheringPlace',
  POLYLINE = 'Polyline',
  FREEHANDLINE = 'FreeHandLine',
  POINT = 'Point',
  PENNANT = 'Pennant',
  RECTANGLE = 'RectAngle',
  CIRCLE = 'Circle',
  ELLIPSE = 'Ellipse',
  LUNE = 'Lune',
  SECTOR = 'Sector',
  CLOSED_CURVE = 'ClosedCurve',
  POLYGON = 'Polygon',
  FREE_POLYGON = 'FreePolygon',
  ATTACK_ARROW = 'AttackArrow',
  DOUBLE_ARROW = 'DoubleArrow',
  STRAIGHT_ARROW = 'StraightArrow',
  FINE_ARROW = 'FineArrow',
  ASSAULT_DIRECTION = 'AssaultDirection',
  TAILED_SQUAD_COMBAT = 'TailedSquadCombat',
  TAILED_ATTACK_ARROW = 'TailedAttackArrow',
  SQUAD_COMBAT = 'SquadCombat',
  RECTFLAG = 'RectFlag',
  TRIANGLEFLAG = 'TriangleFlag',
  CURVEFLAG = 'CurveFlag',
  RECTINCLINED1 = 'RectInclined1',
  RECTINCLINED2 = 'RectInclined2',
}
