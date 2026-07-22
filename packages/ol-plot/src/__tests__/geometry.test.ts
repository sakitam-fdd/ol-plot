import { describe, expect, test } from 'vitest';
import {
  Arc,
  AssaultDirection,
  AttackArrow,
  Circle,
  ClosedCurve,
  Curve,
  CurveFlag,
  DoubleArrow,
  Ellipse,
  FineArrow,
  FreeHandLine,
  FreePolygon,
  GatheringPlace,
  Lune,
  Pennant,
  Point,
  Polygon,
  Polyline,
  RectAngle,
  RectFlag,
  RectInclined1,
  RectInclined2,
  Sector,
  SquadCombat,
  StraightArrow,
  TailedAttackArrow,
  TailedSquadCombat,
  TriangleFlag,
} from '../geometry';
import type { Point as TPoint } from '../utils/utils';

function assertFiniteCoords(coords: unknown): void {
  const walk = (value: unknown) => {
    if (typeof value === 'number') {
      expect(Number.isFinite(value)).toBe(true);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(walk);
    }
  };
  walk(coords);
}

function ringOf(polygon: { getCoordinates: () => number[][][] }): number[][] {
  return polygon.getCoordinates()[0] ?? [];
}

function assertClosedRing(ring: number[][]) {
  expect(ring.length).toBeGreaterThanOrEqual(4);
  const first = ring[0];
  const last = ring[ring.length - 1];
  expect(first[0]).toBeCloseTo(last[0]);
  expect(first[1]).toBeCloseTo(last[1]);
}

function assertFiniteGeometry(geom: { getCoordinates: () => unknown }) {
  const coords = geom.getCoordinates();
  expect(coords).toBeTruthy();
  assertFiniteCoords(coords);
}

describe('point geometries', () => {
  test('Point places a single coordinate', () => {
    const point = new Point([], [[10, 20]], {});
    expect(point.getPlotType()).toBe('Point');
    expect(point.getCoordinates()).toEqual([10, 20]);
  });

  test('Pennant uses Point coordinate layout (not nested array)', () => {
    const pennant = new Pennant([], [[3, 4]], {});
    expect(pennant.fixPointCount).toBe(1);
    expect(pennant.getCoordinates()).toEqual([3, 4]);
  });
});

describe('line geometries', () => {
  test('Polyline / FreeHandLine keep control points', () => {
    const points: TPoint[] = [
      [0, 0],
      [1, 1],
      [2, 0],
    ];
    const polyline = new Polyline([], points, {});
    const freehand = new FreeHandLine([], points, {});
    expect(polyline.getCoordinates()).toEqual(points);
    expect(freehand.getCoordinates()).toEqual(points);
  });

  test('Curve interpolates through endpoints', () => {
    const points: TPoint[] = [
      [0, 0],
      [5, 10],
      [10, 0],
    ];
    const curve = new Curve([], points, {});
    const coords = curve.getCoordinates() as TPoint[];
    expect(coords.length).toBeGreaterThan(points.length);
    expect(coords[0]).toEqual(points[0]);
    expect(coords.at(-1)).toEqual(points.at(-1));
    assertFiniteGeometry(curve);
  });

  test('Arc uses three points and degrades on collinear input', () => {
    const arc = new Arc(
      [],
      [
        [0, 0],
        [2, 0],
        [1, 2],
      ],
      {},
    );
    const coords = arc.getCoordinates() as TPoint[];
    expect(coords.length).toBeGreaterThan(3);
    assertFiniteGeometry(arc);

    const collinear = new Arc(
      [],
      [
        [0, 0],
        [1, 0],
        [2, 0],
      ],
      {},
    );
    expect(collinear.getCoordinates()).toEqual([
      [0, 0],
      [1, 0],
      [2, 0],
    ]);
  });

  test('StraightArrow produces a winged LineString', () => {
    const arrow = new StraightArrow(
      [],
      [
        [0, 0],
        [10, 0],
      ],
      {},
    );
    const coords = arrow.getCoordinates() as TPoint[];
    expect(coords.length).toBeGreaterThan(2);
    assertFiniteGeometry(arrow);
  });
});

describe('area primitives', () => {
  test('Circle / Ellipse produce closed finite rings', () => {
    const circle = new Circle(
      [],
      [
        [0, 0],
        [5, 0],
      ],
      {},
    );
    const ellipse = new Ellipse(
      [],
      [
        [0, 0],
        [4, 2],
      ],
      {},
    );
    assertClosedRing(ringOf(circle));
    assertClosedRing(ringOf(ellipse));
    expect(circle.getArea()).toBeGreaterThan(0);
    expect(ellipse.getArea()).toBeGreaterThan(0);
  });

  test('RectAngle supports fill and outline coordinate layouts', () => {
    const filled = new RectAngle(
      [],
      [
        [0, 0],
        [4, 3],
      ],
      { isFill: true },
    );
    const outline = new RectAngle(
      [],
      [
        [0, 0],
        [4, 3],
      ],
      { isFill: false },
    );
    expect(filled.getCoordinates()[0].length).toBeGreaterThanOrEqual(5);
    expect(outline.getCoordinates()[0]).toHaveLength(5);
    assertClosedRing(ringOf(outline));
    assertFiniteGeometry(filled);
    assertFiniteGeometry(outline);
  });

  test('RectInclined1 / RectInclined2 stay finite on degenerate base edges', () => {
    const inclined1 = new RectInclined1(
      [],
      [
        [0, 0],
        [4, 0],
        [2, 3],
      ],
      {},
    );
    const inclined2 = new RectInclined2(
      [],
      [
        [0, 0],
        [4, 0],
        [3, 2],
      ],
      {},
    );
    assertClosedRing(ringOf(inclined1));
    assertClosedRing(ringOf(inclined2));
    expect(inclined1.getArea()).toBeGreaterThan(0);
    expect(inclined2.getArea()).toBeGreaterThan(0);

    const degenerate1 = new RectInclined1(
      [],
      [
        [1, 1],
        [1, 1],
        [2, 3],
      ],
      {},
    );
    const degenerate2 = new RectInclined2(
      [],
      [
        [1, 1],
        [1, 1],
        [2, 3],
      ],
      {},
    );
    assertFiniteGeometry(degenerate1);
    assertFiniteGeometry(degenerate2);
  });

  test('Lune builds a bow polygon and degrades when collinear', () => {
    const lune = new Lune(
      [],
      [
        [0, 0],
        [4, 0],
        [2, 2],
      ],
      {},
    );
    assertClosedRing(ringOf(lune));
    expect(lune.getArea()).toBeGreaterThan(0);

    const collinear = new Lune(
      [],
      [
        [0, 0],
        [2, 0],
        [4, 0],
      ],
      {},
    );
    assertFiniteGeometry(collinear);
    assertClosedRing(ringOf(collinear));
  });

  test('Sector / GatheringPlace / ClosedCurve produce finite areas', () => {
    const sector = new Sector(
      [],
      [
        [0, 0],
        [5, 0],
        [0, 5],
      ],
      {},
    );
    const gathering = new GatheringPlace(
      [],
      [
        [0, 0],
        [6, 0],
        [3, 4],
      ],
      {},
    );
    const closed = new ClosedCurve(
      [],
      [
        [0, 0],
        [4, 0],
        [4, 3],
        [0, 3],
      ],
      {},
    );
    assertFiniteGeometry(sector);
    assertFiniteGeometry(gathering);
    assertFiniteGeometry(closed);
    expect(sector.getArea()).toBeGreaterThan(0);
    expect(gathering.getArea()).toBeGreaterThan(0);
    expect(closed.getArea()).toBeGreaterThan(0);
  });

  test('Polygon / FreePolygon keep rings', () => {
    const points: TPoint[] = [
      [0, 0],
      [2, 0],
      [1, 2],
    ];
    const polygon = new Polygon([], points, {});
    const free = new FreePolygon([], points, {});
    expect(polygon.getCoordinates()[0]).toEqual(points);
    expect(free.getCoordinates()[0]).toEqual(points);
  });
});

describe('arrow geometries', () => {
  test('FineArrow / AssaultDirection close rings with positive area', () => {
    const fine = new FineArrow(
      [],
      [
        [0, 0],
        [10, 0],
      ],
      {},
    );
    const assault = new AssaultDirection(
      [],
      [
        [0, 0],
        [10, 0],
      ],
      {},
    );
    assertClosedRing(ringOf(fine));
    assertClosedRing(ringOf(assault));
    expect(fine.getArea()).toBeGreaterThan(0);
    expect(assault.getArea()).toBeGreaterThan(0);
  });

  test('AttackArrow family stays finite on sharp folds', () => {
    const sharp: TPoint[] = [
      [0, -2],
      [0, 2],
      [5, 0],
      [5.01, 0],
      [10, 0],
    ];
    const attack = new AttackArrow([], sharp, {});
    const tailed = new TailedAttackArrow([], sharp, {});
    assertFiniteGeometry(attack);
    assertFiniteGeometry(tailed);
    expect(attack.getArea()).toBeGreaterThan(0);
    expect(tailed.getArea()).toBeGreaterThan(0);
    assertClosedRing(ringOf(attack));
  });

  test('SquadCombat / TailedSquadCombat follow polyline axis', () => {
    const axis: TPoint[] = [
      [0, 0],
      [4, 1],
      [8, 0],
      [12, 2],
    ];
    const squad = new SquadCombat([], axis, {});
    const tailed = new TailedSquadCombat([], axis, {});
    assertFiniteGeometry(squad);
    assertFiniteGeometry(tailed);
    expect(squad.getArea()).toBeGreaterThan(0);
    expect(tailed.getArea()).toBeGreaterThan(0);
    assertClosedRing(ringOf(squad));
  });

  test('DoubleArrow supports 3 and 4 control points', () => {
    const three = new DoubleArrow(
      [],
      [
        [0, 0],
        [0, 4],
        [6, 2],
      ],
      {},
    );
    const four = new DoubleArrow(
      [],
      [
        [0, 0],
        [0, 4],
        [6, 3],
        [6, 1],
      ],
      {},
    );
    assertFiniteGeometry(three);
    assertFiniteGeometry(four);
    expect(three.getArea()).toBeGreaterThan(0);
    expect(four.getArea()).toBeGreaterThan(0);
  });

  test('getArrowBodyPoints rejects zero-length bones without Inf', () => {
    const arrow = new AttackArrow([], [], {});
    const body = arrow.getArrowBodyPoints(
      [
        [0, 0],
        [0, 0],
        [0, 0],
      ],
      [0, 1],
      [0, -1],
      0.1,
    );
    expect(body).toEqual([]);
  });
});

describe('flag geometries', () => {
  test('Rect / Triangle / Curve flags close with positive area', () => {
    const points: TPoint[] = [
      [0, 4],
      [3, 0],
    ];
    const rect = new RectFlag([], points, {});
    const triangle = new TriangleFlag([], points, {});
    const curve = new CurveFlag([], points, {});
    assertClosedRing(ringOf(rect));
    assertClosedRing(ringOf(triangle));
    assertClosedRing(ringOf(curve));
    expect(rect.getArea()).toBeGreaterThan(0);
    expect(triangle.getArea()).toBeGreaterThan(0);
    expect(curve.getArea()).toBeGreaterThan(0);
  });
});
