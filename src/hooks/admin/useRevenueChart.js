import { useState, useEffect } from "react";
import analyticApi from "../../api/analyticApi";
import date from "../../helper/date";

/**
 * Custom hook to fetch revenue chart data with time filter
 * @param {Object} revenueTime - { value: 1|2|3, text: string }
 * @returns {Object} { revenueChartData, loading, error }
 */
export default function useRevenueChart(revenueTime) {
  const [revenueChartData, setRevenueChartData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true);
        setError(null);

        let chartData = [];

        switch (revenueTime.value) {
          case 1: {
            // All time
            const { data } = await analyticApi.getRevenueLifeTime();
            chartData = data;
            break;
          }

          case 2: {
            // This week
            const now = new Date();
            const { data } = await analyticApi.getRevenueWeek({
              start: date.getMonday(now),
              end: date.getSunday(now),
            });
            chartData = data;
            break;
          }

          case 3: {
            // Last week
            const now = new Date();
            now.setDate(now.getDate() - 7);
            const { data } = await analyticApi.getRevenueWeek({
              start: date.getMonday(now),
              end: date.getSunday(now),
            });
            chartData = data;
            break;
          }

          default: {
            const { data } = await analyticApi.getRevenueLifeTime();
            chartData = data;
            break;
          }
        }

        setRevenueChartData({
          labels: chartData.map((item) => item._id),
          datasets: [
            {
              label: "Doanh thu",
              data: chartData.map((item) => item.revenue),
              borderColor: "rgb(255, 99, 132)",
              backgroundColor: "rgba(255, 99, 132)",
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
  }, [revenueTime]);

  return { revenueChartData, loading, error };
}






