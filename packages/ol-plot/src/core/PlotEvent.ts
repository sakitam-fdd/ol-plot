import BaseEvent from 'ol/events/Event';

export default class PlotEvent extends BaseEvent {
  constructor(type: string, params = {}) {
    super(type);

    Object.keys(params).forEach((key) => {
      this[key] = params[key];
    });
  }
}
