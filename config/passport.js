const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const makeRequest = require('request');

const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
  let backendLoginUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  backendLoginUrl += process.env.BACKEND_SIGN_IN || '/account/signin';
  const options = {
    url: backendLoginUrl,
    form: { email, password }
  };
  makeRequest.post(options, (err, httpResponse, body) => {
    try {
      const jsonBody = JSON.parse(body);
      console.log(jsonBody);
      if (jsonBody.errors && Array.isArray(jsonBody.errors)) {
        for (const error of body.errors) {
          const keys = Object.keys(err);
          const flashData = {};
          flashData[keys[0]] = `BACKEND: ${error[keys[0]]}`;
          return done(flashData);
        }
      }
      else {
        return done(null, jsonBody.user, { token: jsonBody.token, msg: 'Success! You are logged in.' });
      }
    }
    catch (error) {
      return done(error);
    }
  });
}));

/**
 * Login Required middleware.
 */
exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};
