const express = require('express');
const router = express.Router();
const sql = require('mssql');

const sqlConfig = {
    user: 'sa', password: '123', database: 'ThreadsTreasureDB',
    server: 'NHI\\SQL1', 
    options: { encrypt: false, trustServerCertificate: true }
};

router.get('/', async (req, res) => {
    try {
        // 1. Nhận từ khóa tìm kiếm từ React gửi lên
        const searchKeyword = req.query.search || ''; 
        let pool = await sql.connect(sqlConfig);
        
        // 2. Chuẩn bị câu truy vấn gốc
        let queryStr = `
            SELECT 
                p.ProductID, p.Name, p.Price, p.OriginalPrice, 
                p.ImageUrl, p.Description, p.Badge, p.Colors, p.Sizes, 
                c.Name AS CategoryName
            FROM Products p
            LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
        `;

        // 3. Nếu có từ khóa tìm kiếm, ghép thêm điều kiện WHERE vào SQL
        if (searchKeyword) {
            // Tìm sản phẩm có Tên hoặc Danh mục chứa từ khóa
            queryStr += ` WHERE p.Name LIKE @search OR c.Name LIKE @search`;
        }

        // 4. Chạy truy vấn an toàn
        let request = pool.request();
        if (searchKeyword) {
            request.input('search', sql.NVarChar, `%${searchKeyword}%`);
        }
        let result = await request.query(queryStr);

        // 5. Chuẩn hóa dữ liệu trả về
        const formattedProducts = result.recordset.map(p => ({
            id: p.ProductID,
            name: p.Name,
            price: p.Price,
            originalPrice: p.OriginalPrice,
            image: p.ImageUrl,
            description: p.Description,
            badge: p.Badge,
            colors: p.Colors ? JSON.parse(p.Colors) : [],
            sizes: p.Sizes ? p.Sizes.split(',') : [],
            category: p.CategoryName
        }));

        res.json({ products: formattedProducts, totalPage: 1 });
    } catch (err) {
        console.error("Lỗi lấy sản phẩm:", err);
        res.status(500).json({ message: 'Lỗi kết nối database' });
    }
});

module.exports = router;