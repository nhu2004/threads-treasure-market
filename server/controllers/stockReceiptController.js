const { poolPromise, sql } = require('../db');

// 1. TẠO PHIẾU NHẬP KHO VÀ CỘNG TỒN KHO TỰ ĐỘNG
const createReceipt = async (req, res) => {
    try {
        const { productId, supplierId, quantityAdded, importPrice, note, adminId } = req.body;
        const pool = await poolPromise;
        
        // Dùng TRANSACTION để đảm bảo: Nhập kho thành công thì Tồn kho mới được cộng
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // Bước 1: Lưu lịch sử vào bảng StockReceipts
            await transaction.request()
                .input('product', sql.Int, productId)
                .input('supplier', sql.Int, supplierId)
                .input('qty', sql.Int, quantityAdded)
                .input('price', sql.Decimal(18,2), importPrice)
                .input('note', sql.NVarChar, note || '')
                .input('admin', sql.Int, adminId || 1)
                .query(`
                    INSERT INTO StockReceipts (ProductID, SupplierID, QuantityAdded, ImportPrice, Note, AdminID)
                    VALUES (@product, @supplier, @qty, @price, @note, @admin)
                `);

            // Bước 2: Cộng dồn số lượng vào bảng Products (Nếu Trigger ở SQL không chạy thì code này cứu nguy)
            await transaction.request()
                .input('product', sql.Int, productId)
                .input('qty', sql.Int, quantityAdded)
                .query(`
                    UPDATE Products 
                    SET StockQuantity = ISNULL(StockQuantity, 0) + @qty,
                        UpdatedAt = GETDATE()
                    WHERE ProductID = @product
                `);

            await transaction.commit();
            res.json({ message: 'Nhập kho thành công và đã cộng tồn kho!', success: true });

        } catch (err) {
            await transaction.rollback();
            throw err;
        }

    } catch (error) {
        console.error("Lỗi nhập kho:", error.message);
        res.status(500).json({ message: "Lỗi Server: " + error.message });
    }
};

// 2. LẤY LỊCH SỬ NHẬP CỦA 1 NHÀ CUNG CẤP (Dùng cho Modal của bạn)
const getReceiptsBySupplier = async (req, res) => {
    try {
        const { supplierId } = req.params;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('sup', sql.Int, supplierId)
            .query(`
                SELECT 
                    sr.ReceiptID, sr.EntryDate, sr.QuantityAdded, sr.ImportPrice, sr.Note,
                    p.Name AS ProductName, p.Color, p.Size, p.SKU
                FROM StockReceipts sr
                JOIN Products p ON sr.ProductID = p.ProductID
                WHERE sr.SupplierID = @sup
                ORDER BY sr.EntryDate DESC
            `);
        res.json({ success: true, data: result.recordset });
    } catch (error) {
        res.status(500).json({ message: "Lỗi Server: " + error.message });
    }
};

module.exports = { createReceipt, getReceiptsBySupplier };