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
import PurchaseOrderList from "./admin/PurchaseOrders/PurchaseOrderList";
import CreatePurchaseOrder from "./admin/PurchaseOrders/CreatePurchaseOrder";

const Admin = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Analytics />} /> 
        <Route path="product" element={<ProductList />} />
        <Route path="product/add" element={<AddProduct />} />
        <Route path="product/update/:id" element={<UpdateProduct />} />
        <Route path="categories" element={<Category />} />
        <Route path="suppliers" element={<Supplier />} />
        
        {/* ROUTES CHO QUẢN LÝ NHẬP HÀNG (PO) */}
        <Route path="purchase-orders" element={<PurchaseOrderList />} />
        <Route path="purchase-orders/create" element={<CreatePurchaseOrder />} />
        
        <Route path="orders" element={<Order />} />
        <Route path="orders/update/:id" element={<UpdateOrder />} />
        <Route path="users" element={<CustomerList />} />
        <Route path="vouchers" element={<Voucher />} />
        <Route path="invoices" element={<Invoices />} />
      </Routes>
    </AdminLayout>
  );
};

export default Admin;