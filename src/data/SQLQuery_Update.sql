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