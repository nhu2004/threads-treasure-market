import { useState, useEffect } from "react";
import analyticApi from "../../api/analyticApi";

/**
 * Custom hook to fetch analytics chart data (order count, best sellers, order status)
 * @returns {Object} { orderCountChartData, bestSellerChartData, orderStatusData, loading, error }
 */
export default function useAnalyticsCharts() {
  const [orderCountChartData, setOrderCountChartData] = useState({});
  const [bestSellerChartData, setBestSellerChartData] = useState({});
  
  // BƯỚC 1: Khai báo state orderStatusData để sửa lỗi "is not defined"
  const [orderStatusData, setOrderStatusData] = useState([]); 
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch order count
        const { data: orderData } = await analyticApi.getOrderCountLifeTime();
        setOrderCountChartData({
          labels: (orderData || []).map((item) => item?._id),
          datasets: [
            {
              label: "Số lượng đơn hàng",
              data: (orderData || []).map((item) => item?.total),
              borderColor: "rgb(75, 192, 192)",
              backgroundColor: "rgba(75, 192, 192)",
            },
          ],
        });

        // Fetch best sellers
        const { data: bestSellerData } = await analyticApi.getBestSeller();
        setBestSellerChartData({
          labels: (bestSellerData || []).map((item) => item.product[0]?.name),
          datasets: [
            {
              label: "Sản phẩm bán chạy",
              data: (bestSellerData || []).map((item) => item.count),
              backgroundColor: [
                "#ff6384",
                "#e8c3b9",
                "#ffce56",
                "#8e5ea2",
                "#5ea288ff",
                "#4c39ddff",
                "#e4d292ff",
              ],
            },
          ],
        });

        // BƯỚC 2: Fetch order status data (Trạng thái đơn hàng)
        const statusRes = await analyticApi.getOrdersStatus();
        setOrderStatusData(statusRes.data || []);

      } catch (err) {
        console.error("Error fetching analytics charts:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  // orderStatusData đã được khai báo ở trên nên sẽ không còn báo lỗi nữa
  return { orderCountChartData, bestSellerChartData, orderStatusData, loading, error };
}