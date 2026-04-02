const express = require('express');
const router = express.Router();
const { getOrderAnalytics } = require('../controllers/orderController');

router.get('/summary', getOrderAnalytics);

module.exports = router;