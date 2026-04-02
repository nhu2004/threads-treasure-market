/**
 * Admin hooks - Organized by feature
 * - analytics: Dashboard analytics (existing)
 * - product: Product management (list, create, update, delete, options)
 * - brand: Brand management (list, CRUD)
 * - order: Order management (list, detail, status update)
 * - voucher: Voucher management (list, CRUD)
 * - user: User management (customers, orders)
 */

// Analytics hooks (existing)
export { default as useDashboardCards } from "./useDashboardCards";
export { default as useRevenueChart } from "./useRevenueChart";
export { default as useAnalyticsCharts } from "./useAnalyticsCharts";

// Product hooks
export * from "./product";

// Brand hooks
export * from "./brand";

// Category hooks
export * from "./category";

// Supplier hooks
export * from "./supplier";

// Order hooks
export * from "./order";

// Voucher hooks
export * from "./voucher";

// User hooks
export * from "./user";

// Staff hooks
export * from "./staff";






