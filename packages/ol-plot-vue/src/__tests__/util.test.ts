import { test, expect, describe, beforeAll, afterAll } from 'vitest';

beforeAll(async () => {
  console.log(`[ol-plot-vue]: start testing...`);
});

afterAll(async () => {
  console.log(`[ol-plot-vue]: test end`);
});

describe('utils', async () => {
  test('isNumber', async () => {
    const a = false;
    expect(a).toBe(false);
  });
});
