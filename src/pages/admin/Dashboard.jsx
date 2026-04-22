// Import các hooks bạn đã cung cấp
import useRevenueChart from '../../hooks/admin/useRevenueChart';
import useDashboardCards from '../../hooks/admin/useDashboardCards';
import useAnalyticsCharts from '../../hooks/admin/useAnalyticsCharts';
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer 
} from 'recharts';
import { TrendingUp, Package, ShoppingCart, Users } from 'lucide-react';

const REVENUE_QUERY_CONFIG = { value: 1 };

const AdminDashboard = () => {
  const { cardData, loading: cardsLoading } = useDashboardCards();
  const { revenueChartData, loading: revenueLoading } = useRevenueChart(REVENUE_QUERY_CONFIG); 
  const { bestSellerChartData, loading: analyticsLoading } = useAnalyticsCharts();
  // Chuyển đổi dữ liệu cho LineChart (Doanh thu)
  const formattedRevenueData = revenueChartData.labels?.map((label, index) => ({
    date: label,
    revenue: revenueChartData.datasets[0].data[index]
  })) || [];

  // Chuyển đổi dữ liệu cho Top Products
  const formattedTopProducts = bestSellerChartData.labels?.map((label, index) => ({
    name: label,
    sales: bestSellerChartData.datasets[0].data[index]
  })) || [];

  const stats = [
    { 
      label: "Tổng sản phẩm", 
      value: cardData.product || "0",
      color: "bg-gradient-to-br from-blue-500 to-blue-600", 
      icon: Package,
      trend: "Cập nhật thực tế"
    },
    { 
      label: "Tổng đơn hàng", 
      value: cardData.order || "0",
      color: "bg-gradient-to-br from-emerald-500 to-emerald-600", 
      icon: ShoppingCart,
      trend: "Từ database"
    },
      { 
      label: "Khách hàng năm nay", 
      value: cardData.customers || "0",
      color: "bg-gradient-to-br from-purple-500 to-purple-600", 
      icon: Users, // Sử dụng icon Users từ lucide-react
      trend: "+8% từ tuần trước" 
    }, 
    { 
      label: "Doanh thu", 
      value: `${(cardData.revenue || 0).toLocaleString()}đ`,
      color: "bg-gradient-to-br from-amber-500 to-amber-600", 
      icon: TrendingUp,
      trend: "Tổng cộng"
    },
  ];

  const colors = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"];

  if (cardsLoading || revenueLoading || analyticsLoading) {
    return <div className="p-6 text-center">Đang tải dữ liệu thực tế...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-lg p-6 shadow-sm border border-border">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  <p className="text-xs text-emerald-600 mt-2">{stat.trend}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg text-white`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm border border-border">
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

        <div className="bg-white rounded-lg p-6 shadow-sm border border-border">
          <h3 className="text-lg font-bold mb-6">Sản phẩm bán chạy</h3>
          <div className="space-y-4">
            {formattedTopProducts.map((product, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate">{product.name}</span>
                  <span className="text-sm font-bold">{product.sales}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full" 
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
        {/* Orders Status Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-border">
          <h3 className="text-lg font-bold mb-6">Trạng thái đơn hàng</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Map dữ liệu từ API thay vì để số cứng */}
            {[
              { label: "Chờ xác nhận", color: "bg-yellow-500", key: "Chờ xác nhận" },
              { label: "Đang giao", color: "bg-purple-500", key: "Đang giao" },
              { label: "Đã giao", color: "bg-emerald-500", key: "Đã giao" },
              { label: "Đã hủy", color: "bg-red-500", key: "Đã hủy" }
            ].map((status) => {
              const statusData = orderStatusData.find(s => s.Status === status.key);
              const count = statusData ? statusData.count : 0;
              const percentage = (count / (cardData.order || 1)) * 100;

              return (
                <div key={status.key} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{status.label}</span>
                    <span className="font-bold text-lg">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`${status.color} h-2 rounded-full`} style={{width: `${percentage}%`}}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;