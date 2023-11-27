import type Point from '@/geometry/Point/Point';
import type Pennant from '@/geometry/Point/Pennant';
import type Polyline from '@/geometry/Polyline/Polyline';
import type Arc from '@/geometry/Arc/Arc';
import type Circle from '@/geometry/Circle/Circle';
import type Curve from '@/geometry/Polyline/Curve';
import type FreeHandLine from '@/geometry/Polyline/FreeHandLine';
import type RectAngle from '@/geometry/Polygon/RectAngle';
import type Ellipse from '@/geometry/Circle/Ellipse';
import type Lune from '@/geometry/Polygon/Lune';
import type Sector from '@/geometry/Polygon/Sector';
import type ClosedCurve from '@/geometry/Polygon/ClosedCurve';
import type Polygon from '@/geometry/Polygon/Polygon';
import type FreePolygon from '@/geometry/Polygon/FreePolygon';
import type AttackArrow from '@/geometry/Arrow/AttackArrow';
import type DoubleArrow from '@/geometry/Arrow/DoubleArrow';
import type StraightArrow from '@/geometry/Arrow/StraightArrow';
import type FineArrow from '@/geometry/Arrow/FineArrow';
import type AssaultDirection from '@/geometry/Arrow/AssaultDirection';
import type TailedAttackArrow from '@/geometry/Arrow/TailedAttackArrow';
import type SquadCombat from '@/geometry/Arrow/SquadCombat';
import type TailedSquadCombat from '@/geometry/Arrow/TailedSquadCombat';
import type GatheringPlace from '@/geometry/Polygon/GatheringPlace';
import type RectFlag from '@/geometry/Flag/RectFlag';
import type TriangleFlag from '@/geometry/Flag/TriangleFlag';
import type CurveFlag from '@/geometry/Flag/CurveFlag';
// import type PlotTextBox from '../Geometry/Text/PlotTextBox';
import type RectInclined1 from '@/geometry/Polygon/Rectinclined1';
import type RectInclined2 from '@/geometry/Polygon/Rectinclined2';

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
