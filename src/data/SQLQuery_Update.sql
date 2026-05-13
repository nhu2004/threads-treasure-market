-- ==============================================================================
-- 1. CẬP NHẬT BẢNG NHÀ CUNG CẤP (SUPPLIERS)
-- Bổ sung thông tin liên hệ, ngân hàng và trạng thái hoạt động
-- ==============================================================================
ALTER TABLE Suppliers
ADD 
    ContactPerson NVARCHAR(100) NULL,   -- Tên người liên hệ (Sales/Quản lý xưởng)
    Phone VARCHAR(20) NULL,             -- Số điện thoại
    Email VARCHAR(100) NULL,            -- Email để gửi đơn hàng
    Address NVARCHAR(255) NULL,         -- Địa chỉ xưởng/kho
    BankName NVARCHAR(100) NULL,        -- Tên Ngân hàng
    BankAccount VARCHAR(50) NULL,       -- Số tài khoản
    IsActive BIT DEFAULT 1;             -- Trạng thái: 1 = Đang hợp tác, 0 = Ngừng hợp tác

GO
-- Cập nhật các nhà cung cấp cũ mặc định là Đang hợp tác
UPDATE Suppliers SET IsActive = 1 WHERE IsActive IS NULL;
GO

-- ==============================================================================
-- 2. TẠO BẢNG PHIẾU NHẬP KHO (PURCHASE ORDERS)
-- Quản lý lịch sử nhập hàng và tích hợp Công nợ (Demo)
-- ==============================================================================
CREATE TABLE PurchaseOrders (
    PurchaseOrderID INT IDENTITY(1,1) PRIMARY KEY,
    SupplierID INT FOREIGN KEY REFERENCES Suppliers(SupplierID),
    OrderDate DATETIME DEFAULT GETDATE(),         -- Ngày nhập hàng
    
    -- Các cột phục vụ tính toán Công nợ (Demo)
    TotalAmount DECIMAL(18,2) DEFAULT 0,          -- Tổng giá trị lô hàng
    AmountPaid DECIMAL(18,2) DEFAULT 0,           -- Số tiền đã thanh toán trước cho xưởng
    DebtAmount AS (TotalAmount - AmountPaid),     -- CÔNG NỢ: Cột tự động tính (Tổng trừ Đã trả)
    
    Notes NVARCHAR(MAX) NULL,                     -- Ghi chú thêm
    Status NVARCHAR(50) DEFAULT 'Completed'       -- Trạng thái: Pending, Completed, Cancelled
);
GO

-- ==============================================================================
-- 3. TẠO BẢNG CHI TIẾT PHIẾU NHẬP (PURCHASE ORDER DETAILS)
-- Lưu lại chi tiết lần nhập đó gồm những sản phẩm nào, số lượng bao nhiêu
-- ==============================================================================
CREATE TABLE PurchaseOrderDetails (
    DetailID INT IDENTITY(1,1) PRIMARY KEY,
    PurchaseOrderID INT FOREIGN KEY REFERENCES PurchaseOrders(PurchaseOrderID),
    ProductID INT FOREIGN KEY REFERENCES Products(ProductID),
    
    Quantity INT DEFAULT 0,                       -- Số lượng nhập vào
    UnitPrice DECIMAL(18,2) DEFAULT 0,            -- Giá nhập từ xưởng (Khác với giá bán)
    TotalPrice AS (Quantity * UnitPrice)          -- Thành tiền của từng sản phẩm (Tự động tính)
);
GO

-- ==============================================================================
-- 1. DỌN DẸP BẢNG PRODUCTS CŨ
-- Xóa 2 cột lưu mảng (chuỗi phẩy) để chuyển sang lưu đơn lẻ
-- ==============================================================================
CREATE TRIGGER trg_AutoUpdateStock
ON PurchaseOrderDetails
AFTER INSERT
AS
BEGIN
    UPDATE p
    SET p.StockQuantity = ISNULL(p.StockQuantity, 0) + i.Quantity,
        p.UpdatedAt = GETDATE()
    FROM Products p
    INNER JOIN inserted i ON p.ProductID = i.ProductID;
END;
GO

ALTER TABLE Products DROP COLUMN Colors;
ALTER TABLE Products DROP COLUMN Sizes;
GO

-- ==============================================================================
-- 2. BỔ SUNG CÁC TRƯỜNG DỮ LIỆU ĐỊNH DANH BIẾN THỂ
-- ==============================================================================
ALTER TABLE Products
ADD 
    ProductGroupID NVARCHAR(50) NULL, -- Khóa gom nhóm (Ví dụ: BLAZER-01) để nhóm các size/màu lại với nhau
    Color NVARCHAR(50) NULL,          -- Lưu 1 màu duy nhất (Ví dụ: Đen)
    Size NVARCHAR(20) NULL,           -- Lưu 1 size duy nhất (Ví dụ: XL)
    SKU VARCHAR(50) NULL,             -- Mã kho (Ví dụ: BLAZ-DEN-XL)
    IsActive BIT DEFAULT 1,           -- 1: Bật (Hiện trên web), 0: Tắt
    IsDeleted BIT DEFAULT 0,          -- 1: Đã xóa mềm
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE();
GO

-- Cập nhật dữ liệu mặc định cho các sản phẩm cũ
UPDATE Products 
SET IsActive = 1, IsDeleted = 0, CreatedAt = GETDATE(), UpdatedAt = GETDATE()
WHERE IsActive IS NULL;
GO
 
-----------------------
 CREATE TRIGGER trg_AutoUpdateStock
ON StockReceipts
AFTER INSERT
AS
BEGIN
    UPDATE p
    SET p.StockQuantity = ISNULL(p.StockQuantity, 0) + i.QuantityAdded,
        p.UpdatedAt = GETDATE()
    FROM Products p
    INNER JOIN inserted i ON p.ProductID = i.ProductID;
END;
GO


----------------

-- ==============================================================================
-- BƯỚC 1: CẬP NHẬT CẤU TRÚC BẢNG SẢN PHẨM (CHUẨN 1 DÒNG = 1 BIẾN THỂ)
-- ==============================================================================
BEGIN TRY ALTER TABLE Products DROP COLUMN Colors; END TRY BEGIN CATCH END CATCH;
BEGIN TRY ALTER TABLE Products DROP COLUMN Sizes; END TRY BEGIN CATCH END CATCH;
 

-- Ẩn dữ liệu lỗi thời để tránh xung đột
UPDATE Products SET IsActive = 0, IsDeleted = 1;
GO

-- ==============================================================================
-- BƯỚC 2: ĐỔ DỮ LIỆU MẪU ĐỂ TEST TÍNH NĂNG GIẢM GIÁ
-- ==============================================================================
INSERT INTO [dbo].[Products] 
    ([Name], [Price], [OriginalPrice], [CategoryID], [SupplierID], [Description], [ImageUrl], [Badge], [ProductGroupID], [Color], [Size], [SKU], [StockQuantity], [CreatedBy], [IsActive], [CreatedAt])
VALUES
-- 1. SẢN PHẨM MỚI NHẬP (Tháng này) -> Ngày tạo là GETDATE() -> Không bị giảm giá
(N'Quần short nam Regular Fit', 995000, 995000, 2, 4, N'Hàng mới nhập, chưa quá hạn', 'https://cdn.hstatic.net/products/200000887901/22_ef82f2cdc77141b99873e8c8a05973a8.jpg', N'MỚI', 'ASO225', N'Xám', '29', 'ASO225-XAM-29', 20, 1, 1, GETDATE()),
(N'Quần short nam Regular Fit', 995000, 995000, 2, 4, N'Hàng mới nhập, chưa quá hạn', 'https://cdn.hstatic.net/products/200000887901/22_ef82f2cdc77141b99873e8c8a05973a8.jpg', N'MỚI', 'ASO225', N'Be', '30', 'ASO225-BE-30', 15, 1, 1, GETDATE()),

-- 2. SẢN PHẨM TỒN KHO LÂU (Nhập từ 7 tháng trước) -> Dùng hàm DATEADD lùi 7 tháng
(N'Quần kaki nam Regular Fit', 950000, 950000, 2, 4, N'Hàng tồn kho 7 tháng', 'https://cdn.hstatic.net/products/200000887901/a0137-1536x1536_c3626c5fdee7451189d6498ae6b3100a.jpg', NULL, 'AKK004', N'Xanh nhạt', '30', 'AKK-XANH-30', 50, 1, 1, DATEADD(MONTH, -7, GETDATE())),
(N'Cà vạt nam đan lát', 450000, 450000, 4, 8, N'Hàng tồn kho 8 tháng', 'https://cdn.hstatic.net/products/200000887901/dsc09843_ba757f0103fb4726aaa09a630e9c27d9.jpg', NULL, 'CAVAT-01', N'Đỏ đô', 'Free Size', 'CV-DO', 25, 1, 1, DATEADD(MONTH, -8, GETDATE()));
GO

-- ==============================================================================
-- BƯỚC 3: TẠO HÀM TỰ ĐỘNG GIẢM GIÁ (STORED PROCEDURE)
-- ==============================================================================
CREATE OR ALTER PROCEDURE sp_AutoClearanceSale
AS
BEGIN
    -- Cập nhật Price = OriginalPrice * 80% (Tức là giảm 20%)
    UPDATE Products
    SET Price = OriginalPrice * 0.8,
        Badge = N'XẢ KHO 20%',  -- Đổi luôn nhãn hiển thị cho nổi bật
        UpdatedAt = GETDATE()
    WHERE 
        DATEDIFF(MONTH, CreatedAt, GETDATE()) >= 6 -- 1. Đã qua 6 tháng kể từ lúc tạo
        AND StockQuantity > 0                      -- 2. Vẫn còn hàng tồn kho
        AND Price = OriginalPrice                  -- 3. Chưa bị giảm giá trước đó
        AND IsActive = 1 AND IsDeleted = 0;        -- 4. Sản phẩm vẫn đang hiển thị
END;
GO

------------------- 
-- ==============================================================================
-- TỰ ĐỘNG CẬP NHẬT GIẢM GIÁ (SALE) VÀ NHÃN BÁN CHẠY (BEST SELLER)
-- Logic mới: BEST SELLER dựa trên số lượng đơn hàng xuất hiện
-- ==============================================================================
CREATE OR ALTER PROCEDURE sp_AutoClearanceSale
AS
BEGIN
    -- 1. Xóa nhãn BEST SELLER cũ để reset lại bảng xếp hạng mỗi ngày
    UPDATE Products 
    SET Badge = NULL 
    WHERE Badge = 'BEST SELLER';

    -- 2. Quét hàng tồn 6 tháng -> Giảm giá 20% và gán nhãn SALE
    UPDATE Products
    SET 
        Price = CASE WHEN Price = OriginalPrice THEN OriginalPrice * 0.8 ELSE Price END,
        Badge = 'SALE',
        UpdatedAt = GETDATE()
    WHERE 
        DATEDIFF(MONTH, CreatedAt, GETDATE()) >= 6 
        AND StockQuantity > 0                      
        AND IsActive = 1 AND IsDeleted = 0;

    -- 3. Tìm Top 10 sản phẩm có TẦN SUẤT mua cao nhất và gán BEST SELLER
    -- (Ghi đè lên nhãn SALE nếu sản phẩm đó vừa giảm giá vừa lọt Top bán chạy)
    WITH PopularProducts AS (
        SELECT TOP 10 
            od.ProductID, 
            COUNT(DISTINCT od.OrderID) AS OrderCount -- Đếm số đơn hàng khác nhau chứa SP này
        FROM OrderDetails od
        JOIN Orders o ON od.OrderID = o.OrderID
        WHERE o.Status = N'Đã giao' -- Chỉ tính các đơn đã giao thành công
        GROUP BY od.ProductID
        ORDER BY OrderCount DESC
    )
    UPDATE p
    SET p.Badge = 'BEST SELLER',
        p.UpdatedAt = GETDATE()
    FROM Products p
    INNER JOIN PopularProducts pp ON p.ProductID = pp.ProductID
    WHERE p.IsActive = 1 AND p.IsDeleted = 0;
END;
GO

--------------------
-- ==============================================================================
-- 1. ẨN TOÀN BỘ SẢN PHẨM CŨ ĐỂ LÀM SẠCH GIAO DIỆN (Xóa mềm)
-- ==============================================================================
UPDATE Products SET IsActive = 0, IsDeleted = 1;
GO

-- ==============================================================================
-- 2. THÊM BỘ DỮ LIỆU MỚI ĐỒNG BỘ 100% (1 Dòng = 1 Màu + 1 Size + 1 Ảnh riêng)
-- ==============================================================================
INSERT INTO [dbo].[Products] 
    ([Name], [Price], [OriginalPrice], [CategoryID], [SupplierID], [Description], [ImageUrl], [Badge], [ProductGroupID], [Color], [Size], [SKU], [StockQuantity], [CreatedBy], [IsActive], [CreatedAt])
VALUES
-- ------------------------------------------------------------------------------------------------
-- 1. QUẦN KAKI NAM REGULAR FIT (Nhóm: QKK-REG | Categoy: 2) | Màu: Xám, Đen | Size: 30-34
-- ------------------------------------------------------------------------------------------------
-- Màu Xám
(N'Quần kaki nam Regular Fit', 950000, 950000, 2, 4, N'Quần kaki nam phom Regular Fit suông nhẹ, thoải mái.', 'https://product.hstatic.net/200000887901/product/nam-aristino-regular-fit-akk0040z__3__01d67bb2fbc9470fbcca777da507c802_3647df3852a14b659165c509859cb627.jpg', N'MỚI', 'QKK-REG', N'Xám', '30', 'QKK-XAM-30', 50, 1, 1, GETDATE()),
(N'Quần kaki nam Regular Fit', 950000, 950000, 2, 4, N'Quần kaki nam phom Regular Fit suông nhẹ, thoải mái.', 'https://product.hstatic.net/200000887901/product/nam-aristino-regular-fit-akk0040z__3__01d67bb2fbc9470fbcca777da507c802_3647df3852a14b659165c509859cb627.jpg', N'MỚI', 'QKK-REG', N'Xám', '31', 'QKK-XAM-31', 50, 1, 1, GETDATE()),
(N'Quần kaki nam Regular Fit', 950000, 950000, 2, 4, N'Quần kaki nam phom Regular Fit suông nhẹ, thoải mái.', 'https://product.hstatic.net/200000887901/product/nam-aristino-regular-fit-akk0040z__3__01d67bb2fbc9470fbcca777da507c802_3647df3852a14b659165c509859cb627.jpg', N'MỚI', 'QKK-REG', N'Xám', '32', 'QKK-XAM-32', 50, 1, 1, GETDATE()),
(N'Quần kaki nam Regular Fit', 950000, 950000, 2, 4, N'Quần kaki nam phom Regular Fit suông nhẹ, thoải mái.', 'https://product.hstatic.net/200000887901/product/nam-aristino-regular-fit-akk0040z__3__01d67bb2fbc9470fbcca777da507c802_3647df3852a14b659165c509859cb627.jpg', N'MỚI', 'QKK-REG', N'Xám', '33', 'QKK-XAM-33', 50, 1, 1, GETDATE()),
(N'Quần kaki nam Regular Fit', 950000, 950000, 2, 4, N'Quần kaki nam phom Regular Fit suông nhẹ, thoải mái.', 'https://product.hstatic.net/200000887901/product/nam-aristino-regular-fit-akk0040z__3__01d67bb2fbc9470fbcca777da507c802_3647df3852a14b659165c509859cb627.jpg', N'MỚI', 'QKK-REG', N'Xám', '34', 'QKK-XAM-34', 50, 1, 1, GETDATE()),
-- Màu Đen
(N'Quần kaki nam Regular Fit', 950000, 950000, 2, 4, N'Quần kaki nam phom Regular Fit suông nhẹ, thoải mái.', 'https://product.hstatic.net/200000887901/product/am-aristino-regular-fit-akk0040z__26__939e36e848c74623bbaa37f79ad39732_c71f3f0f8ceb4e5a8ac4d2b1b457475a.jpg', N'MỚI', 'QKK-REG', N'Đen', '30', 'QKK-DEN-30', 50, 1, 1, GETDATE()),
(N'Quần kaki nam Regular Fit', 950000, 950000, 2, 4, N'Quần kaki nam phom Regular Fit suông nhẹ, thoải mái.', 'https://product.hstatic.net/200000887901/product/am-aristino-regular-fit-akk0040z__26__939e36e848c74623bbaa37f79ad39732_c71f3f0f8ceb4e5a8ac4d2b1b457475a.jpg', N'MỚI', 'QKK-REG', N'Đen', '31', 'QKK-DEN-31', 50, 1, 1, GETDATE()),
(N'Quần kaki nam Regular Fit', 950000, 950000, 2, 4, N'Quần kaki nam phom Regular Fit suông nhẹ, thoải mái.', 'https://product.hstatic.net/200000887901/product/am-aristino-regular-fit-akk0040z__26__939e36e848c74623bbaa37f79ad39732_c71f3f0f8ceb4e5a8ac4d2b1b457475a.jpg', N'MỚI', 'QKK-REG', N'Đen', '32', 'QKK-DEN-32', 50, 1, 1, GETDATE()),
(N'Quần kaki nam Regular Fit', 950000, 950000, 2, 4, N'Quần kaki nam phom Regular Fit suông nhẹ, thoải mái.', 'https://product.hstatic.net/200000887901/product/am-aristino-regular-fit-akk0040z__26__939e36e848c74623bbaa37f79ad39732_c71f3f0f8ceb4e5a8ac4d2b1b457475a.jpg', N'MỚI', 'QKK-REG', N'Đen', '33', 'QKK-DEN-33', 50, 1, 1, GETDATE()),
(N'Quần kaki nam Regular Fit', 950000, 950000, 2, 4, N'Quần kaki nam phom Regular Fit suông nhẹ, thoải mái.', 'https://product.hstatic.net/200000887901/product/am-aristino-regular-fit-akk0040z__26__939e36e848c74623bbaa37f79ad39732_c71f3f0f8ceb4e5a8ac4d2b1b457475a.jpg', N'MỚI', 'QKK-REG', N'Đen', '34', 'QKK-DEN-34', 50, 1, 1, GETDATE()),

-- ------------------------------------------------------------------------------------------------
-- 2. ÁO SƠ MI NAM BUSINESS REGULAR FIT (Nhóm: ASM-BUS | Categoy: 1) | Màu: Đen kẻ sọc cam | Size: 38-42
-- ------------------------------------------------------------------------------------------------
(N'Áo Sơ Mi Nam Business', 1700000, 1700000, 1, 4, N'Form slim fit ôm gọn theo tinh thần tối giản hiện đại.', 'https://cdn.hstatic.net/products/200000887901/dsc00589_950415b3ee514227a3c2e787f5e4f0bf_6c699e53b5224ef497da6451e0838295.jpg', N'MỚI', 'ASM-BUS', N'Đen kẻ sọc cam', '38', 'ASM-DEN-38', 30, 1, 1, GETDATE()),
(N'Áo Sơ Mi Nam Business', 1700000, 1700000, 1, 4, N'Form slim fit ôm gọn theo tinh thần tối giản hiện đại.', 'https://cdn.hstatic.net/products/200000887901/dsc00589_950415b3ee514227a3c2e787f5e4f0bf_6c699e53b5224ef497da6451e0838295.jpg', N'MỚI', 'ASM-BUS', N'Đen kẻ sọc cam', '39', 'ASM-DEN-39', 30, 1, 1, GETDATE()),
(N'Áo Sơ Mi Nam Business', 1700000, 1700000, 1, 4, N'Form slim fit ôm gọn theo tinh thần tối giản hiện đại.', 'https://cdn.hstatic.net/products/200000887901/dsc00589_950415b3ee514227a3c2e787f5e4f0bf_6c699e53b5224ef497da6451e0838295.jpg', N'MỚI', 'ASM-BUS', N'Đen kẻ sọc cam', '40', 'ASM-DEN-40', 30, 1, 1, GETDATE()),
(N'Áo Sơ Mi Nam Business', 1700000, 1700000, 1, 4, N'Form slim fit ôm gọn theo tinh thần tối giản hiện đại.', 'https://cdn.hstatic.net/products/200000887901/dsc00589_950415b3ee514227a3c2e787f5e4f0bf_6c699e53b5224ef497da6451e0838295.jpg', N'MỚI', 'ASM-BUS', N'Đen kẻ sọc cam', '41', 'ASM-DEN-41', 30, 1, 1, GETDATE()),
(N'Áo Sơ Mi Nam Business', 1700000, 1700000, 1, 4, N'Form slim fit ôm gọn theo tinh thần tối giản hiện đại.', 'https://cdn.hstatic.net/products/200000887901/dsc00589_950415b3ee514227a3c2e787f5e4f0bf_6c699e53b5224ef497da6451e0838295.jpg', N'MỚI', 'ASM-BUS', N'Đen kẻ sọc cam', '42', 'ASM-DEN-42', 30, 1, 1, GETDATE()),

-- ------------------------------------------------------------------------------------------------
-- 3. QUẦN ÂU NAM (Nhóm: QAU | Categoy: 2) | Màu: Trắng, Be | Size: 30-34
-- ------------------------------------------------------------------------------------------------
-- Màu Trắng
(N'Quần âu nam', 1250000, 1250000, 2, 5, N'Quần âu nam thiết kế tinh tế, lịch lãm dành cho doanh nhân.', 'https://cdn.hstatic.net/products/200000887901/a0579-1536x1536_6939a707e59a4c0e82f3f386b097ffa6.jpg', NULL, 'QAU', N'Trắng', '30', 'QAU-TRA-30', 40, 1, 1, GETDATE()),
(N'Quần âu nam', 1250000, 1250000, 2, 5, N'Quần âu nam thiết kế tinh tế, lịch lãm dành cho doanh nhân.', 'https://cdn.hstatic.net/products/200000887901/a0579-1536x1536_6939a707e59a4c0e82f3f386b097ffa6.jpg', NULL, 'QAU', N'Trắng', '31', 'QAU-TRA-31', 40, 1, 1, GETDATE()),
(N'Quần âu nam', 1250000, 1250000, 2, 5, N'Quần âu nam thiết kế tinh tế, lịch lãm dành cho doanh nhân.', 'https://cdn.hstatic.net/products/200000887901/a0579-1536x1536_6939a707e59a4c0e82f3f386b097ffa6.jpg', NULL, 'QAU', N'Trắng', '32', 'QAU-TRA-32', 40, 1, 1, GETDATE()),
(N'Quần âu nam', 1250000, 1250000, 2, 5, N'Quần âu nam thiết kế tinh tế, lịch lãm dành cho doanh nhân.', 'https://cdn.hstatic.net/products/200000887901/a0579-1536x1536_6939a707e59a4c0e82f3f386b097ffa6.jpg', NULL, 'QAU', N'Trắng', '33', 'QAU-TRA-33', 40, 1, 1, GETDATE()),
(N'Quần âu nam', 1250000, 1250000, 2, 5, N'Quần âu nam thiết kế tinh tế, lịch lãm dành cho doanh nhân.', 'https://cdn.hstatic.net/products/200000887901/a0579-1536x1536_6939a707e59a4c0e82f3f386b097ffa6.jpg', NULL, 'QAU', N'Trắng', '34', 'QAU-TRA-34', 40, 1, 1, GETDATE()),
-- Màu Be
(N'Quần âu nam', 1250000, 1250000, 2, 5, N'Quần âu nam thiết kế tinh tế, lịch lãm dành cho doanh nhân.', 'https://product.hstatic.net/200000887901/product/-be-quan-au-nam-aristino-atr0420z__8__c635eedbc64848ddae1c1550be9b03b6_8713459c6583474a979f95a6effda8e6.jpg', NULL, 'QAU', N'Be', '30', 'QAU-BE-30', 40, 1, 1, GETDATE()),
(N'Quần âu nam', 1250000, 1250000, 2, 5, N'Quần âu nam thiết kế tinh tế, lịch lãm dành cho doanh nhân.', 'https://product.hstatic.net/200000887901/product/-be-quan-au-nam-aristino-atr0420z__8__c635eedbc64848ddae1c1550be9b03b6_8713459c6583474a979f95a6effda8e6.jpg', NULL, 'QAU', N'Be', '31', 'QAU-BE-31', 40, 1, 1, GETDATE()),
(N'Quần âu nam', 1250000, 1250000, 2, 5, N'Quần âu nam thiết kế tinh tế, lịch lãm dành cho doanh nhân.', 'https://product.hstatic.net/200000887901/product/-be-quan-au-nam-aristino-atr0420z__8__c635eedbc64848ddae1c1550be9b03b6_8713459c6583474a979f95a6effda8e6.jpg', NULL, 'QAU', N'Be', '32', 'QAU-BE-32', 40, 1, 1, GETDATE()),
(N'Quần âu nam', 1250000, 1250000, 2, 5, N'Quần âu nam thiết kế tinh tế, lịch lãm dành cho doanh nhân.', 'https://product.hstatic.net/200000887901/product/-be-quan-au-nam-aristino-atr0420z__8__c635eedbc64848ddae1c1550be9b03b6_8713459c6583474a979f95a6effda8e6.jpg', NULL, 'QAU', N'Be', '33', 'QAU-BE-33', 40, 1, 1, GETDATE()),
(N'Quần âu nam', 1250000, 1250000, 2, 5, N'Quần âu nam thiết kế tinh tế, lịch lãm dành cho doanh nhân.', 'https://product.hstatic.net/200000887901/product/-be-quan-au-nam-aristino-atr0420z__8__c635eedbc64848ddae1c1550be9b03b6_8713459c6583474a979f95a6effda8e6.jpg', NULL, 'QAU', N'Be', '34', 'QAU-BE-34', 40, 1, 1, GETDATE()),

-- ------------------------------------------------------------------------------------------------
-- 4. QUẦN KAKI NAM CAO CẤP (Nhóm: QKK-CC | Categoy: 2) | Màu: Đen | Size: 30-34
-- ------------------------------------------------------------------------------------------------
(N'Quần kaki nam cao cấp', 850000, 850000, 2, 4, N'Quần kaki nam công sở cao cấp Merriman, form chuẩn.', 'https://cdn.hstatic.net/products/200000887901/dsc01744_f3d33e47232c46669aed772abee8a623.jpg', NULL, 'QKK-CC', N'Đen', '30', 'QKKC-DEN-30', 60, 1, 1, GETDATE()),
(N'Quần kaki nam cao cấp', 850000, 850000, 2, 4, N'Quần kaki nam công sở cao cấp Merriman, form chuẩn.', 'https://cdn.hstatic.net/products/200000887901/dsc01744_f3d33e47232c46669aed772abee8a623.jpg', NULL, 'QKK-CC', N'Đen', '31', 'QKKC-DEN-31', 60, 1, 1, GETDATE()),
(N'Quần kaki nam cao cấp', 850000, 850000, 2, 4, N'Quần kaki nam công sở cao cấp Merriman, form chuẩn.', 'https://cdn.hstatic.net/products/200000887901/dsc01744_f3d33e47232c46669aed772abee8a623.jpg', NULL, 'QKK-CC', N'Đen', '32', 'QKKC-DEN-32', 60, 1, 1, GETDATE()),
(N'Quần kaki nam cao cấp', 850000, 850000, 2, 4, N'Quần kaki nam công sở cao cấp Merriman, form chuẩn.', 'https://cdn.hstatic.net/products/200000887901/dsc01744_f3d33e47232c46669aed772abee8a623.jpg', NULL, 'QKK-CC', N'Đen', '33', 'QKKC-DEN-33', 60, 1, 1, GETDATE()),
(N'Quần kaki nam cao cấp', 850000, 850000, 2, 4, N'Quần kaki nam công sở cao cấp Merriman, form chuẩn.', 'https://cdn.hstatic.net/products/200000887901/dsc01744_f3d33e47232c46669aed772abee8a623.jpg', NULL, 'QKK-CC', N'Đen', '34', 'QKKC-DEN-34', 60, 1, 1, GETDATE()),

-- ------------------------------------------------------------------------------------------------
-- 5. CÀ VẠT NAM BẢN TO ĐAN LÁT (Nhóm: CAVAT-DL | Categoy: 4) | Màu: Đen | Size: Free Size
-- ------------------------------------------------------------------------------------------------
(N'Cà vạt nam bản to đan lát', 450000, 450000, 4, 8, N'Cà vạt nam bản to họa tiết đan lát sang trọng.', 'https://cdn.hstatic.net/products/200000887901/dsc09882_f7f0f98692aa4e3ab5b5f7da9e1c6852.jpg', NULL, 'CAVAT-DL', N'Đen', 'Free Size', 'CV-DEN', 80, 1, 1, GETDATE()),

-- ------------------------------------------------------------------------------------------------
-- 6. ÁO KHOÁC 2 LỚP NAM REGULAR FIT (Nhóm: AK2L | Categoy: 1) | Màu: Nâu, Xanh rêu, Xám | Size: S-XXL
-- ------------------------------------------------------------------------------------------------
-- Màu Nâu
(N'Áo Khoác 2 lớp Nam Regular Fit', 2040000, 2040000, 1, 4, N'Phong cách Urban Gentleman Quý ông Đô thị.', 'https://cdn.hstatic.net/products/200000887901/dsc00631_1942f21bf9f744f8afcca4c35ce0138c_bb4d8d454f5c4d87a0d8aa4772fb3a4c.jpg', N'MỚI', 'AK2L', N'Nâu', 'S', 'AK2L-NAU-S', 20, 1, 1, GETDATE()),
(N'Áo Khoác 2 lớp Nam Regular Fit', 2040000, 2040000, 1, 4, N'Phong cách Urban Gentleman Quý ông Đô thị.', 'https://cdn.hstatic.net/products/200000887901/dsc00631_1942f21bf9f744f8afcca4c35ce0138c_bb4d8d454f5c4d87a0d8aa4772fb3a4c.jpg', N'MỚI', 'AK2L', N'Nâu', 'M', 'AK2L-NAU-M', 20, 1, 1, GETDATE()),
(N'Áo Khoác 2 lớp Nam Regular Fit', 2040000, 2040000, 1, 4, N'Phong cách Urban Gentleman Quý ông Đô thị.', 'https://cdn.hstatic.net/products/200000887901/dsc00631_1942f21bf9f744f8afcca4c35ce0138c_bb4d8d454f5c4d87a0d8aa4772fb3a4c.jpg', N'MỚI', 'AK2L', N'Nâu', 'L', 'AK2L-NAU-L', 20, 1, 1, GETDATE()),
(N'Áo Khoác 2 lớp Nam Regular Fit', 2040000, 2040000, 1, 4, N'Phong cách Urban Gentleman Quý ông Đô thị.', 'https://cdn.hstatic.net/products/200000887901/dsc00631_1942f21bf9f744f8afcca4c35ce0138c_bb4d8d454f5c4d87a0d8aa4772fb3a4c.jpg', N'MỚI', 'AK2L', N'Nâu', 'XL', 'AK2L-NAU-XL', 20, 1, 1, GETDATE()),
(N'Áo Khoác 2 lớp Nam Regular Fit', 2040000, 2040000, 1, 4, N'Phong cách Urban Gentleman Quý ông Đô thị.', 'https://cdn.hstatic.net/products/200000887901/dsc00631_1942f21bf9f744f8afcca4c35ce0138c_bb4d8d454f5c4d87a0d8aa4772fb3a4c.jpg', N'MỚI', 'AK2L', N'Nâu', 'XXL', 'AK2L-NAU-XXL', 20, 1, 1, GETDATE()),
-- Màu Xanh rêu
(N'Áo Khoác 2 lớp Nam Regular Fit', 2040000, 2040000, 1, 4, N'Phong cách Urban Gentleman Quý ông Đô thị.', 'https://cdn.hstatic.net/products/200000887901/dsc00228_113e923123b74103baea67f8134e8fa9_6bd7bc3b7b874c6a8b3c700340c90bb6.jpg', N'MỚI', 'AK2L', N'Xanh rêu', 'S', 'AK2L-XREU-S', 20, 1, 1, GETDATE()),
(N'Áo Khoác 2 lớp Nam Regular Fit', 2040000, 2040000, 1, 4, N'Phong cách Urban Gentleman Quý ông Đô thị.', 'https://cdn.hstatic.net/products/200000887901/dsc00228_113e923123b74103baea67f8134e8fa9_6bd7bc3b7b874c6a8b3c700340c90bb6.jpg', N'MỚI', 'AK2L', N'Xanh rêu', 'M', 'AK2L-XREU-M', 20, 1, 1, GETDATE()),
(N'Áo Khoác 2 lớp Nam Regular Fit', 2040000, 2040000, 1, 4, N'Phong cách Urban Gentleman Quý ông Đô thị.', 'https://cdn.hstatic.net/products/200000887901/dsc00228_113e923123b74103baea67f8134e8fa9_6bd7bc3b7b874c6a8b3c700340c90bb6.jpg', N'MỚI', 'AK2L', N'Xanh rêu', 'L', 'AK2L-XREU-L', 20, 1, 1, GETDATE()),
(N'Áo Khoác 2 lớp Nam Regular Fit', 2040000, 2040000, 1, 4, N'Phong cách Urban Gentleman Quý ông Đô thị.', 'https://cdn.hstatic.net/products/200000887901/dsc00228_113e923123b74103baea67f8134e8fa9_6bd7bc3b7b874c6a8b3c700340c90bb6.jpg', N'MỚI', 'AK2L', N'Xanh rêu', 'XL', 'AK2L-XREU-XL', 20, 1, 1, GETDATE()),
(N'Áo Khoác 2 lớp Nam Regular Fit', 2040000, 2040000, 1, 4, N'Phong cách Urban Gentleman Quý ông Đô thị.', 'https://cdn.hstatic.net/products/200000887901/dsc00228_113e923123b74103baea67f8134e8fa9_6bd7bc3b7b874c6a8b3c700340c90bb6.jpg', N'MỚI', 'AK2L', N'Xanh rêu', 'XXL', 'AK2L-XREU-XXL', 20, 1, 1, GETDATE()),
-- Màu Xám
(N'Áo Khoác 2 lớp Nam Regular Fit', 2040000, 2040000, 1, 4, N'Phong cách Urban Gentleman Quý ông Đô thị.', 'https://cdn.hstatic.net/products/200000887901/dsc00160_12e96db0f6934af1a875be89fbfdfaad_077392b9593e4eb6b10d161d8ae84cb9.jpg', N'MỚI', 'AK2L', N'Xám', 'S', 'AK2L-XAM-S', 20, 1, 1, GETDATE()),
(N'Áo Khoác 2 lớp Nam Regular Fit', 2040000, 2040000, 1, 4, N'Phong cách Urban Gentleman Quý ông Đô thị.', 'https://cdn.hstatic.net/products/200000887901/dsc00160_12e96db0f6934af1a875be89fbfdfaad_077392b9593e4eb6b10d161d8ae84cb9.jpg', N'MỚI', 'AK2L', N'Xám', 'M', 'AK2L-XAM-M', 20, 1, 1, GETDATE()),
(N'Áo Khoác 2 lớp Nam Regular Fit', 2040000, 2040000, 1, 4, N'Phong cách Urban Gentleman Quý ông Đô thị.', 'https://cdn.hstatic.net/products/200000887901/dsc00160_12e96db0f6934af1a875be89fbfdfaad_077392b9593e4eb6b10d161d8ae84cb9.jpg', N'MỚI', 'AK2L', N'Xám', 'L', 'AK2L-XAM-L', 20, 1, 1, GETDATE()),
(N'Áo Khoác 2 lớp Nam Regular Fit', 2040000, 2040000, 1, 4, N'Phong cách Urban Gentleman Quý ông Đô thị.', 'https://cdn.hstatic.net/products/200000887901/dsc00160_12e96db0f6934af1a875be89fbfdfaad_077392b9593e4eb6b10d161d8ae84cb9.jpg', N'MỚI', 'AK2L', N'Xám', 'XL', 'AK2L-XAM-XL', 20, 1, 1, GETDATE()),
(N'Áo Khoác 2 lớp Nam Regular Fit', 2040000, 2040000, 1, 4, N'Phong cách Urban Gentleman Quý ông Đô thị.', 'https://cdn.hstatic.net/products/200000887901/dsc00160_12e96db0f6934af1a875be89fbfdfaad_077392b9593e4eb6b10d161d8ae84cb9.jpg', N'MỚI', 'AK2L', N'Xám', 'XXL', 'AK2L-XAM-XXL', 20, 1, 1, GETDATE()),

-- ------------------------------------------------------------------------------------------------
-- 7. ÁO SƠ MI NAM TRẮNG SOLID (Nhóm: ASM-TRANG | Categoy: 1) | Màu: Trắng | Size: 39-42
-- ------------------------------------------------------------------------------------------------
(N'Áo Sơ Mi Nam Trắng Solid', 950000, 950000, 1, 4, N'Form slim fit ôm gọn theo tinh thần tối giản hiện đại.', 'https://cdn.hstatic.net/products/200000887901/0b9a9166_1_copy_86e8b01a010d4da0b12a5305602a7c35.jpg', NULL, 'ASM-TRANG', N'Trắng', '39', 'ASMT-TRA-39', 40, 1, 1, GETDATE()),
(N'Áo Sơ Mi Nam Trắng Solid', 950000, 950000, 1, 4, N'Form slim fit ôm gọn theo tinh thần tối giản hiện đại.', 'https://cdn.hstatic.net/products/200000887901/0b9a9166_1_copy_86e8b01a010d4da0b12a5305602a7c35.jpg', NULL, 'ASM-TRANG', N'Trắng', '40', 'ASMT-TRA-40', 40, 1, 1, GETDATE()),
(N'Áo Sơ Mi Nam Trắng Solid', 950000, 950000, 1, 4, N'Form slim fit ôm gọn theo tinh thần tối giản hiện đại.', 'https://cdn.hstatic.net/products/200000887901/0b9a9166_1_copy_86e8b01a010d4da0b12a5305602a7c35.jpg', NULL, 'ASM-TRANG', N'Trắng', '41', 'ASMT-TRA-41', 40, 1, 1, GETDATE()),
(N'Áo Sơ Mi Nam Trắng Solid', 950000, 950000, 1, 4, N'Form slim fit ôm gọn theo tinh thần tối giản hiện đại.', 'https://cdn.hstatic.net/products/200000887901/0b9a9166_1_copy_86e8b01a010d4da0b12a5305602a7c35.jpg', NULL, 'ASM-TRANG', N'Trắng', '42', 'ASMT-TRA-42', 40, 1, 1, GETDATE()),

-- ------------------------------------------------------------------------------------------------
-- 8. THẮT LƯNG NAM DA BÒ MÀU (Nhóm: TL-MAU | Categoy: 4) | Màu: Xanh navy, Nâu trơn | Size: Free Size
-- ------------------------------------------------------------------------------------------------
(N'Thắt Lưng Nam Da Bò', 1950000, 1950000, 4, 8, N'Chất liệu dây da bò cao cấp được nhập khẩu.', 'https://cdn.hstatic.net/products/200000887901/dsc02325_be183c9a4b10463da1dd2b8b1ec66034.jpg', N'MỚI', 'TL-MAU', N'Xanh navy', 'Free Size', 'TL-NAVY', 30, 1, 1, GETDATE()),
(N'Thắt Lưng Nam Da Bò', 1950000, 1950000, 4, 8, N'Chất liệu dây da bò cao cấp được nhập khẩu.', 'https://cdn.hstatic.net/products/200000887901/dsc02348_dd98f33357a04c2a96c1c84ecc2896aa.jpg', N'MỚI', 'TL-MAU', N'Nâu trơn', 'Free Size', 'TL-NAU', 30, 1, 1, GETDATE());
GO
 

 -- ==============================================================================
-- CẬP NHẬT DỮ LIỆU CHO CÁC SẢN PHẨM BỊ NULL (TỪ ID 6 ĐẾN ID 12)
-- ==============================================================================

-- 1. Cập nhật cho ID 6 (Quần âu nam)
UPDATE Products 
SET ProductGroupID = 'QAU', 
    Color = N'Đen', 
    Size = '30', 
    SKU = 'QAU-DEN-30',
    UpdatedAt = GETDATE()
WHERE ProductID = 6;

-- 2. Cập nhật cho ID 7 (Cà vạt nam bản to đan lát)
UPDATE Products 
SET ProductGroupID = 'CAVAT-DL', 
    Color = N'Đỏ đô', 
    Size = 'Free Size', 
    SKU = 'CV-DO-01',
    UpdatedAt = GETDATE()
WHERE ProductID = 7;

-- 3. Cập nhật cho ID 8 (Thắt lưng nam Leather)
UPDATE Products 
SET ProductGroupID = 'TL-LEATHER', 
    Color = N'Đen', 
    Size = 'Free Size', 
    SKU = 'TL-DEN-01',
    UpdatedAt = GETDATE()
WHERE ProductID = 8;

-- 4. Cập nhật cho ID 9 (Cặp tài liệu nam da bò Epsom)
UPDATE Products 
SET ProductGroupID = 'CAP-EPSOM', 
    Color = N'Đen', 
    Size = 'Free Size', 
    SKU = 'CAP-DEN-01',
    UpdatedAt = GETDATE()
WHERE ProductID = 9;

-- 5. Cập nhật cho ID 10 (Ghim cài áo cao cấp - Bạc)
UPDATE Products 
SET ProductGroupID = 'GHIM-CAI', 
    Color = N'Bạc', 
    Size = 'Free Size', 
    SKU = 'GHIM-BAC-01',
    UpdatedAt = GETDATE()
WHERE ProductID = 10;

-- 6. Cập nhật cho ID 11 (Ghim cài áo cao cấp - Vàng kim)
UPDATE Products 
SET ProductGroupID = 'GHIM-CAI', 
    Color = N'Vàng kim', 
    Size = 'Free Size', 
    SKU = 'GHIM-VANG-01',
    UpdatedAt = GETDATE()
WHERE ProductID = 11;

-- 7. Cập nhật cho ID 12 (Ghim cài áo cao cấp - Bạc đính đá)
UPDATE Products 
SET ProductGroupID = 'GHIM-CAI', 
    Color = N'Bạc đính đá', 
    Size = 'Free Size', 
    SKU = 'GHIM-BAC-02',
    UpdatedAt = GETDATE()
WHERE ProductID = 12;
GO

-----------------------


-- 1. Cập nhật thông tin cho Công ty TNHH Dệt may Phong Phú (ID: 4)
UPDATE Suppliers
SET ContactPerson = N'Nguyễn Văn Phong',
    Phone = '0903123456',
    Email = 'phongphu@gmail,com',
    Address = N'115 Tự Cường, Phường 4, Quận Tân Bình, TP. Hồ Chí Minh',
    BankName = N'Ngân hàng Vietcombank (VCB)',
    BankAccount = '0071001234567',
    IsActive = 1
WHERE SupplierID = 4;

-- 2. Cập nhật thông tin cho Xưởng may Gia Định (ID: 5)
UPDATE Suppliers
SET ContactPerson = N'Trần Thị Định',
    Phone = '0918987654',
    Email = 'xuongmaygiadinh@gmail.com',
    Address = N'452 Bùi Hữu Nghĩa, Phường 2, Quận Bình Thạnh, TP. Hồ Chí Minh',
    BankName = N'Ngân hàng Techcombank (TCB)',
    BankAccount = '1903456789012',
    IsActive = 1
WHERE SupplierID = 5;

-- 3. Cập nhật thông tin cho Nhà phân phối Vinatex (ID: 6)
UPDATE Suppliers
SET ContactPerson = N'Lê Hoàng Vinh',
    Phone = '0982334455',
    Email = 'vinhlh@gmail.com',
    Address = N'10 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    BankName = N'Ngân hàng BIDV',
    BankAccount = '2111000123456',
    IsActive = 1
WHERE SupplierID = 6;

-- 4. Cập nhật thông tin cho Công ty Phụ kiện Thời trang Hưng Đạo (ID: 8)
UPDATE Suppliers
SET ContactPerson = N'Phạm Minh Đạo',
    Phone = '0934556677',
    Email = 'hungdaofashion@gmail.com',
    Address = N'789 Cách Mạng Tháng 8, Phường 5, Quận Tân Bình, TP. Hồ Chí Minh',
    BankName = N'Ngân hàng Agribank',
    BankAccount = '1600205123456',
    IsActive = 1
WHERE SupplierID = 8;


-- Đảm bảo xóa dữ liệu cũ để tránh trùng lặp khóa ngoại nếu chạy lại nhiều lần
DELETE FROM StockReceipts;
DELETE FROM PurchaseOrders;


------------Chạy delete ở 2 dòng trên xong mới chạy bên dưới -------
-- Chèn dữ liệu Đơn nhập hàng (Purchase Orders) dựa theo dòng thời gian dự án năm 2026
INSERT INTO PurchaseOrders (SupplierID, OrderDate, TotalAmount, AmountPaid, Notes, Status)
VALUES 
-- NCC Phong Phú (ID: 4)
(4, '2026-04-15 09:30:00', 55000000.00, 55000000.00, N'Nhập bổ sung lô hàng áo Blazer và quần Kaki chuẩn bị cho đợt mở bán hè', N'Hoàn tất'),
(4, '2026-05-01 14:20:00', 32000000.00, 20000000.00, N'Nhập bổ sung các mẫu Sơ mi Nam Business phân loại mới', N'Đang xử lý'),

-- NCC Xưởng may Gia Định (ID: 5)
(5, '2026-04-20 10:15:00', 42000000.00, 42000000.00, N'Nhập sỉ quần âu nam dáng Cropped trẻ trung đứng dáng', N'Hoàn tất'),

-- NCC Phụ kiện Hưng Đạo (ID: 8)
(8, '2026-04-28 11:00:00', 15000000.00, 10000000.00, N'Nhập lô ghim cài áo đính đá thủ công và thắt lưng da bò Epsom', N'Hoàn tất'),
(8, '2026-05-12 16:45:00', 8500000.00, 0.00, N'Nhập gấp phụ kiện cà vạt lụa bản to họa tiết đan lát', N'Chờ xác nhận');

-- Chèn dữ liệu Lịch sử biến động kho (Stock Receipts)
INSERT INTO StockReceipts (ProductID, QuantityAdded, EntryMethod, AdminID, EntryDate)
VALUES 
(1, 50, 'Manual', 1, '2026-04-15 10:00:00'),  -- Nhập 50 Áo Blazer (NCC 4)
(2, 40, 'Manual', 1, '2026-04-15 10:15:00'),  -- Nhập 40 Quần Kaki cao cấp (NCC 4)
(4, 60, 'CSV', 1, '2026-04-20 11:00:00'),     -- Nhập 60 Quần âu nam dáng Cropped (NCC 5)
(8, 30, 'Manual', 1, '2026-04-28 11:30:00'),  -- Nhập 30 Thắt lưng nam Leather (NCC 8)
(10, 100, 'Manual', 1, '2026-04-28 11:45:00');-- Nhập 100 Ghim cài áo cao cấp (NCC 8)