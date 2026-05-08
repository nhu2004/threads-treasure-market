const sql = require('mssql');

const sqlConfig = {
    user: 'sa', password: '123', database: 'ThreadsTreasureDB', 
    server: 'NHI\\SQL1', options: { encrypt: false, trustServerCertificate: true }
};

const getAllInvoices = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        let pool = await sql.connect(sqlConfig);
        
        let queryStr = `
            SELECT i.InvoiceID, i.InvoiceDate, i.TotalAmount, i.OrderID,
                   u.FullName as CustomerName
            FROM Invoices i
            LEFT JOIN Orders o ON i.OrderID = o.OrderID
            LEFT JOIN Users u ON o.UserID = u.UserID
        `;
        
        const request = pool.request();
        if (search) {
            // FIX: Chuyển INT sang VARCHAR để có thể tìm kiếm bằng LIKE
            queryStr += " WHERE u.FullName LIKE @search OR CAST(i.InvoiceID AS VARCHAR) LIKE @search OR CAST(i.OrderID AS VARCHAR) LIKE @search";
            request.input('search', sql.NVarChar, `%${search}%`);
        }
        
        const offset = (page - 1) * limit;
        queryStr += ` ORDER BY i.InvoiceDate DESC OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
        
        const result = await request.query(queryStr);

        // Đếm tổng số bản ghi để phân trang
        let countQuery = `
            SELECT COUNT(*) as total
            FROM Invoices i
            LEFT JOIN Orders o ON i.OrderID = o.OrderID
            LEFT JOIN Users u ON o.UserID = u.UserID
        `;
        const countRequest = pool.request();
        if (search) {
            countQuery += " WHERE u.FullName LIKE @search OR CAST(i.InvoiceID AS VARCHAR) LIKE @search OR CAST(i.OrderID AS VARCHAR) LIKE @search";
            countRequest.input('search', sql.NVarChar, `%${search}%`);
        }
        const countResult = await countRequest.query(countQuery);
        const totalRecords = countResult.recordset[0].total;

        res.json({ 
            data: result.recordset,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalPage: Math.ceil(totalRecords / limit)
            }
        });
    } catch (err) {
        console.error("Lỗi lấy danh sách hóa đơn:", err);
        res.status(500).json({ message: 'Lỗi server khi lấy hóa đơn' });
    }
};

const getInvoiceDetail = async (req, res) => {
    try {
        const { id } = req.params;
        let pool = await sql.connect(sqlConfig);
        
        const invoiceResult = await pool.request().input('id', sql.Int, id).query(`
            SELECT i.InvoiceID, i.InvoiceDate, i.TotalAmount, i.SubTotal, i.DiscountAmount, i.OrderID,
                   u.FullName, u.Phone, u.Address 
            FROM Invoices i 
            LEFT JOIN Orders o ON i.OrderID = o.OrderID
            LEFT JOIN Users u ON o.UserID = u.UserID
            WHERE i.InvoiceID = @id
        `);
        
        if (invoiceResult.recordset.length === 0) return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
        
        const invData = invoiceResult.recordset[0];
        const productsResult = await pool.request().input('orderId', sql.Int, invData.OrderID).query(`
            SELECT p.Name, od.Quantity, od.Price 
            FROM OrderDetails od
            JOIN Products p ON od.ProductID = p.ProductID
            WHERE od.OrderID = @orderId
        `);
        
        res.json({
            InvoiceID: invData.InvoiceID,
            OrderID: invData.OrderID,
            orderDate: invData.InvoiceDate,
            total: invData.TotalAmount,
            subTotal: invData.SubTotal,
            discount: invData.DiscountAmount || 0,
            delivery: { fullName: invData.FullName, phone: invData.Phone, address: invData.Address },
            products: productsResult.recordset.map(p => ({ name: p.Name, quantity: p.Quantity, price: p.Price }))
        });
    } catch (err) {
        console.error("Lỗi lấy chi tiết hóa đơn:", err);
        res.status(500).json({ message: 'Lỗi lấy chi tiết hóa đơn' });
    }
};

module.exports = { getAllInvoices, getInvoiceDetail };