const express = require('express');
const router = express.Router();
const sql = require('mssql');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });


const sqlConfig = {
    user: 'sa', 
    password: '123', 
    database: 'ThreadsTreasureDB', 
    server: 'NHI\\SQL1', 
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
    options: {
        encrypt: false, 
        trustServerCertificate: true 
    }
};

// Hàm hỗ trợ chuyển đổi từ Text sang Code
const getStatusCode = (statusText) => {
    switch(statusText) {
        case "Chờ xác nhận": return 0;
        case "Đang xử lý": return 1;
        case "Đang giao": return 2;
        case "Đã giao": return 3;
        case "Đã hủy": return 4;
        default: return 0;
    }
};

// 1. Lấy danh sách đơn hàng có phân trang + TÍCH HỢP BỘ LỌC (Admin)
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Nhận các biến lọc từ Frontend
        const { search, status, startDate, endDate } = req.query;

        let pool = await sql.connect(sqlConfig);
        let request = pool.request();

        // Mảng chứa các điều kiện WHERE
        let conditions = [];

        // 1. Lọc theo Mã đơn hàng
        if (search) {
            const searchId = search.replace(/\D/g, ''); 
            if (searchId) {
                conditions.push("CAST(o.OrderID AS VARCHAR) LIKE '%' + @searchId + '%'"); // Thêm o.
                request.input('searchId', sql.VarChar, searchId);
            }
        }

        // 2. Lọc theo Trạng thái
        if (status) {
            conditions.push("o.Status = @status"); // Thêm o.
            request.input('status', sql.NVarChar, status);
        }

        // 3. Lọc theo Từ ngày (>=)
        if (startDate) {
            conditions.push("o.OrderDate >= @startDate"); // Thêm o.
            request.input('startDate', sql.Date, startDate);
        }

        // 4. Lọc theo Đến ngày (<=) 
        if (endDate) {
            conditions.push("o.OrderDate <= @endDate"); // Thêm o.
            request.input('endDate', sql.DateTime, endDate + ' 23:59:59');
        }

        // Ghép nối các điều kiện lại (Nếu có)
        let whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

        // Câu lệnh SQL động (Đã fix lỗi đồng bộ alias 'o' cho toàn bộ)
        let query = `
            -- 1. Lấy danh sách phân trang
            SELECT o.*, u.FullName, u.Phone, u.Address 
            FROM Orders o
            LEFT JOIN Users u ON o.UserID = u.UserID
            ${whereClause}
            ORDER BY o.OrderDate DESC 
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
            
            -- 2. Đếm tổng số record (Gán alias 'o' để khớp whereClause)
            SELECT COUNT(*) as total FROM Orders o ${whereClause};

            -- 3. Thống kê số lượng (Gán alias 'o' để khớp whereClause)
            SELECT 
                COUNT(o.OrderID) as TotalOrders,
                SUM(CASE WHEN o.Status = N'Chờ xác nhận' OR o.Status IS NULL THEN 1 ELSE 0 END) as Pending,
                SUM(CASE WHEN o.Status = N'Đang xử lý' THEN 1 ELSE 0 END) as Processing,
                SUM(CASE WHEN o.Status = N'Đang giao' THEN 1 ELSE 0 END) as Shipping,
                SUM(CASE WHEN o.Status = N'Đã giao' THEN 1 ELSE 0 END) as Delivered,
                SUM(CASE WHEN o.Status = N'Đã hủy' THEN 1 ELSE 0 END) as Cancelled
            FROM Orders o ${whereClause};
        `;

        request.input('offset', sql.Int, offset);
        request.input('limit', sql.Int, limit);

        // Thực thi query
        let result = await request.query(query);
            
        const totalRecords = result.recordsets[1][0].total;
        const totalPage = Math.ceil(totalRecords / limit);
        const statsRow = result.recordsets[2][0]; // Lấy dòng kết quả thống kê thứ 3
        // Cập nhật lại formattedOrders để map dữ liệu người nhận:
        const formattedOrders = result.recordsets[0].map(order => ({
            _id: order.OrderID, 
            orderDate: order.OrderDate,
            totalPrice: order.Total, 
            orderStatus: {
                text: order.Status || "Chờ xác nhận", 
                code: getStatusCode(order.Status)     
            },
            CancellationReason: order.CancellationReason,
            // THÊM ĐOẠN NÀY ĐỂ FRONTEND CÓ THÔNG TIN HIỂN THỊ
            delivery: {
                fullName: order.FullName || "Khách lẻ",
                phone: order.Phone || "Không có SĐT",
                address: order.Address || "Không có địa chỉ"
            }
        }));

        res.json({
            orders: formattedOrders, 
            totalPage: totalPage,
            total: totalRecords,
            stats: {
                total: statsRow.TotalOrders || 0,
                pending: statsRow.Pending || 0,
                processing: statsRow.Processing || 0,
                shipping: statsRow.Shipping || 0,
                delivered: statsRow.Delivered || 0,
                cancelled: statsRow.Cancelled || 0
        }
    });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// 2. API Lấy lịch sử giao dịch của 1 User (Đã fix lỗi SQL và lấy bản chuẩn nhất)
router.get('/user/:userId', async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);
        let result = await pool.request()
            .input('userId', sql.Int, req.params.userId)
            .query(`
                SELECT 
                    o.OrderID as id, 
                    o.OrderDate as orderDate, 
                    o.Status as status, 
                    o.Total as total,
                    o.SubTotal as subTotal,
                    o.DiscountAmount as discountAmount,
                    ISNULL(SUM(od.Quantity), 0) as TotalItems
                FROM Orders o
                LEFT JOIN OrderDetails od ON o.OrderID = od.OrderID
                WHERE o.UserID = @userId
                GROUP BY o.OrderID, o.OrderDate, o.Status, o.Total, o.SubTotal, o.DiscountAmount
                ORDER BY o.OrderDate DESC
            `);

        // Ánh xạ lại dữ liệu trả về cho Frontend
        res.json({ orders: result.recordset });
    } catch (err) {
        console.error("Lỗi lấy lịch sử đơn hàng:", err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// 3. Lấy chi tiết một đơn hàng
router.get('/:id', async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);
        const orderId = req.params.id;

        // Lấy thông tin Hóa đơn & Người nhận
        let orderResult = await pool.request()
            .input('id', sql.Int, orderId)
            .query(`
                SELECT o.*, u.FullName, u.Phone, u.Email, u.Address
                FROM Orders o
                LEFT JOIN Users u ON o.UserID = u.UserID
                WHERE o.OrderID = @id
            `);
            
        if (orderResult.recordset.length === 0) return res.status(404).json({ message: 'Không tìm thấy' });
        const order = orderResult.recordset[0];

        // Lấy Chi tiết sản phẩm (Bổ sung thêm p.StockQuantity)
        let detailsResult = await pool.request()
            .input('id', sql.Int, orderId)
            .query(`
                SELECT od.*, p.Name as ProductName, p.ImageUrl as ProductImage, p.StockQuantity
                FROM OrderDetails od
                LEFT JOIN Products p ON od.ProductID = p.ProductID
                WHERE od.OrderID = @id
            `);

        res.json({ data: {
            id: order.OrderID,                 // Dùng 'id' thay vì '_id'
            orderDate: order.OrderDate,
            total: order.Total,                // Dùng 'total' thay vì 'totalPrice'
            subTotal: order.SubTotal || order.Total,
            discount: order.DiscountAmount || 0,
            status: order.Status || "Chờ xác nhận",
            note: order.Note,
            CancellationReason: order.CancellationReason,
            paymentStatus: "Thanh toán khi nhận hàng",   // Đã bỏ cột PaymentStatus gây lỗi
            delivery: {
                fullName: order.FullName,
                phone: order.Phone,            // Dùng 'phone' thay vì 'phoneNumber'
                address: order.Address
            },
            products: detailsResult.recordset.map(item => ({
                id: item.OrderDetailID,        
                name: item.ProductName,
                image: item.ProductImage,
                quantity: item.Quantity,
                price: item.Price,
                // BỔ SUNG DÒNG NÀY ĐỂ TRUYỀN TỒN KHO XUỐNG FRONTEND
                stockQuantity: item.StockQuantity || 0 
            }))
        }});
    } catch (err) {
        console.error("Lỗi lấy chi tiết:", err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// 4. Cập nhật trạng thái đơn hàng
router.put('/:id/status', async (req, res) => {
    try {
        const { orderStatusCode } = req.body;
        
        const statusMap = { 0: "Chờ xác nhận", 1: "Đang giao", 2: "Đã giao", 3: "Đã hủy" };
        const statusText = statusMap[orderStatusCode] || "Chờ xác nhận";

        let pool = await sql.connect(sqlConfig);
        
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('statusText', sql.NVarChar, statusText)
            .query('UPDATE Orders SET Status = @statusText WHERE OrderID = @id');  

        let updatedResult = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT * FROM Orders WHERE OrderID = @id');
            
        const updatedOrder = updatedResult.recordset[0];

        res.json({ data: { 
            orderStatus: { code: orderStatusCode, text: statusText },
            paymentStatus: { text: "Thanh toán khi nhận hàng", code: 0 }
        }});
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});
// BỔ SUNG 1: API Tạo Hóa đơn và chuyển sang Đang giao
router.post('/:id/invoice-and-ship', async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);
        const orderId = req.params.id;

        // Dùng chung 1 lệnh Transaction để vừa tạo Invoices vừa cập nhật Orders
        let result = await pool.request()
            .input('id', sql.Int, orderId)
            .query(`
                BEGIN TRANSACTION;
                
                -- 1. Lấy thông tin từ Orders và chèn vào Invoices (TemplateID mặc định là 1)
                INSERT INTO Invoices (OrderID, TemplateID, InvoiceDate, TotalAmount, SubTotal, DiscountAmount)
                SELECT OrderID, 1, GETDATE(), Total, SubTotal, DiscountAmount 
                FROM Orders WHERE OrderID = @id;

                -- 2. Cập nhật trạng thái Order thành Đang giao
                UPDATE Orders SET Status = N'Đang giao' WHERE OrderID = @id;
                
                COMMIT TRANSACTION;
            `);

        res.json({ message: 'Đã tạo hóa đơn và chuyển sang đang giao', success: true });
    } catch (err) {
        console.error("Lỗi khi tạo hóa đơn:", err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// BỔ SUNG 2: API Up ảnh và chuyển sang Đã giao
// Dùng upload.single('deliveryProofImage') để bắt file ảnh từ frontend
router.put('/:id/confirm-delivery', upload.single('deliveryProofImage'), async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);
        const orderId = req.params.id;
        
        // Lấy đường dẫn file ảnh vừa upload (trong thực tế có thể up lên Cloudinary/S3)
        // Ở đây lưu giả lập đường dẫn file local
        const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

        if (!imagePath) {
            return res.status(400).json({ message: 'Thiếu hình ảnh xác nhận' });
        }

        await pool.request()
            .input('id', sql.Int, orderId)
            .input('imagePath', sql.NVarChar, imagePath)
            .query(`
                UPDATE Orders 
                SET Status = N'Đã giao', DeliveryProofImage = @imagePath 
                WHERE OrderID = @id
            `);

        res.json({ message: 'Xác nhận giao hàng thành công', success: true });
    } catch (err) {
        console.error("Lỗi khi xác nhận giao hàng:", err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});
// BỔ SUNG 3: API Hủy đơn hàng (Kèm Lý do, Người thực hiện và LOGIC TỒN KHO)
router.put('/:id/cancel', async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);
        const orderId = req.params.id;
        const { reason, updatedBy } = req.body;

        // Khởi tạo Transaction để đảm bảo tính toàn vẹn dữ liệu
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // Bước 1: Cập nhật trạng thái đơn hàng thành 'Đã hủy'
            await transaction.request()
                .input('id', sql.Int, orderId)
                .input('reason', sql.NVarChar, reason)
                .input('updatedBy', sql.Int, updatedBy)
                .query(`
                    UPDATE Orders 
                    SET Status = N'Đã hủy', 
                        CancellationReason = @reason, 
                        StatusUpdatedBy = @updatedBy
                    WHERE OrderID = @id
                `);

            // Bước 2: KIỂM TRA LÝ DO ĐỂ TRẢ TỒN KHO
            // Nếu lý do KHÁC "Hàng lỗi", hệ thống sẽ join bảng OrderDetails và Products để cộng lại hàng.
            if (reason !== "Hàng lỗi") {
                await transaction.request()
                    .input('id', sql.Int, orderId)
                    .query(`
                        UPDATE p
                        SET p.StockQuantity = ISNULL(p.StockQuantity, 0) + od.Quantity
                        FROM Products p
                        INNER JOIN OrderDetails od ON p.ProductID = od.ProductID
                        WHERE od.OrderID = @id
                    `);
            }

            // Hoàn tất lưu dữ liệu
            await transaction.commit();
            res.json({ message: 'Đã hủy đơn hàng và xử lý kho thành công', success: true });

        } catch (error) {
            await transaction.rollback(); // Bị lỗi gì thì Hủy bỏ thao tác, bảo vệ DB
            throw error;
        }

    } catch (err) {
        console.error("Lỗi khi hủy đơn:", err);
        res.status(500).json({ message: 'Lỗi server khi hủy đơn' });
    }
});

// BỔ SUNG 4: API Cập nhật chi tiết đơn hàng (Giảm giá và Note)
router.put('/:id/details', async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);
        const orderId = req.params.id;
        const { discount, note, updatedBy } = req.body;

        // Tính toán lại Total = SubTotal - Discount
        // (Lưu ý: Nếu có bảng Note riêng thì insert thêm vào bảng đó, ở đây ví dụ update trực tiếp)
        await pool.request()
            .input('id', sql.Int, orderId)
            .input('discount', sql.Decimal(18, 2), discount || 0)
            .input('updatedBy', sql.Int, updatedBy)
            .query(`
                UPDATE Orders 
                SET DiscountAmount = @discount, 
                    Total = SubTotal - @discount,
                    StatusUpdatedBy = @updatedBy
                WHERE OrderID = @id
            `);

        res.json({ message: 'Đã cập nhật chi tiết đơn hàng', success: true });
    } catch (err) {
        console.error("Lỗi khi cập nhật chi tiết đơn:", err);
        res.status(500).json({ message: 'Lỗi server khi cập nhật đơn' });
    }
});

// BỔ SUNG 1: API Xác nhận đơn, Tạo Hóa đơn và chuyển sang "Đang xử lý"
router.post('/:id/process-and-invoice', async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);
        const orderId = req.params.id;

        // Transaction đảm bảo tính toàn vẹn: Vừa tạo Invoice vừa cập nhật Order
        let result = await pool.request()
            .input('id', sql.Int, orderId)
            .query(`
                BEGIN TRANSACTION;
                
                -- 1. Tạo Hóa đơn (Invoices) dựa trên thông tin Đơn hàng
                INSERT INTO Invoices (OrderID, TemplateID, InvoiceDate, TotalAmount, SubTotal, DiscountAmount)
                SELECT OrderID, 1, GETDATE(), Total, SubTotal, DiscountAmount 
                FROM Orders WHERE OrderID = @id AND NOT EXISTS (SELECT 1 FROM Invoices WHERE OrderID = @id);

                -- 2. Chuyển trạng thái sang Đang xử lý
                UPDATE Orders SET Status = N'Đang xử lý' WHERE OrderID = @id;
                
                COMMIT TRANSACTION;
            `);

        res.json({ message: 'Đã tạo hóa đơn và chuyển sang Đang xử lý', success: true });
    } catch (err) {
        console.error("Lỗi khi tạo hóa đơn:", err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// BỔ SUNG 1.5: API Chuyển từ "Đang xử lý" sang "Đang giao" (Bàn giao cho Shipper)
router.put('/:id/ship', async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`UPDATE Orders SET Status = N'Đang giao' WHERE OrderID = @id`);
        
        res.json({ message: 'Đã bàn giao cho đơn vị vận chuyển', success: true });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});
// BỔ SUNG: API TẠO ĐƠN HÀNG MỚI (Từ trang Checkout - Đã bao gồm Ghi Chú)
router.post('/', async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);
        const { customer, items, totalPrice, subTotal, discountAmount, voucherId, userId } = req.body;

        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // 1. Chèn vào bảng Orders (Thêm cột VoucherID và DiscountAmount)
            let orderResult = await transaction.request()
                .input('userId', sql.Int, userId || null) 
                .input('total', sql.Decimal(18,2), totalPrice)
                .input('subTotal', sql.Decimal(18,2), subTotal)
                .input('discount', sql.Decimal(18,2), discountAmount || 0)
                .input('voucherId', sql.Int, voucherId || null) // <--- MỚI
                .input('note', sql.NVarChar, customer.note || '')
                .query(`
                    INSERT INTO Orders (UserID, OrderDate, Status, Total, SubTotal, DiscountAmount, VoucherID, Note)
                    OUTPUT INSERTED.OrderID
                    VALUES (@userId, GETDATE(), N'Chờ xác nhận', @total, @subTotal, @discount, @voucherId, @note);
                `);

            const newOrderId = orderResult.recordset[0].OrderID;
        // 2. Nếu có dùng Voucher, đánh dấu IsUsed = 1 trong bảng UserVouchers
            if (voucherId && userId) {
                await transaction.request()
                    .input('vId', sql.Int, voucherId)
                    .input('uId', sql.Int, userId)
                    .query(`UPDATE UserVouchers SET IsUsed = 1 WHERE VoucherID = @vId AND UserID = @uId`);
            }
            // 2. Chèn vào bảng OrderDetails và Cập nhật kho
            for (let item of items) {
                await transaction.request()
                    .input('orderId', sql.Int, newOrderId)
                    .input('productId', sql.Int, item.product.id)
                    .input('quantity', sql.Int, item.quantity)
                    .input('price', sql.Decimal(18,2), item.product.price)
                    .query(`
                        -- Lưu chi tiết đơn
                        INSERT INTO OrderDetails (OrderID, ProductID, Quantity, Price)
                        VALUES (@orderId, @productId, @quantity, @price);

                        -- Cập nhật trừ tồn kho trong bảng Products
                        UPDATE Products 
                        SET StockQuantity = StockQuantity - @quantity 
                        WHERE ProductID = @productId;
                    `);
            }

            // Lưu thành công
            await transaction.commit();
            res.json({ message: 'Đặt hàng thành công', orderId: newOrderId, success: true });
        } catch (innerError) {
            await transaction.rollback();
            throw innerError;
        }
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});
module.exports = router;