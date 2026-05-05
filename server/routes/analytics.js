const express = require('express');
const router = express.Router();
const sql = require('mssql');

// Cấu hình SQL giống các file khác của bạn
const sqlConfig = {
    user: 'sa', password: '123', database: 'ThreadsTreasureDB',
    server: 'NHI\\SQL1', 
    options: { encrypt: false, trustServerCertificate: true }
};

// 1. API lấy tổng doanh thu (Cho Dashboard Card)
router.get('/revenue', async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);
        // THÊM ĐIỀU KIỆN WHERE VÀO ĐÂY
        let result = await pool.request().query("SELECT ISNULL(SUM(Total), 0) as revenue FROM Orders WHERE Status = N'Đã giao'");
        res.json({ data: [{ revenue: result.recordset[0].revenue }] });
    } catch (err) {
        res.status(500).json({ data: [{ revenue: 0 }] });
    }
});

// 2. API lấy doanh thu theo ngày (Cho biểu đồ LineChart)
router.get('/lifetime', async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);
        // Nhóm theo ngày và tính tổng tiền
        let result = await pool.request().query(`
            SELECT FORMAT(OrderDate, 'dd/MM') as _id, SUM(Total) as revenue 
            FROM Orders 
            GROUP BY FORMAT(OrderDate, 'dd/MM'), OrderDate
            ORDER BY OrderDate ASC
        `);
        res.json({ data: result.recordset });
    } catch (err) {
        res.status(500).json({ data: [] });
    }
});

// 3. API lấy sản phẩm bán chạy (Cho biểu đồ PieChart)
router.get('/bestseller', async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);
        let result = await pool.request().query(`
            SELECT TOP 5 p.Name as _id, COUNT(od.ProductID) as count
            FROM OrderDetails od
            JOIN Products p ON od.ProductID = p.ProductID
            GROUP BY p.Name
            ORDER BY count DESC
        `);
        res.json({ data: result.recordset });
    } catch (err) {
        res.status(500).json({ data: [] });
    }
});
// 4. Lấy số lượng khách hàng mới trong năm nay
router.get('/customers-this-year', async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);
        let result = await pool.request().query(`
            SELECT COUNT(UserID) as count 
            FROM Users 
            WHERE YEAR(CreatedAt) = YEAR(GETDATE()) AND Role = 'customer'
        `);
        res.json({ count: result.recordset[0].count });
    } catch (err) {
        res.status(500).json({ count: 0 });
    }
});

// 5. Thống kê số lượng đơn theo từng trạng thái
router.get('/orders-status', async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);
        let result = await pool.request().query(`
            SELECT Status, COUNT(OrderID) as count 
            FROM Orders 
            GROUP BY Status
        `);
        res.json({ data: result.recordset });
    } catch (err) {
        res.status(500).json({ data: [] });
    }
});
module.exports = router;