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

module.exports = { getOrderAnalytics };