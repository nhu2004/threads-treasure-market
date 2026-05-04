// Backend/controllers/voucherController.js
const { poolPromise, sql } = require('../db');

// Dành cho Admin quản lý
const getVouchers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const pool = await poolPromise;
        
        // Query 2 câu lệnh cùng lúc: Lấy data theo trang và Đếm tổng số lượng
        const result = await pool.request()
            .input('offset', sql.Int, offset)
            .input('limit', sql.Int, limit)
            .query(`
                SELECT * FROM Vouchers 
                ORDER BY VoucherID DESC 
                OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
                
                SELECT COUNT(*) as total FROM Vouchers;
            `);
            
        // Tính toán tổng số trang
        const totalRecords = result.recordsets[1][0].total;
        const totalPage = Math.ceil(totalRecords / limit);

        // Trả về đúng format mà Frontend đang đợi
        res.json({ 
            vouchers: result.recordsets[0], 
            totalPage: totalPage,
            total: totalRecords
        });
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
// Thêm hàm lấy Top Voucher được dùng nhiều nhất
const getTopVouchers = async (req, res) => {
    try {
        const pool = await poolPromise;
        // Lấy top 3 voucher được sử dụng nhiều nhất từ bảng Orders
        const result = await pool.request().query(`
            SELECT TOP 3
                v.VoucherID,
                v.Code,
                v.Name,
                COUNT(o.OrderID) as UsageCount
            FROM Vouchers v
            INNER JOIN Orders o ON v.VoucherID = o.VoucherID
            GROUP BY v.VoucherID, v.Code, v.Name
            ORDER BY UsageCount DESC
        `);
        
        res.json({ topVouchers: result.recordset });
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
// 1. Hàm Cập nhật Voucher
const updateVoucher = async (req, res) => {
    try {
        const { id } = req.params;
        // Dựa theo UI Modal của bạn, ta chỉ cập nhật Tên, Ngày bắt đầu và Ngày kết thúc
        const { Name, start, end } = req.body; 
        const pool = await poolPromise;
        
        await pool.request()
            .input('id', sql.Int, id)
            .input('name', sql.NVarChar, Name)
            .input('start', sql.DateTime, start)
            .input('end', sql.DateTime, end)
            .query(`UPDATE Vouchers 
                    SET Name = @name, StartDate = @start, ExpiryDate = @end 
                    WHERE VoucherID = @id`);
                    
        res.json({ message: 'Cập nhật mã giảm giá thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Hàm Xóa Voucher (Có xử lý an toàn Khóa Ngoại)
const deleteVoucher = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        
        // Bước 1: Xóa mã này khỏi "Ví" của khách hàng trước (bảng UserVouchers)
        await pool.request()
            .input('id', sql.Int, id)
            .query(`DELETE FROM UserVouchers WHERE VoucherID = @id`);

        // Bước 2: Xóa mã khỏi bảng Vouchers
        await pool.request()
            .input('id', sql.Int, id)
            .query(`DELETE FROM Vouchers WHERE VoucherID = @id`);
            
        res.json({ message: 'Xóa mã giảm giá thành công' });
    } catch (error) {
        // Mã lỗi 547 là lỗi Conflict Foreign Key trong SQL Server
        if (error.number === 547) {
            return res.status(400).json({ message: 'Không thể xóa! Mã này đã được sử dụng trong Đơn hàng của khách.' });
        }
        res.status(500).json({ message: error.message });
    }
}; 
module.exports = { getVouchers, getUserVouchers, createVoucher, getTopVouchers, updateVoucher, deleteVoucher }; 