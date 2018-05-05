import EventEmitter from 'eventemitter3'

import jwt from 'jsonwebtoken'
import cookies from 'js-cookie'
import moment from 'moment'

const defaultOptions = {
  cookie: 'token',
  domain: undefined,
  store (token) {
    const dat = jwt.decode(token)
    const expires = dat.exp ? moment.unix(dat.exp).toDate() : undefined
    console.log(expires)
    cookies.set(this.cookie, token, {
      expires,
      domain: this.domain
    })
  },
  retrive () {
    return cookies.get(this.cookie)
  },
  clear () {
    cookies.remove(this.cookie, {
      domain: this.domain
    })
  }
}

class VueJWT extends EventEmitter {
  
  constructor (options) {
    super()

    // shallow copy default options
    this.options = Object.assign({}, defaultOptions)
    this.token = undefined
    this._tokenExpTimer = undefined

    // copy suppied options to local options variable, overwriting defaults
    for(let key in options) {
      if(!options.hasOwnProperty(key)) continue
      this.options[key] = options[key]
    }

    // retrive the token (if any) from the store and set it
    const token = this._retriveToken()
    if(token && !this._checkExpired(token)) {
      this.setToken(token)
    } else {
      this.setToken(undefined)
    }
  }

  _retriveToken () {
    const token = this.options.retrive()
    return token
  }

  _checkExpired (token) {
    const data = jwt.decode(token)
    const seconds = moment().diff(moment().unix(data.exp), 'seconds')
    return data.exp ? seconds < 0 : false
  }

  _expTimer (token) {
    const data = jwt.decode(token)
    if (data.exp) {
      const ttl = moment().diff(moment().unix(data.exp), 'seconds')
      if(ttl > 0) {
        if (this._tokenExpTimer) clearTimeout(this._tokenExpTimer)
        this._tokenExpTimer = setTimeout(()=> {
          this._tokenExpired()
        }, ttl)
      } else {
        if (this._checkExpired()) _tokenExpired()
      }
    }
  }

  setToken (token) {
    if (token === undefined) {
      this.token = undefined
      this.options.clear()
      this.emit('expired')
      if (this._tokenExpTimer) clearTimeout(this._tokenExpTimer)
    } else {
      this.token = token
      this.options.store(this.token)

      const data = jwt.decode(this.token)

      this.emit('changed', {
        token: this.token,
        data
      })

      this._expTimer(this.token)
    }
  }

  getToken () {
    return this.token
  }

  getData () {
    return this.token ? jwt.decode(this.token) : undefined
  }
}

export default VueJWT