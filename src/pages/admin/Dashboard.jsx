import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { TrendingUp, Package, ShoppingCart, Users } from 'lucide-react';

const AdminDashboard = () => {
  // Mock data
  const stats = [
    { 
      label: "Tổng sản phẩm", 
      value: "142", 
      color: "bg-gradient-to-br from-blue-500 to-blue-600", 
      icon: Package,
      trend: "+12% từ tháng trước"
    },
    { 
      label: "Đơn hàng hôm nay", 
      value: "28", 
      color: "bg-gradient-to-br from-emerald-500 to-emerald-600", 
      icon: ShoppingCart,
      trend: "+5% từ hôm qua"
    },
    { 
      label: "Khách hàng mới", 
      value: "12", 
      color: "bg-gradient-to-br from-purple-500 to-purple-600", 
      icon: Users,
      trend: "+8% từ tuần trước"
    },
    { 
      label: "Doanh thu", 
      value: "45.2M", 
      color: "bg-gradient-to-br from-amber-500 to-amber-600", 
      icon: TrendingUp,
      trend: "+23% từ tháng trước"
    },
  ];

  const revenueData = [
    { date: "1/4", revenue: 2400 },
    { date: "2/4", revenue: 1398 },
    { date: "3/4", revenue: 9800 },
    { date: "4/4", revenue: 3908 },
    { date: "5/4", revenue: 4800 },
    { date: "6/4", revenue: 3800 },
    { date: "7/4", revenue: 4300 },
  ];

  const topProducts = [
    { name: "Áo sơ mi trắng", sales: 245 },
    { name: "Quần jean đen", sales: 182 },
    { name: "Đầm dạo phố", sales: 156 },
    { name: "Áo khoác da", sales: 134 },
  ];

  const colors = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-border"
            >
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
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm border border-border">
          <div className="mb-6">
            <h3 className="text-lg font-bold">Doanh thu theo ngày</h3>
            <p className="text-sm text-muted-foreground mt-1">Tháng 4 năm 2025</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb" }}
                formatter={(value) => `${value.toLocaleString()}đ`}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                dot={{ fill: '#3b82f6', r: 4 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-border">
          <h3 className="text-lg font-bold mb-6">Sản phẩm bán chạy</h3>
          <div className="space-y-4">
            {topProducts.map((product, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate">{product.name}</span>
                  <span className="text-sm font-bold">{product.sales}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full" 
                    style={{ 
                      width: `${(product.sales / 245) * 100}%`,
                      backgroundColor: colors[idx]
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Status */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-border">
        <h3 className="text-lg font-bold mb-6">Trạng thái đơn hàng</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Chờ xác nhận</span>
              <span className="font-bold text-lg">24</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{width: "60%"}}></div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Đang chuẩn bị</span>
              <span className="font-bold text-lg">12</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{width: "30%"}}></div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Đang giao</span>
              <span className="font-bold text-lg">18</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{width: "45%"}}></div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Đã giao</span>
              <span className="font-bold text-lg">157</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full" style={{width: "100%"}}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
