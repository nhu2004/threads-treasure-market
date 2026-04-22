const express = require('express');
const router = express.Router();
const sql = require('mssql');

// Cấu hình kết nối SQL Server (Đồng bộ với ThreadsTreasureDB)
const sqlConfig = {
    user: 'sa', 
    password: '123', 
    database: 'ThreadsTreasureDB', 
    server: 'NHI\\SQL1', 
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
    options: {
        encrypt: false, 
        trustServerCertificate: true 
    }
};

// 1. API Lấy toàn bộ danh mục (GET /api/categories)
router.get('/', async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);
        let result = await pool.request().query('SELECT * FROM Categories');
        
        // Trả về đúng định dạng mà categoryApi.js bên Frontend đang mong đợi
        res.json({
            categories: result.recordset
        });
    } catch (err) {
        console.error("Lỗi lấy danh mục:", err);
        res.status(500).json({ message: 'Lỗi server khi lấy danh mục' });
    }
});

// 2. API Thêm mới danh mục (POST /api/categories)
router.post('/', async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Tên danh mục không được để trống' });
    }

    try {
        let pool = await sql.connect(sqlConfig);
        await pool.request()
            .input('name', sql.NVarChar, name)
            .query('INSERT INTO Categories (Name) VALUES (@name)');
            
        res.status(201).json({ message: 'Thêm danh mục thành công' });
    } catch (err) {
        console.error("Lỗi thêm danh mục:", err);
        res.status(500).json({ message: 'Lỗi server khi thêm danh mục' });
    }
});

module.exports = router;