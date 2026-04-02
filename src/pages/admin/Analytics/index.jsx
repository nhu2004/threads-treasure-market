// Client/src/pages/Admin/Analytics/index.js
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
import { useState } from "react";
import DashboardCard from "../DashboardCard";
import Loading from "../../../components/Loading";
import { FaBox, FaChartBar, FaShoppingBag } from "react-icons/fa";

// Custom hooks
import {
  useDashboardCards,
  useRevenueChart,
  useAnalyticsCharts,
} from "../../../hooks/admin";

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
  const [revenueTime, setRevenueTime] = useState({
    value: 1,
    text: "Toàn thời gian",
  });

  // Custom hooks for data fetching
  const { cardData } = useDashboardCards();
  const { revenueChartData } = useRevenueChart(revenueTime);
  const {
    orderCountChartData: orderCountLifeTimeChartData,
    bestSellerChartData: productBestSellerChartData,
  } = useAnalyticsCharts();

  const handleChangeRevenueTime = (e) => {
    const index = e.target.selectedIndex;
    setRevenueTime({
      value: parseInt(e.target.value),
      text: e.target[index].text,
    });
  };

  return (
    <div className={styles.wrapperDashboard}>
      {cardData && cardData.product ? (
        <Row className="mb-4">
          <Col xl={3}>
            <DashboardCard
              name="Sản phẩm"
              quantity={cardData && cardData.product}
              bgColor="bg-success"
              Icon={FaBox}
            />
          </Col>
          <Col xl={3}>
            <DashboardCard
              name="Đơn hàng"
              quantity={cardData && cardData.order}
              bgColor="bg-info"
              Icon={FaShoppingBag}
            />
          </Col>
          <Col xl={3}>
            <DashboardCard
              name="Doanh thu (triệu)"
              quantity={cardData && (cardData.revenue / 1000000).toFixed(2)}
              bgColor="bg-danger"
              Icon={FaChartBar}
            />
          </Col>
        </Row>
      ) : (
        <Loading />
      )}
      <Row>
        <Col xl={8}>
          <div className={styles.chart}>
            <h2>DOANH THU</h2>
            <select
              className={`form-select ${styles.revenueSelectTime}`}
              value={revenueTime && revenueTime.value}
              onChange={handleChangeRevenueTime}
            >
              <option value="1">Toàn thời gian</option>
              <option value="2">Tuần này</option>
              <option value="3">Tuần trước</option>
            </select>
            {revenueChartData && revenueChartData.datasets && (
              <Bar
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "top",
                    },
                    title: {
                      display: true,
                      text: `Doanh thu ${revenueTime && revenueTime.text}`,
                    },
                  },
                }}
                data={revenueChartData}
              />
            )}
          </div>
        </Col>
        <Col xl={4}>
          <div className={styles.chart}>
            <h2>SÁCH BÁN CHẠY</h2>
            {productBestSellerChartData && productBestSellerChartData.datasets && (
              <Pie
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "top",
                      align: "start",
                    },
                    title: {
                      display: true,
                      text: "Sản phẩm bán chạy",
                    },
                  },
                }}
                data={productBestSellerChartData}
              />
            )}
          </div>
        </Col>
        <Col xl={8}>
          <div className={styles.chart}>
            <h2>SỐ LƯỢNG ĐƠN HÀNG</h2>
            {orderCountLifeTimeChartData &&
              orderCountLifeTimeChartData.datasets && (
                <Bar
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "top",
                      },
                      title: {
                        display: true,
                        text: "Đơn hàng toàn thời gian",
                      },
                    },
                  }}
                  data={orderCountLifeTimeChartData}
                />
              )}
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default AnalyticsPage;






