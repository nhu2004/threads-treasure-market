const { poolPromise, sql } = require('../db');

const getProducts = async (req, res) => {
    try {
        const pool = await poolPromise;
        // Query lấy sản phẩm kèm tên Brand và Category để hiển thị lên Web cho chuyên nghiệp
        const result = await pool.request().query(`
            SELECT p.*, b.Name as BrandName, c.Name as CategoryName 
            FROM Products p
            LEFT JOIN Brands b ON p.BrandID = b.BrandID
            LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
        `);
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách sản phẩm: " + error.message });
    }
};

const createProduct = async (req, res) => {
    try {
        const { name, price, brandId, categoryId, supplierId, description, imageUrl } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('name', sql.NVarChar, name)
            .input('price', sql.Decimal, price)
            .input('brand', sql.Int, brandId)
            .input('cate', sql.Int, categoryId)
            .input('sup', sql.Int, supplierId)
            .input('desc', sql.NVarChar, description)
            .input('img', sql.NVarChar, imageUrl)
            .query(`INSERT INTO Products (Name, Price, BrandID, CategoryID, SupplierID, Description, ImageUrl) 
                    VALUES (@name, @price, @brand, @cate, @sup, @desc, @img)`);
        
        res.json({ message: 'Thêm sản phẩm thời trang thành công!' });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi thêm sản phẩm: " + error.message });
    }
};

module.exports = { getProducts, createProduct };