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
import Invoices from "./admin/Invoices"; 

const Admin = () => {
  return (
    <AdminLayout>
      <Routes>
        {/* Đường dẫn tương đối: Không có dấu / ở đầu */}
        <Route path="/" element={<Analytics />} /> 
        
        {/* Quản lý sản phẩm: localhost:8080/admin/products */}
        <Route path="products" element={<ProductList />} />
        
        {/* Thêm sản phẩm: localhost:8080/admin/products/add */}
        <Route path="product/addproduct" element={<AddProduct />} />
        
        {/* Cập nhật sản phẩm: localhost:8080/admin/product/update/:id */}
        {/* Xóa dấu / ở đầu để tránh đè lên link /product/:id của người dùng */}
        <Route path="product/update/:id" element={<UpdateProduct />} />
        
        <Route path="categories" element={<Category />} />
        <Route path="suppliers" element={<Supplier />} />
        <Route path="orders" element={<Order />} />
        <Route path="orders/update/:id" element={<UpdateOrder />} />
        <Route path="users" element={<CustomerList />} />
        <Route path="vouchers" element={<Voucher />} />
        
        {/* Route Hóa đơn */}
        <Route path="invoices" element={<Invoices />} />
      </Routes>
    </AdminLayout>
  );
};

export default Admin;