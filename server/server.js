const express = require('express');
const cors = require('cors');
const app = express(); // Định nghĩa app trước khi sử dụng middleware

// 1. Middleware
app.use(cors()); // Cho phép Frontend gọi API
app.use(express.json()); // Để đọc dữ liệu JSON từ các form Login/Register

// 2. Import các Routes
const productsRouter = require('./routes/products');
const ordersRouter = require('./routes/orders');
const analyticsRouter = require('./routes/analytics');
const authRouter = require('./routes/auth');
const vouchersRouter = require('./routes/vouchers'); // Bổ sung route Voucher

// 3. Sử dụng các Routes (Định nghĩa đường dẫn API)
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/auth', authRouter);
app.use('/api/vouchers', vouchersRouter); // Thêm endpoint cho Voucher

// Route kiểm tra server
app.get('/', (req, res) => {
  res.send('Backend server Threads & Treasure is running!');
});

// 4. Khởi chạy Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log(` API Login: http://localhost:${PORT}/api/auth/login`);
});