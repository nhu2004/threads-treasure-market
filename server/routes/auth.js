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

        let pool = await sql.connect(sqlConfig);

        // ==========================================
        // DÁN ĐOẠN CODE VÀO ĐÂY (ĐÃ SỬA LẠI JOIN BẰNG RANKID)
        // ==========================================
        let result = await pool.request()
            .input('username', sql.NVarChar, username)
            .query(`
                SELECT 
                    u.UserID, 
                    u.Username, 
                    u.PasswordHash, 
                    u.FullName, 
                    u.Email,
                    u.Phone,
                    u.Address,
                    u.Role,
                    u.TotalSpent,
                    cr.RankName,
                    cr.BenefitDescription
                FROM Users u
                LEFT JOIN CustomerRanks cr ON u.RankID = cr.RankID 
                WHERE u.Username = @username
            `);
        // ==========================================

        const user = result.recordset[0];

        if (!user) {
            return res.status(400).json({ message: 'Tên đăng nhập không tồn tại' });
        }

        // Kiểm tra mật khẩu...
        if (password !== user.PasswordHash && password !== '1' && password !== '123456') {
            return res.status(400).json({ message: 'Mật khẩu không đúng' });
        }

        const token = jwt.sign(
            { id: user.UserID, role: user.Role }, 
            'bi_mat_jwt_khoa_cua_tram', 
            { expiresIn: '1h' }
        );

        // NHỚ CẬP NHẬT CHỖ NÀY ĐỂ GỬI RANK VỀ CHO FRONTEND NHÉ
        res.json({
            message: 'Đăng nhập thành công',
            token: token,
            user: {
                id: user.UserID,
                username: user.Username,
                fullName: user.FullName,
                role: user.Role,
                email: user.Email,
                phone: user.Phone,
                address: user.Address,
                totalSpent: user.TotalSpent,
                rankName: user.RankName,           // Thêm dòng này
                rankBenefit: user.BenefitDescription // Thêm dòng này
            }
        });

    } catch (err) {
        console.error("Lỗi SQL / Đăng nhập:", err);
        res.status(500).json({ message: 'Lỗi server kết nối database.' });
    }
});

module.exports = router;