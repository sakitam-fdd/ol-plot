import './less/index.less';
import { Observable } from 'ol';
import PlotDraw from './core/PlotDraw';
import PlotEdit from './core/PlotEdit';
import PlotUtils from './core/PlotUtils';
import { PlotTypes } from './utils/PlotTypes';
import * as Geometry from './Geometry';

import StyleFactory from './utils/factory';

class olPlot extends Observable {
  static PlotTypes = PlotTypes;

  static Geometry = Geometry;

  static StyleFactory = StyleFactory;

  public plotDraw: PlotDraw;

  public plotEdit: PlotEdit;

  public plotUtils: PlotUtils;

  constructor(map, options) {
    super();
    this.plotDraw = new PlotDraw(map, options, this);
    this.plotEdit = new PlotEdit(map);
    this.plotUtils = new PlotUtils(map, options, this);
  }
}

export default olPlot;
