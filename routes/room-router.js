const express = require('express');
const router = express.Router();
const RoomModel = require('../models/room-model.js');
const multer = require('multer')
const myUploader = multer(
  // 1 argument -> setting object
  {
    dest: __dirname + '/../public/uploads/'
  }// destination folder for uploaded files
);

router.get('/rooms/new', (req, res, next) => {
  if(req.user === undefined) {
    req.flash('securityError', 'Log in to add a room')
    res.redirect('/login');
    return;
  }
  res.render('room-views/room-form.ejs')
});

router.post(
  '/rooms',
  myUploader.single('roomPhoto'),
  (req, res, next) => {
  if(req.user === undefined) {
    req.flash('securityError', 'Log in to add a room')
    res.redirect('/login');
    return;
  }

  // multer creates 'req.file' with all the file information
  console.log('req.file (created by )');
  console.log(req.file);

  const theRoom = new RoomModel({
    name: req.body.roomName,
    photoUrl: '/uploads/' + req.file.filename,
    // req.file.filename is the automatically generated name for the uploaded file
    desc: req.body.roomDesc,
    owner: req.user._id
  })// Logged ni user's ID from passport
    // (passport defines 'req.user')

    theRoom.save((err) => {
      if(err){
        next(err);
        return;
      }

      req.flash('roomFeedback', 'Room added.');
      res.redirect('/');
    })
});

router.get('/my-rooms', (req, res, next) => {
  if(req.user === undefined) {
    req.flash('securityError', 'Log in to add a room')
    res.redirect('/login');
    return;
  }
  RoomModel.find(
    { owner: req.user._id },
    (err, myRooms) => {
      if(err) {
        next(err);
        return;
      }
      res.locals.updateFeedback = req.flash('updateSuccess');

      res.locals.listOfRooms = myRooms;
      res.render('room-views/my-rooms.ejs');
    })
});

router.get('/rooms/:roomId/edit', (req, res, next) => {
  if(req.user === undefined) {
    req.flash('securityError', 'Log in to edit a room')
    res.redirect('/login');
    return;
  }
  RoomModel.findById(
    req.params.roomId,
    (err, roomFromDb) => {
      if(err) {
        next(err);
        return;
      }
      if(roomFromDb.owner.toString() !== req.user._id.toString()) {
        req.flash('securityError', 'You can only edit your rooms');
        res.redirect('/my-rooms');
        return;
      }

      res.locals.updateFeedback = req.flash('updateSuccess');

      res.locals.roomInfo = roomFromDb;
      res.render('room-views/room-edit.ejs');
    }
  );
});

router.post('/rooms/:roomId',
  myUploader.single('roomPhoto'),
 (req, res, next) => {
   if(req.user === undefined) {
     req.flash('securityError', 'Log in to add a room')
     res.redirect('/login');
     return;
   }
  RoomModel.findById(
    req.params.roomId,
    (err, roomFromDb) => {
      if(err) {
        next(err);
        return;
      }

      if(roomFromDb.owner.toString() !== req.user._id.toString()) {
        req.flash('securityError', 'You can only edit your rooms');
        res.redirect('/my-rooms');
        return;
      }

      roomFromDb.name = req.body.roomName;
      // roomFromDb.photoUrl = req.body.roomPhoto;
      roomFromDb.desc = req.body.roomDescription;

      if (req.file) {
        roomFromDb.photoUrl = '/uploads/' + req.file.filename;
      }

      roomFromDb.save((err) => {
        if(err) {
          console.log(err);
          next(err);
          return;
        }
        req.flash('updateSuccess', 'Room update succesful.');
        res.redirect('/my-rooms')
      });
    }
  )
})

module.exports = router;
