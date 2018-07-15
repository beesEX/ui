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
          const keys = Object.keys(error);
          const flashData = {};
          flashData[ keys[ 0 ] ] = `BACKEND: ${error[ keys[ 0 ] ]}`;
          req.flash(flashData);
        }

        done(new Error(jsonBody.errors[ 0 ].message));

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
