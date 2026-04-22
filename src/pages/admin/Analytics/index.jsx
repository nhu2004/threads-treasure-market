// Client/src/pages/Admin/Analytics/index.js
import React, { useState, useMemo } from "react";  
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
import { FaBox, FaChartBar, FaShoppingBag, FaSpinner } from "react-icons/fa";  

// Đăng ký ChartJS
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function AnalyticsPage() {
  const [revenueTime, setRevenueTime] = useState({ value: 1, text: "Toàn thời gian" });

  // --- DỮ LIỆU GIẢ LẬP (MOCK DATA) THEO SQL ---
  const cardData = {
    product: 10, // 8 sản phẩm gốc + 2 sản phẩm mới thêm trong SQL
    order: 24,   // 4 đơn hàng mẫu + 20 đơn hàng cho user '01'
    revenue: 35500000 // Giả lập tổng doanh thu khoảng 35.5 triệu
  };

  const revenueChartData = {
    labels: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4"],
    datasets: [{
      label: "Doanh thu (VNĐ)",
      data: [12000000, 19000000, 15000000, 22000000],
      backgroundColor: "rgba(99, 102, 241, 0.8)",
      borderRadius: 8,
    }]
  };

  const bestSellerChartData = {
    labels: ["Áo Blazer", "Đầm Midi", "Quần Palazzo", "Túi Xách"],
    datasets: [{
      data: [15, 12, 8, 5],
      backgroundColor: ["#6366f1", "#a855f7", "#f43f5e", "#fbbf24"],
    }]
  };

  const orderCountChartData = {
    labels: ["Hoàn thành", "Đang xử lý", "Chờ xác nhận"],
    datasets: [{
      label: "Số lượng đơn",
      data: [18, 4, 2],
      backgroundColor: ["#22c55e", "#3b82f6", "#f59e0b"],
    }]
  };
  // --- KẾT THÚC GIẢ LẬP ---

  const commonOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { boxWidth: 12, usePointStyle: true, font: { size: 13, weight: '600' }, padding: 20 }
      },
    },
    scales: {
      y: { grid: { color: "#f1f5f9" }, ticks: { font: { size: 11 } } },
      x: { grid: { display: false }, ticks: { font: { size: 11 } } }
    }
  }), []);

  const LoadingState = () => (
    <div className={styles.loadingPlaceholder}>
      <FaSpinner className="fa-spin" size={24} />
      <span className="mt-2">Đang cập nhật dữ liệu...</span>
    </div>
  );

  return (
    <div className={styles.wrapperDashboard}>
      {/* 1. Header Cards */}
      <section className="mb-5">
        <Row className="g-4">
          <Col xl={4} md={6}>
            <DashboardCard name="Sản phẩm" quantity={cardData.product} bgColor="bg-primary" Icon={FaBox} />
          </Col>
          <Col xl={4} md={6}>
            <DashboardCard name="Đơn hàng" quantity={cardData.order} bgColor="bg-info" Icon={FaShoppingBag} />
          </Col>
          <Col xl={4} md={12}>
            <DashboardCard name="Doanh thu (triệu)" quantity={(cardData.revenue / 1000000).toFixed(2)} bgColor="bg-indigo" Icon={FaChartBar} />
          </Col>
        </Row>
      </section>

      {/* 2. Charts Grid */}
      <Row className="g-4">
        <Col xl={8} lg={12}>
          <div className={styles.chart}>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
              <h2>Doanh thu chi tiết</h2>
              <select 
                className={styles.revenueSelectTime} 
                onChange={(e) => setRevenueTime({ value: e.target.value, text: e.target.options[e.target.selectedIndex].text })}
              >
                <option value="1">Toàn thời gian</option>
                <option value="2">Tuần này</option>
                <option value="3">Tuần trước</option>
              </select>
            </div>
            <div style={{ height: "350px" }}>
              <Bar options={commonOptions} data={revenueChartData} />
            </div>
          </div>
        </Col>

        <Col xl={4} lg={12}>
          <div className={styles.chart}>
            <h2 className="mb-4">Top sản phẩm</h2>
            <div style={{ height: "350px" }}>
              <Pie options={{...commonOptions, scales: {}}} data={bestSellerChartData} />
            </div>
          </div>
        </Col>

        <Col xs={12}>
          <div className={styles.chart}>
            <h2 className="mb-4">Thống kê đơn hàng (Theo SQL Status)</h2>
            <div style={{ height: "300px" }}>
              <Bar options={commonOptions} data={orderCountChartData} />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default AnalyticsPage;