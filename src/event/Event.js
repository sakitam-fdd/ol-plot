olPlot.Event = {};

olPlot.Event.EventType = {};
olPlot.Event.EventType.MOUSEMOVE = 'mousemove';
olPlot.Event.EventType.MOUSEUP = 'mouseup';
olPlot.Event.EventType.MOUSEDOWN = 'mousedown';
olPlot.Event.EventType.DRAW_START = "draw_start";
olPlot.Event.EventType.DRAW_END = "draw_end";
olPlot.Event.EventType.EDIT_START = "edit_start";
olPlot.Event.EventType.EDIT_END = "edit_end";

/**
 * 绑定事件
 * @param listenerObj
 * @returns {boundListener}
 * @private
 */
olPlot.Event.bindListener = function (listenerObj) {
  var boundListener = function (evt) {
    var listener = listenerObj.listener
    var bindTo = listenerObj.bindTo || listenerObj.target
    if (listenerObj.callOnce) {
      olPlot.Event.unListenByKey(listenerObj)
    }
    return listener.call(bindTo, evt)
  }
  listenerObj.boundListener = boundListener
  return boundListener
}

/**
 * 查找监听器
 * @param listeners
 * @param listener
 * @param optThis
 * @param optSetDevareIndex
 * @returns {*}
 */
olPlot.Event.findListener = function (listeners, listener, optThis, optSetDevareIndex) {
  var listenerObj = null
  for (var i = 0, ii = listeners.length; i < ii; ++i) {
    listenerObj = listeners[i]
    if (listenerObj.listener === listener && listenerObj.bindTo === optThis) {
      if (optSetDevareIndex) {
        listenerObj.devareIndex = i
      }
      return listenerObj
    }
  }
  return undefined
}

/**
 * get Listeners
 * @param target
 * @param type
 * @returns {undefined}
 */
olPlot.Event.getListeners = function (target, type) {
  var listenerMap = target.vlm
  return listenerMap ? listenerMap[type] : undefined
}

/**
 * Get the lookup of listeners.  If one does not exist on the target, it is
 * @param target
 * @returns {{}|*}
 * @private
 */
olPlot.Event.getListenerMap = function (target) {
  var listenerMap = target.vlm
  if (!listenerMap) {
    listenerMap = target.vlm = {}
  }
  return listenerMap
}

/**
 * 清空事件
 * @param target
 * @param type
 */
olPlot.Event.removeListeners = function (target, type) {
  var listeners = olPlot.Event.getListeners(target, type)
  if (listeners) {
    for (var i = 0, ii = listeners.length; i < ii; ++i) {
      target.removeEventListener(type, listeners[i].boundListener)
      olPlot.Event.clear(listeners[i])
    }
    listeners.length = 0
    var listenerMap = target.vlm
    if (listenerMap) {
      delete listenerMap[type]
      if (Object.keys(listenerMap).length === 0) {
        delete target.vlm
      }
    }
  }
}

/**
 * 注册事件处理
 * @param target
 * @param type
 * @param listener
 * @param optThis
 * @param optOnce
 * @returns {*}
 */
olPlot.Event.listen = function (target, type, listener, optThis, optOnce) {
  var listenerMap = olPlot.Event.getListenerMap(target)
  var listeners = listenerMap[type]
  if (!listeners) {
    listeners = listenerMap[type] = []
  }
  var listenerObj = olPlot.Event.findListener(listeners, listener, optThis, false)
  if (listenerObj) {
    if (!optOnce) {
      listenerObj.callOnce = false
    }
  } else {
    listenerObj = ({
      bindTo: optThis,
      callOnce: !!optOnce,
      listener: listener,
      target: target,
      type: type
    })
    target.addEventListener(type, olPlot.Event.bindListener(listenerObj))
    listeners.push(listenerObj)
  }
  return listenerObj
}

/**
 * 注册事件，只触发一次
 * @param target
 * @param type
 * @param listener
 * @param optThis
 * @returns {*}
 */
olPlot.Event.listenOnce = function (target, type, listener, optThis) {
  return olPlot.Event.listen(target, type, listener, optThis, true)
}

/**
 * 取消事件注册
 * @param target
 * @param type
 * @param listener
 * @param optThis
 */
olPlot.Event.unListen = function (target, type, listener, optThis) {
  var listeners = olPlot.Event.getListeners(target, type)
  if (listeners) {
    var listenerObj = olPlot.Event.findListener(listeners, listener, optThis, true)
    if (listenerObj) {
      olPlot.Event.unListenByKey(listenerObj)
    }
  }
}

/**
 * 根据事件名移除事件对象
 * @param key
 */
olPlot.Event.unListenByKey = function (key) {
  if (key && key.target) {
    key.target.removeEventListener(key.type, key.boundListener)
    var listeners = olPlot.Event.getListeners(key.target, key.type)
    if (listeners) {
      var i = 'deleteIndex' in key ? key.devareIndex : listeners.indexOf(key)
      if (i !== -1) {
        listeners.splice(i, 1)
      }
      if (listeners.length === 0) {
        olPlot.Event.removeListeners(key.target, key.type)
      }
    }
    olPlot.Event.clear(key)
  }
}

/**
 * 清空当前对象
 * @param object
 */
olPlot.Event.clear = function (object) {
  for (var property in object) {
    delete object[property]
  }
}

/**
 * 移除所有事件监听
 * @param target
 */
olPlot.Event.unlistenAll = function (target) {
  var listenerMap = olPlot.Event.getListenerMap(target)
  for (var type in listenerMap) {
    olPlot.Event.removeListeners(target, type)
  }
}

/**
 * 获取事件唯一标识
 * @param type
 * @param fn
 * @param context
 * @returns {string}
 */
olPlot.Event.getDomEventKey = function (type, fn, context) {
  return '_dom_event_' + type + '_' + olPlot.Utils.stamp(fn) + (context ? '_' + olPlot.Utils.stamp(context) : '')
}

/**
 * 对DOM对象添加事件监听
 * @param element
 * @param type
 * @param fn
 * @param context
 * @returns {*}
 */
olPlot.Event.addListener = function (element, type, fn, context) {
  var eventKey = olPlot.Event.getDomEventKey(type, fn, context)
  var handler = element[eventKey]
  if (handler) {
    return this
  }
  handler = function (e) {
    return fn.call(context || element, e)
  }
  if ('addEventListener' in element) {
    element.addEventListener(type, handler, false)
  } else if ('attachEvent' in element) {
    element.attachEvent('on' + type, handler)
  }
  element[eventKey] = handler
  return this
}

/**
 * 移除DOM对象监听事件
 * @param element
 * @param type
 * @param fn
 * @param context
 * @returns {removeListener}
 */
olPlot.Event.removeListener = function (element, type, fn, context) {
  var eventKey = olPlot.Event.getDomEventKey(type, fn, context)
  var handler = element[eventKey]
  if (!handler) {
    return this
  }
  if ('removeEventListener' in element) {
    element.removeEventListener(type, handler, false)
  } else if ('detachEvent' in element) {
    element.detachEvent('on' + type, handler)
  }
  element[eventKey] = null
  return this
}
