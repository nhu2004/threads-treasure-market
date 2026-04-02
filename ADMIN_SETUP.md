# Admin Dashboard - Localhost riêng

Để chạy Admin Dashboard trên port riêng:

## Cách setup:

1. **Tạo thư mục admin-app riêng (tùy chọn):**
   ```bash
   mkdir admin-app
   cd admin-app
   ```

2. **Copy file package.json với port khác:**
   ```json
   {
     "name": "admin-dashboard",
     "version": "1.0.0",
     "scripts": {
       "dev": "vite --port 5173"
     }
   }
   ```

3. **Chạy Admin Dashboard:**
   - Cửa sổ 1: `npm run dev` (chạy cửa hàng trên http://localhost:5174)
   - Cửa sổ 2: `npm run dev -- --port 5173` (chạy admin trên http://localhost:5173)

## Hoặc đơn giản hơn:

Trong package.json gốc của dự án, thêm script:
```json
"admin": "vite --port 5173"
```

Sau đó chạy:
```bash
npm run dev        # Cửa hàng (port 8081 hoặc 5174)
npm run admin      # Admin (port 5173)
```

## Đăng nhập Admin:
- Username: `admin1`
- Password: `1`

Sau khi đăng nhập, bạn sẽ được redirect tới admin dashboard.
