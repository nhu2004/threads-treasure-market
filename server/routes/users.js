// File: auth.js (hoặc file chứa API Login)
const express = require('express');
const router = express.Router();
const sql = require('mssql');
const jwt = require('jsonwebtoken');

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
        
        // Truy vấn lấy đầy đủ thông tin cần thiết, kết hợp (JOIN) với bảng CustomerRanks
        let result = await pool.request().query(`
            SELECT 
                u.UserID AS id, 
                u.Username AS username, 
                u.FullName AS fullName, 
                u.Email AS email, 
                u.Phone AS phone,          -- Bổ sung số điện thoại
                u.Address AS address,      -- Bổ sung địa chỉ
                u.Role AS role,
                u.Status AS status,
                u.TotalSpent AS totalSpent,-- Bổ sung tổng chi tiêu
                cr.RankName AS rankName    -- Bổ sung tên hạng thẻ
            FROM Users u
            LEFT JOIN CustomerRanks cr ON u.RankID = cr.RankID
        `);
        
        // Trả về dữ liệu cho Frontend
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
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { fullName, email, phone, address } = req.body;

    try {
        let pool = await sql.connect(sqlConfig);
        await pool.request()
            .input('id', sql.Int, id)
            .input('fullName', sql.NVarChar, fullName)
            .input('email', sql.NVarChar, email)
            .input('phone', sql.VarChar, phone)
            .input('address', sql.NVarChar, address)
            .query(`
                UPDATE Users 
                SET FullName = @fullName, Email = @email, Phone = @phone, Address = @address 
                WHERE UserID = @id
            `);
            
        res.json({ message: 'Cập nhật thông tin thành công' });
    } catch (err) {
        console.error("Lỗi cập nhật SQL:", err);
        res.status(500).json({ message: 'Lỗi server khi cập nhật SQL' });
    }
}); 
// API Lấy thông tin chi tiết 1 người dùng (bao gồm Rank)
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let pool = await sql.connect(sqlConfig);
        
        let result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT 
                    u.UserID AS id, 
                    u.Username AS username, 
                    u.FullName AS fullName, 
                    u.Email AS email,   
                    u.Phone AS phone,   
                    u.Address AS address,
                    u.TotalSpent AS totalSpent,
                    cr.RankName AS rankName,            -- Lấy tên hạng
                    cr.BenefitDescription AS rankBenefit -- Lấy mô tả ưu đãi
                FROM Users u
                LEFT JOIN CustomerRanks cr ON u.RankID = cr.RankID -- JOIN THEO CÁCH CỦA BẠN LÀ CHUẨN NHẤT
                WHERE u.UserID = @id
            `);
            
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        res.json({ user: result.recordset[0] });
    } catch (err) {
        console.error("Lỗi lấy thông tin người dùng:", err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});
module.exports = router;