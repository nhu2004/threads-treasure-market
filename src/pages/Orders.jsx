import { useAuth } from "@/contexts/AuthContext";
import { Package, Calendar, DollarSign } from "lucide-react";

const Orders = () => {
  const { user } = useAuth();

  // Mock data - sẽ fetch từ API sau
  const orders = [
    {
      id: "ORD001",
      date: "2025-04-01",
      total: 1500000,
      status: "delivered",
      items: 3,
    },
    {
      id: "ORD002",
      date: "2025-03-28",
      total: 890000,
      status: "delivered",
      items: 2,
    },
    {
      id: "ORD003",
      date: "2025-03-20",
      total: 2200000,
      status: "processing",
      items: 4,
    },
  ];

  const statusLabels = {
    delivered: "Đã giao",
    processing: "Đang xử lý",
    pending: "Chờ xác nhận",
    cancelled: "Đã hủy",
  };

  const statusColors = {
    delivered: "bg-green-100 text-green-800",
    processing: "bg-blue-100 text-blue-800",
    pending: "bg-yellow-100 text-yellow-800",
    cancelled: "bg-red-100 text-red-800",
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-500">Vui lòng đăng nhập để xem lịch sử mua hàng</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Lịch sử mua hàng</h1>
          <p className="text-muted-foreground mt-2">
            Bạn có {orders.length} đơn hàng trong lịch sử
          </p>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.length > 0 ? (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg">Đơn hàng #{order.id}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        {new Date(order.date).toLocaleDateString("vi-VN")}
                      </div>
                      <div className="flex items-center gap-1">
                        <Package size={16} />
                        {order.items} sản phẩm
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
                      {statusLabels[order.status]}
                    </div>
                  </div>
                </div>

                <div className="flex items-end justify-between pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Tổng tiền</p>
                    <p className="text-2xl font-bold text-primary">
                      {order.total.toLocaleString("vi-VN")}₫
                    </p>
                  </div>
                  <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
                    Chi tiết
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg p-12 shadow-sm text-center">
              <Package size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Bạn chưa có đơn hàng nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
