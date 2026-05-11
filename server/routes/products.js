const express = require('express');
const router = express.Router();
const sql = require('mssql');
const productController = require('../controllers/productController');

const sqlConfig = {
    user: 'sa',
    password: '123456789',
    database: 'ThreadsTreasureDB',
    server: 'LAPTOP-1D1H6LSB\\MSSQLSERVER01',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

// API: Lấy danh sách sản phẩm
router.get('/', async (req, res) => {
    try {
        // 1. Nhận từ khóa tìm kiếm từ React gửi lên
        const searchKeyword = req.query.search || '';
        let pool = await sql.connect(sqlConfig);

        // 2. Chuẩn bị câu truy vấn gốc
        let queryStr = `
            SELECT
                p.ProductID,
                p.Name,
                p.Price,
                p.OriginalPrice,
                p.ImageUrl,
                p.Description,
                p.Badge,
                p.Colors,
                p.Sizes,
                p.StockQuantity,
                c.Name AS CategoryName
            FROM Products p
            LEFT JOIN Categories c
                ON p.CategoryID = c.CategoryID
        `;

        // 3. Nếu có từ khóa tìm kiếm thì thêm điều kiện WHERE
        if (searchKeyword) {
            queryStr += `
                WHERE p.Name LIKE @search
                   OR c.Name LIKE @search
            `;
        }

        // 4. Chạy truy vấn
        let request = pool.request();

        if (searchKeyword) {
            request.input('search', sql.NVarChar, `%${searchKeyword}%`);
        }

        let result = await request.query(queryStr);

        // 5. Chuẩn hóa dữ liệu trả về
        const formattedProducts = result.recordset.map((p) => ({
            id: p.ProductID,
            name: p.Name,
            price: p.Price,
            originalPrice: p.OriginalPrice,
            image: p.ImageUrl,
            description: p.Description,
            badge: p.Badge,

            // Parse Colors an toàn
            colors: (() => {
                try {
                    return p.Colors ? JSON.parse(p.Colors) : [];
                } catch {
                    return [];
                }
            })(),

            sizes: p.Sizes ? p.Sizes.split(',') : [],
            category: p.CategoryName,
            stockQuantity: p.StockQuantity
        }));

        res.json({
            products: formattedProducts,
            totalPage: 1
        });
    } catch (err) {
        console.error('Lỗi lấy sản phẩm:', err);
        res.status(500).json({
            message: 'Lỗi kết nối database',
            error: err.message
        });
    }
});

// API: Lấy chi tiết 1 sản phẩm theo ID
router.get('/:id', async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);

        let result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`
                SELECT
                    p.*,
                    c.Name AS CategoryName,
                    s.Name AS SupplierName
                FROM Products p
                LEFT JOIN Categories c
                    ON p.CategoryID = c.CategoryID
                LEFT JOIN Suppliers s
                    ON p.SupplierID = s.SupplierID
                WHERE p.ProductID = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: 'Không tìm thấy sản phẩm'
            });
        }

        const p = result.recordset[0];

        const formattedProduct = {
            id: p.ProductID,
            name: p.Name,
            price: p.Price,
            originalPrice: p.OriginalPrice,
            image: p.ImageUrl,
            description: p.Description,
            badge: p.Badge,

            colors: (() => {
                try {
                    return p.Colors ? JSON.parse(p.Colors) : [];
                } catch {
                    return [];
                }
            })(),

            sizes: p.Sizes ? p.Sizes.split(',') : [],
            category: p.CategoryName,
            categoryId: p.CategoryID,
            supplierId: p.SupplierID,
            supplierName: p.SupplierName,
            stockQuantity: p.StockQuantity
        };

        res.json({
            product: formattedProduct
        });
    } catch (err) {
        console.error('Lỗi lấy chi tiết SP:', err);
        res.status(500).json({
            message: 'Lỗi server',
            error: err.message
        });
    }
});

// API: Tạo sản phẩm
router.post('/', productController.createProduct);

// API: Cập nhật sản phẩm
router.put('/:id', productController.updateProduct);

// API: Xóa sản phẩm
router.delete('/:id', productController.deleteProduct);

// API: Kiểm tra sản phẩm đã có đơn hàng chưa
router.get('/:id/check-ordered', async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);

        let result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`
                SELECT TOP 1 OrderDetailID
                FROM OrderDetails
                WHERE ProductID = @id
            `);

        res.json({
            data: result.recordset
        });
    } catch (err) {
        console.error('Lỗi kiểm tra đơn hàng:', err);
        res.status(500).json({
            message: 'Lỗi kiểm tra đơn hàng',
            error: err.message
        });
    }
});

module.exports = router;