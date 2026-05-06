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
        
        // Lưu ý: Nếu database có ràng buộc khóa ngoại (Foreign Key), bạn không thể xóa danh mục đang có sản phẩm.
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Categories WHERE CategoryID = @id');
            
        res.json({ message: 'Xóa thành công' });
    } catch (err) {
        console.error("Lỗi xóa danh mục:", err);
        res.status(500).json({ message: 'Xóa thất bại! Có thể do danh mục này đang chứa sản phẩm.' });
    }
});

module.exports = router;