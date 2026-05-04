const express = require('express');
const router = express.Router();
const {
    getAllSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier
} = require('../controllers/supplierController');

// GET: Lấy danh sách tất cả nhà cung cấp
router.get('/', getAllSuppliers);

// GET: Lấy chi tiết một nhà cung cấp
router.get('/:id', getSupplierById);

// POST: Tạo nhà cung cấp mới
router.post('/', createSupplier);

// PUT: Cập nhật nhà cung cấp
router.put('/:id', updateSupplier);

// DELETE: Xóa nhà cung cấp
router.delete('/:id', deleteSupplier);

module.exports = router;
