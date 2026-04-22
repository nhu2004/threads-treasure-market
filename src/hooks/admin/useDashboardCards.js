import { useState, useEffect } from "react";
import productApi from "../../api/productApi";
import orderApi from "../../api/orderApi";
import analyticApi from "../../api/analyticApi";

/**
 * Custom hook to fetch dashboard card data (total products, orders, revenue, customers)
 * @returns {Object} { cardData, loading, error }
 */
export default function useDashboardCards() {
  const [cardData, setCardData] = useState({
    product: 0,
    order: 0,
    revenue: 0,
    customers: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Gọi tất cả API cùng lúc để tối ưu tốc độ load
        const [resBook, resOrder, resRevenue, resCustomer] = await Promise.all([
          productApi.getAll({}),
          orderApi.getAll({}),
          analyticApi.getTotalRevenue(),
          analyticApi.getCustomersThisYear() 
        ]);

        // Cập nhật state một lần duy nhất
        setCardData({
          // Đối với SQL Server, trường trả về thường là resBook.products.length hoặc resBook.count
          product: resBook?.products?.length || resBook?.count || 0,
          order: resOrder?.count || resOrder?.data?.length || 0,
          revenue: resRevenue?.data?.[0]?.revenue || 0,
          customers: resCustomer?.count || 0
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