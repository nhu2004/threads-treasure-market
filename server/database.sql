-- Tạo bảng Brands
CREATE TABLE Brands (
    BrandID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Year INT
);

-- Tạo bảng Categories
CREATE TABLE Categories (
    CategoryID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL
);

-- Tạo bảng Suppliers
CREATE TABLE Suppliers (
    SupplierID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(255)
);

-- Tạo bảng Products
CREATE TABLE Products (
    ProductID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Price DECIMAL(18,2) NOT NULL,
    BrandID INT FOREIGN KEY REFERENCES Brands(BrandID),
    CategoryID INT FOREIGN KEY REFERENCES Categories(CategoryID),
    SupplierID INT FOREIGN KEY REFERENCES Suppliers(SupplierID),
    Description NVARCHAR(255),
    ImageUrl NVARCHAR(255)
);

-- Tạo bảng Users
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    FullName NVARCHAR(100),
    Email NVARCHAR(100),
    Phone NVARCHAR(20),
    Address NVARCHAR(255),
    Role NVARCHAR(20) NOT NULL DEFAULT 'customer', -- 'customer', 'admin'
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Tạo bảng Orders
CREATE TABLE Orders (
    OrderID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    OrderDate DATETIME NOT NULL DEFAULT GETDATE(),
    Status NVARCHAR(20),
    Total DECIMAL(18,2)
);

-- Tạo bảng OrderDetails
CREATE TABLE OrderDetails (
    OrderDetailID INT IDENTITY(1,1) PRIMARY KEY,
    OrderID INT FOREIGN KEY REFERENCES Orders(OrderID),
    ProductID INT FOREIGN KEY REFERENCES Products(ProductID),
    Quantity INT NOT NULL,
    Price DECIMAL(18,2) NOT NULL
);

-- Tạo bảng Vouchers
CREATE TABLE Vouchers (
    VoucherID INT IDENTITY(1,1) PRIMARY KEY,
    Code NVARCHAR(50) NOT NULL,
    Value DECIMAL(18,2) NOT NULL,
    ByType NVARCHAR(10), -- 'percent' hoặc 'amount'
    ExpiryDate DATETIME
);

-- Tạo bảng Analytics (nếu cần lưu thống kê riêng)
-- Tuỳ vào nhu cầu, có thể không cần bảng này nếu chỉ thống kê động

-- Chèn dữ liệu mẫu

-- Chèn dữ liệu vào bảng Brands
INSERT INTO Brands (Name, Year) VALUES
('Threads & Treasure', 2020),
('Fashion Brand A', 2018),
('Luxury Wear', 2019),
('Casual Style', 2021);

-- Chèn dữ liệu vào bảng Categories
INSERT INTO Categories (Name) VALUES
('Áo'),
('Quần'),
('Đầm'),
('Phụ kiện');

-- Chèn dữ liệu vào bảng Suppliers
INSERT INTO Suppliers (Name, Description) VALUES
('Nhà cung cấp nội địa', 'Cung cấp sản phẩm từ các nhà sản xuất trong nước'),
('Nhà cung cấp quốc tế', 'Cung cấp sản phẩm nhập khẩu từ các thương hiệu quốc tế'),
('Nhà cung cấp phụ kiện', 'Chuyên cung cấp các loại phụ kiện thời trang');

-- Chèn dữ liệu vào bảng Products
INSERT INTO Products (Name, Price, BrandID, CategoryID, SupplierID, Description, ImageUrl) VALUES
('Áo Blazer Oversized', 1290000.00, 1, 1, 1, 'Áo blazer oversized phong cách hiện đại, chất liệu cao cấp. Phù hợp cho cả công sở và dạo phố.', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop'),
('Đầm Midi Lụa', 1590000.00, 2, 3, 2, 'Đầm midi chất liệu lụa mềm mại, kiểu dáng thanh lịch. Hoàn hảo cho buổi tiệc và sự kiện.', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop'),
('Quần Palazzo Ống Rộng', 890000.00, 3, 2, 1, 'Quần palazzo ống rộng, lưng cao tôn dáng. Chất liệu thoáng mát, phù hợp mọi dịp.', 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=800&fit=crop'),
('Áo Sơ Mi Lụa', 790000.00, 1, 1, 2, 'Áo sơ mi lụa cao cấp, form dáng thoải mái. Có thể kết hợp với nhiều phong cách khác nhau.', 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=600&h=800&fit=crop'),
('Túi Xách Mini', 1190000.00, 4, 4, 3, 'Túi xách mini thiết kế tinh tế, chất liệu da tổng hợp cao cấp.', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=800&fit=crop'),
('Đầm Maxi Hoa', 1390000.00, 2, 3, 2, 'Đầm maxi họa tiết hoa thanh nhã, phong cách nữ tính và lãng mạn.', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=800&fit=crop'),
('Quần Jeans Skinny', 690000.00, 3, 2, 1, 'Quần jeans skinny co giãn tốt, thoải mái suốt cả ngày.', 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=800&fit=crop'),
('Khăn Lụa Vuông', 490000.00, 4, 4, 3, 'Khăn lụa vuông họa tiết sang trọng, đa dạng cách sử dụng.', 'https://images.unsplash.com/photo-1601924921557-45e6dea0c151?w=600&h=800&fit=crop');

-- Chèn dữ liệu vào bảng Users
INSERT INTO Users (Username, PasswordHash, FullName, Email, Role) VALUES
('admin', '$2b$10$hashedpassword1', 'Administrator', 'admin@threads-treasure.com', 'admin'),
('staff1', '$2b$10$hashedpassword2', 'Nguyễn Văn A', 'staff1@threads-treasure.com', 'staff'),
('customer1', '$2b$10$hashedpassword3', 'Trần Thị B', 'customer1@gmail.com', 'customer'),
('customer2', '$2b$10$hashedpassword4', 'Lê Văn C', 'customer2@gmail.com', 'customer'),
('customer3', '$2b$10$hashedpassword5', 'Phạm Thị D', 'customer3@gmail.com', 'customer');

-- Chèn dữ liệu vào bảng Orders
INSERT INTO Orders (UserID, OrderDate, Status, Total) VALUES
(3, '2024-01-15', 'Completed', 2180000.00),
(4, '2024-01-20', 'Processing', 1590000.00),
(5, '2024-01-25', 'Pending', 890000.00),
(3, '2024-02-01', 'Completed', 2080000.00);

-- Chèn dữ liệu vào bảng OrderDetails
INSERT INTO OrderDetails (OrderID, ProductID, Quantity, Price) VALUES
(1, 1, 1, 1290000.00),
(1, 4, 1, 790000.00),
(2, 2, 1, 1590000.00),
(3, 3, 1, 890000.00),
(4, 5, 1, 1190000.00),
(4, 8, 1, 490000.00);

-- Chèn dữ liệu vào bảng Vouchers
INSERT INTO Vouchers (Code, Value, ByType, ExpiryDate) VALUES
('SALE10', 10.00, 'percent', '2024-12-31'),
('DISCOUNT50K', 50000.00, 'amount', '2024-12-31'),
('NEWUSER20', 20.00, 'percent', '2024-12-31');

-- Voucher thực tế cho shop quần áo
INSERT INTO Vouchers (Code, Name, Value, ByType, StartDate, ExpiryDate, MinimumAmount) VALUES
('XUAN2026', N'Mã Giảm Giá Xuân 2026', 15.00, 'percent', GETDATE(), '2026-05-01', 500000),
('FREESHIP', N'Ưu đãi vận chuyển', 30000.00, 'amount', GETDATE(), '2026-12-31', 200000),
('VIPTHREADS', N'Tri ân khách hàng thân thiết', 100000.00, 'amount', GETDATE(), '2026-06-01', 1000000);

-- Thêm sản phẩm thời trang đa dạng hơn
INSERT INTO Products (Name, Price, BrandID, CategoryID, SupplierID, Description, ImageUrl) VALUES
(N'Chân váy xếp ly Tennis', 350000.00, 1, 2, 1, N'Chân váy trẻ trung, dễ phối đồ.', 'https://example.com/skirt.jpg'),
(N'Áo khoác dạ dáng dài', 1850000.00, 3, 1, 2, N'Chất liệu dạ giữ ấm tốt, sang trọng.', 'https://example.com/coat.jpg');
-- 1. Đảm bảo User '01' tồn tại (nếu chưa có từ file của bạn)
-- INSERT INTO Users (Username, PasswordHash, FullName, Email, Role) VALUES ('01', '$2b$10$xyz', 'Customer 01', 'customer01@gmail.com', 'customer');

-- 2. Thêm 20 đơn hàng cho UserID = 2 (Username '01')
DECLARE @i INT = 1;
DECLARE @UserID INT = 2; -- ID của tài khoản '01'

WHILE @i <= 20
BEGIN
    INSERT INTO Orders (UserID, OrderDate, Status, Total)
    VALUES (
        @UserID, 
        DATEADD(DAY, -@i * 2, GETDATE()), -- Các đơn hàng cách nhau 2 ngày về trước
        CASE 
            WHEN @i % 5 = 0 THEN 'Pending' 
            WHEN @i % 5 = 1 THEN 'Processing' 
            ELSE 'Completed' 
        END,
        (600000 + (ABS(CHECKSUM(NEWID())) % 2000000)) -- Giá ngẫu nhiên từ 600k đến 2.6tr
    );
    
    -- Thêm chi tiết đơn hàng (mỗi đơn hàng có 1-2 sản phẩm ngẫu nhiên)
    DECLARE @NewOrderID INT = SCOPE_IDENTITY();
    INSERT INTO OrderDetails (OrderID, ProductID, Quantity, Price)
    SELECT TOP (1 + ABS(CHECKSUM(NEWID())) % 2) 
           @NewOrderID, ProductID, 1, Price
    FROM Products ORDER BY NEWID();

    SET @i = @i + 1;
END;

ALTER TABLE Vouchers ADD Name NVARCHAR(100);
ALTER TABLE Vouchers ADD StartDate DATETIME DEFAULT GETDATE();
ALTER TABLE Vouchers ADD MinimumAmount DECIMAL(18,2) DEFAULT 0;