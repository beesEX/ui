const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const createRequestToBackend = require('../util/createRequestToBackend');

const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({
  passReqToCallback: true,
  usernameField: 'email'
}, (req, email, password, done) => {
  const options = {
    url: process.env.BACKEND_SIGN_IN,
    form: {
      email,
      password
    }
  };
  const requestToBackend = createRequestToBackend(req);
  requestToBackend.post(options, (err, httpResponse, body) => {
    try {
      const jsonBody = JSON.parse(body);
      if(jsonBody.errors && Array.isArray(jsonBody.errors)) {
        for(const error of jsonBody.errors) {
          if(typeof error === 'string') {
            req.flash('errors', { msg: error });
          }
          else{
            const msg = error.password || error.email || error.message;
            req.flash('errors', { msg });
          }
        }

        done(null, null, 'Fail! Please try again');

      }
      else{
        done(null,
          jsonBody.user,
          {
            token: jsonBody.token,
            msg: 'Success! You are logged in.'
          }
        );
      }
    }
    catch(error) {
      done(error);
    }
  });
}));

/**
 * Login Required middleware.
 */
exports.isAuthenticated = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};
