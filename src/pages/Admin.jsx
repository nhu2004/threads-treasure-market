import { Routes, Route } from "react-router-dom";
import AdminLayout from "./admin/AdminLayout"; 
import Analytics from "./admin/Analytics";
import ProductList from "./admin/Product/ProductList";
import AddProduct from "./admin/Product/AddProduct";
import UpdateProduct from "./admin/Product/UpdateProduct";
import Category from "./admin/Category";
import Supplier from "./admin/Supplier";
import Order from "./admin/Order";
import UpdateOrder from "./admin/Order/UpdateOrder";
import { CustomerList } from "./admin/User";
import Voucher from "./admin/Voucher";

// 1. IMPORT COMPONENT HÓA ĐƠN
import Invoices from "./admin/Invoices"; 

const Admin = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Analytics />} /> 
        
        {/* Đăng ký cả 2 đường dẫn (có 's' và không có 's') để chống lỗi màn hình trắng */}
        <Route path="/products" element={<ProductList />} />
        <Route path="/product" element={<ProductList />} />
        
        <Route path="/products/add" element={<AddProduct />} />
        <Route path="/product/add" element={<AddProduct />} />
        <Route path="/product/addproduct" element={<AddProduct />} /> {/* Dự phòng cho ảnh 3 */}
        
        <Route path="/products/update/:id" element={<UpdateProduct />} />
        <Route path="/product/update/:id" element={<UpdateProduct />} />
        
        <Route path="/categories" element={<Category />} />
        <Route path="/suppliers" element={<Supplier />} />
        <Route path="/orders" element={<Order />} />
        <Route path="/orders/update/:id" element={<UpdateOrder />} />
        <Route path="/users" element={<CustomerList />} />
        <Route path="/vouchers" element={<Voucher />} />
        
        {/* 2. KHAI BÁO ROUTE CHO HÓA ĐƠN ĐỂ HẾT BỊ TRẮNG TRANG */}
        <Route path="/invoices" element={<Invoices />} />

      </Routes>
    </AdminLayout>
  );
};

export default Admin;