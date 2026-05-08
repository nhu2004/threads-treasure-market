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

-- =======================================================================
-- 1. CẬP NHẬT DỮ LIỆU CÁC VOUCHER ĐANG BỊ NULL
-- =======================================================================

-- Cập nhật Voucher 1 (SALE10 - Giảm 10%)
UPDATE Vouchers
SET Name = N'Siêu Sale Giảm 10%',
    StartDate = '2024-01-01',
    MinimumAmount = 500000,
    VoucherType = 'General', -- Dành cho mọi người
    MinOrderValue = 500000,  -- Đơn tối thiểu 500k
    MaxDiscountAmount = 100000, -- Giảm tối đa 100k
    TargetRankID = NULL, -- NULL nghĩa là ai cũng dùng được
    Description = N'Giảm 10% (tối đa 100.000đ) cho tất cả đơn hàng có giá trị từ 500.000đ trở lên.',
    IsActive = 1
WHERE VoucherID = 1;

-- Cập nhật Voucher 2 (DISCOUNT50K - Giảm 50k)
UPDATE Vouchers
SET Name = N'Giảm Trực Tiếp 50K',
    StartDate = '2024-01-01',
    MinimumAmount = 300000,
    VoucherType = 'General',
    MinOrderValue = 300000,
    MaxDiscountAmount = 50000,
    TargetRankID = NULL,
    Description = N'Giảm thẳng 50.000đ vào tổng hóa đơn cho các đơn hàng từ 300.000đ.',
    IsActive = 1
WHERE VoucherID = 2;

-- Cập nhật Voucher 3 (NEWUSER20 - Khách hàng mới)
UPDATE Vouchers
SET Name = N'Ưu Đãi Khách Hàng Mới',
    StartDate = '2024-01-01',
    MinimumAmount = 1000000,
    VoucherType = 'NewUser', -- Loại ưu đãi khách mới
    MinOrderValue = 1000000, -- Đơn tối thiểu 1 triệu như bạn từng mô tả
    MaxDiscountAmount = 200000, -- Giảm 20% tối đa 200k
    TargetRankID = 1, -- Khách vãng lai (RankID = 1) mới đăng ký
    Description = N'Ưu đãi dành riêng cho khách hàng mới. Giảm 20% (tối đa 200.000đ) cho đơn hàng đầu tiên từ 1.000.000đ.',
    IsActive = 1
WHERE VoucherID = 3;

-- Tặng thêm 1 Voucher Sinh nhật tự động (Bonus thêm cho đúng nghiệp vụ của bạn)
INSERT INTO Vouchers (Code, Value, ByType, ExpiryDate, Name, StartDate, MinimumAmount, VoucherType, MinOrderValue, MaxDiscountAmount, TargetRankID, Description, IsActive)
VALUES ('HPBD20', 20.00, 'percent', '2026-12-31', N'Quà Tặng Sinh Nhật', '2024-01-01', 0, 'Birthday', 0, 500000, NULL, N'Giảm 20% (tối đa 500.000đ) cho tháng sinh nhật của khách hàng. Không giới hạn giá trị đơn hàng tối thiểu.', 1);


-- =======================================================================
-- 2. TỰ ĐỘNG XUẤT HÓA ĐƠN CHO CÁC ĐƠN HÀNG HỢP LỆ (Chưa có hóa đơn)
-- =======================================================================

-- Lấy mẫu hóa đơn mặc định
DECLARE @TemplateID INT;
SELECT TOP 1 @TemplateID = TemplateID FROM InvoiceTemplates;

-- Insert hàng loạt vào bảng Invoices
INSERT INTO Invoices (OrderID, TemplateID, InvoiceDate, TotalAmount)
SELECT 
    OrderID, 
    @TemplateID, 
    OrderDate, -- Tạm lấy ngày đặt hàng làm ngày xuất hóa đơn cho các đơn cũ
    Total
FROM Orders
WHERE Status IN (N'Đang giao', N'Đã giao') -- Chỉ lấy đơn hợp lệ
  AND OrderID NOT IN (SELECT OrderID FROM Invoices); -- Bỏ qua những đơn đã xuất hóa đơn rồi (như OrderID 59)
 
-- Xóa dữ liệu cũ (nếu muốn làm sạch bảng trước khi thêm mẫu)
-- TRUNCATE TABLE [dbo].[Suppliers]; 
 

-- Kiểm tra lại dữ liệu vừa thêm
SELECT * FROM [dbo].[Suppliers];

---------------------------------------------------------------
CREATE TRIGGER trg_AutoUpdateStatus_DeliveryProof
ON [ThreadsTreasureDB].[dbo].[Orders]
AFTER UPDATE
AS
BEGIN
    -- Ngăn việc đếm số dòng ảnh hưởng làm rối kết quả trả về
    SET NOCOUNT ON;

    -- Kiểm tra xem cột DeliveryProofImage có nằm trong lệnh UPDATE hay không
    IF UPDATE(DeliveryProofImage)
    BEGIN
        -- Cập nhật Status thành 'Đã giao' cho những đơn hàng vừa được thêm ảnh
        UPDATE o
        SET o.Status = N'Đã giao'
        FROM [ThreadsTreasureDB].[dbo].[Orders] o
        INNER JOIN inserted i ON o.OrderID = i.OrderID
        WHERE i.DeliveryProofImage IS NOT NULL 
          AND (o.Status <> N'Đã giao' OR o.Status IS NULL); 
          -- Điều kiện AND để tránh việc update lặp lại nếu status đã là 'Đã giao'
    END
END;


------------------------------------them khoa ngoai 
ALTER TABLE [ThreadsTreasureDB].[dbo].[Products]
ADD [SupplierID] INT NULL;

-- (Tùy chọn) Thêm khóa ngoại để đảm bảo toàn vẹn dữ liệu
ALTER TABLE [ThreadsTreasureDB].[dbo].[Products]
ADD CONSTRAINT FK_Products_Suppliers FOREIGN KEY (SupplierID)
REFERENCES [ThreadsTreasureDB].[dbo].[Suppliers](SupplierID);

 

 BEGIN TRANSACTION;

-- Khai báo biến để lưu OrderID tự động tăng
DECLARE @OrderID1 INT, @OrderID2 INT, @OrderID3 INT;

-----------------------------------------------------------
-- ĐƠN HÀNG 1: Không dùng Voucher
-----------------------------------------------------------
INSERT INTO [dbo].[Orders] ([UserID], [OrderDate], [Status], [Total], [SubTotal], [DiscountAmount], [VoucherID])
VALUES (5, GETDATE(), N'Chờ xác nhận', 5130000, 5130000, 0, NULL);

-- Lấy OrderID vừa chèn
SET @OrderID1 = SCOPE_IDENTITY();

INSERT INTO [dbo].[OrderDetails] ([OrderID], [ProductID], [Quantity], [Price])
VALUES 
    (@OrderID1, 1, 2, 1290000), -- 2 Áo Blazer (ProductID = 1)
    (@OrderID1, 2, 3, 850000);  -- 3 Quần Kaki (ProductID = 2)

-----------------------------------------------------------
-- ĐƠN HÀNG 2: Không dùng Voucher
-----------------------------------------------------------
INSERT INTO [dbo].[Orders] ([UserID], [OrderDate], [Status], [Total], [SubTotal], [DiscountAmount], [VoucherID])
VALUES (5, GETDATE(), N'Chờ xác nhận', 5130000, 5130000, 0, NULL);

SET @OrderID2 = SCOPE_IDENTITY();

INSERT INTO [dbo].[OrderDetails] ([OrderID], [ProductID], [Quantity], [Price])
VALUES 
    (@OrderID2, 1, 2, 1290000), -- 2 Áo
    (@OrderID2, 2, 3, 850000);  -- 3 Quần

-----------------------------------------------------------
-- ĐƠN HÀNG 3: Dùng Voucher 'NEWUSER20' (VoucherID = 3)
-----------------------------------------------------------
-- Total = SubTotal (5.130.000) - Discount (200.000 max) = 4.930.000
INSERT INTO [dbo].[Orders] ([UserID], [OrderDate], [Status], [Total], [SubTotal], [DiscountAmount], [VoucherID])
VALUES (5, GETDATE(), N'Chờ xác nhận', 4930000, 5130000, 200000, 3);

SET @OrderID3 = SCOPE_IDENTITY();

INSERT INTO [dbo].[OrderDetails] ([OrderID], [ProductID], [Quantity], [Price])
VALUES 
    (@OrderID3, 1, 2, 1290000), -- 2 Áo
    (@OrderID3, 2, 3, 850000);  -- 3 Quần

COMMIT TRANSACTION;

PRINT N'Đã tạo thành công 3 đơn hàng cho UserID = 5 (Đơn thứ 3 có áp dụng NEWUSER20)!';

INSERT INTO [dbo].[Products] 
    ([Name], [Price], [CategoryID], [Description], [ImageUrl], [Badge], [Colors], [Sizes], [OriginalPrice], [StockQuantity], [CreatedBy], [SupplierID])
VALUES
-- 1. Quần short nam ASO225SAH2 / ASO226SAH2
(
    N'Quần short nam Regular Fit ASO225SAH2', 995000, 2, 
    N'Quần short nam phom Regular Fit ôm vừa phải, thoải mái vận động. Màu sắc đa dạng, dễ phối đồ.', 
    'https://cdn.hstatic.net/products/200000887901/22_ef82f2cdc77141b99873e8c8a05973a8.jpg', 
    N'MỚI', 
    '[{"name": "Xám", "hex": "#808080"}, {"name": "Be", "hex": "#F5F5DC"}]', 
    '29,30,31,32,33,34', 995000, 100, 1, 4
),

-- 2. Quần âu nam Cropped ATR0610Z / ATR0420S3
(
    N'Quần âu nam Cropped ATR0610Z', 1150000, 2, 
    N'Quần âu nam phom Cropped trẻ trung, tôn dáng. Chất liệu vải cao cấp, đứng phom.', 
    'https://cdn.hstatic.net/products/200000887901/img_7082_668a7f4a8b504c41a136a3e9c8a422fb.jpg', 
    N'HOT', 
    '[{"name": "Xanh navy", "hex": "#000080"}, {"name": "Xám kẻ", "hex": "#A9A9A9"}]', 
    '29,30,31,32,33,34', 1150000, 80, 1, 5
),

-- 3. Quần kaki nam Regular Fit AKK0040Z / AKK00103
(
    N'Quần kaki nam Regular Fit AKK0040Z', 950000, 2, 
    N'Quần kaki nam phom Regular Fit suông nhẹ, thoải mái. Phù hợp môi trường công sở và dạo phố.', 
    'https://cdn.hstatic.net/products/200000887901/a0137-1536x1536_c3626c5fdee7451189d6498ae6b3100a.jpg', 
    N'BEST SELLER', 
    '[{"name": "Xanh nhạt", "hex": "#ADD8E6"}, {"name": "Be", "hex": "#F5F5DC"}]', 
    '29,30,31,32,33', 950000, 150, 1, 4
),

-- 4. Quần âu nam ATR0420Z
(
    N'Quần âu nam ATR0420Z', 1250000, 2, 
    N'Quần âu nam thiết kế tinh tế, lịch lãm dành cho doanh nhân. Vải chống nhăn hiệu quả.', 
    'https://cdn.hstatic.net/products/200000887901/a0579-1536x1536_6939a707e59a4c0e82f3f386b097ffa6.jpg', 
    NULL, 
    '[{"name": "Đen", "hex": "#000000"}, {"name": "Xám be", "hex": "#D3D3D3"}]', 
    '29,30,31,32,33,34', 1250000, 90, 1, 5
),

-- 5. Cà vạt nam bản to đan lát ATI004S0H2 / ATI005S0H2
(
    N'Cà vạt nam bản to đan lát ATI004S0H2', 450000, 4, 
    N'Cà vạt nam bản to họa tiết đan lát sang trọng, chất liệu lụa tổng hợp cao cấp.', 
    'https://cdn.hstatic.net/products/200000887901/dsc09843_ba757f0103fb4726aaa09a630e9c27d9.jpg', 
    N'MỚI', 
    '[{"name": "Đỏ đô", "hex": "#800000"}, {"name": "Xanh navy", "hex": "#000080"}]', 
    'Free Size', 450000, 50, 1, 8
),

-- 6. Thắt lưng nam Leather ABL00502
(
    N'Thắt lưng nam Leather ABL00502', 850000, 4, 
    N'Thắt lưng nam da bò thật 100%, mặt khóa hợp kim nguyên khối chống gỉ sét.', 
    'https://product.hstatic.net/200000887901/product/_tc_8175_31271334e19f4984801736e999c01c71_61991f44100a428da07158b27bc58e1e.jpg', 
    N'CA CAO CẤP', 
    '[{"name": "Đen", "hex": "#000000"}]', 
    'Free Size', 850000, 60, 1, 8
),

-- 7. Cặp tài liệu nam da bò Epsom ABC020S0H2
(
    N'Cặp tài liệu nam da bò Epsom ABC020S0H2', 2500000, 4, 
    N'Cặp tài liệu da bò dập vân Epsom sang trọng, chống xước và giữ phom cực tốt.', 
    'https://cdn.hstatic.net/products/200000887901/dsc08619_2048_1x1_150kb_08095a5cb0be472dbe7c9f836ed2d9eb.jpg', 
    N'VIP', 
    '[{"name": "Đen", "hex": "#000000"}]', 
    'Free Size', 2500000, 20, 1, 8
),

-- 8. Ghim cài áo GHBA030
(
    N'Ghim cài áo cao cấp GHBA030', 150000, 4, 
    N'Ghim cài áo nam cao cấp, điểm nhấn hoàn hảo cho bộ Vest/Suit của bạn.', 
    'https://cavatcaocap.com/wp-content/uploads/2023/02/GHBA030-2-gl.webp', 
    NULL, 
    '[{"name": "Bạc", "hex": "#C0C0C0"}]', 
    'Free Size', 150000, 200, 1, 8
),

-- 9. Ghim cài áo GHBA009
(
    N'Ghim cài áo cao cấp GHBA009', 150000, 4, 
    N'Ghim cài áo nam họa tiết tinh xảo, tôn vinh vẻ đẹp lịch lãm.', 
    'https://cavatcaocap.com/wp-content/uploads/2023/02/GHBA009-2-gl.webp', 
    NULL, 
    '[{"name": "Vàng kim", "hex": "#FFD700"}]', 
    'Free Size', 150000, 180, 1, 8
),

-- 10. Ghim cài áo GHVA025
(
    N'Ghim cài áo cao cấp GHVA025', 150000, 4, 
    N'Ghim cài áo vest hình dáng độc đáo, đính đá sang trọng.', 
    'https://cavatcaocap.com/wp-content/uploads/2023/02/GHVA025-2-gl.webp', 
    NULL, 
    '[{"name": "Bạc", "hex": "#C0C0C0"}]', 
    'Free Size', 150000, 150, 1, 8
);




-- =========================================================
-- BƯỚC 1: XỬ LÝ LỖI FONT CHỮ CỘT COLORS
-- =========================================================

-- 1.1 Chuyển cột Colors sang dạng NVARCHAR(MAX) để hỗ trợ lưu tiếng Việt Unicode (Nếu cột đã là NVARCHAR thì lệnh này vẫn an toàn)
ALTER TABLE Products ALTER COLUMN Colors NVARCHAR(MAX);

-- 1.2 Dùng lệnh REPLACE để sửa lại các chuỗi JSON bị lỗi font (Dựa trên hình ảnh bạn cung cấp)
UPDATE Products SET Colors = REPLACE(Colors, N'Xanh nh?t', N'Xanh nhạt');
UPDATE Products SET Colors = REPLACE(Colors, N'Xám k?', N'Xám khói');
UPDATE Products SET Colors = REPLACE(Colors, N'Đ? dỏ', N'Đỏ đô');
UPDATE Products SET Colors = REPLACE(Colors, N'B?c', N'Bạc');

-- =========================================================
-- BƯỚC 2: CẮT MÃ SẢN PHẨM Ở CUỐI TÊN
-- =========================================================

-- Thuật toán: Tìm khoảng trắng cuối cùng trong chuỗi. 
-- Nếu cụm từ cuối cùng (độ dài >= 5 ký tự) và có chứa chữ số -> Khả năng cao là Mã SP -> Cắt bỏ nó đi.

UPDATE Products
SET Name = RTRIM(LEFT(Name, LEN(Name) - CHARINDEX(' ', REVERSE(Name))))
WHERE 
    CHARINDEX(' ', REVERSE(Name)) > 0  -- Tên phải có ít nhất 1 khoảng trắng
    AND RIGHT(Name, CHARINDEX(' ', REVERSE(Name)) - 1) LIKE '%[0-9]%' -- Từ cuối cùng phải chứa ít nhất 1 chữ số
    AND LEN(RIGHT(Name, CHARINDEX(' ', REVERSE(Name)) - 1)) >= 5; -- Từ cuối cùng phải dài từ 5 ký tự trở lên (VD: GHBA030)


	SELECT COLUMNPROPERTY(OBJECT_ID('Products'), 'ProductID', 'IsIdentity') AS IsIdentity;

	ALTER TABLE Orders 
ADD Note NVARCHAR(MAX) NULL;

BEGIN TRANSACTION;

-- Bước 1: Xóa các sản phẩm chi tiết của đơn hàng số 66 trong bảng OrderDetails
DELETE FROM OrderDetails 
WHERE OrderID = 66;

-- Bước 2: Xóa bản ghi của đơn hàng số 66 trong bảng Orders chính
DELETE FROM Orders 
WHERE OrderID = 66;

COMMIT TRANSACTION;