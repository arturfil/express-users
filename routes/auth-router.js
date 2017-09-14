const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');

const UserModel = require('../models/user-model.js');

const router = express.Router();

router.get('/signup', (req, res, next) => {
  // redirect home if you are already logged in;
  if(req.user) {
    res.redirect('/');
    return;
  }

  res.render('auth-views/signup-form.ejs');
})

router.post('/process-signup', (req, res, next) => {
  // if either email or password
  if(req.body.signupEmail === "" || req.body.signupPassword === "") {
    res.locals.feedbackMessage = "We need both email and password";
    res.render('auth-views/signup-form.ejs');
    return;
  }

  // check the database to see if there's a user with that email
  UserModel.findOne(
    { email: req.body.signupEmail },
    (err, userFromDb) => {
      if(err) {
        next(err);
        return;
      }

      if(userFromDb) {
        res.locals.feedbackMessage = 'Email taken';
        res.render('auth-views/signup-form.ejs');
        return;
      }

      //if we get to this line, green litght to salt and encryp their pasword .....

      const salt = bcrypt.genSaltSync(10);
      const scrambledPass = bcrypt.hashSync(req.body.signupPassword, salt);

      const theUser = new UserModel({
        email: req.body.signupEmail,
        encryptedPassword: scrambledPass
      });

      theUser.save((err) => {
        if(err) {
          next(err);
          return;
        }
        req.flash('signupSuccess', 'Sign up Succesful!');
        res.redirect('/');
      });
    }
  );
})

router.get('/login', (req, res, next) => {
  // redirect home if you are already logged in;
  if(req.user) {
    res.redirect('/');
    return;
  }

  res.locals.flashError = req.flash('error');

  // check for feedback messages from the log out procces
  res.locals.logoutFeedback = req.flash('logoutSuccess');
  res.locals.securityFeedback = req.flash('securityError');
  res.render('auth-views/login-form.ejs');
});

router.post('/process-login',
  // name of the strategy
  passport.authenticate("local", {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  })
);

router.get('/logout', (req, res, next) => {
  // special passport method for clearing the session
  // (emptying the bowl)
  req.logout();
  req.flash('logoutSuccess', 'Log out successful');

  res.redirect('/login');

});

//link to /auth/facebook to take the user to the Facebook Website for login
router.get('/auth/facebook', passport.authenticate('facebook'));
// the /auth/facebook/callback URL is whre the user will arrive after login
router.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  })
);

// link to "/auth/google" to take the user to the Google Website for login
router.get('/auth/google',
  passport.authenticate('google', {
    scope: [
      'https://www.googleapis.com/auth/plus.login',
      'https://www.googleapis.com/auth/plus.profile.emails.read'
    ]
  })
);

// the '/auth/google/callback' URL is where the user will arrive after login
router.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  })
);


module.exports = router;
