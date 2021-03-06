// Showcase Bios, Education, Social Network
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Validation
const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');


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

router.get('/',
  passport.authenticate('jwt', {
    session: false
  }),
  (req, res) => {
    // Empty object 
    const errors = {};

    // Find user id from models/profile schema
    Profile.findOne({
        user: req.user.id
      })
      .populate('user', ['name', 'avatar'])
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

// @route         GET api/profile/all
// @description   Get all profiles
// @access        Public  
router.get('/all', (req, res) => {
  const errors = {};

  // Find all profiles
  Profile.find()
    .populate('user', ['name', 'avatar'])
    .then(profiles => {
      // If not profile found; send this error
      if (!profiles) {
        errors.noprofile = ' There are no profiles'
        return res.status(404).json(errors);
      }
      res.json(profiles);
    })
    .catch(err => res.status(404).json({
      profile: 'There are no profiles'
    }));
})

// @route         GET api/handle/:handle (backend route)
// @description   Get profile by handle
// @access        Public
router.get('/handle/:handle', (req, res) => {
  const errors = {};

  // User model to find handle from :handle in url
  Profile.findOne({
      handle: req.params.handle
    })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noprofile = ' There is no profile for this user';
        res.status(400).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

// @route         GET api/handle/user/:user_id (backend route)
// @description   Get user by handle
// @access        Public
router.get('/user/:user_id', (req, res) => {
  const errors = {};

  // User model to find user from url
  Profile.findOne({
      user: req.params.user_id
    })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noprofile = ' There is no profile for this user';
        res.status(400).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json({
      profile: 'There is no profile for this user'
    }));
});


// @route         POST api/profile
// @description   Create or Edit user profile
// @access        Private
router.post(
  '/',
  passport.authenticate('jwt', {
    session: false
  }),
  (req, res) => {
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
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;

    // Skills - Split into array 
    // If skills is not undefined, than split each [String] with commas
    if (typeof req.body.skills !== "undefined") {
      profileFields.skills = req.body.skills.split(',');
    }

    // Social
    profileFields.social = {};
    // Come in as req.body.youtube and then set this (profileFields.youtube) to that value
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

    Profile.findOne({
        user: req.user.id
      })
      .then(profile => {
        if (profile) {
          //Update Profile by the Login User
          Profile.findOneAndUpdate({
                user: req.user.id
              },

              // All the Fields user's inputed 
              {
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
              });
            });
        }
      });
  });
// @route         POST api/profile/experience
// @description   Add exp to profile
// @access        Private
router.post('/experience', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  const {
    errors,
    isValid
  } = validateExperienceInput(req.body);

  //Check Validation
  if (!isValid) {
    // Return any errors with 400 status
    return res.status(400).json(errors);
  }

  Profile.findOne({
      user: req.user.id
    })
    .then(profile => {
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      }

      // Add to experience array to end of the array
      profile.experience.unshift(newExp);
      // Add to existing profile
      profile.save().then(profile => res.json(profile));
    })
});

// @route         POST api/profile/education
// @description   Add education to profile
// @access        Private
router.post('/education', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  const {
    errors,
    isValid
  } = validateEducationInput(req.body);

  //Check Validation
  if (!isValid) {
    // Return any errors with 400 status
    return res.status(400).json(errors);
  }

  Profile.findOne({
      user: req.user.id
    })
    .then(profile => {
      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      }

      // Add to experience array to end of the array
      profile.education.unshift(newEdu);
      // Add to existing profile
      profile.save().then(profile => res.json(profile));
    })
});

// @route         DELETE api/profile/experience/:exp_id
// @description   Delete experience from profile
// @access        Private
router.delete('/experience/:exp_id', passport.authenticate('jwt', {
  session: false
}), (req, res) => {

  Profile.findOne({
      // Find user by one using user id
      user: req.user.id
    })
    .then(profile => {
      //Get remove index
      const removeIndex = profile.experience
        // Map() find the id of the user
        .map(item => item.id)
        // Match the url :exp_id - get correct experience
        .indexOf(req.params.exp_id);

      //Splice out of the array
      //Array splice because we know which one to remove
      profile.experience.splice(removeIndex, 1);

      //Save
      profile.save().then(profile => res.json(profile));
    })
    .catch(err => res.status(404).json(err));
});

// @route         DELETE api/profile/education/:edu_id
// @description   Delete education from profile
// @access        Private
router.delete('/education/:edu_id', passport.authenticate('jwt', {
  session: false
}), (req, res) => {

  Profile.findOne({
      // Find user by one using user id
      user: req.user.id
    })
    .then(profile => {
      //Get remove index
      const removeIndex = profile.education
        // Map() find the id of the user
        .map(item => item.id)
        // Match the url :exp_id - get correct experience
        .indexOf(req.params.edu_id);

      //Splice out of the array
      //Array splice because we know which one to remove
      profile.education.splice(removeIndex, 1);

      //Save
      profile.save().then(profile => res.json(profile));
    })
    .catch(err => res.status(404).json(err));
});

// @route         DELETE api/profile/
// @description   Delete user and profile
// @access        Private
router.delete('/', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  Profile.findOneAndRemove({
      user: req.user.id
    })
    .then(() => {
      // Removing user
      User.findOneAndRemove({
          _id: req.user.id
        })
        .then(() => res.json({
          success: true
        }));
    });
});


module.exports = router;