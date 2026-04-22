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

module.exports = router;