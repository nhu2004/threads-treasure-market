const express = require('express');
const router = express.Router();
const sql = require('mssql');
const jwt = require('jsonwebtoken');

// 1. Cấu hình kết nối SQL Server
const sqlConfig = {
    user: 'sa', // Tên đăng nhập SQL Server
    password: '123', // Mật khẩu SQL Server
    database: 'ThreadsTreasureDB', // Tên database của bạn
    server: 'NHI\\SQL1',
    // port: 1433, 
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
    options: {
        encrypt: false, 
        trustServerCertificate: true 
    }
};

// 2. API Xử lý Đăng nhập (POST /api/auth/login)
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Mở kết nối tới SQL Server
        let pool = await sql.connect(sqlConfig);

        // Truy vấn tìm User
        let result = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT UserID, Username, PasswordHash, FullName, Role FROM Users WHERE Username = @username');

        const user = result.recordset[0];

        if (!user) {
            return res.status(400).json({ message: 'Tên đăng nhập không tồn tại' });
        }

        // Kiểm tra mật khẩu (Pass luôn nếu nhập 1 hoặc 123456 để test cho nhanh)
        if (password !== user.PasswordHash && password !== '1' && password !== '123456') {
            return res.status(400).json({ message: 'Mật khẩu không đúng' });
        }

        // Tạo Token
        const token = jwt.sign(
            { id: user.UserID, role: user.Role }, 
            'bi_mat_jwt_khoa_cua_tram', 
            { expiresIn: '1h' }
        );

        // Trả kết quả
        res.json({
            message: 'Đăng nhập thành công',
            token: token,
            user: {
                id: user.UserID,
                username: user.Username,
                fullName: user.FullName,
                role: user.Role
            }
        });

    } catch (err) {
        console.error("Lỗi SQL / Đăng nhập:", err);
        res.status(500).json({ message: 'Lỗi server kết nối database.' });
    }
});

module.exports = router; // Bắt buộc phải có dòng này để server.js có thể import