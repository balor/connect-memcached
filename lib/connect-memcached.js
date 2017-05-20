/*!
 * connect-memcached
 * MIT Licensed
 */

var Memcached = require('memcached');
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

        this.serverSupportsTouch = options.serverSupportsTouch;
        this.prefix = options.prefix || '';
        this.ttl = options.ttl;
        if (!options.client) {
            if (!options.hosts) {
                options.hosts = '127.0.0.1:11211';
            }
            if (options.secret) {
                this.crypto = require('crypto'),
                this.secret = options.secret;
            }
            if (options.algorithm) {
                this.algorithm = options.algorithm;
            }

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
    	secret = this.secret, self = this, sid = this.getKey(sid);

        this.client.get(sid, function(err, data) {
            if (err) {
                return fn(err, {}); 
            }
            try {
                if (!data) {
                    return fn();
                }
                if (secret) {
                    parseable_string = decryptData.call(self, data.toString());
                }
                else {
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
            var ttl = computeTtl.call(this, sess);
            var sess = JSON.stringify((this.secret) ?
                                encryptData.call(this, JSON.stringify(sess),
                                                 this.secret, this.algorithm) :
                                sess);

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

    MemcachedStore.prototype.touch = function (sid, sess, fn) {
        sid = this.getKey(sid);

        try {
            var ttl = computeTtl.call(this, sess);
            var self = this;

            // memcached.touch support introduced in 1.4.8 and buggy until 1.4.14
            // when touch not supported implement it using get+set as modelled in MemoryStore
            // Memcached.version is not robust so we use options flag to disable work-around

            if (this.serverSupportsTouch) {
                this.client.touch(sid, ttl, ensureCallback(fn));
            } else {
                self.client.get(sid, function(err, data) {
                    if (err) {
                        return fn && fn(err);
                    }
                    self.client.set(sid, data, ttl, ensureCallback(fn));
                });
            }
        } catch (err) {
            fn && fn(err);
        }
    }

    function computeTtl(sess) {
        var maxAge = sess.cookie.maxAge;
        return this.ttl || ('number' == typeof maxAge ? maxAge / 1000 | 0 : oneDay);
    }

    function encryptData(plaintext){
        var pt = encrypt.call(this, this.secret, plaintext, this.algo)
            , hmac = digest.call(this, this.secret, pt);

        return {
            ct: pt,
            mac: hmac
        };
    }

    function decryptData(ciphertext){
        ciphertext = JSON.parse(ciphertext)
        var hmac = digest.call(this, this.secret, ciphertext.ct);

        if (hmac != ciphertext.mac) {
            throw 'Encrypted session was tampered with!';
        }

        return decrypt.call(this, this.secret, ciphertext.ct, this.algo);
    }

    function digest(key, obj) {
        var hmac = this.crypto.createHmac('sha512', key);
        hmac.setEncoding('hex');
        hmac.write(obj);
        hmac.end();
        return hmac.read();
    }

    function encrypt(key, pt, algo) {
        algo = algo || 'aes-256-ctr';
        pt = (Buffer.isBuffer(pt)) ? pt : new Buffer(pt);

        var cipher = this.crypto.createCipher(algo, key), ct = [];
        ct.push(cipher.update(pt, 'buffer', 'hex'));
        ct.push(cipher.final('hex'));

        return ct.join('');
    }

    function decrypt(key, ct, algo) {
        algo = algo || 'aes-256-ctr';
        var cipher = this.crypto.createDecipher(algo, key), pt = [];

        pt.push(cipher.update(ct, 'hex', 'utf8'));
        pt.push(cipher.final('utf8'));

        return pt.join('');
    }

    return MemcachedStore;
};
