// Backend/controllers/voucherController.js
const { poolPromise, sql } = require('../db');

const getVouchers = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Vouchers');
        res.json({ vouchers: result.recordset });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createVoucher = async (req, res) => {
    try {
        const { code, value, byType, name, startDate, expiryDate, minimumAmount } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('code', sql.NVarChar, code)
            .input('value', sql.Decimal, value)
            .input('byType', sql.NVarChar, byType)
            .input('name', sql.NVarChar, name)
            .input('start', sql.DateTime, startDate)
            .input('end', sql.DateTime, expiryDate)
            .input('min', sql.Decimal, minimumAmount)
            .query(`INSERT INTO Vouchers (Code, Value, ByType, Name, StartDate, ExpiryDate, MinimumAmount) 
                    VALUES (@code, @value, @byType, @name, @start, @end, @min)`);
        res.json({ message: 'Thêm mã giảm giá thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getVouchers, createVoucher };
