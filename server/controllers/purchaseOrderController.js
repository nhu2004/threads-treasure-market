const { poolPromise, sql } = require('../db');

// 1. LẤY DANH SÁCH ĐƠN NHẬP
const getAllPurchaseOrders = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT po.*, s.Name as SupplierName 
            FROM PurchaseOrders po
            JOIN Suppliers s ON po.SupplierID = s.SupplierID
            ORDER BY po.CreatedAt DESC
        `);
        res.json({ success: true, data: result.recordset });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. LẤY CHI TIẾT 1 ĐƠN (Dùng để hiển thị lên bảng Kiểm đếm)
const getPODetails = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT pod.*, p.Name, p.SKU, p.Color, p.Size 
                FROM PurchaseOrderDetails pod
                JOIN Products p ON pod.ProductID = p.ProductID
                WHERE pod.PurchaseOrderID = @id
            `);
        res.json({ success: true, data: result.recordset });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. TẠO ĐƠN NHẬP MỚI (BƯỚC 1: TỒN KHO CHƯA CỘNG)
const createPurchaseOrder = async (req, res) => {
    const { supplierId, items, totalAmount, notes, createdBy } = req.body;
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();
        const poResult = await transaction.request()
            .input('sup', sql.Int, supplierId)
            .input('total', sql.Decimal(18,2), totalAmount)
            .input('note', sql.NVarChar, notes || '')
            .input('user', sql.Int, createdBy || 1)
            .query(`
                INSERT INTO PurchaseOrders (SupplierID, TotalAmount, Notes, Status, CreatedBy, CreatedAt)
                OUTPUT INSERTED.PurchaseOrderID
                VALUES (@sup, @total, @note, N'Chờ xác nhận', @user, GETDATE())
            `);
        
        const poId = poResult.recordset[0].PurchaseOrderID;

        for (const item of items) {
            await transaction.request()
                .input('poId', sql.Int, poId)
                .input('prodId', sql.Int, item.productId)
                .input('price', sql.Decimal(18,2), item.importPrice)
                .input('qty', sql.Int, item.orderQuantity)
                .query(`
                    INSERT INTO PurchaseOrderDetails (PurchaseOrderID, ProductID, ImportPrice, OrderQuantity, ReceiveQuantity, TotalPrice)
                    VALUES (@poId, @prodId, @price, @qty, 0, 0)
                `);
        }
        await transaction.commit();
        res.json({ success: true, message: "Tạo Yêu cầu Đặt hàng thành công!" });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: error.message });
    }
};

// 4. CHUYỂN TRẠNG THÁI (Chờ xác nhận -> Đang giao / Hủy đơn)
const updatePOStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .input('status', sql.NVarChar, status)
            .query(`UPDATE PurchaseOrders SET Status = @status, UpdatedAt = GETDATE() WHERE PurchaseOrderID = @id`);
        res.json({ success: true, message: `Đã cập nhật trạng thái: ${status}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 5. BƯỚC 3: NHẬN HÀNG, XỬ LÝ HÀNG THIẾU VÀ CỘNG KHO
const completePurchaseOrder = async (req, res) => {
    const { id } = req.params;
    const { items } = req.body; // Mảng gửi lên chứa số lượng THỰC NHẬN
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();
        let newTotalAmount = 0; // Tính lại tổng tiền thực tế

        for (const item of items) {
            const actualTotal = item.importPrice * item.receiveQuantity;
            newTotalAmount += actualTotal;

            // 1. Cập nhật số lượng thực nhận vào phiếu chi tiết
            await transaction.request()
                .input('poId', sql.Int, id)
                .input('prodId', sql.Int, item.productId)
                .input('qty', sql.Int, item.receiveQuantity)
                .input('price', sql.Decimal(18,2), actualTotal)
                .query(`UPDATE PurchaseOrderDetails SET ReceiveQuantity = @qty, TotalPrice = @price WHERE PurchaseOrderID = @poId AND ProductID = @prodId`);

            // 2. CỘNG VÀO TỒN KHO SẢN PHẨM CHÍNH XÁC SỐ LƯỢNG THỰC NHẬN
            if (item.receiveQuantity > 0) {
                await transaction.request()
                    .input('prodId', sql.Int, item.productId)
                    .input('qty', sql.Int, item.receiveQuantity)
                    .query(`UPDATE Products SET StockQuantity = ISNULL(StockQuantity, 0) + @qty, UpdatedAt = GETDATE() WHERE ProductID = @prodId`);
            }
        }

        // 3. Chốt đơn hàng, cập nhật lại tiền thực tế, không ghi nợ
        await transaction.request()
            .input('id', sql.Int, id)
            .input('total', sql.Decimal(18,2), newTotalAmount)
            .query(`
                UPDATE PurchaseOrders 
                SET Status = N'Hoàn thành', TotalAmount = @total, AmountPaid = @total, DebtAmount = 0, UpdatedAt = GETDATE() 
                WHERE PurchaseOrderID = @id
            `);

        await transaction.commit();
        res.json({ success: true, message: "Kiểm đếm hoàn tất! Tồn kho đã được cập nhật." });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: error.message });
    }
};
const getPOById = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        
        // Lấy thông tin Đơn nhập + Nhà cung cấp
        const poRes = await pool.request().input('id', sql.Int, id).query(`
            SELECT po.*, s.Name as SupplierName, s.ContactPerson, s.Phone, s.Email, s.Address
            FROM PurchaseOrders po
            JOIN Suppliers s ON po.SupplierID = s.SupplierID
            WHERE po.PurchaseOrderID = @id
        `);
        
        // Lấy danh sách sản phẩm chi tiết
        const detailsRes = await pool.request().input('id', sql.Int, id).query(`
            SELECT pod.*, p.Name, p.SKU, p.Color, p.Size 
            FROM PurchaseOrderDetails pod
            JOIN Products p ON pod.ProductID = p.ProductID
            WHERE pod.PurchaseOrderID = @id
        `);
        
        if (poRes.recordset.length > 0) {
            res.json({ success: true, order: poRes.recordset[0], details: detailsRes.recordset });
        } else {
            res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Đừng quên export nó ở cuối file
module.exports = { getAllPurchaseOrders, getPODetails, createPurchaseOrder, updatePOStatus, completePurchaseOrder, getPOById };