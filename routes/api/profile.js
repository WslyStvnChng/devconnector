// Showcase Bios, Education, Social Network
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Validation
const validateProfileInput = require('../../validation/profile');

// Load Profile Models
const Profile = require('../../models/Profile');

// Load User Profile
const User = require('../../models/User');


// @route         GET api/profile/test
// @description   Test Profile route
// @access        Public route
router.get('/test', (req, res) => res.json({
  msg: "Profile Works"
}));

// ****Protective Routes ****

// @route         GET api/profile
// @description   GET current user's profile
// @access        Private

//
router.get('/', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  // Empty object 
  const errors = {};

  // Find user id from models/profile schema
  Profile.findOne({
      user: req.user.id
    })
    .then(profile => {
      // If not profile, display errors message and send 404 status
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        return res.status(404).json(errors);
      }
      // If profile exist, show profile
      res.json(profile);
    })
    // Catch the all other err with 404 status 
    .catch(err => res.status(404).json(err));
});

// @route         POST api/profile
// @description   Create or Edit user profile
// @access        Private
router.post('/', passport.authenticate('jwt', {
  session: false
}), (req, res) => {

  const {
    errors,
    isValid
  } = validateProfileInput(req.body);

  //Check Validation
  if (!isValid) {
    // Return any errors with 400 status
    return res.status(400).json(errors);
  }

  // Get fields
  const profileFields = {};

  // Login user information 
  profileFields.user = req.user.id

  // Check from form sent; then set to profileFields.handle
  if (req.body.handle) profileFields.handle = req.body.handle;
  if (req.body.company) profileFields.company = req.body.company;
  if (req.body.website) profileFields.website = req.body.website;
  if (req.body.location) profileFields.location = req.body.location;
  if (req.body.bio) profileFields.bio = req.body.bio;
  if (req.body.status) profileFields.status = req.body.status;
  if (req.body.githubusername) profileFields.githubusername = req.body.githubusername;

  // Skills - Split into array 
  // If skills is not undefined, than split each [String] with commas
  if (typeof req.body.skills !== "undefined") {
    profileFields.skills = req.body.skills.split(',');
  }

  // Social
  profileFields.social = {};
  // Come in as req.body.youtube and then set this (profileFields.youtube) to that value
  if (req.body.youtube) profileFields.youtube = req.body.youtube;
  if (req.body.twitter) profileFields.twitter = req.body.twitter;
  if (req.body.facebook) profileFields.facebook = req.body.facebook;
  if (req.body.instagram) profileFields.instagram = req.body.instagram;
  if (req.body.linkedin) profileFields.linkedin = req.body.linkedin;

  profile.findOne({
      user: req.user.id
    })
    .then(profile => {
      if (profile) {
        //Update Profile by the Login User
        Profile.findOneAndUpdate({
            user: req.user.id
          }, {
            // All the Fields user's inputed
            $set: profileFields
          }, {
            new: true
          })
          // Promise to respond to the profile 
          .then(profile => res.json(profile))
      } else {

        // Check to see if handle exist (SEO to access it in a friendly way)
        Profile.findOne({
            handle: profileFields.handle
          })
          // Promise of all the user profile information exist
          .then(profile => {
            if (profile) {
              errors.handle = 'That handle already exists';
              res.status(400).json(errors);
            }

            // Save Profile
            //Profile with all fields will save to the profile parameter 
            new Profile(profileFields).save().then(profile => {
              res.json(profile);
            })
          })
      }
    })
});

module.exports = router;