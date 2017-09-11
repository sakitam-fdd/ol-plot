const copyProperties = (target, source) => {
  for (let key of Reflect.ownKeys(source)) {
    if (!key.match(/^(?:constructor|prototype|arguments|caller|name|bind|call|apply|toString|length)$/)) {
      let desc = Object.getOwnPropertyDescriptor(source, key)
      Object.defineProperty(target, key, desc)
    }
  }
}

const mixin = (...mixins) => {
  class Mix {}
  // 以编程方式给Mix类添加mixin的所有方法和访问器
  for (let key in mixins) {
    let mixin = mixins[key]
    copyProperties(Mix, mixin)
    copyProperties(Mix.prototype, mixin.prototype)
  }
  return Mix
}

export default mixin
