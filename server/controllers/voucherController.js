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
        
        // 1. Lấy thông tin Hạng (RankID) của User hiện tại
        const userRes = await pool.request()
            .input('uid', sql.Int, userId)
            .query(`SELECT RankID, DOB FROM Users WHERE UserID = @uid`);
        const user = userRes.recordset[0];
        if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

        // --- 1. LOGIC TỰ ĐỘNG TẶNG MÃ SINH NHẬT ---
        const userQuery = await pool.request().input('uid', sql.Int, userId).query(`SELECT DOB FROM Users WHERE UserID = @uid`);
        const userDob = userQuery.recordset[0]?.DOB;

        if (userDob && new Date(userDob).getMonth() === new Date().getMonth()) {
            // Lấy mã Birthday đang Active
            const bdayVoucherQuery = await pool.request().query(`SELECT TOP 1 VoucherID FROM Vouchers WHERE VoucherType = 'Birthday' AND IsActive = 1`);
            if (bdayVoucherQuery.recordset.length > 0) {
                const bdayVoucherId = bdayVoucherQuery.recordset[0].VoucherID;
                
                // Kiểm tra xem năm nay đã nhận chưa để không phát trùng
                const checkClaimed = await pool.request()
                    .input('uid', sql.Int, userId)
                    .input('vid', sql.Int, bdayVoucherId)
                    .query(`SELECT UserVoucherID FROM UserVouchers WHERE UserID = @uid AND VoucherID = @vid AND YEAR(ReceivedDate) = YEAR(GETDATE())`);
                
                if (checkClaimed.recordset.length === 0) {
                    await pool.request()
                        .input('uid', sql.Int, userId)
                        .input('vid', sql.Int, bdayVoucherId)
                        .query(`INSERT INTO UserVouchers (UserID, VoucherID, IsUsed, ReceivedDate) VALUES (@uid, @vid, 0, GETDATE())`);
                }
            }
        }
        // 3. LẤY VOUCHER TRONG VÍ (NewUser, Birthday, General)
        // Những mã này cần JOIN với UserVouchers để check IsUsed
        const walletRes = await pool.request()
            .input('uid', sql.Int, userId)
            .query(`
                SELECT uv.IsUsed, v.*
                FROM UserVouchers uv
                JOIN Vouchers v ON uv.VoucherID = v.VoucherID
                WHERE uv.UserID = @uid AND v.IsActive = 1 AND uv.IsUsed = 0
            `);

        // 4. LẤY ƯU ĐÃI RANK (RankBased) - LUÔN LUÔN CÓ THEO HẠNG
        // Mã này không nằm trong ví cá nhân mà nằm ở quy định chung của Hạng
        const rankRes = await pool.request()
            .input('rid', sql.Int, user.RankID)
            .query(`
                SELECT *, 0 as IsUsed 
                FROM Vouchers 
                WHERE VoucherType = 'RankBased' AND TargetRankID = @rid AND IsActive = 1
            `);

        // Gộp 2 danh sách lại trả về cho Frontend
        const allVouchers = [...walletRes.recordset, ...rankRes.recordset];
        
        res.json({ vouchers: allVouchers });
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
const claimVoucher = async (req, res) => {
    try {
        const { userId, voucherId } = req.body;
        const pool = await poolPromise;
        // Check mã General giới hạn 10 người/tháng
        const countRes = await pool.request().input('vid', sql.Int, voucherId).query(`
            SELECT COUNT(*) as total 
            FROM UserVouchers 
            WHERE VoucherID = @vid AND MONTH(ReceivedDate) = MONTH(GETDATE()) AND YEAR(ReceivedDate) = YEAR(GETDATE())
        `);
        
        if (countRes.recordset[0].total >= 10) {
            return res.status(400).json({ message: 'Rất tiếc, mã này đã hết lượt phát trong tháng.' });
        }

        // Cấp mã
        await pool.request()
            .input('uid', sql.Int, userId)
            .input('vid', sql.Int, voucherId)
            .query(`INSERT INTO UserVouchers (UserID, VoucherID, IsUsed, ReceivedDate) VALUES (@uid, @vid, 0, GETDATE())`);

        res.json({ message: 'Đã lưu vào ví voucher!' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Hàm tự động tặng mã sinh nhật (Có thể chạy định kỳ hoặc khi user đăng nhập)
const autoGiftBirthdayVoucher = async (userId) => {
    try {
        const pool = await poolPromise;
        const userQuery = await pool.request().input('uid', sql.Int, userId).query(`SELECT DOB FROM Users WHERE UserID = @uid`);
        const userDob = userQuery.recordset[0]?.DOB;
        // 1. Kiểm tra xem voucher này là loại gì
        const voucherRes = await pool.request()
            .input('voucherId', sql.Int, voucherId)
            .query(`SELECT VoucherType FROM Vouchers WHERE VoucherID = @voucherId`);
            
        if (voucherRes.recordset.length === 0) return res.status(404).json({ message: 'Voucher không tồn tại' });
        const vType = voucherRes.recordset[0].VoucherType;

        // 2. Kiểm tra xem user đã nhận mã này chưa (Mỗi người 1 mã/loại)
        const checkClaimed = await pool.request()
            .input('userId', sql.Int, userId)
            .input('voucherId', sql.Int, voucherId)
            .query(`SELECT UserVoucherID FROM UserVouchers WHERE UserID = @userId AND VoucherID = @voucherId`);
            
        if (checkClaimed.recordset.length > 0) {
            return res.status(400).json({ message: 'Bạn đã nhận voucher này rồi!' });
        }

        // 3. LOGIC XÉT DUYỆT TỪNG LOẠI
        if (vType === 'Birthday') {
            // Check tháng sinh của User có trùng tháng hiện tại không
            const userRes = await pool.request().input('userId', sql.Int, userId).query(`SELECT DOB FROM Users WHERE UserID = @userId`);
            const dob = userRes.recordset[0].DOB;
            if (!dob || new Date(dob).getMonth() !== new Date().getMonth()) {
                return res.status(400).json({ message: 'Chỉ áp dụng trong tháng sinh nhật của bạn!' });
            }
        } 
        else if (vType === 'General') {
            // Check xem tháng này đã có đủ 10 người nhận mã này chưa
            const countRes = await pool.request()
                .input('voucherId', sql.Int, voucherId)
                .query(`
                    SELECT COUNT(*) as totalClaimed 
                    FROM UserVouchers 
                    WHERE VoucherID = @voucherId AND MONTH(ReceivedDate) = MONTH(GETDATE()) AND YEAR(ReceivedDate) = YEAR(GETDATE())
                `);
            if (countRes.recordset[0].totalClaimed >= 10) {
                return res.status(400).json({ message: 'Rất tiếc, mã này đã hết lượt phát trong tháng này!' });
            }
        }

        // 4. Nếu hợp lệ -> Cấp mã
        await pool.request()
            .input('userId', sql.Int, userId)
            .input('voucherId', sql.Int, voucherId)
            .query(`INSERT INTO UserVouchers (UserID, VoucherID, IsUsed, ReceivedDate) VALUES (@userId, @voucherId, 0, GETDATE())`);

        res.json({ message: 'Nhận voucher thành công!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    
};
module.exports = { getVouchers, getUserVouchers, createVoucher, getTopVouchers, updateVoucher, deleteVoucher, claimVoucher }; 