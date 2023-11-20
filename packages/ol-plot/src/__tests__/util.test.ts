import { test, expect, describe, beforeAll, afterAll } from 'vitest';

import { isObject } from '../utils/utils';

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
});
