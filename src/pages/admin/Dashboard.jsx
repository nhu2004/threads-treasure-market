// File: src/pages/Admin/AdminDashboard.jsx
import { Link } from 'react-router-dom';
import useRevenueChart from '../../hooks/admin/useRevenueChart';
import useDashboardCards from '../../hooks/admin/useDashboardCards';
import useAnalyticsCharts from '../../hooks/admin/useAnalyticsCharts';
import React, { useState, useEffect } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  LineChart, Line, ResponsiveContainer 
} from 'recharts';
// Import thêm Tag icon
import { TrendingUp, Package, ShoppingCart, Users, Tag } from 'lucide-react';
import voucherApi from '@/api/voucherApi'; // Nhớ import voucherApi

const REVENUE_QUERY_CONFIG = { value: 1 };

const AdminDashboard = () => {
  const { cardData, loading: cardsLoading } = useDashboardCards();
  const { revenueChartData, loading: revenueLoading } = useRevenueChart(REVENUE_QUERY_CONFIG); 
  const { bestSellerChartData, orderStatusData = [], loading: analyticsLoading } = useAnalyticsCharts();
  
  // State chứa Top Voucher
  const [topVouchers, setTopVouchers] = useState([]);

  // Fetch tạm Top Vouchers (Sau này nên viết 1 query SQL riêng gộp vào useAnalyticsCharts)
  useEffect(() => {
    const fetchTopVouchers = async () => {
      try {
        // Gọi API lấy dữ liệu THẬT thay vì getAll()
        const data = await voucherApi.getTopUsed();
        setTopVouchers(data.topVouchers || []); 
      } catch (error) {
        console.error("Lỗi lấy top vouchers", error);
      }
    };
    fetchTopVouchers();
  }, []);

  const formattedRevenueData = revenueChartData.labels?.map((label, index) => ({
    date: label,
    revenue: revenueChartData.datasets[0].data[index]
  })) || [];

  const formattedTopProducts = bestSellerChartData.labels?.map((label, index) => ({
    name: label,
    sales: bestSellerChartData.datasets[0].data[index]
  })) || [];

  // --- CẬP NHẬT MẢNG STATS ---
  const stats = [
    { 
      label: "Tổng sản phẩm", 
      value: cardData.product || "0",
      color: "bg-blue-500", 
      icon: Package,
      trend: "Cập nhật thực tế"
    },
    { 
      label: "Tổng đơn hàng", 
      value: cardData.order || "0",
      color: "bg-emerald-500", 
      icon: ShoppingCart,
      trend: "Từ database"
    },
    { 
      label: "Khách hàng năm nay", 
      value: cardData.customers || "0",
      color: "bg-purple-500", 
      icon: Users,
      trend: "+8% từ tuần trước" 
    }, 
    { 
      label: "Doanh thu", 
      value: `${(cardData.revenue || 0).toLocaleString()}đ`,
      color: "bg-amber-500", 
      icon: TrendingUp,
      trend: "Tổng cộng"
    },
    // BỔ SUNG Ô VOUCHER
    { 
      label: "Voucher phát hành", 
      value: cardData.totalVouchers || "5", // Sẽ lấy từ DB
      color: "bg-rose-500", 
      icon: Tag,
      trend: "Mã đang kích hoạt"
    },
  ];

  const colors = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"];

  if (cardsLoading || revenueLoading || analyticsLoading) {
    return <div className="p-6 text-center">Đang tải dữ liệu thực tế...</div>;
  }

  return (
    <div className="space-y-8">
      {/* --- CẬP NHẬT GRID CHỨA THẺ THỐNG KÊ (5 cột hoặc tự động bọc) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-lg p-5 shadow-sm border border-border flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-2 truncate">{stat.value}</p>
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái: Biểu đồ doanh thu */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-border">
                <h3 className="text-lg font-bold mb-6">Doanh thu theo ngày</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={formattedRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value.toLocaleString()}đ`} />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* --- BỔ SUNG TOP VOUCHER --- */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-border">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold">Voucher được sử dụng nhiều nhất</h3>
                  <Link to="/admin/vouchers" className="text-sm text-primary hover:underline">
                      Xem tất cả
                  </Link>
              </div>
              
              {topVouchers.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">Chưa có voucher nào được sử dụng.</p>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {topVouchers.map((voucher, idx) => (
                          <div key={idx} className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-center bg-gray-50/50">
                              <Tag size={24} className="text-rose-500 mb-2" />
                              <p className="font-bold text-sm">{voucher.Code}</p>
                              <p className="text-xs text-muted-foreground mt-1 truncate w-full">{voucher.Name}</p>
                              <div className="mt-3 px-3 py-1 bg-white rounded-full border text-xs font-medium">
                                  {/* Lấy UsageCount trực tiếp từ DB */}
                                  Lượt dùng: {voucher.UsageCount} 
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
        </div>

        {/* Cột phải: Sản phẩm bán chạy & Trạng thái đơn */}
        <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-border">
            <h3 className="text-lg font-bold mb-6">Sản phẩm bán chạy</h3>
            <div className="space-y-4">
                {formattedTopProducts.map((product, idx) => (
                <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate pr-4">{product.name}</span>
                    <span className="text-sm font-bold">{product.sales}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div 
                        className="h-1.5 rounded-full" 
                        style={{ 
                        width: `${Math.min((product.sales / (formattedTopProducts[0]?.sales || 1)) * 100, 100)}%`,
                        backgroundColor: colors[idx % colors.length]
                        }}
                    ></div>
                    </div>
                </div>
                ))}
            </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-border">
            <h3 className="text-lg font-bold mb-6">Trạng thái đơn hàng</h3>
            <div className="space-y-4">
                {[
                { label: "Chờ xác nhận", color: "bg-yellow-500", key: "Chờ xác nhận" },
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
                        <span className="text-sm font-medium">{status.label}</span>
                        <span className="font-bold text-sm">{count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className={`${status.color} h-1.5 rounded-full`} style={{width: `${percentage}%`}}></div>
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
};

export default AdminDashboard;