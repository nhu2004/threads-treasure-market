/* SQL Script: Khởi tạo cơ sở dữ liệu ThreadsTreasure
   Dựa trên hình ảnh truy vấn SQL Server
*/

-- 1. TẠO CẤU TRÚC BẢNG (SCHEMA)
-- =============================================

-- Bảng Danh mục (Categories)
CREATE TABLE Categories (
    CategoryID INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(255) NOT NULL
);

-- Bảng Người dùng (Users)
CREATE TABLE Users (
    UserID INT PRIMARY KEY IDENTITY(1,1),
    Username NVARCHAR(50) NOT NULL,
    PasswordHash NVARCHAR(MAX),
    FullName NVARCHAR(255),
    Email NVARCHAR(255),
    Phone NVARCHAR(20) NULL,
    Address NVARCHAR(MAX) NULL,
    Role NVARCHAR(50),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Bảng Sản phẩm (Products)
CREATE TABLE Products (
    ProductID INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(255) NOT NULL,
    Price DECIMAL(18, 2),
    CategoryID INT,
    Description NVARCHAR(MAX),
    ImageUrl NVARCHAR(MAX),
    Badge NVARCHAR(50),
    Colors NVARCHAR(MAX), -- Lưu chuỗi JSON định dạng màu sắc
    Sizes NVARCHAR(MAX),
    OriginalPrice DECIMAL(18, 2),
    CONSTRAINT FK_Product_Category FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID)
);

-- Bảng Đơn hàng (Orders)
CREATE TABLE Orders (
    OrderID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT,
    OrderDate DATETIME,
    Status NVARCHAR(50),
    Total DECIMAL(18, 2),
    CONSTRAINT FK_Order_User FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- Bảng Chi tiết đơn hàng (OrderDetails)
CREATE TABLE OrderDetails (
    OrderDetailID INT PRIMARY KEY IDENTITY(1,1),
    OrderID INT,
    ProductID INT,
    Quantity INT,
    Price DECIMAL(18, 2),
    CONSTRAINT FK_Detail_Order FOREIGN KEY (OrderID) REFERENCES Orders(OrderID),
    CONSTRAINT FK_Detail_Product FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
);
GO

-- 2. CHÈN DỮ LIỆU (DATA)
-- =============================================

-- Dữ liệu Categories
INSERT INTO Categories (Name) VALUES (N'Áo'), (N'Quần'), (N'Phụ kiện');

-- Dữ liệu Users
INSERT INTO Users (Username, PasswordHash, FullName, Email, Role, CreatedAt, UpdatedAt)
VALUES 
('admin', '$2b$10$8.D02wXl8Yh1u/e6Q1IE5.Z9s6.K0R9t1Q9X1O9x8...', N'Administrator', 'admin@threads-treasure.com', 'admin', '2026-04-02 22:13:29.923', '2026-04-02 22:13:29.923'),
('customer1', '1', N'Trần Thị B', 'customer1@gmail.com', 'customer', '2026-04-02 22:13:29.923', '2026-04-02 22:13:29.923'),
('customer2', '$2b$10$hashedpassword4', N'Lê Văn C', 'customer2@gmail.com', 'customer', '2026-04-02 22:13:29.923', '2026-04-02 22:13:29.923'),
('customer3', '$2b$10$hashedpassword5', N'Phạm Thị D', 'customer3@gmail.com', 'customer', '2026-04-02 22:13:29.923', '2026-04-02 22:13:29.923'),
('01', '1', N'Customer 01', 'customer01@gmail.com', 'customer', '2026-04-02 22:15:15.127', '2026-04-02 22:15:15.127');

-- Dữ liệu Products
INSERT INTO Products (Name, Price, CategoryID, Description, ImageUrl, Badge, Colors, Sizes, OriginalPrice)
VALUES 
(N'Áo Blazer Oversized', 1290000.00, 1, N'Áo blazer oversized phong cách hiện đại, chất liệu cao cấp...', 'https://images.unsplash.com/photo-1594938298603-...', 'SALE', '[{"name": "Đen", "hex": "#111111"}]', 'S,M,L,XL', 1690000.00),
(N'Quần kaki nam cao cấp', 850000.00, 2, N'Quần kaki nam công sở cao cấp Merriman, form chuẩn...', 'https://cdn.hstatic.net/products/1000102419/fmk030iv...', N'MỚI', '[{"name": "Tan", "hex": "#D2B48C"}]', '29,30,31,32', 1000000.00);

-- Dữ liệu Orders (Mô phỏng 8 đơn hàng cho UserID 3 như trong ảnh)
-- Vì ID tự tăng nên chúng ta chèn tuần tự
INSERT INTO Orders (UserID, OrderDate, Status, Total)
VALUES 
(3, '2026-04-21 23:40:30.113', N'Đã giao', 1290000.00),
(3, '2026-04-20 23:40:30.120', N'Đã giao', 1290000.00),
(3, '2026-04-19 23:40:30.120', N'Đã giao', 1290000.00),
(3, '2026-04-18 23:40:30.123', N'Đã giao', 1290000.00),
(3, '2026-04-17 23:40:30.123', N'Đã giao', 1290000.00),
(3, '2026-04-16 23:40:30.127', N'Đã giao', 1290000.00),
(3, '2026-04-15 23:40:30.127', N'Đã giao', 1290000.00),
(3, '2026-04-14 23:40:30.127', N'Đã giao', 1290000.00);

-- Dữ liệu OrderDetails (Liên kết với các đơn hàng từ 25 đến 32)
-- Giả sử các ID của Orders bắt đầu từ 25 như trong ảnh của bạn
-- Để chèn chính xác ID 25, 26... bạn có thể dùng IDENTITY_INSERT nếu cần.
-- Ở đây tôi chèn theo mối quan hệ logic:
INSERT INTO OrderDetails (OrderID, ProductID, Quantity, Price)
VALUES 
(1, 1, 1, 1290000.00), -- Cho Order 1 (thực tế trong ảnh là ID 25)
(2, 1, 1, 1290000.00),
(3, 1, 1, 1290000.00),
(4, 1, 1, 1290000.00),
(5, 1, 1, 1290000.00),
(6, 1, 1, 1290000.00),
(7, 1, 1, 1290000.00),
(8, 1, 1, 1290000.00);
GO