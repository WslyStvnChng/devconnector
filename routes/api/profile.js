// Showcase Bios, Education, Social Network

const express = require('express');
const router = express.Router();

// @route         GET api/profile/test
// @description   Test Profile route
// @access        Public route
router.get('/test', (req, res) => res.json({
  msg: "Profile Works"
}));

module.exports = router;