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

// 1. API Lấy danh sách toàn bộ người dùng (GET /api/users)
router.get('/', async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);
        
        // Truy vấn lấy các thông tin cần thiết, loại bỏ mật khẩu để bảo mật
        let result = await pool.request().query(`
            SELECT 
                UserID AS id, 
                Username AS username, 
                FullName AS fullName, 
                Email AS email, 
                Role AS role,
                Status AS status
            FROM Users
        `);
        
        // Trả về đúng cấu trúc mà userApi.js bên Frontend đang mong đợi
        res.json({
            users: result.recordset
        });
    } catch (err) {
        console.error("Lỗi lấy danh sách người dùng:", err);
        res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu người dùng' });
    }
});

// 2. API Cập nhật trạng thái người dùng (Ví dụ: Khóa tài khoản)
router.put('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        let pool = await sql.connect(sqlConfig);
        await pool.request()
            .input('id', sql.Int, id)
            .input('status', sql.NVarChar, status)
            .query('UPDATE Users SET Status = @status WHERE UserID = @id');
            
        res.json({ message: 'Cập nhật trạng thái thành công' });
    } catch (err) {
        console.error("Lỗi cập nhật người dùng:", err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

module.exports = router;