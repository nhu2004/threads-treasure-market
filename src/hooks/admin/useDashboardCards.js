import { useState, useEffect } from "react";
import productApi from "../../api/productApi";
import orderApi from "../../api/orderApi";
import analyticApi from "../../api/analyticApi";

/**
 * Custom hook to fetch dashboard card data (total books, orders, revenue)
 * @returns {Object} { cardData, loading, error }
 */
export default function useDashboardCards() {
  const [cardData, setCardData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resBook, resOrder, resRevenue, resCustomer] = await Promise.all([
    productApi.getAll({}),
    orderApi.getAll({}),
    analyticApi.getTotalRevenue(),
    analyticApi.getCustomersThisYear() // Gọi thêm khách hàng
  ]);

  setCardData({
    product: resBook?.count || 0,
    order: resOrder?.count || 0,
    revenue: resRevenue?.data[0]?.revenue || 0,
    customers: resCustomer?.count || 0 // Lưu vào state
  });
  useEffect(() => {
    const fetchCardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [resBook, resOrder, resRevenue] = await Promise.all([
          productApi.getAll({}),
          orderApi.getAll({}),
          analyticApi.getTotalRevenue(),
        ]);

        setCardData({
          product: resBook?.count || 0,
          order: resOrder?.count || 0,
          revenue: resRevenue?.data[0]?.revenue || 0,
        });
      } catch (err) {
        console.error("Error fetching dashboard cards:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCardData();
  }, []);

  return { cardData, loading, error };
}






