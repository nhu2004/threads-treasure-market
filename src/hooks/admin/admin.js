// Export all admin hooks from subdirectories

// Category hooks
export { usecategoryList, usecategoryCRUD } from "./category";

// Supplier hooks
export { usesupplierList, usesupplierCRUD } from "./supplier";

// Product hooks
export {
  useProductList,
  useDeleteProduct,
  useProductOptions,
  useAddCategory,
  useAddSupplier,
  useCreateProduct,
  useAdminProductDetail,
  useUpdateProduct,
  useAddProductForm,
  useUpdateProductForm,
} from "./product";

// Order hooks
export { useOrderList, useAdminOrderDetail, useUpdateOrderStatus } from "./order";

// User hooks
export { useCustomerList, useCustomerOrders } from "./user";

// Staff hooks
export { useStaffList, useStaffCRUD } from "./staff";

// Voucher hooks
export { useVoucherList, useVoucherCRUD } from "./voucher";

// Staff hooks
export { useStaffList as useStaffListFromStaff, useStaffCRUD as useStaffCRUDFromStaff } from "./staff";

// Dashboard hooks
export { useAnalyticsCharts, useDashboardCards, useRevenueChart } from "./index";