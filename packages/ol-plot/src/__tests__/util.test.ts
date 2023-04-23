import { test, expect, describe, beforeAll, afterAll } from 'vitest';

import { isObject } from '../utils/utils';

beforeAll(async () => {
  console.log(`[ol-plot]: start testing...`);
});

afterAll(async () => {
  console.log(`[ol-plot]: test end`);
});

describe('utils', async () => {
  test('isNumber', async () => {
    expect(isObject(1)).toBe(false);
  });
});
