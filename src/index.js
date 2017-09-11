import './scss/index.scss'
import 'core-js/es6/set'
import 'core-js/es6/symbol'
import 'core-js/es6/reflect'
import PlotDraw from './core/PlotDraw'
import PlotEdit from './core/PlotEdit'
import PlotTypes from './Utils/PlotTypes'
class olPlot {
  constructor (map) {
    this.plotDraw = new PlotDraw(map)
    this.plotEdit = new PlotEdit(map)
  }
  static PlotTypes = PlotTypes
}

export default olPlot
