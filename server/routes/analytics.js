const express = require('express');
const router = express.Router();
const analytics = require('../data/analytics');

router.get('/', (req, res) => {
  res.json(analytics);
});

module.exports = router;
