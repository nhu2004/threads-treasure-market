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
import voucherApi from '../../../api/voucherApi';

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
  const [revenueTime, setRevenueTime] = useState({ value: 0, text: "Tất cả" });
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 14; 

  const [topVouchers, setTopVouchers] = useState([]);

  const { cardData, loading: cardsLoading } = useDashboardCards();
  const { revenueChartData, loading: revenueLoading } = useRevenueChart(revenueTime);
  const { bestSellerChartData, orderStatusData = [], loading: analyticsLoading } = useAnalyticsCharts();

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

  const stats = [
    { label: "Tổng sản phẩm", value: cardData.product || "0", color: "bg-blue-500", icon: Package, trend: "Cập nhật thực tế" },
    { label: "Tổng đơn hàng", value: cardData.order || "0", color: "bg-emerald-500", icon: ShoppingCart, trend: "Từ database" },
    { label: "Khách hàng năm nay", value: cardData.customers || "0", color: "bg-purple-500", icon: Users, trend: "+8% từ tuần trước" }, 
    { label: "Doanh thu", value: `${(cardData.revenue || 0).toLocaleString()}đ`, color: "bg-amber-500", icon: TrendingUp, trend: "Tổng cộng" },
    { label: "Voucher phát hành", value: cardData.totalVouchers || "5", color: "bg-rose-500", icon: Tag, trend: "Mã đang kích hoạt" },
  ];

  if (cardsLoading || revenueLoading || analyticsLoading) {
    return <Loading />;
  }

  return (
    // Đã thu hẹp space-y-6 thành space-y-4 để giảm khoảng trắng dọc
    <div className="space-y-4 bg-slate-50 min-h-screen p-4 md:p-6 font-sans">
      
      {/* HEADER BẢNG ĐIỀU KHIỂN & ĐỒNG HỒ */}
      {/* Đã giảm padding từ p-4 xuống py-3 px-4 */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white py-3 px-4 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-2 sm:mb-0">Bảng điều khiển</h2>
        <RealTimeClock />
      </div>

      {/* DÒNG 1: 5 THẺ THỐNG KÊ */}
      {/* Tối ưu grid hiển thị và khoảng cách */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            // Đã giảm padding từ p-5 xuống p-4
            <div key={idx} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-md transition-shadow">
              {/* Thêm gap-3 để tách biệt chữ và Icon */}
              <div className="flex items-start justify-between gap-3">
                {/* Thêm flex-1 và min-w-0 để đoạn text tự động co lại thay vì đẩy Icon đi */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-500 truncate">{stat.label}</p>
                  {/* Thay text-2xl bằng text-xl để vừa vặn hơn, thêm title để xem đầy đủ khi hover */}
                  <p className="text-xl font-bold mt-1 text-gray-800 truncate" title={stat.value}>{stat.value}</p>
                </div>
                {/* Thêm flex-shrink-0 để Icon luôn giữ nguyên kích thước */}
                <div className={`${stat.color} p-2 rounded-lg text-white shadow-sm flex-shrink-0`}>
                  <Icon size={20} />
                </div>
              </div>
              <p className="text-xs text-emerald-600 mt-3 truncate">{stat.trend}</p>
            </div>
          );
        })}
      </div>

      {/* DÒNG 2 & 3: LƯỚI BỐ CỤC */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* === CỘT BÊN TRÁI === */}
        <div className="lg:col-span-2 space-y-4">
            
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
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

              <div style={{ height: "300px" }}>
                {paginatedRevenueData.labels?.length > 0 ? (
                  <Line options={lineOptions} data={paginatedRevenueData} />
                ) : (
                  <p className="text-center mt-5 text-gray-500">Không có dữ liệu doanh thu</p>
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-4 gap-3">
                  <Button variant="outline-secondary" size="sm" disabled={currentPage === 0} onClick={() => setCurrentPage(prev => prev - 1)}><FaChevronLeft /></Button>
                  <span className="text-gray-500 text-sm">Trang {currentPage + 1} / {totalPages}</span>
                  <Button variant="outline-secondary" size="sm" disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(prev => prev + 1)}><FaChevronRight /></Button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-4">
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
                              <div className="mt-2 px-3 py-1 bg-white rounded-full border text-xs font-medium text-gray-700 shadow-sm">
                                  Lượt dùng: <span className="font-bold">{voucher.UsageCount}</span>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
        </div>

        {/* === CỘT BÊN PHẢI === */}
        <div className="space-y-4">
            
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Sản phẩm bán chạy</h3>
              <div style={{ height: "260px" }}>
                {bestSellerChartData.labels ? (
                  <Pie options={pieOptions} data={bestSellerChartData} />
                ) : (
                  <p className="text-center mt-5 text-gray-500">Chưa có dữ liệu bán hàng</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-5">Trạng thái đơn hàng</h3>
              <div className="space-y-4">
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
                      <div key={status.key} className="space-y-1.5">
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