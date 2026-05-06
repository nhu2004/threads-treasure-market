// Server/routes/categoryController.js
const express = require('express');
const router = express.Router();
const sql = require('mssql');

const sqlConfig = {
    user: 'sa', password: '123', database: 'ThreadsTreasureDB', 
    server: 'NHI\\SQL1', pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
    options: { encrypt: false, trustServerCertificate: true }
};

// 1. Lấy danh mục KÈM SỐ LƯỢNG SẢN PHẨM
router.get('/', async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);
        let result = await pool.request().query(`
            SELECT c.CategoryID, c.Name, COUNT(p.ProductID) AS ProductCount 
            FROM Categories c
            LEFT JOIN Products p ON c.CategoryID = p.CategoryID
            GROUP BY c.CategoryID, c.Name
        `);
        res.json({ categories: result.recordset });
    } catch (err) { res.status(500).json({ message: 'Lỗi server' }); }
});

// ... (API POST, PUT, DELETE giữ nguyên)

// 5. API Xuất danh sách sản phẩm thuộc danh mục
router.get('/:id/export-products', async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);
        let result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`
                SELECT 
                    ProductID as N'Mã SP', 
                    Name as N'Tên Sản Phẩm', 
                    Price as N'Giá Bán', 
                    StockQuantity as N'Tồn Kho',
                    Sizes as N'Kích cỡ',
                    Colors as N'Màu sắc'
                FROM Products 
                WHERE CategoryID = @id
            `);
        res.json(result.recordset);
    } catch (err) { res.status(500).json({ message: 'Lỗi server' }); }
});

// 6. API Xuất danh sách đơn hàng đã bán theo danh mục
router.get('/:id/export-orders', async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);
        let result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`
                SELECT 
                    o.OrderID as N'Mã Đơn', 
                    CONVERT(varchar, o.OrderDate, 103) as N'Ngày Đặt', 
                    p.Name as N'Tên Sản Phẩm', 
                    od.Quantity as N'Số Lượng Bán', 
                    od.Price as N'Đơn Giá Lúc Bán', 
                    (od.Quantity * od.Price) as N'Thành Tiền'
                FROM Orders o
                JOIN OrderDetails od ON o.OrderID = od.OrderID
                JOIN Products p ON od.ProductID = p.ProductID
                WHERE p.CategoryID = @id
                ORDER BY o.OrderDate DESC
            `);
        res.json(result.recordset);
    } catch (err) { res.status(500).json({ message: 'Lỗi server' }); }
});

module.exports = router;