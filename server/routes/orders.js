const express = require('express');
const router = express.Router();
const sql = require('mssql');

const sqlConfig = {
    user: 'sa', 
    password: '123', 
    database: 'ThreadsTreasureDB', // Đã thêm lại chữ DB theo đúng ý bạn
    server: 'NHI\\SQL1', 
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
    options: {
        encrypt: false, 
        trustServerCertificate: true 
    }
};

router.get('/', async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);
        let result = await pool.request().query('SELECT * FROM Orders');
        res.json({ orders: result.recordset });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});
router.get('/', async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);
        // Lấy danh sách đơn hàng và map lại key nếu cần để khớp với Frontend
        let result = await pool.request().query('SELECT * FROM Orders');
        
        const formattedOrders = result.recordset.map(order => ({
            _id: order.OrderID, // Ánh xạ OrderID thành _id để khớp với logic Frontend cũ
            orderDate: order.OrderDate,
            totalPrice: order.TotalAmount,
            paymentStatus: {
                text: order.PaymentStatus === 1 ? "Đã thanh toán" : "Chưa thanh toán",
                code: order.PaymentStatus
            },
            orderStatus: {
                text: order.StatusText || "Đang xử lý",
                code: order.Status
            },
            // Thêm các trường khác tùy theo DB của bạn
        }));

        res.json({ orders: formattedOrders });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});
module.exports = router;