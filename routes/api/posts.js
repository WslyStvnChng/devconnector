// Users can create posts like comments
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// POST Model
const Post = require('../../models/Post');

// Validation
const validatePostInput = require('../../validation/post');
// @route         GET api/posts/test
// @description   Test Post route
// @access        Public route
router.get('/test', (req, res) => res.json({
  msg: "Posts Works"
}));

// @route         POST api/posts
// @description   Create post
// @access        Private route
router.post('/', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  const {
    errors,
    isValid
  } = validatePostInput(req.body);

  // Check validation
  if (!isValid) {
    // If any errors, send 400 with errors object
    return res.status(400).json(errors);
  }

  const newPost = new Post({
    text: req.body.text,
    name: req.body.name,
    avatar: req.body.avatar,
    // Current Login User
    user: req.user.id
  });

  newPost.save().then(post => res.json(post));
});

module.exports = router;