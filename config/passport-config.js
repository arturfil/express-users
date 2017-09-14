const passport = require('passport');
const UserModel = require('../models/user-model.js');
const bcrypt = require('bcrypt');

// 'serializeUser' is called when a user logs in
passport.serializeUser((userFromDb, done) => {
  // tell passport we want to save the ID inside the session
  done(null, userFromDb._id);
});

// 'deserializeUser' is called on every requrest After loggin in
// it tells passport how to get the user information
// with the contents of the session (in this case, the ID).
passport.deserializeUser((idFromBowl, done) => {
  UserModel.findById(
    idFromBowl,

    (err, userFromDb) => {
      if(err) {
        done(err);
        return;
      }

      //give passport the user document from the database
      done(null, userFromDb);

    }
  )
});

//Strategies setup

const LocalStrategy = require('passport-local').Strategy;
// 'passport.use()' sets up a new strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: 'loginEmail',
      passwordField: 'loginPassword'
    }, //
    (emailValue, passValue, done) => {
      // find the user in the database with that email
      UserModel.findOne(
        { email: emailValue },

        (err, userFromDb) => {
          if(err) {
            done(err);
            return;
          }
          //'userFromDb' will be 'null' if we didn't find anything
          if(userFromDb === null) {
            done(null, false, { message: 'Email is wrong 💩'});
            return;
          }
          // confirm that the password is correct
          const isGoodPassword = bcrypt.compareSync(passValue, userFromDb.encryptedPassword);

          if (isGoodPassword === false) {
            done(null, false, { message: 'Password is wrong 💩'});
            return;
          }
          // if everything works, send passport the user document
          done(null, userFromDb);
          //passport takes 'userFromDb' and calls 'serializeUser"
        }
      );
    }
  )
);

const FbStrategy = require('passport-facebook').Strategy;

passport.use(
  new FbStrategy(
    // 1st arg -> settings object
    {
        // App ID = Client ID
        clientID: process.env.fb_app_id, //----> defined in the .env file
        // clientSecret = App Secret
        clientSecret: process.env.fb_app_secret,
        callbackURL: '/auth/facebook/callback'
    },
    //2nd arg, -> callback
    // gets called after a succesful facebook login
    (accessToken, refreshToken, profile, done) => {
      console.log('Facebook user info:');
      console.log(profile);

      // check to see if it's the first time they log in
      UserModel.findOne(
        { facebookID: profile.id },

        (err, userFromDb) => {
          if (err) {
            done(err);
            return;
          }
          if(userFromDb) {
            done(null, userFromDb);
            return;
          }

          const theUser = new UserModel({
            facebookID: profile.id,
            email: 'blah facebook name'
          });

          theUser.save((err) => {
            if (err) {
              done(err);
              return;
            }

            // if save is succesful, log them in.
            done(null, theUser);
          })
        }
      );
    }
  ) // close new FbStrategy
);

const GoogleStratey = require('passport-google-oauth').OAuth2Strategy;

passport.use(
  new GoogleStratey(
    {
      clientID: process.env.google_app_id,
      clientSecret: process.env.google_app_secret,
      callbackURL: '/auth/google/callback',
      proxy: true
    },
    (accesToken, resfreshToke, profile, done) => {
      console.log('Google user info:');
      console.log( profile.emails[0].value);
      UserModel.findOne(
        { googleID: profile.id },
        (err, userFromDb) => {
          if (err) {
            done(err);
            return;
          }

          if(userFromDb) {
            done(null, userFromDb);
            return;
          }
          // otherwise create an account before loggin them in
          const theUser = new UserModel({
            googleID: profile.id,
            email: profile.emails[0].value
          });
          theUser.save((err) => {
            if(err){
              done(err);
              return;
            }
            done(null, theUser);
          })
        }
      )
    }
  )
);
