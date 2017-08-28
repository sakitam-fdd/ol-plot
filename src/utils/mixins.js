const copyProperties = (target, source) => {
  for (let key of Reflect.ownKeys(source)) {
    if (!key.match(/^(?:constructor|prototype|arguments|caller|name|bind|call|apply|toString|length)$/)) {
      let desc = Object.getOwnPropertyDescriptor(source, key)
      Object.defineProperty(target, key, desc)
    }
  }
}

const mixin = (...mixins) => {
  class _mixin {}
  // 以编程方式给_mixin类添加mixin的所有方法和访问器
  for (let key in mixins) {
    let mixin = mixins[key]
    copyProperties(_mixin, mixin)
    copyProperties(_mixin.prototype, mixin.prototype)
  }
  return _mixin
}

export default mixin
