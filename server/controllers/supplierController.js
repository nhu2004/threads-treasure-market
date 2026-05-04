const sql = require('mssql');

const sqlConfig = {
    user: 'sa',
    password: '123',
    database: 'ThreadsTreasureDB',
    server: 'NHI\\SQL1',
    options: { encrypt: false, trustServerCertificate: true }
};

// Lấy danh sách tất cả nhà cung cấp
const getAllSuppliers = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        let pool = await sql.connect(sqlConfig);
        
        let queryStr = 'SELECT * FROM Suppliers';
        const request = pool.request();
        
        if (search) {
            queryStr += " WHERE Name LIKE @search OR ContactPerson LIKE @search";
            request.input('search', sql.NVarChar, `%${search}%`);
        }
        
        // Thêm phân trang
        const offset = (page - 1) * limit;
        queryStr += ` ORDER BY SupplierID OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
        
        const result = await request.query(queryStr);
        
        // Lấy tổng số bản ghi
        let countQuery = 'SELECT COUNT(*) as total FROM Suppliers';
        if (search) {
            countQuery += " WHERE Name LIKE @search OR ContactPerson LIKE @search";
        }
        const countRequest = pool.request();
        if (search) {
            countRequest.input('search', sql.NVarChar, `%${search}%`);
        }
        const countResult = await countRequest.query(countQuery);
        
        res.json({
            data: result.recordset,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult.recordset[0].total
            }
        });
    } catch (err) {
        console.error('Lỗi lấy danh sách nhà cung cấp:', err);
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách nhà cung cấp' });
    }
};

// Lấy chi tiết một nhà cung cấp
const getSupplierById = async (req, res) => {
    try {
        const { id } = req.params;
        let pool = await sql.connect(sqlConfig);
        
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Suppliers WHERE SupplierID = @id');
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Nhà cung cấp không tìm thấy' });
        }
        
        res.json({ data: result.recordset[0] });
    } catch (err) {
        console.error('Lỗi lấy chi tiết nhà cung cấp:', err);
        res.status(500).json({ message: 'Lỗi server khi lấy chi tiết nhà cung cấp' });
    }
};

// Tạo nhà cung cấp mới
const createSupplier = async (req, res) => {
    try {
        const { name, contactPerson, email, phone, address, description } = req.body;
        
        if (!name) {
            return res.status(400).json({ message: 'Tên nhà cung cấp không được để trống' });
        }
        
        let pool = await sql.connect(sqlConfig);
        
        const result = await pool.request()
            .input('name', sql.NVarChar, name)
            .input('contactPerson', sql.NVarChar, contactPerson || '')
            .input('email', sql.NVarChar, email || '')
            .input('phone', sql.NVarChar, phone || '')
            .input('address', sql.NVarChar, address || '')
            .input('description', sql.NVarChar, description || '')
            .query(`
                INSERT INTO Suppliers (Name, ContactPerson, Email, Phone, Address, Description) 
                VALUES (@name, @contactPerson, @email, @phone, @address, @description)
                SELECT SCOPE_IDENTITY() AS SupplierID
            `);
        
        res.status(201).json({
            message: 'Tạo nhà cung cấp thành công',
            data: { 
                SupplierID: result.recordset[0].SupplierID, 
                name, contactPerson, email, phone, address, description 
            }
        });
    } catch (err) {
        console.error('Lỗi tạo nhà cung cấp:', err);
        res.status(500).json({ message: 'Lỗi server khi tạo nhà cung cấp' });
    }
};

// Cập nhật nhà cung cấp
const updateSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, contactPerson, email, phone, address, description } = req.body;
        
        if (!name) {
            return res.status(400).json({ message: 'Tên nhà cung cấp không được để trống' });
        }
        
        let pool = await sql.connect(sqlConfig);
        
        await pool.request()
            .input('id', sql.Int, id)
            .input('name', sql.NVarChar, name)
            .input('contactPerson', sql.NVarChar, contactPerson || '')
            .input('email', sql.NVarChar, email || '')
            .input('phone', sql.NVarChar, phone || '')
            .input('address', sql.NVarChar, address || '')
            .input('description', sql.NVarChar, description || '')
            .query(`
                UPDATE Suppliers 
                SET Name = @name, ContactPerson = @contactPerson, Email = @email, 
                    Phone = @phone, Address = @address, Description = @description
                WHERE SupplierID = @id
            `);
        
        res.json({ 
            message: 'Cập nhật nhà cung cấp thành công', 
            data: { SupplierID: id, name, contactPerson, email, phone, address, description } 
        });
    } catch (err) {
        console.error('Lỗi cập nhật nhà cung cấp:', err);
        res.status(500).json({ message: 'Lỗi server khi cập nhật nhà cung cấp' });
    }
};

// Xóa nhà cung cấp
const deleteSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        let pool = await sql.connect(sqlConfig);
        
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Suppliers WHERE SupplierID = @id');
        
        res.json({ message: 'Xóa nhà cung cấp thành công' });
    } catch (err) {
        console.error('Lỗi xóa nhà cung cấp:', err);
        res.status(500).json({ message: 'Lỗi server khi xóa nhà cung cấp' });
    }
};

module.exports = {
    getAllSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier
};
