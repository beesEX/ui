const passport = require('passport');
const {Strategy: LocalStrategy} = require('passport-local');
const requestToBackend = require('../util/callBackend');
const {getErrorFromResponse} = require('../util/backendResponseUtil');

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
    body: {
      email,
      password
    },
    req: req
  };

  const jwtTokenPromise = requestToBackend.post(options);

  jwtTokenPromise.then((response) => {

    const errorObject = getErrorFromResponse(response, 'string');

    if (errorObject) {

      req.flash('errors', errorObject);

      done(null, null, 'Fail! Please try again');

    }
    else {

      done(null,
        response.user,
        {
          token: response.token,
          msg: 'Success! You are logged in.'
        }
      );

    }

  })

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
