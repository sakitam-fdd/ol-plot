/**
 * Created by FDD on 2017/8/28.
 * @desc 事件类型集合
 */
const DragBox = {
  /**
   * Triggered upon drag box start.
   * @event ol.interaction.DragBox.Event#boxstart
   * @api
   */
  BOXSTART: 'boxstart',

  /**
   * Triggered on drag when box is active.
   * @event ol.interaction.DragBox.Event#boxdrag
   * @api
   */
  BOXDRAG: 'boxdrag',

  /**
   * Triggered upon drag box end.
   * @event ol.interaction.DragBox.Event#boxend
   * @api
   */
  BOXEND: 'boxend'
}

export {
  DragBox
}
