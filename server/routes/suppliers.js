const express = require('express');
const router = express.Router();
const {
    getAllSuppliers, getSupplierById, createSupplier, updateSupplier, deleteSupplier,
    exportProducts, exportOrders,
    getPurchaseOrders, toggleStatus // BỔ SUNG 2 hàm mới từ Controller
} = require('../controllers/supplierController');

router.get('/', getAllSuppliers);
router.get('/:id', getSupplierById);
router.post('/', createSupplier);
router.put('/:id', updateSupplier);

// Xóa cứng (Vẫn giữ lại phòng trường hợp Admin cấp cao muốn xóa hẳn)
router.delete('/:id', deleteSupplier);

// BỔ SUNG: API Cập nhật trạng thái (Khóa / Mở khóa)
router.put('/:id/toggle-status', toggleStatus);

// BỔ SUNG: API lấy Lịch sử nhập hàng của Nhà cung cấp
router.get('/:id/purchases', getPurchaseOrders);

// Thêm route lấy dữ liệu xuất file
router.get('/:id/export-products', exportProducts);
router.get('/:id/export-orders', exportOrders);

module.exports = router;