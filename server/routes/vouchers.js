// Backend/routes/vouchers.js
const express = require('express');
const router = express.Router();
const { getVouchers, createVoucher } = require('../controllers/voucherController');

router.get('/', getVouchers);
router.post('/add', createVoucher);

module.exports = router;