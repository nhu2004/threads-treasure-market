const { poolPromise, sql } = require('../db');

// 1. THÊM SẢN PHẨM (Đã cập nhật Size, Màu sắc, Nhà cung cấp)
const createProduct = async (req, res) => {
    try {
        const { name, price, originalPrice, categoryId, supplierId, description, imageUrl, badge, colors, sizes, stockQuantity } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('name', sql.NVarChar, name)
            .input('price', sql.Decimal, price)
            .input('originalPrice', sql.Decimal, originalPrice || price)
            .input('cate', sql.Int, categoryId)
            .input('sup', sql.Int, supplierId) // Lưu thông tin nhà cung cấp
            .input('desc', sql.NVarChar, description)
            .input('img', sql.NVarChar, imageUrl)
            .input('badge', sql.NVarChar, badge || '')
            .input('colors', sql.NVarChar, JSON.stringify(colors)) // Chuyển mảng màu thành chuỗi JSON
            .input('sizes', sql.NVarChar, sizes.join(',')) // Chuyển mảng size thành chuỗi cách nhau dấu phẩy
            .input('stock', sql.Int, stockQuantity)
            .query(`INSERT INTO Products (Name, Price, OriginalPrice, CategoryID, SupplierID, Description, ImageUrl, Badge, Colors, Sizes, StockQuantity) 
                    VALUES (@name, @price, @originalPrice, @cate, @sup, @desc, @img, @badge, @colors, @sizes, @stock)`);
        
        res.json({ message: 'Thêm sản phẩm thành công!' });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi thêm sản phẩm: " + error.message });
    }
};

// 2. SỬA SẢN PHẨM (Mới bổ sung theo yêu cầu ảnh)
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, categoryId, supplierId, description, colors, sizes, stockQuantity } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .input('name', sql.NVarChar, name)
            .input('price', sql.Decimal, price)
            .input('cate', sql.Int, categoryId)
            .input('sup', sql.Int, supplierId)
            .input('desc', sql.NVarChar, description)
            .input('colors', sql.NVarChar, JSON.stringify(colors))
            .input('sizes', sql.NVarChar, sizes.join(','))
            .input('stock', sql.Int, stockQuantity)
            .query(`UPDATE Products 
                    SET Name=@name, Price=@price, CategoryID=@cate, SupplierID=@sup, 
                        Description=@desc, Colors=@colors, Sizes=@sizes, StockQuantity=@stock 
                    WHERE ProductID=@id`);
        res.json({ message: 'Cập nhật sản phẩm thành công!' });
    } catch (error) {
        res.status(500).json({ message: "Lỗi cập nhật: " + error.message });
    }
};

// 3. XÓA SẢN PHẨM (Mới bổ sung theo yêu cầu ảnh)
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .query(`DELETE FROM Products WHERE ProductID=@id`);
        res.json({ message: 'Xóa sản phẩm thành công!' });
    } catch (error) {
        res.status(500).json({ message: "Lỗi xóa sản phẩm: " + error.message });
    }
};

module.exports = { createProduct, updateProduct, deleteProduct };