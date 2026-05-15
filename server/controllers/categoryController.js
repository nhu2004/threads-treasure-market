// Backend/controllers/categoryController.js
const sql = require('mssql');

const sqlConfig = {
    user: 'sa', 
    password: '123', 
    database: 'ThreadsTreasureDB', 
    server: 'NHI\\SQL1', 
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
    options: { encrypt: false, trustServerCertificate: true }
};

// 1. LẤY DANH MỤC & ĐẾM SỐ LƯỢNG SP (CHUẨN FORM FRONTEND)
const getCategories = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        // Bắt chính xác từ khóa search từ Frontend truyền lên
        const search = req.query.search || (req.query.query && req.query.query.name && req.query.query.name.$regex) || ''; 
        const offset = (page - 1) * limit;

        let pool = await sql.connect(sqlConfig);
        let request = pool.request();

        // CHÚ Ý: Dùng LEFT JOIN và chỉ đếm sản phẩm chưa bị xóa (IsDeleted = 0)
        let queryStr = `
            SELECT c.CategoryID, c.Name, COUNT(p.ProductID) AS ProductCount 
            FROM Categories c
            LEFT JOIN Products p ON c.CategoryID = p.CategoryID AND p.IsDeleted = 0
        `;

        if (search) {
            queryStr += " WHERE c.Name LIKE @search ";
            request.input('search', sql.NVarChar, `%${search}%`);
        }

        queryStr += " GROUP BY c.CategoryID, c.Name ";
        queryStr += ` ORDER BY c.CategoryID DESC OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;

        const result = await request.query(queryStr);

        let countQuery = "SELECT COUNT(*) as total FROM Categories";
        if (search) countQuery += " WHERE Name LIKE @search";
        const countRequest = pool.request();
        if (search) countRequest.input('search', sql.NVarChar, `%${search}%`);
        const countResult = await countRequest.query(countQuery);
        const totalRecords = countResult.recordset[0].total;

        // MAP data trả về để Frontend nhận diện được ID
        const formattedData = result.recordset.map(cat => ({
            _id: cat.CategoryID,
            name: cat.Name,
            productCount: cat.ProductCount
        }));

        res.json({ 
            data: formattedData, 
            pagination: { page, limit, total: totalRecords, totalPage: Math.ceil(totalRecords / limit) }
        });
    } catch (err) {
        console.error("Lỗi lấy danh mục:", err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// 2. LẤY CHI TIẾT 1 DANH MỤC
const getCategoryById = async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT CategoryID as _id, Name as name FROM Categories WHERE CategoryID = @id');
        if (result.recordset.length === 0) return res.status(404).json({ message: 'Không tìm thấy' });
        res.json({ data: result.recordset[0] });
    } catch (err) { res.status(500).json({ message: 'Lỗi server' }); }
};

// 3. TẠO MỚI DANH MỤC
const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: 'Tên không được để trống' });

        let pool = await sql.connect(sqlConfig);
        const result = await pool.request()
            .input('name', sql.NVarChar, name)
            .query(`
                INSERT INTO Categories (Name) VALUES (@name)
                SELECT SCOPE_IDENTITY() AS CategoryID
            `);
        res.status(201).json({ message: 'Thành công', data: { _id: result.recordset[0].CategoryID, name } });
    } catch (err) { res.status(500).json({ message: 'Lỗi server' }); }
};

// 4. CẬP NHẬT DANH MỤC
const updateCategory = async (req, res) => {
    try {
        const { name } = req.body;
        let pool = await sql.connect(sqlConfig);
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('name', sql.NVarChar, name)
            .query('UPDATE Categories SET Name = @name WHERE CategoryID = @id');
        res.json({ message: 'Thành công' });
    } catch (err) { res.status(500).json({ message: 'Lỗi server' }); }
};

// 5. XÓA DANH MỤC
const deleteCategory = async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);
        
        // Kiểm tra xem danh mục có đang chứa sản phẩm không (Bao gồm cả SP đã ẩn)
        const check = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT COUNT(*) as count FROM Products WHERE CategoryID = @id AND IsDeleted = 0');
            
        if (check.recordset[0].count > 0) {
            return res.status(400).json({ message: 'Không thể xóa vì danh mục đang chứa sản phẩm!' });
        }

        await pool.request().input('id', sql.Int, req.params.id).query('DELETE FROM Categories WHERE CategoryID = @id');
        res.json({ message: 'Xóa thành công!' });
    } catch (err) { res.status(500).json({ message: 'Lỗi server' }); }
};

// 6. XUẤT FILE SẢN PHẨM THEO DANH MỤC (ĐÃ CẬP NHẬT THEO CỘT MỚI)
const exportProducts = async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);
        let result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`
                SELECT 
                    ProductID as N'Mã SP', 
                    SKU as N'Mã SKU',
                    Name as N'Tên Sản Phẩm', 
                    Price as N'Giá Bán', 
                    StockQuantity as N'Tồn Kho',
                    Size as N'Kích cỡ',
                    Color as N'Màu sắc'
                FROM Products 
                WHERE CategoryID = @id AND IsDeleted = 0
            `);
        res.json(result.recordset);
    } catch (err) { 
        console.error("Lỗi xuất file:", err);
        res.status(500).json({ message: 'Lỗi server' }); 
    }
};

// 7. XUẤT ĐƠN HÀNG THEO DANH MỤC
const exportOrders = async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);
        let result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`
                SELECT 
                    o.OrderID as N'Mã Đơn', 
                    CONVERT(varchar, o.OrderDate, 103) as N'Ngày Đặt', 
                    p.Name as N'Tên Sản Phẩm', 
                    od.Quantity as N'Số Lượng Bán', 
                    od.Price as N'Đơn Giá Lúc Bán', 
                    (od.Quantity * od.Price) as N'Thành Tiền'
                FROM Orders o
                JOIN OrderDetails od ON o.OrderID = od.OrderID
                JOIN Products p ON od.ProductID = p.ProductID
                WHERE p.CategoryID = @id
                ORDER BY o.OrderDate DESC
            `);
        res.json(result.recordset);
    } catch (err) { res.status(500).json({ message: 'Lỗi server' }); }
};

module.exports = {
    getCategories, getCategoryById, createCategory, updateCategory, deleteCategory, exportProducts, exportOrders
};