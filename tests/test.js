var express = require("express"),
  session = require("express-session"),
  cookieParser = require("cookie-parser"),
  http = require("http"),
  app = express(),
  MemcachedStore = require("../lib/connect-memcached")(session);

app.use(cookieParser());
app.use(
  session({
    secret: "TestSecret",
    key: "test",
    proxy: "true",
    resave: false,
    saveUninitialized: false,
    store: new MemcachedStore({
      hosts: ["127.0.0.1:11211"],
      prefix: "testapp_"
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

http.createServer(app).listen(9341, function() {
  console.log("Listening on %d", this.address().port);
});