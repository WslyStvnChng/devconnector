// Hold Authenication of Users

const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

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
  User.findOne({
      email: req.body.email
    })
    .then(user => {
      // If there is an user with that email address
      if (user) {
        return res.status(400).json({
          email: 'Email already exists'
        });
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


module.exports = router;