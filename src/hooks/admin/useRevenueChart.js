import { useState, useEffect } from "react";
import analyticApi from "../../api/analyticApi";

export default function useRevenueChart(revenueTime) {
  const [revenueChartData, setRevenueChartData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Lấy giá trị thời gian từ dropdown (0: Tất cả, 1: Tuần, 2: Tháng, 3: Quý, 4: Năm)
        const timeValue = revenueTime?.value || 0;
        
        // Gọi 1 API duy nhất có chứa param ?time=...
        const { data } = await analyticApi.getLifetimeRevenue(timeValue);

        setRevenueChartData({
          labels: (data || []).map((item) => item._id),
          datasets: [
            {
              label: "Doanh thu",
              data: (data || []).map((item) => item.revenue),
              borderColor: "rgb(255, 99, 132)", // Giữ màu hồng đỏ
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              pointBackgroundColor: "#ffffff",
              pointBorderColor: "rgb(255, 99, 132)",
              pointBorderWidth: 2,
              pointRadius: 4,
              fill: false, // Đổi thành true nếu bạn muốn tô màu vùng dưới biểu đồ
              tension: 0.1 // Độ cong của đường biểu đồ
            },
          ],
        });
      } catch (err) {
        console.error("Error fetching revenue chart:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, [revenueTime?.value]); // Tự động load lại biểu đồ khi thay đổi dropdown

  return { revenueChartData, loading, error };
}