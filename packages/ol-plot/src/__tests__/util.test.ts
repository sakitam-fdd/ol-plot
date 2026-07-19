import { test, expect, describe, beforeAll, afterAll } from 'vitest';

import {
  MathDistance,
  getArcPoints,
  getBezierPoints,
  getBinomialFactor,
  getCircleCenterOfThreePoints,
  getFactorial,
  getuuid,
  getIntersectPoint,
  getNormal,
  isObject,
  squaredDistance,
  wholeDistance,
} from '../utils/utils';

beforeAll(async () => {
  console.log(`[ol-plot]: start testing...`);
});

afterAll(async () => {
  console.log(`[ol-plot]: test end`);
});

describe('utils', async () => {
  test('isObject', async () => {
    expect(isObject({})).toBe(true);
  });

  test('computes distances without mutating input', () => {
    const points: [number, number][] = [
      [0, 0],
      [3, 4],
      [6, 8],
    ];
    expect(squaredDistance(points[0], points[1])).toBe(25);
    expect(MathDistance(points[0], points[1])).toBe(5);
    expect(wholeDistance(points)).toBe(10);
    expect(points).toEqual([
      [0, 0],
      [3, 4],
      [6, 8],
    ]);
  });

  test('uses correct factorial and binomial values', () => {
    expect(getFactorial(4)).toBe(24);
    expect(getFactorial(5)).toBe(120);
    expect(getBinomialFactor(5, 2)).toBe(10);
  });

  test('creates standard and compact UUIDs', () => {
    expect(getuuid()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    expect(getuuid(true)).toMatch(/^[0-9a-f]{32}$/i);
  });

  test('generates a stable bezier sample with exact endpoints', () => {
    const points: [number, number][] = [
      [0, 0],
      [5, 10],
      [10, 0],
    ];
    const curve = getBezierPoints(points);
    expect(curve).toHaveLength(101);
    expect(curve[0]).toEqual(points[0]);
    expect(curve.at(-1)).toEqual(points.at(-1));
    expect(curve[50][0]).toBeCloseTo(5);
    expect(curve[50][1]).toBeCloseTo(5);
  });

  test('keeps degenerate geometry finite', () => {
    expect(getNormal([0, 0], [0, 0], [1, 1])).toEqual([0, 0]);
    expect(getIntersectPoint([0, 0], [1, 0], [0, 1], [1, 1])).toEqual([0, 0.5]);
    const center = getCircleCenterOfThreePoints([0, 0], [2, 0], [0, 2]);
    expect(center[0]).toBeCloseTo(1);
    expect(center[1]).toBeCloseTo(1);
    expect(getArcPoints(center, 1, 0, Math.PI)).toHaveLength(101);
  });
});
