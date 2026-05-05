import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import moment from "moment"; 

// --- IMPORTS CHO CHART.JS ---
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement, 
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Pie, Line } from "react-chartjs-2"; 

// --- IMPORTS UI & ICONS ---
import { Button } from "react-bootstrap";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { TrendingUp, Package, ShoppingCart, Users, Tag } from 'lucide-react';
import Loading from "../../../components/Loading";

// --- IMPORTS HOOKS & API ---
import useDashboardCards from "../../../hooks/admin/useDashboardCards";
import useRevenueChart from "../../../hooks/admin/useRevenueChart";
import useAnalyticsCharts from "../../../hooks/admin/useAnalyticsCharts";
import voucherApi from '../../../api/voucherApi'; // Nhớ kiểm tra đúng đường dẫn của bạn

// Đăng ký các thành phần của Chart.js
ChartJS.register(
  ArcElement, CategoryScale, LinearScale, BarElement, 
  PointElement, LineElement, Title, Tooltip, Legend, Filler
);

// --- COMPONENT ĐỒNG HỒ ---
function RealTimeClock() {
  const [currentTime, setCurrentTime] = useState(moment());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(moment()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="text-sm text-gray-500 font-medium">
      Cập nhật lúc <span className="font-bold text-blue-600">{currentTime.format('HH:mm - DD/MM/YYYY')}</span>
    </span>
  );
}

// --- MAIN COMPONENT ---
function AnalyticsPage() {
  // 1. States cho biểu đồ doanh thu
  const [revenueTime, setRevenueTime] = useState({ value: 0, text: "Tất cả" });
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 14; 

  // 2. State cho Top Vouchers
  const [topVouchers, setTopVouchers] = useState([]);

  // 3. Gọi Hooks lấy dữ liệu
  const { cardData, loading: cardsLoading } = useDashboardCards();
  const { revenueChartData, loading: revenueLoading } = useRevenueChart(revenueTime);
  const { bestSellerChartData, orderStatusData = [], loading: analyticsLoading } = useAnalyticsCharts();

  // 4. Fetch Vouchers
  useEffect(() => {
    const fetchTopVouchers = async () => {
      try {
        const data = await voucherApi.getTopUsed();
        setTopVouchers(data.topVouchers || []); 
      } catch (error) {
        console.error("Lỗi lấy top vouchers", error);
      }
    };
    fetchTopVouchers();
  }, []);

  // 5. Logic phân trang biểu đồ ngang
  useEffect(() => {
    setCurrentPage(0);
  }, [revenueTime.value]);

  const totalItems = revenueChartData?.labels?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedRevenueData = revenueChartData?.labels ? {
    ...revenueChartData,
    labels: revenueChartData.labels.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage),
    datasets: revenueChartData.datasets.map(dataset => ({
      ...dataset,
      data: dataset.data.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage),
    }))
  } : {};

  // 6. Cấu hình Chart.js
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { left: 15, right: 15 } },
    plugins: { legend: { position: "bottom" } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            if (value >= 1000000) return (value / 1000000) + ' Tr';
            if (value >= 1000) return (value / 1000) + ' K';
            return value;
          }
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom" } },
  };

  // 7. Dữ liệu thẻ thống kê (Khớp với Dashboard.jsx cũ)
  const stats = [
    { label: "Tổng sản phẩm", value: cardData.product || "0", color: "bg-blue-500", icon: Package, trend: "Cập nhật thực tế" },
    { label: "Tổng đơn hàng", value: cardData.order || "0", color: "bg-emerald-500", icon: ShoppingCart, trend: "Từ database" },
    { label: "Khách hàng năm nay", value: cardData.customers || "0", color: "bg-purple-500", icon: Users, trend: "+8% từ tuần trước" }, 
    { label: "Doanh thu", value: `${(cardData.revenue || 0).toLocaleString()}đ`, color: "bg-amber-500", icon: TrendingUp, trend: "Tổng cộng" },
    { label: "Voucher phát hành", value: cardData.totalVouchers || "5", color: "bg-rose-500", icon: Tag, trend: "Mã đang kích hoạt" },
  ];

  // 8. Render
  if (cardsLoading || revenueLoading || analyticsLoading) {
    return <Loading />;
  }

  return (
    // Sử dụng Tailwind CSS để tái tạo khung nền chuẩn của Admin
    <div className="space-y-6 bg-slate-50 min-h-screen p-4 md:p-6 font-sans">
      
      {/* HEADER BẢNG ĐIỀU KHIỂN & ĐỒNG HỒ */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-2 sm:mb-0">Bảng điều khiển</h2>
        <RealTimeClock />
      </div>

      {/* DÒNG 1: 5 THẺ THỐNG KÊ */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold mt-2 text-gray-800 truncate">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-2.5 rounded-lg text-white shadow-sm`}>
                  <Icon size={20} />
                </div>
              </div>
              <p className="text-xs text-emerald-600 mt-4">{stat.trend}</p>
            </div>
          );
        })}
      </div>

      {/* DÒNG 2 & 3: LƯỚI BỐ CỤC (TRÁI 2 CỘT - PHẢI 1 CỘT) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* === CỘT BÊN TRÁI === */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Biểu đồ doanh thu (Line Chart Chart.js) */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h3 className="text-lg font-bold text-gray-800">Doanh thu theo ngày</h3>
                <select 
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:border-blue-500" 
                  value={revenueTime.value}
                  onChange={(e) => setRevenueTime({ 
                    value: Number(e.target.value), 
                    text: e.target.options[e.target.selectedIndex].text 
                  })}
                >
                  <option value={0}>Tất cả</option>
                  <option value={1}>Tuần</option>
                  <option value={2}>Tháng</option>
                  <option value={3}>3 tháng</option>
                  <option value={4}>Năm</option>
                </select>
              </div>

              <div style={{ height: "320px" }}>
                {paginatedRevenueData.labels?.length > 0 ? (
                  <Line options={lineOptions} data={paginatedRevenueData} />
                ) : (
                  <p className="text-center mt-5 text-gray-500">Không có dữ liệu doanh thu</p>
                )}
              </div>

              {/* Phân trang biểu đồ */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-4 gap-3">
                  <Button variant="outline-secondary" size="sm" disabled={currentPage === 0} onClick={() => setCurrentPage(prev => prev - 1)}><FaChevronLeft /></Button>
                  <span className="text-gray-500 text-sm">Trang {currentPage + 1} / {totalPages}</span>
                  <Button variant="outline-secondary" size="sm" disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(prev => prev + 1)}><FaChevronRight /></Button>
                </div>
              )}
            </div>

            {/* Top Vouchers */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-800">Voucher được sử dụng nhiều nhất</h3>
                  <Link to="/admin/vouchers" className="text-sm text-blue-600 hover:underline font-medium">
                      Xem tất cả
                  </Link>
              </div>
              
              {topVouchers.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">Chưa có voucher nào được sử dụng.</p>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {topVouchers.map((voucher, idx) => (
                          <div key={idx} className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-center bg-gray-50/50 hover:bg-gray-50 transition-colors">
                              <Tag size={24} className="text-rose-500 mb-2" />
                              <p className="font-bold text-sm text-gray-800">{voucher.Code}</p>
                              <p className="text-xs text-gray-500 mt-1 truncate w-full">{voucher.Name}</p>
                              <div className="mt-3 px-3 py-1 bg-white rounded-full border text-xs font-medium text-gray-700 shadow-sm">
                                  Lượt dùng: <span className="font-bold">{voucher.UsageCount}</span>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
        </div>

        {/* === CỘT BÊN PHẢI === */}
        <div className="space-y-6">
            
            {/* Top Sản Phẩm Bán Chạy (Pie Chart Chart.js) */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Sản phẩm bán chạy</h3>
              <div style={{ height: "300px" }}>
                {bestSellerChartData.labels ? (
                  <Pie options={pieOptions} data={bestSellerChartData} />
                ) : (
                  <p className="text-center mt-5 text-gray-500">Chưa có dữ liệu bán hàng</p>
                )}
              </div>
            </div>

            {/* Trạng thái đơn hàng (Progress Bars) */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Trạng thái đơn hàng</h3>
              <div className="space-y-5">
                  {[
                  { label: "Chờ xác nhận", color: "bg-amber-500", key: "Chờ xác nhận" },
                  { label: "Đang giao", color: "bg-blue-500", key: "Đang giao" },
                  { label: "Đã giao", color: "bg-emerald-500", key: "Đã giao" },
                  { label: "Đã hủy", color: "bg-red-500", key: "Đã hủy" }
                  ].map((status) => {
                  const statusData = orderStatusData.find(s => s.Status === status.key);
                  const count = statusData ? statusData.count : 0;
                  const percentage = (count / (cardData.order || 1)) * 100;

                  return (
                      <div key={status.key} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">{status.label}</span>
                            <span className="font-bold text-sm text-gray-900">{count}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className={`${status.color} h-2 rounded-full`} style={{width: `${percentage}%`}}></div>
                        </div>
                      </div>
                  );
                  })}
              </div>
            </div>

        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;