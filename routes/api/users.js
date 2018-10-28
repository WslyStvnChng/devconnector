// Hold Authenication of Users
const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

// Load input validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

// Load User Model
const User = require("../../models/User");

// @route         GET api/users/test
// @description   Test Users route
// @access        Public route
router.get('/test', (req, res) => res.json({
  msg: "Users Works"
}));

// @route         GET api/users/register
// @description   Register user
// @access        Public
router.post('/register', (req, res) => {

  // Pull out the errors from validateRegisterInput - req.body is everything said to route name, password etc
  const {
    errors,
    isValid
  } = validateRegisterInput(req.body);

  // Check validation (1st line of validation)
  if (!isValid) {

    // Checks to see if user's input is valid under the circumstances of 'is-empty.js'
    return res.status(400).json(errors);
  }

  User.findOne({
      email: req.body.email
    })
    .then(user => {
      // If there is an user with that email address
      if (user) {
        errors.email = 'Email already exist';
        return res.status(400).json(errors);
        // Else use gravatar from schema email
      } else {
        const avatar = gravatar.url(req.body.email, {
          s: '200', // Size
          r: 'pg', // Rating
          d: 'mm' // Default
        });
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          avatar: avatar,
          password: req.body.password
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) {
              throw err;
            } else {
              newUser.password = hash;
              newUser.save()
                .then(user => res.json(user))
                .catch(err => console.log(err));
            }
          });
        });
      }
    });
});

// @route         GET api/users/login
// @description   Login User / Return JWT Token
// @access        Public

router.post('/login', (req, res) => {

  // Pull out the errors from validateRegisterInput - req.body is everything said to route name, password etc
  const {
    errors,
    isValid
  } = validateLoginInput(req.body);

  // Check validation (1st line of validation)
  if (!isValid) {
    // Checks to see if user's input is valid under the circumstances of 'is-empty.js'
    return res.status(400).json(errors);
  }
  const email = req.body.email;
  const password = req.body.password;

  // Find user by email
  User.findOne({
      email
    })
    .then(user => {
      // Check for user
      if (!user) {
        errors.email = 'User not found'
        return res.status(404).json(errors);
      }

      // Check password
      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          // User Matched

          // Create JWT Payload
          const payload = {
            id: user.id,
            name: user.name,
            avatar: user.avatar
          }

          // Sign Token
          jwt.sign(
            payload,
            keys.secretOrKey, {
              expiresIn: 3600
            },
            (err, token) => {
              res.json({
                success: true,
                token: 'Bearer ' + token,
                msg: 'Success'
              })

            });
        } else {
          errors.password = 'Password incorrect'
          return res.status(400).json(errors);
        }
      });
    });
});

// @route         GET api/users/current
// @description   Return current user
// @access        Private
router.get('/current', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  //req.user is from jwt_payload and it returns the value of the current user login
  res.json({
    // Return only the Id, Name and Email
    id: req.user.id,
    name: req.user.name,
    email: req.user.email
  })
});


module.exports = router;