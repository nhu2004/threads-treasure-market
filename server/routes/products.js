const express = require('express');
const router = express.Router();
const sql = require('mssql');
const productController = require('../controllers/productController');

const sqlConfig = {
    user: 'sa', password: '123', database: 'ThreadsTreasureDB',
    server: 'NHI\\SQL1', 
    options: { encrypt: false, trustServerCertificate: true }
};

// 1. API LẤY DANH SÁCH SẢN PHẨM (TÍCH HỢP 2 KỊCH BẢN: ADMIN & KHÁCH HÀNG)
router.get('/', async (req, res) => {
    try {
        const searchKeyword = req.query.search || ''; 
        const isAdmin = req.query.admin === 'true'; // Nhận biết cuộc gọi từ trang quản trị Admin
        
        let pool = await sql.connect(sqlConfig);
        let request = pool.request();
        let queryStr = '';

        if (isAdmin) {
            // 🔴 KỊCH BẢN A: DÀNH CHO TRANG QUẢN TRỊ ADMIN (Lấy hết tất cả biến thể để quản lý chi tiết)
            queryStr = `
                SELECT 
                    p.ProductID, p.Name, p.Price, p.OriginalPrice, 
                    p.ImageUrl, p.Description, p.Badge, 
                    p.Color, p.Size, p.SKU, p.ProductGroupID,
                    p.CategoryID, p.SupplierID, p.IsActive, p.StockQuantity,
                    c.Name AS CategoryName
                FROM Products p
                LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
                WHERE p.IsDeleted = 0
            `;

            if (searchKeyword) {
                queryStr += ` AND (p.Name LIKE @search OR c.Name LIKE @search OR p.SKU LIKE @search)`;
                request.input('search', sql.NVarChar, `%${searchKeyword}%`);
            }

            queryStr += ` ORDER BY p.ProductID DESC`;

            let result = await request.query(queryStr);

            const formattedProducts = result.recordset.map(p => ({
                id: p.ProductID,
                name: p.Name,
                price: p.Price,
                originalPrice: p.OriginalPrice,
                image: p.ImageUrl,
                description: p.Description,
                badge: p.Badge,
                color: p.Color,                  
                size: p.Size,                    
                sku: p.SKU,
                productGroupId: p.ProductGroupID,
                category: p.CategoryName,
                categoryId: p.CategoryID,
                supplierId: p.SupplierID,
                isActive: p.IsActive,
                stockQuantity: p.StockQuantity // Lấy số lượng tồn kho thực tế của riêng size/màu đó
            }));

            return res.json({ products: formattedProducts, totalPage: 1 });

        } else {
            // 🔵 KỊCH BẢN B: DÀNH CHO KHÁCH HÀNG NGOÀI CỬA HÀNG (Giữ nguyên logic cũ của bạn)
            queryStr = `
                WITH GroupedData AS (
                    SELECT ISNULL(NULLIF(ProductGroupID, ''), CAST(ProductID AS NVARCHAR)) as GroupKey, 
                           SUM(StockQuantity) as TotalStock
                    FROM Products WHERE IsActive = 1 AND IsDeleted = 0
                    GROUP BY ISNULL(NULLIF(ProductGroupID, ''), CAST(ProductID AS NVARCHAR))
                ),
                RankedProducts AS (
                    SELECT 
                        p.ProductID, p.Name, p.Price, p.OriginalPrice, 
                        p.ImageUrl, p.Description, p.Badge, 
                        p.Color, p.Size, p.SKU, p.ProductGroupID,
                        p.CategoryID, p.SupplierID,
                        c.Name AS CategoryName, 
                        g.TotalStock,
                        ROW_NUMBER() OVER(PARTITION BY ISNULL(NULLIF(p.ProductGroupID, ''), CAST(p.ProductID AS NVARCHAR)) ORDER BY p.ProductID) as rn
                    FROM Products p
                    LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
                    LEFT JOIN GroupedData g ON ISNULL(NULLIF(p.ProductGroupID, ''), CAST(p.ProductID AS NVARCHAR)) = g.GroupKey
                    WHERE p.IsActive = 1 AND p.IsDeleted = 0
            `;

            if (searchKeyword) {
                queryStr += ` AND (p.Name LIKE @search OR c.Name LIKE @search OR p.SKU LIKE @search)`;
                request.input('search', sql.NVarChar, `%${searchKeyword}%`);
            }

            queryStr += ` ) SELECT * FROM RankedProducts WHERE rn = 1 ORDER BY ProductID DESC`;

            let result = await request.query(queryStr);

            const formattedProducts = result.recordset.map(p => ({
                id: p.ProductID,
                name: p.Name,
                price: p.Price,
                originalPrice: p.OriginalPrice,
                image: p.ImageUrl,
                description: p.Description,
                badge: p.Badge,
                color: p.Color,                  
                size: p.Size,                    
                sku: p.SKU,
                productGroupId: p.ProductGroupID,
                category: p.CategoryName,
                categoryId: p.CategoryID,
                supplierId: p.SupplierID,
                stockQuantity: p.TotalStock // Tổng tồn kho gộp nhóm hiển thị ngoài shop Card
            }));

            return res.json({ products: formattedProducts, totalPage: 1 });
        }
    } catch (err) {
        console.error("Lỗi lấy sản phẩm:", err);
        res.status(500).json({ message: 'Lỗi kết nối database' });
    }
});  

// Các hàm bổ trợ điều hướng khác giữ nguyên của bạn
router.post('/', productController.createProduct); 
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct); 
router.get('/group/:groupId', productController.getProductsByGroup);
router.put('/:id/toggle-status', productController.toggleStatus);
// 2. LẤY CHI TIẾT SẢN PHẨM 
router.get('/:id', async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);
        let result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`
                SELECT p.*, c.Name AS CategoryName, s.Name AS SupplierName
                FROM Products p
                LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
                LEFT JOIN Suppliers s ON p.SupplierID = s.SupplierID
                WHERE p.ProductID = @id
            `);

        if (result.recordset.length === 0) return res.status(404).json({ message: 'Không tìm thấy' });
        const p = result.recordset[0];
        res.json({ product: {
            id: p.ProductID, name: p.Name, price: p.Price, originalPrice: p.OriginalPrice, image: p.ImageUrl,
            description: p.Description, badge: p.Badge, productGroupId: p.ProductGroupID, color: p.Color, size: p.Size,   
            sku: p.SKU, category: p.CategoryName, categoryId: p.CategoryID, supplierId: p.SupplierID, stockQuantity: p.StockQuantity
        } });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// 3. KIỂM TRA ĐƠN HÀNG TRƯỚC KHI THAO TÁC
router.get('/:id/check-ordered', async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);
        let result = await pool.request().input('id', sql.Int, req.params.id).query(`SELECT TOP 1 OrderDetailID FROM OrderDetails WHERE ProductID = @id`);
        res.json({ data: result.recordset });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi kiểm tra đơn hàng' });
    }
}); 
module.exports = router;