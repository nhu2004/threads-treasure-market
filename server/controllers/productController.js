const { poolPromise, sql } = require('../db');

// 1. THÊM SẢN PHẨM (Mỗi lần thêm là 1 Size + 1 Màu)
const createProduct = async (req, res) => {
    try {
        const { 
            name, price, originalPrice, categoryId, supplierId, 
            description, imageUrl, image, badge, 
            productGroupId, color, size, sku, stockQuantity, createdBy 
        } = req.body;

        const pool = await poolPromise;
        const finalImageUrl = image || imageUrl || '';

        const result = await pool.request()
            .input('name', sql.NVarChar, name)
            .input('price', sql.Decimal(18, 2), price)
            .input('oriPrice', sql.Decimal(18, 2), originalPrice || price)
            .input('cate', sql.Int, categoryId)
            .input('sup', sql.Int, supplierId)
            .input('desc', sql.NVarChar, description || '')
            .input('img', sql.NVarChar, finalImageUrl)
            .input('badge', sql.NVarChar, badge || 'MỚI')
            .input('groupId', sql.NVarChar, productGroupId || null)
            .input('color', sql.NVarChar, color || null)
            .input('size', sql.NVarChar, size || null)
            .input('sku', sql.VARCHAR, sku || null)
            .input('stock', sql.Int, stockQuantity || 0)
            .input('user', sql.Int, createdBy || 1)
            .query(`
                INSERT INTO Products (Name, Price, OriginalPrice, CategoryID, SupplierID, Description, ImageUrl, Badge, ProductGroupID, Color, Size, SKU, StockQuantity, CreatedBy) 
                VALUES (@name, @price, @oriPrice, @cate, @sup, @desc, @img, @badge, @groupId, @color, @size, @sku, @stock, @user)
            `);
        
        res.json({ message: 'Thêm sản phẩm thành công!', success: true });
    } catch (error) {
        console.error("LỖI SQL:", error.message);
        res.status(500).json({ message: "Lỗi Server: " + error.message });
    }
}; 

// 2. SỬA SẢN PHẨM 
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            name, price, originalPrice, categoryId, supplierId, 
            description, imageUrl, productGroupId, color, size, sku, stockQuantity 
        } = req.body;

        const pool = await poolPromise;

        await pool.request()
            .input('id', sql.Int, id)
            .input('name', sql.NVarChar, name)
            .input('price', sql.Decimal(18, 2), price)
            .input('oriPrice', sql.Decimal(18, 2), originalPrice)
            .input('cate', sql.Int, categoryId)
            .input('sup', sql.Int, supplierId)
            .input('desc', sql.NVarChar, description || '')
            .input('img', sql.NVarChar, imageUrl)
            .input('groupId', sql.NVarChar, productGroupId || null)
            .input('color', sql.NVarChar, color || null)
            .input('size', sql.NVarChar, size || null)
            .input('sku', sql.VARCHAR, sku || null)
            .input('stock', sql.Int, stockQuantity)
            .query(`
                UPDATE Products 
                SET Name = @name, 
                    Price = @price, 
                    OriginalPrice = @oriPrice,
                    CategoryID = @cate, 
                    SupplierID = @sup, 
                    Description = @desc, 
                    ImageUrl = @img,
                    ProductGroupID = @groupId,
                    Color = @color, 
                    Size = @size, 
                    SKU = @sku,
                    StockQuantity = @stock 
                WHERE ProductID = @id
            `);

        res.json({ message: 'Cập nhật sản phẩm thành công!', success: true });
    } catch (error) {
        console.error("Lỗi cập nhật SQL:", error.message);
        res.status(500).json({ message: "Lỗi cập nhật: " + error.message });
    }
};

// 3. XÓA SẢN PHẨM (Nên đổi thành xóa mềm trong tương lai, hiện tại giữ nguyên để không phá code cũ)
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        await pool.request().input('id', sql.Int, id).query(`DELETE FROM Products WHERE ProductID=@id`);
        res.json({ message: 'Xóa sản phẩm thành công!' });
    } catch (error) {
        res.status(500).json({ message: "Lỗi xóa sản phẩm: " + error.message });
    }
};

// 4. LẤY DANH SÁCH (Cho Admin - Gom nhóm)
const getProducts = async (req, res) => {
    try {
        const { search } = req.query;
        const pool = await poolPromise;
        try { await pool.request().query('EXEC sp_AutoClearanceSale'); } catch (e) { console.log(e.message); }
        
        let queryStr = `
            WITH GroupedData AS (
                SELECT ISNULL(NULLIF(ProductGroupID, ''), CAST(ProductID AS NVARCHAR)) as GroupKey, SUM(StockQuantity) as TotalStock
                FROM Products WHERE IsActive = 1 AND IsDeleted = 0
                GROUP BY ISNULL(NULLIF(ProductGroupID, ''), CAST(ProductID AS NVARCHAR))
            ),
            RankedProducts AS (
                SELECT p.*, c.Name AS CategoryName, g.TotalStock,
                       ROW_NUMBER() OVER(PARTITION BY ISNULL(NULLIF(p.ProductGroupID, ''), CAST(p.ProductID AS NVARCHAR)) ORDER BY p.ProductID) as rn
                FROM Products p
                LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
                LEFT JOIN GroupedData g ON ISNULL(NULLIF(p.ProductGroupID, ''), CAST(p.ProductID AS NVARCHAR)) = g.GroupKey
                WHERE p.IsActive = 1 AND p.IsDeleted = 0
        `;
        
        const request = pool.request();
        if (search) {
            queryStr += ` AND (p.Name LIKE @search OR p.Description LIKE @search OR p.SKU LIKE @search)`;
            request.input('search', sql.NVarChar, `%${search}%`);
        }
        queryStr += ` ) SELECT * FROM RankedProducts WHERE rn = 1 ORDER BY ProductID DESC`;

        const result = await request.query(queryStr);
        
        const formattedProducts = result.recordset.map(p => ({
            id: p.ProductID, name: p.Name, price: p.Price, originalPrice: p.OriginalPrice, image: p.ImageUrl,
            description: p.Description, badge: p.Badge, productGroupId: p.ProductGroupID, 
            color: p.Color, size: p.Size, sku: p.SKU, category: p.CategoryName || 'Mặc định',
            categoryId: p.CategoryID, supplierId: p.SupplierID, 
            stockQuantity: p.TotalStock // Hiển thị tổng số lượng kho của cả nhóm
        }));

        res.json({ success: true, products: formattedProducts, totalPage: 1 });
    } catch (error) {
        res.status(500).json({ message: "Lỗi Server: " + error.message });
    }
};


// 5. HÀM MỚI: LẤY CÁC SẢN PHẨM CÙNG NHÓM (Cho Khách Hàng chọn Size/Màu)
const getProductsByGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('groupId', sql.NVarChar, groupId)
            .query(`
                SELECT ProductID, Name, Price, ImageUrl, Color, Size, StockQuantity 
                FROM Products 
                WHERE ProductGroupID = @groupId AND IsActive = 1 AND IsDeleted = 0
            `);
        
        res.json({ success: true, variants: result.recordset });
    } catch (error) {
        res.status(500).json({ message: "Lỗi Server: " + error.message });
    }
};

module.exports = { getProducts, createProduct, updateProduct, deleteProduct, getProductsByGroup };