import { describe, expect, test, vi } from 'vitest';
import Feature from 'ol/Feature';
import Map from 'ol/Map';
import LineString from 'ol/geom/LineString';
import { Stroke, Style } from 'ol/style';
import PlotUtils from '../core/PlotUtils';
import StyleFactory from '../utils/factory';

describe('style serialization', () => {
  test('omits an empty fill for line-only styles', () => {
    const map = Object.create(Map.prototype) as Map;
    const utils = new PlotUtils(map, {}, {} as any);
    const feature = new Feature(
      new LineString([
        [0, 0],
        [1, 1],
      ]),
    );
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    feature.setStyle(new Style({ stroke: new Stroke({ color: '#4338ca', width: 3 }) }));

    const serialized = utils.getStyleCode(feature)!;
    const restored = new StyleFactory(serialized).style;

    expect(serialized.fill).toBeUndefined();
    expect(serialized.stroke).toMatchObject({ strokeColor: 'rgba(67,56,202,1)', strokeWidth: 3 });
    expect(restored.getFill()).toBeNull();
    expect(restored.getStroke()?.getWidth()).toBe(3);
    expect(warn).not.toHaveBeenCalled();
  });
});
