# connect-memcached

Memcached session store, using [node-memcached](http://github.com/3rd-Eden/node-memcached) for communication with cache server.

## Installation

npm:

```shell
npm install connect-memcached express-session
```

yarn:

```shell
yarn add connect-memcached express-session
```

## Example

```javascript
var express = require("express"),
  session = require("express-session"),
  app = express(),
  MemcachedStore = require("connect-memcached")(session);

app.use(
  session({
    secret: "CatOnKeyboard",
    key: "test",
    proxy: "true",
    resave: false,
    saveUninitialized: false,
    store: new MemcachedStore({
      hosts: ["127.0.0.1:11211"],
      secret: "Xj8$kLp2@Qa9#Zt5!" // Optionally use transparent encryption for memcached session data (must meet complexity requirements)
    })
  })
);

app.get("/", function(req, res) {
  if (req.session.views) {
    ++req.session.views;
  } else {
    req.session.views = 1;
  }
  res.send("Viewed <strong>" + req.session.views + "</strong> times.");
});

app.listen(9341, function() {
  console.log("Listening on %d", this.address().port);
});
```

## Options

- `hosts` (Optional) Memcached servers locations, can be string, array or hash. Default is `127.0.0.1:11211`.
- `prefix` (Optional) Prefix for each memcached key, in case you are sharing your memcached servers with something generating its own keys.
- `ttl` (Optional) Default TTL parameter for the session data (in seconds).
- `secret` (Optional) Secret used to encrypt/decrypt session contents. Setting it enables data encryption, which is handled by [kruptein](https://github.com/jas-/kruptein) module.
- `algorithm` (Optional) Cipher algorithm from `crypto.getCiphers()`. Default is `aes-256-gcm`.
- `hashing` (Optional) Hash algorithm from `crypto.getHashes()`. Default is `sha512`.
- ... Rest of given options will be passed directly to the [node-memcached](http://github.com/3rd-Eden/node-memcached) and [kruptein](https://github.com/jas-/kruptein) constructors, see their appropriate docs for extra configurability.

## Upgrading to v3.x.x

v3.0.0 introduces two breaking changes:

### 1. Node.js version requirement

**Breaking change:** v3.0.0 requires Node.js >= 14.0.0. Support for Node.js versions 4-12 has been dropped.

If you're running an older Node.js version, please upgrade to Node.js 14 or later before upgrading to v3.x.x.

### 2. Stronger secret requirements for encryption

**Breaking change:** The `kruptein` dependency has been updated to enforce stricter password complexity requirements for the `secret` option. If you use encryption (set the `secret` option), your secret must now meet these requirements:

- Minimum length: 8 characters
- Minimum 2 uppercase letters
- Minimum 2 lowercase letters
- Minimum 2 numbers
- Minimum 2 special characters (`!@#$%^&*()_+-=[]{};':"\\|,.<>/?`)

**IMPORTANT:** Check if your current secret meets these requirements:

- **If your secret already meets the requirements:** You can upgrade safely with no additional action needed.
- **If your secret does NOT meet the requirements:** You MUST flush all encrypted session data from memcached before upgrading AND update your secret to meet the new requirements. All existing encrypted session data will become inaccessible with the new secret.

Sessions without encryption (no `secret` option) are not affected.

## Upgrading to v2.x.x

When upgrading from pre v2 and using data encryption please flush all the session entries from memcached before rolling the update.

Sessions without data encryption are not affected.

## Upgrading from v0.x.x -> v1.x.x

If You're upgrading from the pre v1.0.0 version of this library and use encryption for session data be sure to **remove all session entries created with previous version**. 

Upgrading library without taking appropriate action will result in `SyntaxError` exceptions during JSON parsing of decoded entries. 

Sessions without encryption are not affected.

## Contributors

Big thanks for the contributors! See the actual list [here](https://github.com/balor/connect-memcached/graphs/contributors)!

## License

(The MIT License)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
