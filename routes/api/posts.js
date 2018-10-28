// Users can create posts like comments
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// POST Model
const Post = require("../../models/Post");
// PROFILE Model
const Profile = require("../../models/Profile");

// Validation
const validatePostInput = require("../../validation/post");

// @route         GET api/posts/test
// @description   Test Post route
// @access        Public route
router.get("/test", (req, res) =>
  res.json({
    msg: "Posts Works"
  })
);

// @route         GET api/posts
// @description   Get posts
// @access        Public route
router.get("/", (req, res) => {
  Post.find()
    .sort({
      date: -1
    })
    // posts found
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({
      nopostsfound: "No posts found"
    }));
});

// @route         GET api/posts/:id
// @description   Get post by id
// @access        Public route
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err =>
      res.status(404).json({
        nopostfound: "No post found with that ID"
      })
    );
});

// @route         POST api/posts
// @description   Create post
// @access        Private route
router.post(
  "/",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
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
  }
);
// @route         DELETE api/posts/:id
// @description   Delete post
// @access        Private route
router.delete('/:id', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  Profile.findOne({
      user: req.user.id
    })
    .then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          // Check for post owner (don't want anyone deleting)
          // If post of user is not true or match user id must return
          if (post.user.toString() !== req.user.id) {
            return res.status(401).json({
              notauthorized: 'User not authorized'
            })
          }
          // Delete
          post.remove().then(() => res.json({
            success: true
          }));
        })
        .catch(err => res.status(404).json({
          postnotfound: 'No post found'
        }));
    });
});

// @route         POST api/posts/like/:id
// @description   Like post
// @access        Private route
router.post('/like/:id', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  Profile.findOne({
      user: req.user.id
    })
    .then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          // If user already liked it, it's there
          if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({
              alreadyliked: 'User already liked this post'
            });
          }
          // Add user id to likes array
          post.likes.unshift({
            user: req.user.id
          });
          // Save the entire post
          post.save().then(post => res.json(post));

        })
        .catch(err => res.status(404).json({
          postnotfound: 'No post found '
        }));
    });
});

// @route         POST api/posts/unlike/:id
// @description   Unlike post
// @access        Private route
router.post('/unlike/:id', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  Profile.findOne({
      user: req.user.id
    })
    .then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({
              notliked: 'You have not yet liked this post'
            });
          }
          // Get remove index 
          const removeIndex = post.likes
            // Map the likes by the id
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          // Splice out of array
          post.likes.splice(removeIndex, 1);

          // Save
          post.save().then(post => res.json(post));

        })
        .catch(err => res.status(404).json({
          postnotfound: 'No post found'
        }));
    });
});

// @route         POST api/posts/comment/:id
// @description   Add comment to post
// @access        Private route
router.post('/comment/:id', passport.authenticate('jwt', {
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

  Post.findById(req.params.id)
    .then(post => {
      const newComment = {
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
      }

      // Add to comments array
      post.comments.unshift(newComment);

      // Save
      post.save().then(post => res.json(post))
    })
    .catch(err => res.status(404).json({
      postnofound: 'No post found'
    }))
});

// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    Remove comment from post
// @access  Private
router.delete(
  '/comment/:id/:comment_id',
  passport.authenticate('jwt', {
    session: false
  }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        // Check to see if comment exists
        if (
          post.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          return res
            .status(404)
            .json({
              commentnotexists: 'Comment does not exist'
            });
        }

        // Get remove index
        const removeIndex = post.comments
          .map(item => item._id.toString())
          .indexOf(req.params.comment_id);

        // Splice comment out of array
        post.comments.splice(removeIndex, 1);

        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({
        postnotfound: 'No post found'
      }));
  }
);

module.exports = router;