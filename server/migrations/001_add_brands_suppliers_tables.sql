-- SQL Migration Script: Thêm bảng Suppliers
-- Chạy script này trên SQL Server để thêm bảng nhà cung cấp

-- Kiểm tra xem bảng Suppliers đã tồn tại chưa
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = N'Suppliers')
BEGIN
    -- Tạo bảng Suppliers
    CREATE TABLE Suppliers (
        SupplierID INT PRIMARY KEY IDENTITY(1,1),
        Name NVARCHAR(255) NOT NULL,
        ContactPerson NVARCHAR(255),
        Email NVARCHAR(255),
        Phone NVARCHAR(20),
        Address NVARCHAR(MAX),
        Description NVARCHAR(MAX),
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );
    
    PRINT 'Bảng Suppliers đã được tạo thành công';
END
ELSE
BEGIN
    PRINT 'Bảng Suppliers đã tồn tại';
END;
GO


IF NOT EXISTS (SELECT * FROM Suppliers)
BEGIN
    INSERT INTO Suppliers (Name, ContactPerson, Email, Phone, Address, Description)
    VALUES 
    (N'Công ty may mặc Hùng Phát', N'Nguyễn Văn A', N'hungphat@gmail.com', N'0123456789', N'Số 10 Đường Lê Lợi, TP HCM', N'Nhà cung cấp vải may'),
    (N'Công ty vải HAFA', N'Trần Thị B', N'hafa@gmail.com', N'0987654321', N'Số 20 Đường Quang Trung, Hà Nội', N'Nhà cung cấp vải cao cấp'),
    (N'Công ty phụ kiện Minh Hiền', N'Lê Văn C', N'minhhien@gmail.com', N'0912345678', N'Số 30 Đường Nguyễn Huệ, Hải Phòng', N'Nhà cung cấp phụ kiện may mặc');
    
    PRINT 'Dữ liệu mẫu cho Suppliers đã được chèn';
END;
GO

PRINT 'Migration hoàn tất!';
