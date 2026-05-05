const express = require('express');
const router = express.Router();
const sql = require('mssql');

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

// Hàm hỗ trợ chuyển đổi từ Text trong Database sang Code cho Frontend
const getStatusCode = (statusText) => {
    switch(statusText) {
        case "Chờ xác nhận": return 0;
        case "Đang giao": return 1;
        case "Đã giao": return 2;
        case "Đã hủy": return 3;
        default: return 0;
    }
};

// Lấy danh sách đơn hàng có phân trang
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
            // Đã sửa TotalAmount thành Total khớp với DB
            totalPrice: order.Total, 
            paymentStatus: {
                text: order.PaymentStatus === 1 ? "Đã thanh toán" : "Chưa thanh toán",
                code: order.PaymentStatus || 0
            },
            orderStatus: {
                text: order.Status || "Chờ xác nhận", // Lấy chữ từ cột Status
                code: getStatusCode(order.Status)     // Dịch chữ ra số cho UI
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

// Lấy chi tiết một đơn hàng
router.get('/:id', async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);
        const orderId = req.params.id;

        // 1. Lấy thông tin chung của đơn hàng + JOIN với Users để lấy thông tin giao hàng
        let orderResult = await pool.request()
            .input('id', sql.Int, orderId)
            .query(`
                SELECT o.*, u.FullName, u.Phone, u.Email, u.Address
                FROM Orders o
                LEFT JOIN Users u ON o.UserID = u.UserID
                WHERE o.OrderID = @id
            `);
            
        if (orderResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }
        
        const order = orderResult.recordset[0];

        // 2. Lấy danh sách sản phẩm trong OrderDetails + JOIN với Products để lấy Tên và Hình ảnh
        let detailsResult = await pool.request()
            .input('id', sql.Int, orderId)
            .query(`
                SELECT od.*, p.Name as ProductName, p.ImageUrl as ProductImage
                FROM OrderDetails od
                LEFT JOIN Products p ON od.ProductID = p.ProductID
                WHERE od.OrderID = @id
            `);

        // 3. Format mảng sản phẩm cho Frontend dễ đọc
        const formattedProducts = detailsResult.recordset.map(item => ({
            _id: item.OrderDetailID,
            product: {
                _id: item.ProductID,
                name: item.ProductName || 'Sản phẩm không xác định',
                image: item.ProductImage || ''
            },
            quantity: item.Quantity,
            price: item.Price
        }));

        // 4. Trả về một Object lồng nhau (Nested Object) giống hệt cấu trúc cũ của MongoDB
        res.json({ data: {
            _id: order.OrderID,
            orderDate: order.OrderDate,
            totalPrice: order.Total,
            paymentStatus: { 
                text: order.PaymentStatus === 1 ? "Đã thanh toán" : "Chưa thanh toán",
                code: order.PaymentStatus || 0 
            },
            orderStatus: { 
                code: getStatusCode(order.Status), 
                text: order.Status || "Chờ xác nhận" 
            },
            // Đóng gói thông tin giao hàng
            delivery: {
                fullName: order.FullName,
                phoneNumber: order.Phone,
                email: order.Email,
                address: order.Address
            },
            // Đóng gói thông tin chi phí
            cost: {
                total: order.Total,
                subTotal: order.SubTotal || order.Total,
                discount: order.DiscountAmount || 0
            },
            // Đóng gói danh sách sản phẩm
            products: formattedProducts,
            cancellationReason: order.CancellationReason
        }});
    } catch (err) {
        console.error("Lỗi lấy chi tiết đơn hàng:", err);
        res.status(500).json({ message: 'Lỗi server' });
    }
}); 


// 1. API Lấy lịch sử giao dịch của 1 User
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
                    o.PaymentStatus as paymentStatus
                FROM Orders o
                WHERE o.UserID = @userId
                ORDER BY o.OrderDate DESC
            `);
        res.json({ orders: result.recordset });
    } catch (err) {
        console.error("Lỗi lấy lịch sử đơn hàng:", err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// 2. API Lấy Chi tiết 1 Đơn hàng cụ thể
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
            id: order.OrderID,
            orderDate: order.OrderDate,
            total: order.Total,
            subTotal: order.SubTotal || order.Total,
            discount: order.DiscountAmount || 0,
            status: order.Status || "Chờ xác nhận",
            paymentStatus: order.PaymentStatus === 1 ? "Đã thanh toán" : "Chưa thanh toán",
            delivery: {
                fullName: order.FullName,
                phone: order.Phone,
                address: order.Address
            },
            products: detailsResult.recordset.map(item => ({
                id: item.OrderDetailID,
                name: item.ProductName,
                image: item.ProductImage,
                quantity: item.Quantity,
                price: item.Price
            }))
        }});
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});
// Cập nhật trạng thái đơn hàng
router.put('/:id/status', async (req, res) => {
    try {
        const { orderStatusCode } = req.body;
        
        // Mapping code từ UI trả về sang Text để lưu vào Database
        const statusMap = { 0: "Chờ xác nhận", 1: "Đang giao", 2: "Đã giao", 3: "Đã hủy" };
        const statusText = statusMap[orderStatusCode] || "Chờ xác nhận";

        let pool = await sql.connect(sqlConfig);
        
        // Cập nhật Cột Status bằng Chuỗi Text (vì DB của bạn lưu bằng chữ)
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('statusText', sql.NVarChar, statusText)
            .query('UPDATE Orders SET Status = @statusText WHERE OrderID = @id');  

        // Lấy lại thông tin sau khi Update
        let updatedResult = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT * FROM Orders WHERE OrderID = @id');
            
        const updatedOrder = updatedResult.recordset[0];

        res.json({ data: { 
            orderStatus: { code: orderStatusCode, text: statusText },
            paymentStatus: {
                text: updatedOrder.PaymentStatus === 1 ? "Đã thanh toán" : "Chưa thanh toán",
                code: updatedOrder.PaymentStatus || 0
            },
        }});
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});
router.get('/user/:userId', async (req, res) => {
    try {
        let pool = await sql.connect(sqlConfig);
        let result = await pool.request()
            .input('userId', sql.Int, req.params.userId)
            .query(`
                SELECT 
                    o.OrderID, 
                    o.OrderDate, 
                    o.Status, 
                    o.Total,
                    o.SubTotal,
                    o.DiscountAmount,
                    ISNULL(SUM(od.Quantity), 0) as TotalItems
                FROM Orders o
                LEFT JOIN OrderDetails od ON o.OrderID = od.OrderID
                WHERE o.UserID = @userId
                GROUP BY o.OrderID, o.OrderDate, o.Status, o.Total, o.SubTotal, o.DiscountAmount
                ORDER BY o.OrderDate DESC
            `);

        res.json({ orders: result.recordset });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});
module.exports = router;