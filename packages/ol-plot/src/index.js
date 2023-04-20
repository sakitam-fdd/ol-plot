import './less/index.less';
import { Observable } from 'ol';
import PlotDraw from './core/PlotDraw';
import PlotEdit from './core/PlotEdit';
import PlotUtils from './core/PlotUtils';
import * as PlotTypes from './utils/PlotTypes';
import * as Geometry from './Geometry';
class olPlot extends Observable {
  constructor(map, options) {
    super();
    this.plotDraw = new PlotDraw(map, options, this);
    this.plotEdit = new PlotEdit(map);
    this.plotUtils = new PlotUtils(map, options, this);
  }
  static PlotTypes = PlotTypes;
  static Geometry = Geometry;
}

export default olPlot;
