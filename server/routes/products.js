const express = require('express');
const router = express.Router();
const sql = require('mssql');
const productController = require('../controllers/productController');

const sqlConfig = {
    user: 'sa', password: '123', database: 'ThreadsTreasureDB',
    server: 'NHI\\SQL1', 
    options: { encrypt: false, trustServerCertificate: true }
};

// 1. API LẤY DANH SÁCH KHÁCH HÀNG (ĐÃ GOM NHÓM BIẾN THỂ VÀ CỘNG DỒN TỒN KHO)
router.get('/', async (req, res) => {
    try {
        const searchKeyword = req.query.search || ''; 
        let pool = await sql.connect(sqlConfig);
        
        let queryStr = `
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
        }

        queryStr += ` ) SELECT * FROM RankedProducts WHERE rn = 1 ORDER BY ProductID DESC`;

        let request = pool.request();
        if (searchKeyword) request.input('search', sql.NVarChar, `%${searchKeyword}%`);
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
            stockQuantity: p.TotalStock // Lấy tổng tồn kho của cả nhóm
        }));

        res.json({ products: formattedProducts, totalPage: 1 });
    } catch (err) {
        console.error("Lỗi lấy sản phẩm:", err);
        res.status(500).json({ message: 'Lỗi kết nối database' });
    }
}); 

router.post('/', productController.createProduct); 
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.get('/group/:groupId', productController.getProductsByGroup);

// --- LẤY CHI TIẾT SẢN PHẨM ---
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

        if (result.recordset.length === 0) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        const p = result.recordset[0];
        res.json({ product: {
            id: p.ProductID, name: p.Name, price: p.Price, originalPrice: p.OriginalPrice, image: p.ImageUrl,
            description: p.Description, badge: p.Badge, productGroupId: p.ProductGroupID, color: p.Color, size: p.Size,   
            sku: p.SKU, category: p.CategoryName, categoryId: p.CategoryID, supplierId: p.SupplierID, supplierName: p.SupplierName, stockQuantity: p.StockQuantity
        } });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

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