const express = require('express');
const cors = require('cors');
const app = express();

// 1. Middleware
app.use(cors()); // Cho phép Frontend gọi API
app.use(express.json()); // Để đọc dữ liệu JSON

// 2. Import các Routes (Đảm bảo bạn đã tạo các file này trong thư mục routes)
const authRouter = require('./routes/auth');
 // Các router này nếu bạn chưa code thì có thể comment (thêm // ở trước) để tránh lỗi
  const productsRouter = require('./routes/products');
  const ordersRouter = require('./routes/orders');
  const analyticsRouter = require('./routes/analytics');
  const vouchersRouter = require('./routes/vouchers');
  const categoriesRouter = require('./routes/categories');
  const usersRouter = require('./routes/users');
// 3. Sử dụng các Routes
app.use('/api/auth', authRouter);
  app.use('/api/products', productsRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/analytics', analyticsRouter);
  app.use('/api/vouchers', vouchersRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/users', usersRouter);  
// Route kiểm tra server
app.get('/', (req, res) => {
  res.send('Backend server Threads & Treasure is running!');
});

// 4. Khởi chạy Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔑 API Login: http://localhost:${PORT}/api/auth/login`);
});