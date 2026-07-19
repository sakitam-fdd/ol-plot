import './less/index.less';
import { Observable } from 'ol';
import type Map from 'ol/Map';
import PlotDraw from './core/PlotDraw';
import PlotEdit from './core/PlotEdit';
import PlotUtils from './core/PlotUtils';
import { PlotTypes } from './utils/PlotTypes';
import * as Geometry from './geometry';

import StyleFactory from './utils/factory';
import type { PlotOptions } from './types';

class olPlot extends Observable {
  static PlotTypes = PlotTypes;

  static Geometry = Geometry;

  static StyleFactory = StyleFactory;

  public plotDraw: PlotDraw;

  public plotEdit: PlotEdit;

  public plotUtils: PlotUtils;

  constructor(map: Map, options: PlotOptions = {}) {
    super();
    this.plotDraw = new PlotDraw(map, options, this);
    this.plotEdit = new PlotEdit(map);
    this.plotUtils = new PlotUtils(map, options, this);
  }

  /** Release map interactions, overlays and event listeners owned by this instance. */
  public destroy(): void {
    this.plotDraw.deactivate();
    this.plotEdit.deactivate();
    this.plotUtils.destroy();
    this.plotDraw.dispose();
    this.plotEdit.dispose();
    this.dispose();
  }
}

export { PlotDraw, PlotEdit, PlotUtils, PlotTypes, Geometry, StyleFactory };
export type {
  Coordinate,
  OpenLayersMap,
  PlotDrawEvent,
  PlotFeatureParams,
  PlotOptions,
  PlotSerializedFeature,
} from './types';
export default olPlot;
