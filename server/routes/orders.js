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
        case "Đang giao": return 1;
        case "Đã giao": return 2;
        case "Đã hủy": return 3;
        default: return 0;
    }
};

// 1. Lấy danh sách đơn hàng có phân trang (Admin)
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        let pool = await sql.connect(sqlConfig);
        
        let result = await pool.request()
            .input('offset', sql.Int, offset)
            .input('limit', sql.Int, limit)
            .query(`
                SELECT * FROM Orders 
                ORDER BY OrderDate DESC 
                OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
                
                SELECT COUNT(*) as total FROM Orders;
            `);
            
        const totalRecords = result.recordsets[1][0].total;
        const totalPage = Math.ceil(totalRecords / limit);

        const formattedOrders = result.recordsets[0].map(order => ({
            _id: order.OrderID, 
            orderDate: order.OrderDate,
            totalPrice: order.Total, 
            paymentStatus: {
                text: "Thanh toán khi nhận hàng", // Hardcode do DB không có cột này
                code: 0
            },
            orderStatus: {
                text: order.Status || "Chờ xác nhận", 
                code: getStatusCode(order.Status)     
            }
        }));

        res.json({ 
            orders: formattedOrders, 
            totalPage: totalPage,
            total: totalRecords
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

        // Lấy Chi tiết sản phẩm
        let detailsResult = await pool.request()
            .input('id', sql.Int, orderId)
            .query(`
                SELECT od.*, p.Name as ProductName, p.ImageUrl as ProductImage
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
            paymentStatus: "Thanh toán khi nhận hàng",   // Đã bỏ cột PaymentStatus gây lỗi
            delivery: {
                fullName: order.FullName,
                phone: order.Phone,            // Dùng 'phone' thay vì 'phoneNumber'
                address: order.Address
            },
            products: detailsResult.recordset.map(item => ({
                id: item.OrderDetailID,        // Dùng 'id' thay vì '_id'
                name: item.ProductName,
                image: item.ProductImage,
                quantity: item.Quantity,
                price: item.Price
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
// BỔ SUNG 3: API Hủy đơn hàng (Kèm Lý do và Người thực hiện)
router.put('/:id/cancel', async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);
        const orderId = req.params.id;
        const { reason, updatedBy } = req.body;

        await pool.request()
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

        res.json({ message: 'Đã hủy đơn hàng thành công', success: true });
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
module.exports = router;