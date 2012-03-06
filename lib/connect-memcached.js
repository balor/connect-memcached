
/*!
 * connect-memcached
 * Copyright(c) 2012 Michał Thoma <michal@balor.pl>
 * MIT Licensed
 */

/**
 * Library version.
 */

exports.version = '0.0.3';


/**
 * Module dependencies.
 */

var Memcached = require('memcached');

/**
 * One day in seconds.
 */

var oneDay = 86400;



/**
 * Return the `MemcachedStore` extending `connect`'s session Store.
 * 
 * @param {object} connect
 * @return {Function}
 * @api public
 */

module.exports = function(connect){

  /**
   * Connect's Store.
   */

  var Store = connect.session.Store;

  /**
   * Initialize MemcachedStore with the given `options`.
   *
   * @param {Object} options
   * @api public
   */

  function MemcachedStore(options) {
    options = options || {};
    Store.call(this, options);
    if (!options.hosts) {
        options.hosts = '127.0.0.1:11211';
    }
    this.client = new Memcached(options.hosts, options);
    console.log("MemcachedStore initialized for servers: " + options.hosts);

    this.client.on("issue", function(issue) {
        console.log("MemcachedStore::Issue @ " + issue.server + ": " + 
            issue.messages + ", " + issue.retries  + " attempts left");
    });
  };

  /**
   * Inherit from `Store`.
   */

  MemcachedStore.prototype.__proto__ = Store.prototype;

  /**
   * Attempt to fetch session by the given `sid`.
   * 
   * @param {String} sid
   * @param {Function} fn
   * @api public
   */

  MemcachedStore.prototype.get = function(sid, fn) {
      this.client.get(sid, function(err, data) {
          try {
              if (!data) {
                 return fn();
              }
              fn(null, JSON.parse(data.toString()));
          } catch (err) {
              fn(err);
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
      try {
          var maxAge = sess.cookie.maxAge
          var ttl = 'number' == typeof maxAge ? maxAge / 1000 | 0 : oneDay
          var sess = JSON.stringify(sess);

          this.client.set(sid, sess, ttl, function() {
              fn && fn.apply(this, arguments);
          });
      } catch (err) {
          fn && fn(err);
      } 
  };

  /**
   * Destroy the session associated with the given `sid`.
   * 
   * @param {String} sid
   * @api public
   */

  MemcachedStore.prototype.destroy = function(sid, fn) {
        this.client.del(sid, fn);
  };

  /**
   * Fetch number of sessions.
   *
   * @param {Function} fn
   * @api public
   */

  MemcachedStore.prototype.length = function(fn) {
        this.client.items(fn);
  };

  /**
   * Clear all sessions.
   * 
   * @param {Function} fn
   * @api public
   */ 

  MemcachedStore.prototype.clear = function(fn) {
        this.client.flush(fn);
  };

  return MemcachedStore;
};
