// Backend/routes/vouchers.js
const express = require('express');
const router = express.Router();
const { getVouchers, getUserVouchers, createVoucher } = require('../controllers/voucherController');

// Lấy tất cả voucher (Dành cho Admin)
router.get('/', getVouchers);

// Lấy voucher theo UserID (Dành cho trang "Voucher của bạn" của khách hàng)
router.get('/user/:userId', getUserVouchers);

// Thêm voucher mới
router.post('/add', createVoucher);

module.exports = router;