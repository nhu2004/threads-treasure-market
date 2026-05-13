const { poolPromise } = require('../db');

const getOrderAnalytics = async (req, res) => {
    try {
        const pool = await poolPromise;
        // Tính tổng doanh thu và đếm số đơn hàng từ 20 đơn mẫu bạn đã chạy
        const result = await pool.request().query(`
            SELECT 
                SUM(Total) as totalRevenue, 
                COUNT(OrderID) as totalOrders 
            FROM Orders
        `);
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).send(error.message);
    }
};
const createOrder = async (req, res) => {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    
    try {
        const { userId, customer, items, totalPrice, discountAmount, voucherId } = req.body;
        await transaction.begin();

        // 1. Tạo đơn hàng vào bảng Orders (Giả sử bạn có các cột tương ứng)
        const orderResult = await transaction.request()
            .input('UserID', sql.Int, userId)
            .input('CustomerName', sql.NVarChar, customer.name)
            .input('Phone', sql.VarChar, customer.phone)
            .input('Address', sql.NVarChar, customer.address)
            .input('Total', sql.Decimal, totalPrice)
            .input('DiscountAmount', sql.Decimal, discountAmount)
            .input('VoucherID', sql.Int, voucherId || null)
            .input('Status', sql.NVarChar, 'pending')
            .query(`
                INSERT INTO Orders (UserID, CustomerName, Phone, Address, Total, DiscountAmount, VoucherID, Status, OrderDate)
                OUTPUT INSERTED.OrderID
                VALUES (@UserID, @CustomerName, @Phone, @Address, @Total, @DiscountAmount, @VoucherID, @Status, GETDATE())
            `);
        
        const orderId = orderResult.recordset[0].OrderID;

        // 2. Lưu OrderDetails và trừ StockQuantity
        for (const item of items) {
            await transaction.request()
                .input('OrderID', sql.Int, orderId)
                .input('ProductID', sql.Int, item.product.id)
                .input('Quantity', sql.Int, item.quantity)
                .input('Price', sql.Decimal, item.product.price)
                .input('Size', sql.NVarChar, item.size)
                .input('Color', sql.NVarChar, item.color)
                .query(`INSERT INTO OrderDetails (OrderID, ProductID, Quantity, Price, Size, Color) VALUES (@OrderID, @ProductID, @Quantity, @Price, @Size, @Color)`);
            
            await transaction.request()
                .input('qty', sql.Int, item.quantity)
                .input('pid', sql.Int, item.product.id)
                .query(`UPDATE Products SET StockQuantity = StockQuantity - @qty WHERE ProductID = @pid`);
        }

        // 3. XỬ LÝ USER (Rank và Voucher)
        if (userId) {
            // A. Đánh dấu Voucher nhập tay là đã sử dụng (NewUser, Birthday, General)
            if (voucherId) {
            // Kiểm tra loại voucher trước khi update
            const checkVoucher = await transaction.request()
                .input('vid', sql.Int, voucherId)
                .query(`SELECT VoucherType FROM Vouchers WHERE VoucherID = @vid`);
            
            const vType = checkVoucher.recordset[0]?.VoucherType;

            // Nếu KHÔNG PHẢI RankBased thì mới khóa mã (IsUsed = 1)
            if (vType !== 'RankBased') {
                await transaction.request()
                    .input('vid', sql.Int, voucherId)
                    .input('uid', sql.Int, userId)
                    .query(`UPDATE UserVouchers SET IsUsed = 1 WHERE VoucherID = @vid AND UserID = @uid`);
            }

            // B. Cập nhật tổng chi tiêu (TotalSpent)
            await transaction.request()
                .input('uid', sql.Int, userId)
                .input('spent', sql.Decimal, totalPrice) // Cộng số tiền đã thanh toán
                .query(`UPDATE Users SET TotalSpent = ISNULL(TotalSpent, 0) + @spent WHERE UserID = @uid`);

            // C. THUẬT TOÁN TỰ ĐỘNG NÂNG HẠNG (RANK)
            await transaction.request()
                .input('uid', sql.Int, userId)
                .query(`
                    UPDATE Users
                    SET RankID = (
                        SELECT TOP 1 RankID 
                        FROM CustomerRanks 
                        WHERE MinSpend <= (SELECT TotalSpent FROM Users WHERE UserID = @uid)
                        ORDER BY MinSpend DESC
                    )
                    WHERE UserID = @uid
                `);
        }

        await transaction.commit();
        res.status(201).json({ message: "Đặt hàng thành công", orderId });
    } 
    }catch (err) {
        await transaction.rollback();
        console.error(err);
        res.status(500).json({ message: 'Lỗi tạo đơn hàng' });
    }
};

module.exports = { getOrderAnalytics, createOrder };