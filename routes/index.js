const express = require('express');
const router  = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  // req.user  is created by passport
  console.log(req.user);

  if( req.user) {
    res.locals.roomSuccess = req.flash('roomFeedback');
    res.render('auth-views/user-home.ejs');
  } else {
    res.locals.signupFeedback = req.flash('signupSuccess');
    res.render('index');
  }

});

module.exports = router;
