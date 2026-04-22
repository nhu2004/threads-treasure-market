import React, { useState } from "react";  
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { Row, Col } from "react-bootstrap";
import styles from "./AnalyticsPage.module.css";
import DashboardCard from "../DashboardCard";
import Loading from "../../../components/Loading";
import { FaBox, FaChartBar, FaShoppingBag } from "react-icons/fa";

// Import các hooks của bạn - Sửa đường dẫn nếu cần thiết
import useDashboardCards from "../../../hooks/admin/useDashboardCards";
import useRevenueChart from "../../../hooks/admin/useRevenueChart";
import useAnalyticsCharts from "../../../hooks/admin/useAnalyticsCharts";

ChartJS.register(
  ArcElement, CategoryScale, LinearScale, BarElement, 
  LineElement, Title, Tooltip, Legend, Filler
);

function AnalyticsPage() {
  const [revenueTime, setRevenueTime] = useState({ value: 1, text: "Toàn thời gian" });

  // 1. Gọi dữ liệu thật từ Hooks
  const { cardData, loading: cardsLoading } = useDashboardCards();
  const { revenueChartData, loading: revenueLoading } = useRevenueChart(revenueTime);
  const { bestSellerChartData, orderCountChartData, loading: analyticsLoading } = useAnalyticsCharts();

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
    },
  };

  // 2. Kiểm tra trạng thái tải dữ liệu để tránh lỗi Reference
  if (cardsLoading || revenueLoading || analyticsLoading) {
    return <Loading />;
  }

  return (
    <div className={styles.wrapperDashboard}>
      <Row className="g-4">
        {/* Render Dashboard Cards với dữ liệu từ cardData */}
        <Col xl={4} md={6}>
          <DashboardCard
            name="Tổng sản phẩm"
            quantity={cardData.product || 0}
            Icon={FaBox}
            bgColor="bg-primary text-white"
          />
        </Col>
        <Col xl={4} md={6}>
          <DashboardCard
            name="Tổng đơn hàng"
            quantity={cardData.order || 0}
            Icon={FaShoppingBag}
            bgColor="bg-success text-white"
          />
        </Col>
        <Col xl={4} md={6}>
          <DashboardCard
            name="Tổng doanh thu"
            quantity={`${(cardData.revenue || 0).toLocaleString()}đ`}
            Icon={FaChartBar}
            bgColor="bg-warning text-white"
          />
        </Col>

        {/* Biểu đồ doanh thu chi tiết */}
        <Col xl={8} lg={12}>
          <div className={styles.chart}>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
              <h2 className="fs-5 fw-bold">Doanh thu chi tiết</h2>
              <select 
                className={styles.revenueSelectTime} 
                value={revenueTime.value}
                onChange={(e) => setRevenueTime({ 
                  value: Number(e.target.value), 
                  text: e.target.options[e.target.selectedIndex].text 
                })}
              >
                <option value={1}>Toàn thời gian</option>
                <option value={2}>Tuần này</option>
                <option value={3}>Tuần trước</option>
              </select>
            </div>
            <div style={{ height: "350px" }}>
              {/* Sử dụng dữ liệu từ useRevenueChart */}
              {revenueChartData.labels ? (
                <Bar options={commonOptions} data={revenueChartData} />
              ) : (
                <p className="text-center mt-5">Không có dữ liệu doanh thu</p>
              )}
            </div>
          </div>
        </Col>

        {/* Biểu đồ Top sản phẩm */}
        <Col xl={4} lg={12}>
          <div className={styles.chart}>
            <h2 className="fs-5 fw-bold mb-4">Top sản phẩm bán chạy</h2>
            <div style={{ height: "350px" }}>
              {bestSellerChartData.labels ? (
                <Pie options={commonOptions} data={bestSellerChartData} />
              ) : (
                <p className="text-center mt-5">Chưa có dữ liệu bán hàng</p>
              )}
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default AnalyticsPage;