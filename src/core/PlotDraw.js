/**
 * Created by FDD on 2017/8/21.
 * @desc draw工具
 */

const PlotDraw = function (params) {
  ol.interaction.Draw.call(this, {
    type: '',
    source: '',
    features: '',
    snapTolerance: 12
  })
}

ol.inherits(PlotDraw, ol.interaction.Draw)
