const express = require('express');   
const router = express.Router();     
const { poolPromise, sql } = require('../db');

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const pool = await poolPromise;

    if (!pool) {
        return res.status(500).json({ message: "Chưa kết nối được Database" });
    }

    const result = await pool.request()
      .input('user', sql.NVarChar, username)
      .input('pass', sql.NVarChar, password)
      .query('SELECT * FROM Users WHERE Username = @user AND PasswordHash = @pass');

    const user = result.recordset[0];

    // Xử lý kết quả trả về cho Frontend
    if (user) {
      res.json({
        message: 'Đăng nhập thành công',
        user: {
          id: user.UserID,
          username: user.Username,
          role: user.Role,  
          fullName: user.FullName
        },
        token: 'mock-jwt-token'
      });
    } else {
      res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });
    }
  } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      res.status(500).json({ message: "Lỗi hệ thống" });
  }
});

module.exports = router; 