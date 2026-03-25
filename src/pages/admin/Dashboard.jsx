import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Package, TrendingUp } from "lucide-react";
import { products, formatPrice } from "@/data/products";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const stats = [
  {
    title: "Doanh thu tháng",
    value: formatPrice(45680000),
    icon: DollarSign,
    change: "+12.5%",
  },
  {
    title: "Đơn hàng",
    value: "156",
    icon: ShoppingCart,
    change: "+8.2%",
  },
  {
    title: "Sản phẩm",
    value: String(products.length),
    icon: Package,
    change: "0",
  },
  {
    title: "Tỷ lệ chuyển đổi",
    value: "3.2%",
    icon: TrendingUp,
    change: "+0.4%",
  },
];

const revenueData = [
  { month: "T1", revenue: 32000000 },
  { month: "T2", revenue: 28000000 },
  { month: "T3", revenue: 35000000 },
  { month: "T4", revenue: 40000000 },
  { month: "T5", revenue: 38000000 },
  { month: "T6", revenue: 45680000 },
];

const categoryData = [
  { name: "Áo", value: 35, color: "hsl(var(--primary))" },
  { name: "Quần", value: 25, color: "hsl(var(--accent))" },
  { name: "Đầm", value: 25, color: "hsl(var(--gold))" },
  { name: "Phụ kiện", value: 15, color: "hsl(var(--muted-foreground))" },
];

const topProducts = products.slice(0, 5).map((p) => ({
  name: p.name,
  sold: p.reviews,
  revenue: p.price * p.reviews,
}));

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold text-foreground">Dashboard</h2>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-body font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-body">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className={stat.change.startsWith("+") ? "text-green-600" : "text-muted-foreground"}>
                  {stat.change}
                </span>{" "}
                so với tháng trước
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-display">Doanh thu 6 tháng</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(v) => `${(v / 1000000).toFixed(0)}tr`}
                />
                <Tooltip
                  formatter={(v) => [formatPrice(v), "Doanh thu"]}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display">Theo danh mục</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => [`${v}%`, "Tỷ lệ"]}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {categoryData.map((c) => (
                <div key={c.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                  {c.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top products */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-display">Sản phẩm bán chạy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground w-6">{i + 1}</span>
                  <span className="text-sm font-medium">{p.name}</span>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <span className="text-muted-foreground">{p.sold} đã bán</span>
                  <span className="font-medium">{formatPrice(p.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
