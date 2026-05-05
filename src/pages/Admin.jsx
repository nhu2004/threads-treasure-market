import { Routes, Route } from "react-router-dom";
import AdminLayout from "./admin/AdminLayout"; 
import Analytics from "./admin/Analytics";
import ProductList from "./admin/Product/ProductList";
import AddProduct from "./admin/Product/AddProduct";
import UpdateProduct from "./admin/Product/UpdateProduct";
import Category from "./admin/Category";
import Supplier from "./admin/Supplier";
import Order from "./admin/Order";
import { CustomerList } from "./admin/User";
import Voucher from "./admin/Voucher";

const Admin = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Analytics />} /> 
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/add" element={<AddProduct />} />
        <Route path="/products/update/:id" element={<UpdateProduct />} />
        <Route path="/categories" element={<Category />} />
        <Route path="/suppliers" element={<Supplier />} />
        <Route path="/orders" element={<Order />} />
        <Route path="/users" element={<CustomerList />} />
        <Route path="/vouchers" element={<Voucher />} />
      </Routes>
    </AdminLayout>
  );
};

export default Admin;