const express = require('express');
const router = express.Router();
const {
    getAllSuppliers, getSupplierById, createSupplier, updateSupplier, deleteSupplier,
    exportProducts, exportOrders // Thêm 2 hàm mới
} = require('../controllers/supplierController');

router.get('/', getAllSuppliers);
router.get('/:id', getSupplierById);
router.post('/', createSupplier);
router.put('/:id', updateSupplier);
router.delete('/:id', deleteSupplier);

// Thêm route lấy dữ liệu xuất file
router.get('/:id/export-products', exportProducts);
router.get('/:id/export-orders', exportOrders);

module.exports = router;