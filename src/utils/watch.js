/*
 * object.watch v0.0.1: Cross-browser object.watch
 *
 * By Elijah Grey, http://eligrey.com
 *
 * A shim that partially implements object.watch and object.unwatch
 * in browsers that have accessor support.
 *
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

/* eslint no-extend-native: ["error", { "exceptions": ["Object"] }] */
if (!Object.prototype.watch) { // watch
  Object.prototype.watch = function (prop, handler) {
    let oldval = this[prop]
    let newval = oldval
    let getter = function () {
      return newval
    }
    let setter = function (val) {
      oldval = newval
      return (newval = handler.call(this, prop, oldval, val))
    }
    if (delete this[prop]) { // can't watch constants
      if (Object.defineProperty) { // ECMAScript 5
        Object.defineProperty(this, prop, {
          get: getter,
          set: setter
        })
      } else if (Object.prototype.__defineGetter__ && Object.prototype.__defineSetter__) { // legacy
        Object.prototype.__defineGetter__.call(this, prop, getter)
        Object.prototype.__defineSetter__.call(this, prop, setter)
      }
    }
  }
}
if (!Object.prototype.unwatch) { // unwatch
  Object.prototype.unwatch = function (prop) {
    let val = this[prop]
    delete this[prop] // remove accessors
    this[prop] = val
  }
}
