// Users can create posts like comments

const express = require('express');
const router = express.Router();

// @route         GET api/posts/test
// @description   Test Post route
// @access        Public route
router.get('/test', (req, res) => res.json({
  msg: "Posts Works"
}));

module.exports = router;