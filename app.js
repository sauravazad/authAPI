const express = require("express");
const path = require("path");
var redis = require("redis");
const bodyParser = require("body-parser");
const session = require("express-session");
var redisStore = require("connect-redis")(session);
var client = redis.createClient();
const cors = require("cors");
const passport = require("passport");
const mongoose = require("mongoose");
const errorHandler = require("errorhandler");
const sessionSecrete = "passport-AUTH";
//Configure mongoose's promise to global promise
mongoose.promise = global.Promise;

//Configure isProduction variable
const isProduction = process.env.NODE_ENV === "production";
//Configure Mongoose and server port
const dbPort = process.env.DB_PORT || 27017;
const serverPort = 8000;
const redisPort = 6379;
const dbUrl = process.env.DB_URL || "localhost";
const dbCollection = process.env.DB_COLLECTION || "auth-test";
//Initiate our app
const app = express();

//Configure our app
app.use(cors());
app.use(require("morgan")("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//  set config for redis port number and cookie maxage
//  consfigure a store for session managemant Using Redis
app.use(
  session({
    secret: sessionSecrete,
    cookie: { maxAge: 60000 },
    store: new redisStore({
      host: "localhost",
      port: redisPort,
      client: client,
      ttl: 260
    }),
    resave: false,
    saveUninitialized: false
  })
);

if (!isProduction) {
  //  send stack trace and full error details to the client  do not use in production environment
  app.use(errorHandler());
}

mongoose
  .connect(`mongodb://${dbUrl}:${dbPort}/${dbCollection}`, {
    useNewUrlParser: true
  })
  .then(_ => console.log("Connected Successfully to MongoDB"))
  .catch(err => console.error(err));
mongoose.set("debug", true);

//  pass passport middleware for authenticated routes
app.use(passport.initialize());
//Models & routes
require("./models/Users");
require("./models/followers");
require("./config/passport");
//  pass the routes to express app
app.use(require("./routes"));

//  default error handler
//Error handlers & middlewares
if (!isProduction) {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    if (err.name === "UnauthorizedError") {
      res.status(401).send("invalid token.");
    }
    res.json({
      errors: {
        message: err.message,
        error: err
      }
    });
  });
}

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  if (err.name === "UnauthorizedError") {
    res.status(401).send("invalid token.");
  }
  res.json({
    errors: {
      message: err.message,
      error: {}
    }
  });
});

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

app.listen(serverPort, () =>
  console.log(`Server running on http://localhost:${serverPort}/`)
);
app.on("error", onError);
