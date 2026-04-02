const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

// Mock users database (tạm thời, trong thực tế sẽ kết nối SQL Server)
const users = [
  {
    id: 1,
    username: 'admin1',
    password: '1',
    fullName: 'Administrator',
    email: 'admin@threads-treasure.com',
    role: 'admin',
  },
  {
    id: 2,
    username: '01',
    password: '1',
    fullName: 'Customer',
    email: 'customer@threads-treasure.com',
    role: 'customer',
  },
];

// Register route
router.post('/register', async (req, res) => {
  try {
    const { phone, password, fullName, email } = req.body;

    // Kiểm tra user đã tồn tại
    const existingUser = users.find((u) => u.username === phone);
    if (existingUser) {
      return res.status(400).json({ message: 'Số điện thoại đã được đăng ký' });
    }

    // Tạo user mới
    const newUser = {
      id: users.length + 1,
      username: phone,
      password: password || '1', // Mật khẩu mặc định là "1"
      fullName: fullName || '',
      email: email || '',
      role: 'customer',
    };

    users.push(newUser);

    res.json({
      message: 'Đăng ký thành công',
      user: {
        id: newUser.id,
        username: newUser.username,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi đăng ký' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Tìm user theo username
    const user = users.find((u) => u.username === username);
    if (!user) {
      return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không chính xác' });
    }

    // Kiểm tra mật khẩu
    if (user.password !== password) {
      return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không chính xác' });
    }

    res.json({
      message: 'Đăng nhập thành công',
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      token: 'mock-jwt-token', // Tạm thời, sau sẽ xử dụng JWT thực
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi đăng nhập' });
  }
});

// Get current user
router.get('/me', (req, res) => {
  // Tạm thời, sau sẽ kiểm tra token
  res.json({ message: 'Lấy user thành công' });
});

// Logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Đăng xuất thành công' });
});

module.exports = router;
