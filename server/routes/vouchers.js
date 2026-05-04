// Backend/routes/vouchers.js
const express = require('express');
const router = express.Router();
const { getVouchers, getUserVouchers, createVoucher,getTopVouchers,updateVoucher,deleteVoucher } = require('../controllers/voucherController');

// Lấy tất cả voucher (Dành cho Admin)
router.get('/', getVouchers);

// Lấy voucher theo UserID (Dành cho trang "Voucher của bạn" của khách hàng)
router.get('/user/:userId', getUserVouchers);

// Thêm voucher mới
router.post('/add', createVoucher);

router.get('/top-used', getTopVouchers);
// Cập nhật voucher (Dùng method PUT)
router.put('/:id', updateVoucher);

// Xóa voucher (Dùng method DELETE)
router.delete('/:id', deleteVoucher);
module.exports = router;