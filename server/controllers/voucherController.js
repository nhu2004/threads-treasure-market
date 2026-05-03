// Backend/controllers/voucherController.js
const { poolPromise, sql } = require('../db');

// Dành cho Admin quản lý
const getVouchers = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Vouchers');
        res.json({ vouchers: result.recordset });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Dành cho Khách hàng xem ví voucher của mình
const getUserVouchers = async (req, res) => {
    try {
        const { userId } = req.params;
        const pool = await poolPromise;
        
        // 1. Gọi SP lấy các voucher ĐANG KHẢ DỤNG (chưa dùng + chưa hết hạn)
        const availableResult = await pool.request()
            .input('UserID', sql.Int, userId)
            .execute('sp_GetAvailableVouchersForUser');
            
        // 2. Query thêm các voucher ĐÃ DÙNG hoặc ĐÃ HẾT HẠN từ ví của user để hiển thị lịch sử
        const historyResult = await pool.request()
            .input('UserID', sql.Int, userId)
            .query(`
                SELECT v.*, uv.IsUsed 
                FROM UserVouchers uv 
                JOIN Vouchers v ON uv.VoucherID = v.VoucherID 
                WHERE uv.UserID = @UserID AND (uv.IsUsed = 1 OR v.ExpiryDate < GETDATE())
            `);

        // Gắn cờ used = false cho voucher khả dụng, và cờ từ DB cho voucher lịch sử
        const availableVouchers = availableResult.recordset.map(v => ({...v, used: false}));
        const unavailableVouchers = historyResult.recordset.map(v => ({...v, used: v.IsUsed}));

        // Trả về toàn bộ danh sách
        res.json({ vouchers: [...availableVouchers, ...unavailableVouchers] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Dành cho Admin thêm Voucher mới
const createVoucher = async (req, res) => {
    try {
        const { code, value, byType, name, startDate, expiryDate, minimumAmount, voucherType, minOrderValue, maxDiscountAmount, targetRankId, description } = req.body;
        const pool = await poolPromise;
        
        await pool.request()
            .input('code', sql.NVarChar, code)
            .input('value', sql.Decimal, value)
            .input('byType', sql.NVarChar, byType)
            .input('name', sql.NVarChar, name)
            .input('start', sql.DateTime, startDate)
            .input('end', sql.DateTime, expiryDate)
            .input('min', sql.Decimal, minimumAmount)
            .input('type', sql.NVarChar, voucherType)
            .input('minOrder', sql.Decimal, minOrderValue)
            .input('maxDiscount', sql.Decimal, maxDiscountAmount)
            .input('targetRank', sql.Int, targetRankId || null) // Nếu không có rank thì là NULL
            .input('desc', sql.NVarChar, description)
            .query(`INSERT INTO Vouchers 
                    (Code, Value, ByType, Name, StartDate, ExpiryDate, MinimumAmount, VoucherType, MinOrderValue, MaxDiscountAmount, TargetRankID, Description) 
                    VALUES (@code, @value, @byType, @name, @start, @end, @min, @type, @minOrder, @maxDiscount, @targetRank, @desc)`);
                    
        res.json({ message: 'Thêm mã giảm giá thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getVouchers, getUserVouchers, createVoucher };