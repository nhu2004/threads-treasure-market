// src/hooks/admin/useDashboardCards.js
import { useState, useEffect } from "react";
import productApi from "../../api/productApi";
import orderApi from "../../api/orderApi";
import analyticApi from "../../api/analyticApi";
import voucherApi from "../../api/voucherApi"; // 1. Nhớ import voucherApi nhé

/**
 * Custom hook to fetch dashboard card data (total products, orders, revenue, customers, vouchers)
 * @returns {Object} { cardData, loading, error }
 */
export default function useDashboardCards() {
  const [cardData, setCardData] = useState({
    product: 0,
    order: 0,
    revenue: 0,
    customers: 0,
    totalVouchers: 0 // 2. Khai báo thêm trạng thái mặc định cho Voucher
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Gọi tất cả API cùng lúc để tối ưu tốc độ load
        // 3. Bổ sung gọi API voucher (resVoucher)
        const [resBook, resOrder, resRevenue, resCustomer, resVoucher] = await Promise.all([
          productApi.getAll({}),
          orderApi.getAll({}),
          analyticApi.getTotalRevenue(),
          analyticApi.getCustomersThisYear(),
          voucherApi.getAll() 
        ]);

        // Cập nhật state một lần duy nhất
        setCardData({
          product: resBook?.products?.length || resBook?.count || 0,
          order: resOrder?.count || resOrder?.data?.length || 0,
          revenue: resRevenue?.data?.[0]?.revenue || 0,
          customers: resCustomer?.count || 0,
          // 4. Lấy số đếm danh sách voucher (tùy cấu trúc JSON API của bạn, tôi để sẵn 2 trường hợp phổ biến)
          totalVouchers: resVoucher?.vouchers?.length || resVoucher?.count || 0
        });
      } catch (err) {
        console.error("Error fetching dashboard cards:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCardData();
  }, []); // useEffect chỉ chạy 1 lần khi mount trang

  return { cardData, loading, error };
}