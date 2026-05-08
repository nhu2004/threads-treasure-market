// Server/controllers/invoiceController.js
const sql = require('mssql');

const sqlConfig = {
    user: 'sa', password: '123', database: 'ThreadsTreasureDB', 
    server: 'NHI\\SQL1', options: { encrypt: false, trustServerCertificate: true }
};

// Lấy danh sách hóa đơn
const getAllInvoices = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        let pool = await sql.connect(sqlConfig);
        
        // Truy vấn lấy thông tin hóa đơn từ bảng Orders (hoặc Invoices nếu bạn có bảng riêng)
        let queryStr = `
            SELECT o.OrderID as InvoiceID, o.OrderDate as InvoiceDate, 
                   o.Total as TotalAmount, o.Status,
                   d.FullName as CustomerName, d.Phone
            FROM Orders o
            LEFT JOIN DeliveryInfo d ON o.OrderID = d.OrderID
        `;
        
        const request = pool.request();
        if (search) {
            queryStr += " WHERE d.FullName LIKE @search OR o.OrderID LIKE @search";
            request.input('search', sql.NVarChar, `%${search}%`);
        }
        
        const offset = (page - 1) * limit;
        queryStr += ` ORDER BY o.OrderDate DESC OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
        
        const result = await request.query(queryStr);
        res.json({ data: result.recordset });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server khi lấy hóa đơn' });
    }
};

// Lấy chi tiết 1 hóa đơn (Dùng để in)
const getInvoiceDetail = async (req, res) => {
    try {
        const { id } = req.params;
        let pool = await sql.connect(sqlConfig);
        
        // Lấy thông tin chung và sản phẩm trong đơn
        const orderResult = await pool.request().input('id', sql.Int, id).query(`
            SELECT o.*, d.FullName, d.Phone, d.Address 
            FROM Orders o 
            JOIN DeliveryInfo d ON o.OrderID = d.OrderID 
            WHERE o.OrderID = @id
        `);
        
        const productsResult = await pool.request().input('id', sql.Int, id).query(`
            SELECT p.Name, od.Quantity, od.Price 
            FROM OrderDetails od
            JOIN Products p ON od.ProductID = p.ProductID
            WHERE od.OrderID = @id
        `);
        
        if (orderResult.recordset.length === 0) return res.status(404).json({ message: 'Không tìm thấy' });
        
        const orderData = orderResult.recordset[0];
        res.json({
            OrderID: orderData.OrderID,
            orderDate: orderData.OrderDate,
            total: orderData.Total,
            subTotal: orderData.SubTotal,
            discount: orderData.Discount || 0,
            delivery: { fullName: orderData.FullName, phone: orderData.Phone, address: orderData.Address },
            products: productsResult.recordset.map(p => ({ name: p.Name, quantity: p.Quantity, price: p.Price }))
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi lấy chi tiết hóa đơn' });
    }
};

module.exports = { getAllInvoices, getInvoiceDetail };