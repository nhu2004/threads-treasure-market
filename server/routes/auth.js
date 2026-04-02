const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db'); // Đảm bảo bạn đã tạo file db.js như tôi hướng dẫn

// Login route kết nối SQL Server
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const pool = await poolPromise;

    // Truy vấn tìm user trong bảng Users
    const result = await pool.request()
      .input('user', sql.NVarChar, username)
      .input('pass', sql.NVarChar, password) // Lưu ý: thực tế nên dùng bcrypt
      .query('SELECT * FROM Users WHERE Username = @user AND PasswordHash = @pass');

    const user = result.recordset[0];

    if (!user) {
      return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không chính xác' });
    }

    res.json({
      message: 'Đăng nhập thành công',
      user: {
        id: user.UserID,
        username: user.Username,
        fullName: user.FullName,
        email: user.Email,
        role: user.Role,
      },
      token: 'mock-jwt-token',
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: 'Lỗi kết nối SQL Server' });
  }
});

module.exports = router;