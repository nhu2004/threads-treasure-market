-- 1. Bảng Phân hạng khách hàng
CREATE TABLE CustomerRanks (
    RankID INT PRIMARY KEY IDENTITY(1,1),
    RankName NVARCHAR(50), -- Khách vãng lai, Thân thiết, Cao cấp, Đặc quyền
    MinSpend DECIMAL(18, 2),
    MaxSpend DECIMAL(18, 2),
    BenefitDescription NVARCHAR(MAX)
);

-- 2. Cập nhật bảng Users (Khách hàng & Admin)
-- Lưu ý: Email phải là Unique
ALTER TABLE Users ADD 
    DOB DATE, -- Ngày sinh để tặng voucher
    TotalSpent DECIMAL(18, 2) DEFAULT 0, -- Tổng tiền đã mua để xếp hạng
    RankID INT FOREIGN KEY REFERENCES CustomerRanks(RankID),
    RegistrationDate DATETIME DEFAULT GETDATE();
-- Ràng buộc 1 email 1 tài khoản
ALTER TABLE Users ADD CONSTRAINT UC_Email UNIQUE (Email);


-- 3. Cập nhật bảng Products
ALTER TABLE Products ADD 
    StockQuantity INT DEFAULT 0,
    CreatedBy INT FOREIGN KEY REFERENCES Users(UserID); -- Người tạo/nhập đầu tiên

-- 4. Bảng Lịch sử nhập hàng (Manual hoặc CSV)
CREATE TABLE StockReceipts (
    ReceiptID INT PRIMARY KEY IDENTITY(1,1),
    ProductID INT FOREIGN KEY REFERENCES Products(ProductID),
    QuantityAdded INT,
    EntryMethod NVARCHAR(20), -- 'Manual' hoặc 'CSV'
    AdminID INT FOREIGN KEY REFERENCES Users(UserID),
    EntryDate DATETIME DEFAULT GETDATE()
);

-- 5. Cập nhật bảng Orders (Đã bỏ cột Status vì cột này đã tồn tại)
ALTER TABLE Orders ADD 
    CancellationReason NVARCHAR(MAX),
    StatusUpdatedBy INT FOREIGN KEY REFERENCES Users(UserID), -- Admin hoặc Shipper (Admin giả lập)
    DeliveryProofImage NVARCHAR(MAX); -- Link ảnh xác nhận đã giao

-- 6. Bảng Mẫu Hóa Đơn (Admin quản lý mẫu)
CREATE TABLE InvoiceTemplates (
    TemplateID INT PRIMARY KEY IDENTITY(1,1),
    TemplateContent NVARCHAR(MAX),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    UpdatedBy INT FOREIGN KEY REFERENCES Users(UserID)
);

-- 7. Bảng Hóa đơn (Invoice) - Xuất khi "Đang giao"
CREATE TABLE Invoices (
    InvoiceID INT PRIMARY KEY IDENTITY(1,1),
    OrderID INT FOREIGN KEY REFERENCES Orders(OrderID),
    TemplateID INT FOREIGN KEY REFERENCES InvoiceTemplates(TemplateID),
    InvoiceDate DATETIME DEFAULT GETDATE(), -- Thời gian thực khi in
    TotalAmount DECIMAL(18, 2)
);

-- 8. Cập nhật bảng Vouchers
ALTER TABLE Vouchers ADD 
    VoucherType NVARCHAR(50), -- 'Birthday', 'NewUser', 'RankBased', 'General'
    MinOrderValue DECIMAL(18, 2),
    MaxDiscountAmount DECIMAL(18, 2), -- Giới hạn số tiền giảm nếu là %
    TargetRankID INT NULL FOREIGN KEY REFERENCES CustomerRanks(RankID), -- Đối tượng áp dụng
    Description NVARCHAR(MAX),
    IsActive BIT DEFAULT 1;

-- 9. Bảng liên kết Voucher của người dùng (Mục "Voucher của bạn")
CREATE TABLE UserVouchers (
    UserVoucherID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT FOREIGN KEY REFERENCES Users(UserID),
    VoucherID INT FOREIGN KEY REFERENCES Vouchers(VoucherID),
    IsUsed BIT DEFAULT 0,
    ReceivedDate DATETIME DEFAULT GETDATE()
);

 
 -- 1. Xóa danh mục 'Đầm' để phù hợp với shop thời trang nam
-- (Nếu có khóa ngoại cản trở, bạn cần xóa sản phẩm thuộc danh mục này trước nhé)
DELETE FROM Categories WHERE Name = N'Đầm';

-- 2. Thêm dữ liệu các mốc phân hạng vào bảng CustomerRanks (vì bạn mới tạo bảng chứ chưa có dữ liệu)
INSERT INTO CustomerRanks (RankName, MinSpend, MaxSpend, BenefitDescription)
VALUES 
(N'Khách vãng lai', 0, 4999999, N'Ưu đãi cơ bản'),
(N'Khách hàng thân thiết', 5000000, 39999999, N'Chính sách ưu đãi khách thân thiết'),
(N'Khách hàng cao cấp', 40000000, 99999999, N'Chính sách ưu đãi khách cao cấp'),
(N'Khách hàng đặc quyền', 100000000, 9999999999, N'Chính sách ưu đãi khách đặc quyền');

-- Cập nhật RankID mặc định cho các khách hàng đã có sẵn trong database (để tránh bị NULL)
UPDATE Users SET RankID = 1 WHERE RankID IS NULL;

-- 3. Bổ sung cột Tên mẫu hóa đơn cho bảng InvoiceTemplates (giúp Admin dễ quản lý các mẫu khác nhau)
ALTER TABLE InvoiceTemplates ADD 
    TemplateName NVARCHAR(100);


---------------------

CREATE TRIGGER trg_UpdateCustomerRank
ON Orders
AFTER UPDATE
AS
BEGIN
    -- Chỉ kích hoạt logic này nếu cột Status bị thay đổi
    IF UPDATE(Status)
    BEGIN
        -- BƯỚC 1: Cập nhật lại TotalSpent cho những khách hàng có đơn vừa chuyển sang 'Đã giao'
        UPDATE u
        SET u.TotalSpent = (
            -- Tính tổng tiền các đơn hàng 'Đã giao' của user này
            SELECT ISNULL(SUM(Total), 0)
            FROM Orders o
            WHERE o.UserID = u.UserID AND o.Status = N'Đã giao'
        )
        FROM Users u
        INNER JOIN inserted i ON u.UserID = i.UserID
        WHERE i.Status = N'Đã giao';

        -- BƯỚC 2: Cập nhật lại RankID dựa trên TotalSpent mới tính
        UPDATE u
        SET u.RankID = cr.RankID
        FROM Users u
        INNER JOIN inserted i ON u.UserID = i.UserID
        -- Khớp tổng tiền vào khoảng giới hạn của Rank
        INNER JOIN CustomerRanks cr 
            ON u.TotalSpent >= cr.MinSpend AND u.TotalSpent <= cr.MaxSpend
        WHERE i.Status = N'Đã giao';
    END
END;



--lấy ra toàn bộ Voucher khách hàng được dùng khi họ vào mục "Voucher của bạn":
CREATE PROCEDURE sp_GetAvailableVouchersForUser
    @UserID INT
AS
BEGIN
    -- Lấy hạng hiện tại của khách hàng
    DECLARE @UserRankID INT;
    SELECT @UserRankID = RankID FROM Users WHERE UserID = @UserID;

    -- LẤY DANH SÁCH VOUCHER
    -- 1. Voucher phát riêng cho user (từ bảng UserVouchers)
    SELECT 
        v.VoucherID, v.Code, v.VoucherType, v.Value, v.ByType, 
        v.MinimumAmount AS MinOrderValue, -- Đã sửa lại đúng tên cột
        v.MaxDiscountAmount, 
        v.Description, v.ExpiryDate,
        N'Cá nhân' AS SourceType
    FROM Vouchers v
    INNER JOIN UserVouchers uv ON v.VoucherID = uv.VoucherID
    WHERE uv.UserID = @UserID 
      AND uv.IsUsed = 0 
      AND v.IsActive = 1 
      AND v.ExpiryDate >= GETDATE()

    UNION ALL

    -- 2. Voucher chung và Voucher theo đúng hạng của user
    SELECT 
        v.VoucherID, v.Code, v.VoucherType, v.Value, v.ByType, 
        v.MinimumAmount AS MinOrderValue, -- Đã sửa lại đúng tên cột
        v.MaxDiscountAmount, 
        v.Description, v.ExpiryDate,
        N'Theo Hạng/Chương trình' AS SourceType
    FROM Vouchers v
    WHERE v.IsActive = 1 
      AND v.ExpiryDate >= GETDATE()
      -- Khớp hạng hoặc voucher public (NULL)
      AND (v.TargetRankID IS NULL OR v.TargetRankID = @UserRankID)
      -- Loại trừ những voucher hệ thống đã lưu vào bảng UserVouchers để tránh trùng lặp hiển thị
      AND v.VoucherID NOT IN (SELECT VoucherID FROM UserVouchers WHERE UserID = @UserID)
END;

--Thống kê sản phẩm khách mua nhiều nhất
CREATE PROCEDURE sp_GetTopProductsByUser
    @UserID INT
AS
BEGIN
    SELECT TOP 5 
        p.ProductID, 
        p.Name, 
        SUM(od.Quantity) AS TotalQuantityPurchased
    FROM OrderDetails od
    INNER JOIN Orders o ON od.OrderID = o.OrderID
    INNER JOIN Products p ON od.ProductID = p.ProductID
    WHERE o.UserID = @UserID 
      AND o.Status != N'Đã hủy' -- Loại trừ các đơn đã hủy
    GROUP BY p.ProductID, p.Name
    ORDER BY TotalQuantityPurchased DESC;
END;

SELECT* FROM Users 


-- =======================================================================
-- 1. CẬP NHẬT LẠI ĐỊA CHỈ CHI TIẾT (SỐ NHÀ, TÊN ĐƯỜNG, PHƯỜNG, QUẬN/TP)
-- =======================================================================
UPDATE Users SET Address = N'123 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM' WHERE UserID = 1;
UPDATE Users SET Address = N'456 Điện Biên Phủ, Phường 11, Quận 3, TP.HCM' WHERE UserID = 2;
UPDATE Users SET Address = N'789 Nguyễn Trãi, Phường 11, Quận 5, TP.HCM' WHERE UserID = 3;
UPDATE Users SET Address = N'101 Nguyễn Thị Thập, Phường Tân Phú, Quận 7, TP.HCM' WHERE UserID = 4;
UPDATE Users SET Address = N'202 Xô Viết Nghệ Tĩnh, Phường 21, Quận Bình Thạnh, TP.HCM' WHERE UserID = 5;
UPDATE Users SET Address = N'303 Quang Trung, Phường 10, Quận Gò Vấp, TP.HCM' WHERE UserID = 6;

-- =======================================================================
-- 2. TÍNH TOÁN LẠI TỔNG CHI TIÊU & CẬP NHẬT HẠNG CHO DỮ LIỆU HIỆN TẠI
-- =======================================================================

-- Bước 2.1: Tính tổng tiền từ các đơn hàng 'Đã giao' và cập nhật vào TotalSpent của từng User
UPDATE Users
SET TotalSpent = ISNULL((
    SELECT SUM(Total)
    FROM Orders o
    WHERE o.UserID = Users.UserID AND o.Status = N'Đã giao'
), 0);

-- Bước 2.2: Dựa vào cột TotalSpent vừa tính được, xét lại RankID cho toàn bộ khách hàng
UPDATE u
SET u.RankID = cr.RankID
FROM Users u
INNER JOIN CustomerRanks cr 
    ON u.TotalSpent >= cr.MinSpend AND u.TotalSpent <= cr.MaxSpend;


	-- =======================================================================
-- KỊCH BẢN TẠO DỮ LIỆU MẪU LIÊN KẾT GIỮA CÁC BẢNG
-- =======================================================================

-- 1. GIẢ LẬP NHẬP KHO (Lưu vào StockReceipts và cộng StockQuantity)
-- Giả sử nhập thêm Áo Blazer (ProductID = 1) và Quần Kaki (ProductID = 2)
INSERT INTO StockReceipts (ProductID, QuantityAdded, EntryMethod, AdminID, EntryDate)
VALUES 
(1, 50, N'CSV', 1, GETDATE() - 5),
(2, 100, N'Manual', 1, GETDATE() - 5);

UPDATE Products SET StockQuantity = StockQuantity + 50 WHERE ProductID = 1;
UPDATE Products SET StockQuantity = StockQuantity + 100 WHERE ProductID = 2;

-- 2. TẠO MẪU HÓA ĐƠN (InvoiceTemplates) CHO ADMIN
DECLARE @TemplateID INT;
INSERT INTO InvoiceTemplates (TemplateName, TemplateContent, UpdatedBy, UpdatedAt)
VALUES (N'Mẫu Hóa Đơn Điện Tử Chuẩn 2026', N'<html><body><h1>HÓA ĐƠN BÁN HÀNG THREADS TREASURE</h1><p>Cảm ơn quý khách...</p></body></html>', 1, GETDATE());
SET @TemplateID = SCOPE_IDENTITY(); -- Lấy ID mẫu hóa đơn vừa tạo

-- Sử dụng biến để lưu ID đơn hàng tự tăng, đảm bảo liên kết OrderDetails chính xác
DECLARE @OrderID_ChoXacNhan INT, @OrderID_DangGiao INT, @OrderID_DaGiao INT, @OrderID_DaHuy INT;

-- -----------------------------------------------------------------------
-- SCENARIO 1: ĐƠN HÀNG "CHỜ XÁC NHẬN" (Chưa có hóa đơn, chưa trừ kho thực tế)
-- Khách hàng: customer3 (UserID = 5)
-- -----------------------------------------------------------------------
INSERT INTO Orders (UserID, OrderDate, Status, Total)
VALUES (5, GETDATE(), N'Chờ xác nhận', 2140000);
SET @OrderID_ChoXacNhan = SCOPE_IDENTITY();

INSERT INTO OrderDetails (OrderID, ProductID, Quantity, Price)
VALUES 
(@OrderID_ChoXacNhan, 1, 1, 1290000), -- 1 Áo
(@OrderID_ChoXacNhan, 2, 1, 850000);  -- 1 Quần

-- -----------------------------------------------------------------------
-- SCENARIO 2: ĐƠN HÀNG "ĐANG GIAO" (Đã xuất hóa đơn, ghi nhận người cập nhật)
-- Khách hàng: customer2 (UserID = 4)
-- -----------------------------------------------------------------------
INSERT INTO Orders (UserID, OrderDate, Status, Total, StatusUpdatedBy)
VALUES (4, GETDATE() - 1, N'Đang giao', 850000, 1); -- Admin (UserID = 1) đã xác nhận
SET @OrderID_DangGiao = SCOPE_IDENTITY();

INSERT INTO OrderDetails (OrderID, ProductID, Quantity, Price)
VALUES (@OrderID_DangGiao, 2, 1, 850000);

-- Sinh Hóa Đơn cho đơn "Đang giao"
INSERT INTO Invoices (OrderID, TemplateID, InvoiceDate, TotalAmount)
VALUES (@OrderID_DangGiao, @TemplateID, GETDATE() - 1, 850000);

-- Khớp logic: Trừ tồn kho khi đơn chuyển sang Đang giao
UPDATE Products SET StockQuantity = StockQuantity - 1 WHERE ProductID = 2;

-- -----------------------------------------------------------------------
-- SCENARIO 3: ĐƠN HÀNG "ĐÃ GIAO" (Có ảnh bằng chứng, kích hoạt Trigger nâng hạng)
-- Khách hàng: customer1 (UserID = 3)
-- -----------------------------------------------------------------------
INSERT INTO Orders (UserID, OrderDate, Status, Total, StatusUpdatedBy, DeliveryProofImage)
VALUES (3, GETDATE() - 2, N'Đã giao', 2580000, 1, N'https://example.com/images/proof_delivery_order3.jpg');
SET @OrderID_DaGiao = SCOPE_IDENTITY();

INSERT INTO OrderDetails (OrderID, ProductID, Quantity, Price)
VALUES (@OrderID_DaGiao, 1, 2, 1290000);

-- Sinh Hóa Đơn cho đơn "Đã giao" (Hóa đơn đã được sinh từ lúc 'Đang giao')
INSERT INTO Invoices (OrderID, TemplateID, InvoiceDate, TotalAmount)
VALUES (@OrderID_DaGiao, @TemplateID, GETDATE() - 3, 2580000);

-- Trừ tồn kho
UPDATE Products SET StockQuantity = StockQuantity - 2 WHERE ProductID = 1;

-- -----------------------------------------------------------------------
-- SCENARIO 4: ĐƠN HÀNG "ĐÃ HỦY" (Có lý do hủy cụ thể)
-- Khách hàng: Khách Hàng 01 (UserID = 6)
-- -----------------------------------------------------------------------
INSERT INTO Orders (UserID, OrderDate, Status, Total, CancellationReason, StatusUpdatedBy)
VALUES (6, GETDATE() - 4, N'Đã hủy', 1290000, N'Khách hàng thay đổi ý định, không muốn mua nữa', 1);
SET @OrderID_DaHuy = SCOPE_IDENTITY();

INSERT INTO OrderDetails (OrderID, ProductID, Quantity, Price)
VALUES (@OrderID_DaHuy, 1, 1, 1290000);
-- Không sinh hóa đơn và không trừ kho cho đơn đã hủy