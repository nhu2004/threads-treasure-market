const express = require('express');
const router = express.Router();
const { getProducts, createProduct } = require('../controllers/productController');

// Lấy danh sách sản phẩm từ SQL Server
router.get('/', getProducts);

// Thêm sản phẩm mới
router.post('/add', createProduct);

module.exports = router;    