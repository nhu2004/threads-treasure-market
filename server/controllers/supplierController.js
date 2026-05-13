const sql = require('mssql');

const sqlConfig = {
    user: 'sa', password: '123', database: 'ThreadsTreasureDB',
    server: 'NHI\\SQL1', options: { encrypt: false, trustServerCertificate: true }
};

// 1. Lấy danh sách NCC KÈM ĐẾM SỐ LƯỢNG SP VÀ ĐẦY ĐỦ CỘT MỚI
const getAllSuppliers = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        let pool = await sql.connect(sqlConfig);
        
        // ĐÃ SỬA: Lấy đầy đủ các cột mới tạo từ database để truyền xuống Frontend
        let queryStr = `
            SELECT s.SupplierID, s.Name, s.Description,
                   s.ContactPerson, s.Phone, s.Email, s.Address,
                   s.BankName, s.BankAccount, s.IsActive,
                   COUNT(p.ProductID) AS ProductCount 
            FROM Suppliers s
            LEFT JOIN Products p ON s.SupplierID = p.SupplierID
        `;
        
        const request = pool.request();
        if (search) {
            queryStr += " WHERE s.Name LIKE @search OR s.Description LIKE @search OR s.ContactPerson LIKE @search";
            request.input('search', sql.NVarChar, `%${search}%`);
        }
        
        // ĐÃ SỬA: Khi dùng hàm đếm COUNT(), bắt buộc phải GROUP BY tất cả các cột được SELECT ở trên
        queryStr += ` GROUP BY s.SupplierID, s.Name, s.Description, s.ContactPerson, s.Phone, s.Email, s.Address, s.BankName, s.BankAccount, s.IsActive`;
        
        const offset = (page - 1) * limit;
        queryStr += ` ORDER BY s.SupplierID OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
        
        const result = await request.query(queryStr);
        
        let countQuery = 'SELECT COUNT(*) as total FROM Suppliers';
        if (search) countQuery += " WHERE Name LIKE @search OR Description LIKE @search OR ContactPerson LIKE @search";
        
        const countRequest = pool.request();
        if (search) countRequest.input('search', sql.NVarChar, `%${search}%`);
        const countResult = await countRequest.query(countQuery);
        
        res.json({
            data: result.recordset,
            pagination: { page: parseInt(page), limit: parseInt(limit), total: countResult.recordset[0].total }
        });
    } catch (err) {
        console.error("Lỗi lấy danh sách nhà cung cấp:", err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

const getSupplierById = async (req, res) => {
    try {
        const { id } = req.params;
        let pool = await sql.connect(sqlConfig);
        const result = await pool.request().input('id', sql.Int, id).query('SELECT * FROM Suppliers WHERE SupplierID = @id');
        if (result.recordset.length === 0) return res.status(404).json({ message: 'Không tìm thấy' });
        res.json({ data: result.recordset[0] });
    } catch (err) { res.status(500).json({ message: 'Lỗi server' }); }
};

const createSupplier = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ message: 'Tên không được để trống' });

        let pool = await sql.connect(sqlConfig);
        const result = await pool.request()
            .input('name', sql.NVarChar, name)
            .input('description', sql.NVarChar, description || '')
            // FIX: Đã xóa chữ "suicide" vô lý ở đây
            .query(`
                INSERT INTO Suppliers (Name, Description, IsActive) 
                VALUES (@name, @description, 1)
                SELECT SCOPE_IDENTITY() AS SupplierID
            `);
        res.status(201).json({ message: 'Thành công', data: { SupplierID: result.recordset[0].SupplierID, name, description } });
    } catch (err) { 
        console.error("Lỗi thêm NCC:", err);
        res.status(500).json({ message: 'Lỗi server' }); 
    }
};

const updateSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ message: 'Tên không được để trống' });

        let pool = await sql.connect(sqlConfig);
        await pool.request()
            .input('id', sql.Int, id)
            .input('name', sql.NVarChar, name)
            .input('description', sql.NVarChar, description || '')
            .query(`
                UPDATE Suppliers 
                SET Name = @name, Description = @description 
                WHERE SupplierID = @id
            `);
        res.json({ message: 'Thành công' });
    } catch (err) { res.status(500).json({ message: 'Lỗi server' }); }
};

const deleteSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        let pool = await sql.connect(sqlConfig);
        await pool.request().input('id', sql.Int, id).query('DELETE FROM Suppliers WHERE SupplierID = @id');
        res.json({ message: 'Thành công' });
    } catch (err) { res.status(500).json({ message: 'Lỗi server' }); }
};

const exportProducts = async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);
        let result = await pool.request().input('id', sql.Int, req.params.id).query(`
            SELECT ProductID as N'Mã SP', Name as N'Tên Sản Phẩm', Price as N'Giá Bán', StockQuantity as N'Tồn Kho', Sizes as N'Kích cỡ', Colors as N'Màu sắc'
            FROM Products WHERE SupplierID = @id
        `);
        res.json(result.recordset);
    } catch (err) { res.status(500).json({ message: 'Lỗi server' }); }
};

const exportOrders = async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);
        let result = await pool.request().input('id', sql.Int, req.params.id).query(`
            SELECT o.OrderID as N'Mã Đơn', CONVERT(varchar, o.OrderDate, 103) as N'Ngày Đặt', p.Name as N'Tên Sản Phẩm', od.Quantity as N'Số Lượng Bán', od.Price as N'Đơn Giá Lúc Bán', (od.Quantity * od.Price) as N'Thành Tiền'
            FROM Orders o JOIN OrderDetails od ON o.OrderID = od.OrderID JOIN Products p ON od.ProductID = p.ProductID
            WHERE p.SupplierID = @id ORDER BY o.OrderDate DESC
        `);
        res.json(result.recordset);
    } catch (err) { res.status(500).json({ message: 'Lỗi server' }); }
};

const toggleStatus = async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`
                UPDATE Suppliers 
                SET IsActive = CASE WHEN IsActive = 1 THEN 0 ELSE 1 END 
                WHERE SupplierID = @id
            `);
        res.json({ success: true, message: 'Đã cập nhật trạng thái nhà cung cấp' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi khi đổi trạng thái' });
    }
};

const getPurchaseOrders = async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);
        let result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`
                SELECT PurchaseOrderID, OrderDate, TotalAmount, AmountPaid, DebtAmount, Status
                FROM PurchaseOrders
                WHERE SupplierID = @id
                ORDER BY OrderDate DESC
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi lấy lịch sử nhập hàng' });
    }
};

module.exports = { getAllSuppliers, getSupplierById, createSupplier, updateSupplier, deleteSupplier, exportProducts, exportOrders, getPurchaseOrders, toggleStatus };