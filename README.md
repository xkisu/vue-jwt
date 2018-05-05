# vue-jwt

`vue-jwt` is a event-based library for storing and managing a JWT session token.

Include automatic expiration management when a token is set, if it contains the `exp` field an experation timeout and the cookie expire time will be set. When the expired time is reached it will fire `#.emit('expired')` and set the token to undefined. 

# Installing

```
npm i xkisu/vue-jwt
```

# Usage Example

```javascript
// src/jwt/index.js

import Vue from 'vue'
import VueJWT from 'vue-jwt'

Vue.use(VueJWT)


export default new VueJWT({
  domain: 'localhost'
})
```

```javascript
// src/main.js
...
import jwt from '@/jwt'
...

new Vue({
  el: '#app',
  router,
  jwt,
  ...
})
```

And then somewhere in your login component.

```javascript
...

const token = await getToken(username, password)
this.$jwt.setToken(token)

...
```

And then somewhere in your router.

```javascript
...
import jwt from '@/jwt'
...

router.beforeEach((to, from, next) => {
  if (to.name !== 'login' && to.name !== 'signup') {
    if (!jwt.getToken()) {
      return next({
        name: 'login',
        query: {
          message: 'Session expired'
        }
      })
    }
  }
  next()
})

jwt.on('changed', () => {
  router.push({
    name: 'dashboard',
    query: {
      message: 'Login successful'
    }
  })
})

jwt.on('expired', () => {
  router.push({
    name: 'login',
    query: {
      message: 'Login token expired'
    }
  })
})

...
```

# Events

 * `changed` - the jwt token changed
 * `expired` - the jwt token expired

 # Methods

 * `setToken(<token:string>)` - Sets the token
 * `getToken()` - Get the current token, returned `undefined` if no token is set or it expired
 * `getData()` - Returns a JSON object of the data in the token