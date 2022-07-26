// reads in our .env file and makes those values available as environment variables
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const routes = require('./routes/main');
const secureRoutes = require('./routes/secure');
const cookieParser = require('cookie-parser');
const passport = require('passport');

// setup mongo connection
const uri = process.env.MONGO_CONNECTION_URL;
// mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true });
//useNewUrlParser , useUnifiedTopology , useFindAndModify , and useCreateIndex are no longer supported options. Mongoose 6 always behaves as if useNewUrlParser , useUnifiedTopology , and useCreateIndex are true , and useFindAndModify is false .
mongoose.connect(uri);
mongoose.connection.on('error', (error) => {
  console.log(error);
  process.exit(1);
});
mongoose.connection.on('connected', function () {
  console.log('connected to mongo');
});

// create an instance of an express app
const app = express();

// update express settings
app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json

app.use(cookieParser()); //By using cookie-parser, the request object will have the cookies included.

// require passport auth
require('./auth/auth');

// main routes
app.use('/', routes);

// secure routes
// app.use('/', secureRoutes);
app.use('/', passport.authenticate('jwt', { session: false }), secureRoutes); //secure routes usinge the passport JWT strategy from auth/auth.


// catch all other routes
app.use((req, res, next) => {
  res.status(404);
  res.json({ message: '404 - Not Found' });
});

// handle errors
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({ error: err });
});

// have the server start listening on the provided port
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server started on port ${process.env.PORT || 3000}`);
});