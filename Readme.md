# connect-memcached

  Memcached session store, using [node-memcached](http://github.com/3rd-Eden/node-memcached) for communication with cache server.

## Installation

  via npm:

```bash
$ npm install connect-memcached
```

## Example
```javascript
var express      = require('express')
, session        = require('express-session')
, cookieParser   = require('cookie-parser')
, http           = require('http')
, app            = express()
, MemcachedStore = require('connect-memcached')(session);

app.use(cookieParser());
app.use(session({
      secret  : 'CatOnKeyboard'
    , key     : 'test'
    , proxy   : 'true'
    , store   : new MemcachedStore({
        hosts: ['127.0.0.1:11211']
    })
}));

app.get('/', function(req, res){
    if(req.session.views) {
        ++req.session.views;
    } else {
        req.session.views = 1;
    }
    res.send('Viewed <strong>' + req.session.views + '</strong> times.');
});

http.createServer(app).listen(9341, function() {
    console.log("Listening on %d", this.address().port);
});
```

## Options
- `hosts` Memcached servers locations, can by string, array, hash.
- `prefix` An optional prefix for each memcache key, in case you are sharing your memcached servers with something generating its own keys.
- ...     Rest of given option will be passed directly to the node-memcached constructor.

For details see [node-memcached](http://github.com/3rd-Eden/node-memcached).

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
