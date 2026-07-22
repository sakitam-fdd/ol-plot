import { afterEach, describe, expect, test, vi } from 'vitest';
import Collection from 'ol/Collection';
import Map from 'ol/Map';
import DoubleClickZoom from 'ol/interaction/DoubleClickZoom';
import PlotDraw from '../core/PlotDraw';
import { PlotTypes } from '../utils/PlotTypes';

const cleanups: Array<() => void> = [];

function createDraw(doubleClickZoomActive = true) {
  const doubleClickZoom = new DoubleClickZoom();
  doubleClickZoom.setActive(doubleClickZoomActive);
  const interactions = new Collection([doubleClickZoom]);
  const layers = new Collection<any>();
  const map = Object.assign(Object.create(Map.prototype), {
    addInteraction: vi.fn((interaction) => interactions.push(interaction)),
    addLayer: vi.fn((layer) => layers.push(layer)),
    getInteractions: vi.fn(() => interactions),
    getLayers: vi.fn(() => layers),
    getViewport: vi.fn(() => ({}) as HTMLElement),
    on: vi.fn(),
    removeInteraction: vi.fn((interaction) => interactions.remove(interaction)),
    un: vi.fn(),
  }) as Map;
  const draw = new PlotDraw(map, {}, {} as any);
  cleanups.push(() => {
    draw.deactivate();
    draw.dispose();
  });
  return { doubleClickZoom, draw };
}

afterEach(() => {
  cleanups.splice(0).forEach((cleanup) => cleanup());
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('PlotDraw map interaction lifecycle', () => {
  test('keeps DoubleClickZoom disabled until the finishing dblclick is fully handled', () => {
    vi.useFakeTimers();
    const { doubleClickZoom, draw } = createDraw();
    const finishDrawing = vi.fn();
    const event = {
      type: 'dblclick',
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };

    draw.activate(PlotTypes.POLYLINE);
    expect(doubleClickZoom.getActive()).toBe(false);

    (draw as any).plot = { finishDrawing };
    (draw as any).mapDoubleClickHandler(event);

    expect(finishDrawing).toHaveBeenCalledOnce();
    expect(event.preventDefault).toHaveBeenCalledOnce();
    expect(event.stopPropagation).toHaveBeenCalledOnce();
    expect(draw.isDrawing()).toBe(false);
    expect(doubleClickZoom.getActive()).toBe(false);

    vi.runOnlyPendingTimers();
    expect(doubleClickZoom.getActive()).toBe(true);
  });

  test('restores the host interaction state on explicit cancellation', () => {
    const enabled = createDraw(true);
    enabled.draw.activate(PlotTypes.POLYGON);
    enabled.draw.deactivate();
    expect(enabled.doubleClickZoom.getActive()).toBe(true);

    const disabled = createDraw(false);
    disabled.draw.activate(PlotTypes.POLYGON);
    disabled.draw.deactivate();
    expect(disabled.doubleClickZoom.getActive()).toBe(false);
  });

  test('does not change map interactions for an unsupported plot type', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { doubleClickZoom, draw } = createDraw();

    draw.activate('UnknownPlot' as PlotTypes);

    expect(draw.isDrawing()).toBe(false);
    expect(doubleClickZoom.getActive()).toBe(true);
    expect(warn).toHaveBeenCalledWith('不存在的标绘类型！');
  });
});
