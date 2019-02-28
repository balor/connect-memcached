/*!
 * connect-memcached
 * MIT Licensed
 */
<<<<<<< HEAD
const bufferFrom = require('buffer-from');
var crypto = require("crypto");
=======
>>>>>>> Updates to crypto functionality:

var Memcached = require("memcached");
var crypto = require("crypto");
var oneDay = 86400;

function ensureCallback(fn) {
  return function() {
    fn && fn.apply(null, arguments);
  };
}

/**
 * Return the `MemcachedStore` extending `connect`'s session Store.
 *
 * @param {object} session
 * @return {Function}
 * @api public
 */
module.exports = function(session) {
  var Store = session.Store;

  /**
   * Initialize MemcachedStore with the given `options`.
   *
   * @param {Object} options
   * @api public
   */
  function MemcachedStore(options) {
    options = options || {};
    Store.call(this, options);

    this.prefix = options.prefix || "";
    this.ttl = options.ttl;
    if (!options.client) {
      if (!options.hosts) {
        options.hosts = "127.0.0.1:11211";
      }
      if (options.secret) {
        this.secret = derive_key(options.secret);
      }

      this.algorithm = options.algorithm || 'aes-256-gcm';
      this.hashing = options.hashing || 'sha512';
      this.encodeas = options.encodeas || 'hex';

      options.client = new Memcached(options.hosts, options);
    }

    this.client = options.client;
  }

  MemcachedStore.prototype.__proto__ = Store.prototype;

  /**
   * Translates the given `sid` into a memcached key, optionally with prefix.
   *
   * @param {String} sid
   * @api private
   */
  MemcachedStore.prototype.getKey = function getKey(sid) {
    return this.prefix + sid;
  };

  /**
   * Attempt to fetch session by the given `sid`.
   *
   * @param {String} sid
   * @param {Function} fn
   * @api public
   */
  MemcachedStore.prototype.get = function(sid, fn) {
    var secret = this.secret, self = this, sid = this.getKey(sid),
        parseable_string;

    this.client.get(sid, function(err, data) {
      if (err) {
        return fn(err, {});
      }
      try {
        if (!data) {
          return fn();
        }
        if (secret) {
          parseable_string = decryptData.call(self, JSON.parse(data));
        } else {
          parseable_string = data.toString();
        }

        fn(null, JSON.parse(parseable_string));
      } catch (e) {
        fn(e);
      }
    });
  };

  /**
   * Commit the given `sess` object associated with the given `sid`.
   *
   * @param {String} sid
   * @param {Session} sess
   * @param {Function} fn
   * @api public
   */
  MemcachedStore.prototype.set = function(sid, sess, fn) {
    sid = this.getKey(sid);

    try {
      var maxAge = sess.cookie.maxAge;
      var ttl =
        this.ttl || ("number" == typeof maxAge ? (maxAge / 1000) | 0 : oneDay);

      var sess = JSON.stringify(this.secret ? encryptData.call(this,
        JSON.stringify(sess)) : sess);

      this.client.set(sid, sess, ttl, ensureCallback(fn));
    } catch (err) {
      fn && fn(err);
    }
  };

  /**
   * Destroy the session associated with the given `sid`.
   *
   * @param {String} sid
   * @param {Function} fn
   * @api public
   */
  MemcachedStore.prototype.destroy = function(sid, fn) {
    sid = this.getKey(sid);
    this.client.del(sid, ensureCallback(fn));
  };

  /**
   * Fetch number of sessions.
   *
   * @param {Function} fn
   * @api public
   */
  MemcachedStore.prototype.length = function(fn) {
    this.client.items(ensureCallback(fn));
  };

  /**
   * Clear all sessions.
   *
   * @param {Function} fn
   * @api public
   */
  MemcachedStore.prototype.clear = function(fn) {
    this.client.flush(ensureCallback(fn));
  };

  /**
   * Refresh the time-to-live for the session with the given `sid`.
   *
   * @param {String} sid
   * @param {Session} sess
   * @param {Function} fn
   * @api public
   */

  MemcachedStore.prototype.touch = function(sid, sess, fn) {
    this.set(sid, sess, fn);
  };

  function encryptData(plaintext) {
    var pt = encrypt.call(this, this.secret, plaintext, this.algo),
      hmac = digest.call(this, this.secret, pt);

    return {
      ct: pt,
      mac: hmac
    };
  }

  /**
   * Wrapper to create cipher text, digest & encoded payload
   */

  function encryptData(plaintext) {
    var iv = crypto.randomBytes(16).toString(this.encodeas);

<<<<<<< HEAD
    var aad = digest(this.secret, this.serializer.stringify(plaintext),
                     this.hashing, this.encodeas);

    var ct = encrypt(this.secret, this.serializer.stringify(plaintext),
=======
    var aad = digest(this.secret, JSON.stringify(plaintext),
                     this.hashing, this.encodeas);

    var ct = encrypt(this.secret, JSON.stringify(plaintext),
>>>>>>> Updates to crypto functionality:
                     this.algorithm, this.encodeas, iv, aad);

    var hmac = digest(this.secret, ct.ct, this.hashing, this.encodeas);

    var obj = {
      hmac: hmac,
      ct: ct.ct,
      at: ct.at,
      aad: aad,
      iv: iv
    };

<<<<<<< HEAD
    console.log('encryptData %s', this.serializer.stringify(obj));

    return this.serializer.stringify(obj);
=======
    return JSON.stringify(obj);
>>>>>>> Updates to crypto functionality:
  }

  /**
   * Wrapper to extract digest, verify digest & decrypt cipher text
   */

  function decryptData(ciphertext) {
<<<<<<< HEAD
    console.log('decryptData %s', ciphertext);

    if (ciphertext)
      ciphertext = this.serializer.parse(ciphertext);

    var hmac = digest(this.secret, ciphertext.ct, this.hashing, this.encodeas);

    console.log('HMAC %s %s', ciphertext.hmac, hmac);

=======
    ciphertext = JSON.parse(ciphertext);
    
    var hmac = digest(this.secret, ciphertext.ct, this.hashing, this.encodeas);

>>>>>>> Updates to crypto functionality:
    if (hmac != ciphertext.hmac) {
      throw 'Encrypted session was tampered with!';
    }

    var pt = decrypt(this.secret, ciphertext.ct, this.algorithm,
                     this.encodeas, ciphertext.iv, Buffer.from(ciphertext.at),
                     ciphertext.aad);

<<<<<<< HEAD
    console.log('PT %s %s', pt, typeof pt);

    return this.serializer.parse(pt);
=======
    return JSON.parse(pt);
>>>>>>> Updates to crypto functionality:
  }

  /**
   * Generates HMAC as digest of cipher text
   */

  function digest(key, obj, hashing, encodeas) {
    var hmac = crypto.createHmac(hashing, key);
    hmac.setEncoding(encodeas);
    hmac.write(obj);
    hmac.end();
    return hmac.read().toString(encodeas);
<<<<<<< HEAD
  }

  /**
   * Creates cipher text from plain text
   */

  function encrypt(key, pt, algo, encodeas, iv, aad) {
    var cipher = crypto.createCipheriv(algo, key, iv, {
      authTagLength: 16
    }), ct, at;

    try {
      cipher.setAAD(Buffer.from(aad), {
        plaintextLength: Buffer.byteLength(pt)
      });
    } catch(e) {
      // Discard as the algo may not support AAD
    }

    ct = cipher.update(pt, 'utf8', encodeas);
    ct += cipher.final(encodeas);

    try {
      at = cipher.getAuthTag();
    } catch(e) {
      // Discard as the algo may not support auth tags
    }

    return (at) ? {'ct': ct, 'at': at} : {'ct': ct};
  }

  /**
=======
  }

  /**
   * Creates cipher text from plain text
   */

  function encrypt(key, pt, algo, encodeas, iv, aad) {
    var cipher = crypto.createCipheriv(algo, key, iv, {
      authTagLength: 16
    }), ct, at;

    try {
      cipher.setAAD(Buffer.from(aad), {
        plaintextLength: Buffer.byteLength(pt)
      });
    } catch(e) {
      // Discard as the algo may not support AAD
    }

    ct = cipher.update(pt, 'utf8', encodeas);
    ct += cipher.final(encodeas);

    try {
      at = cipher.getAuthTag();
    } catch(e) {
      // Discard as the algo may not support auth tags
    }

    return (at) ? {'ct': ct, 'at': at} : {'ct': ct};
  }

  /**
>>>>>>> Updates to crypto functionality:
   * Creates plain text from cipher text
   */

  function decrypt(key, ct, algo, encodeas, iv, at, aad) {
    var cipher = crypto.createDecipheriv(algo, key, iv)
      , pt;

    try {
      if (at)
        cipher.setAuthTag(Buffer.from(at));
    } catch(e) {
      // Discard as the algo may not support Auth tags
    }

    try {
      if (aad)
        cipher.setAAD(Buffer.from(aad), {plaintextLength: Buffer.byteLength(ct)});
    } catch(e) {
      // Discard as the algo may not support AAD
    }

    pt = cipher.update(ct, encodeas, 'utf8');
    pt += cipher.final('utf8');

    return pt;
  }

  /**
   * Derive key from supplied pass phrase
   */
   
  function derive_key(secret) {
    var key, hash, salt;

    if (!secret)
      return false;

    hash = crypto.createHash('sha512');
    hash.update(secret);
    salt = hash.digest('hex').substr(0, 16);

    key = crypto.pbkdf2Sync(secret, salt, 25000, 64, 'sha512');

    return key.toString('hex').substr(0, 32);
  }

  return MemcachedStore;
};
