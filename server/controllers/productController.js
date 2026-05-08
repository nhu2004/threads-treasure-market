const { poolPromise, sql } = require('../db');

// 1. THÊM SẢN PHẨM (Để SQL tự động tăng ProductID)
const createProduct = async (req, res) => {
    try {
        const { 
            name, price, originalPrice, categoryId, supplierId, 
            description, imageUrl, badge, colors, sizes, stockQuantity, createdBy 
        } = req.body;

        const pool = await poolPromise;

        // BỎ QUA KIỂM TRA TRÙNG MÃ VÌ SQL TỰ ĐỘNG ĐÁNH SỐ
        // THỰC HIỆN INSERT TRỰC TIẾP (Không có cột ProductID)
        const result = await pool.request()
            .input('name', sql.NVarChar, name)
            .input('price', sql.Decimal(18, 2), price)
            .input('oriPrice', sql.Decimal(18, 2), originalPrice || price)
            .input('cate', sql.Int, categoryId)
            .input('sup', sql.Int, supplierId)
            .input('desc', sql.NVarChar, description || '')
            .input('img', sql.NVarChar, imageUrl || '')
            .input('badge', sql.NVarChar, badge || 'MỚI')
            .input('colors', sql.NVarChar, JSON.stringify(colors)) 
            .input('sizes', sql.NVarChar, Array.isArray(sizes) ? sizes.join(',') : sizes)
            .input('stock', sql.Int, stockQuantity || 0)
            .input('user', sql.Int, createdBy || 1)
            .query(`
                INSERT INTO Products (Name, Price, OriginalPrice, CategoryID, SupplierID, Description, ImageUrl, Badge, Colors, Sizes, StockQuantity, CreatedBy) 
                VALUES (@name, @price, @oriPrice, @cate, @sup, @desc, @img, @badge, @colors, @sizes, @stock, @user)
            `);
        
        if (result.rowsAffected[0] > 0) {
            res.json({ message: 'Thêm sản phẩm thành công!', success: true });
        } else {
            res.status(500).json({ message: 'Lỗi: Không có dữ liệu nào được thêm vào.' });
        }

    } catch (error) {
        console.error("LỖI SQL:", error.message);
        res.status(500).json({ message: "Lỗi Server: " + error.message });
    }
}; 

// 2. SỬA SẢN PHẨM 
// TRONG FILE productController.js

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params; // Đây là ProductID từ URL
        const { 
            name, price, originalPrice, categoryId, supplierId, 
            description, imageUrl, colors, sizes, stockQuantity 
        } = req.body;

        const pool = await poolPromise;
        
        // Chuyển đổi mảng thành chuỗi để lưu vào SQL (nếu chưa là chuỗi)
        const colorsStr = Array.isArray(colors) ? JSON.stringify(colors) : colors;
        const sizesStr = Array.isArray(sizes) ? sizes.join(',') : sizes;

        await pool.request()
            .input('id', sql.Int, id)
            .input('name', sql.NVarChar, name)
            .input('price', sql.Decimal(18, 2), price)
            .input('oriPrice', sql.Decimal(18, 2), originalPrice)
            .input('cate', sql.Int, categoryId)
            .input('sup', sql.Int, supplierId)
            .input('desc', sql.NVarChar, description || '')
            .input('img', sql.NVarChar, imageUrl)
            .input('colors', sql.NVarChar, colorsStr)
            .input('sizes', sql.NVarChar, sizesStr)
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
                    Colors = @colors, 
                    Sizes = @sizes, 
                    StockQuantity = @stock 
                WHERE ProductID = @id
            `);

        res.json({ message: 'Cập nhật sản phẩm thành công!', success: true });
    } catch (error) {
        console.error("Lỗi cập nhật SQL:", error.message);
        res.status(500).json({ message: "Lỗi cập nhật: " + error.message });
    }
};

// 3. XÓA SẢN PHẨM
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
// Thêm hàm này vào productController.js
const getProducts = async (req, res) => {
    try {
        const { search } = req.query;
        const pool = await poolPromise;
        
        let query = `SELECT * FROM Products`; // Dùng * sẽ lấy hết các cột bao gồm StockQuantity
        
        const request = pool.request();
        if (search) {
            query += ` WHERE Name LIKE @search OR Description LIKE @search`;
            request.input('search', sql.NVarChar, `%${search}%`);
        }

        const result = await request.query(query);
        
        // Trả về dữ liệu cho Frontend
        res.json({
            success: true,
            products: result.recordset, // result.recordset chứa danh sách sản phẩm từ SQL
            totalPage: 1 // Bạn có thể tính toán phân trang sau nếu cần
        });
    } catch (error) {
        console.error("Lỗi lấy danh sách sản phẩm:", error.message);
        res.status(500).json({ message: "Lỗi Server: " + error.message });
    }
};

// Đừng quên export nó ra nhé
module.exports = { getProducts, createProduct, updateProduct, deleteProduct };