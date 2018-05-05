
const installed = false

export function install (Vue, options) {
  Vue.mixin({
    beforeCreate () {
      if (this.$options.jwt !== undefined) {
        // _jwtRoot is used to propogate $jwt through children components
        this._jwtRoot = this
        this._jwt = this.$options.jwt
        Vue.util.defineReactive(this, '_jwt', this._jwt)
      } else {
        this._jwtRoot = (this.$parent && this.$parent._jwtRoot) || this
      }
    }
  })

  // allows Vue components to use this.$jwt
  Object.defineProperty(Vue.prototype, '$jwt', {
    get () { return this._jwtRoot._jwt }
  })
  
}