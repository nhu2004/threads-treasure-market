const express = require('express');
const router = express.Router();
const sql = require('mssql');

// Cấu hình kết nối SQL Server
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

// 1. API Lấy toàn bộ danh mục KÈM ĐẾM SỐ LƯỢNG SẢN PHẨM (GET /api/categories)
router.get('/', async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);
        // Dùng LEFT JOIN để đếm số lượng SP thuộc danh mục, nếu không có thì ra 0
        let result = await pool.request().query(`
            SELECT c.CategoryID, c.Name, COUNT(p.ProductID) AS ProductCount 
            FROM Categories c
            LEFT JOIN Products p ON c.CategoryID = p.CategoryID
            GROUP BY c.CategoryID, c.Name
        `);
        
        res.json({ categories: result.recordset });
    } catch (err) {
        console.error("Lỗi lấy danh mục:", err);
        res.status(500).json({ message: 'Lỗi server khi lấy danh mục' });
    }
});

// 2. API Thêm mới danh mục (POST /api/categories)
router.post('/', async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Tên danh mục không được để trống' });

    try {
        let pool = await sql.connect(sqlConfig);
        await pool.request()
            .input('name', sql.NVarChar, name)
            .query('INSERT INTO Categories (Name) VALUES (@name)');
            
        res.status(201).json({ message: 'Thêm danh mục thành công' });
    } catch (err) {
        console.error("Lỗi thêm danh mục:", err);
        res.status(500).json({ message: 'Lỗi server khi thêm danh mục' });
    }
});

// 3. API CẬP NHẬT DANH MỤC (PUT /api/categories/:id) -> GIẢI QUYẾT LỖI CẬP NHẬT THẤT BẠI
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        let pool = await sql.connect(sqlConfig);
        await pool.request()
            .input('id', sql.Int, id)
            .input('name', sql.NVarChar, name)
            .query('UPDATE Categories SET Name = @name WHERE CategoryID = @id');
            
        res.json({ message: 'Cập nhật thành công' });
    } catch (err) {
        console.error("Lỗi cập nhật:", err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// 4. API XÓA DANH MỤC (DELETE /api/categories/:id) -> GIẢI QUYẾT LỖI XÓA THẤT BẠI
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    let pool = await sql.connect(sqlConfig);

    // BƯỚC 1: KIỂM TRA CÓ SẢN PHẨM NÀO ĐANG NẰM TRONG DANH MỤC NÀY KHÔNG
    let checkResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT COUNT(*) as ProductCount FROM Products WHERE CategoryID = @id');

    const productCount = checkResult.recordset[0].ProductCount;

    // NẾU CÓ SẢN PHẨM -> BÁO LỖI (STATUS 400) VÀ CHẶN LẠI NGAY
    if (productCount > 0) {
      return res.status(400).json({ 
        message: `Xóa thất bại! Danh mục này đang chứa ${productCount} sản phẩm. Vui lòng chuyển các sản phẩm sang danh mục khác trước khi xóa.` 
      });
    }

    // BƯỚC 2: NẾU SỐ SẢN PHẨM = 0 -> TIẾN HÀNH XÓA DANH MỤC
    let deleteResult = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Categories WHERE CategoryID = @id');

    // Kiểm tra xem có thực sự xóa được dòng nào không
    if (deleteResult.rowsAffected[0] === 0) {
        return res.status(404).json({ message: 'Không tìm thấy danh mục để xóa!' });
    }

    // Trả về thành công
    res.json({ message: 'Xóa thành công!', success: true });

  } catch (err) {
    console.error("Lỗi xóa danh mục:", err);
    res.status(500).json({ message: 'Lỗi server khi xóa danh mục.' });
  }
});
// 5. API XUẤT DANH SÁCH SẢN PHẨM THUỘC DANH MỤC
router.get('/:id/export-products', async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);
        let result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`
                SELECT 
                    ProductID as N'Mã SP', 
                    Name as N'Tên Sản Phẩm', 
                    Price as N'Giá Bán', 
                    StockQuantity as N'Tồn Kho',
                    Sizes as N'Kích cỡ',
                    Colors as N'Màu sắc'
                FROM Products 
                WHERE CategoryID = @id
            `);
        res.json(result.recordset);
    } catch (err) { 
        console.error("Lỗi xuất file SP:", err);
        res.status(500).json({ message: 'Lỗi server' }); 
    }
});

// 6. API XUẤT DANH SÁCH ĐƠN HÀNG ĐÃ BÁN THEO DANH MỤC
router.get('/:id/export-orders', async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);
        let result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`
                SELECT 
                    o.OrderID as N'Mã Đơn', 
                    CONVERT(varchar, o.OrderDate, 103) as N'Ngày Đặt', 
                    p.Name as N'Tên Sản Phẩm', 
                    od.Quantity as N'Số Lượng Bán', 
                    od.Price as N'Đơn Giá Lúc Bán', 
                    (od.Quantity * od.Price) as N'Thành Tiền'
                FROM Orders o
                JOIN OrderDetails od ON o.OrderID = od.OrderID
                JOIN Products p ON od.ProductID = p.ProductID
                WHERE p.CategoryID = @id
                ORDER BY o.OrderDate DESC
            `);
        res.json(result.recordset);
    } catch (err) { 
        console.error("Lỗi xuất file ĐH:", err);
        res.status(500).json({ message: 'Lỗi server' }); 
    }
});
module.exports = router;