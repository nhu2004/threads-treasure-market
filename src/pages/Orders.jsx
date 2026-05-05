// src/pages/Orders.jsx
import { useAuth } from "@/contexts/AuthContext";
import { Package, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import orderApi from "@/api/orderApi";
import { useNavigate, Link } from "react-router-dom";
import OrderDetail from "../components/OrderDetail"; 


const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 6;
  const navigate = useNavigate();
  const [selectedOrderId, setSelectedOrderId] = useState(null);


  useEffect(() => {
    const fetchOrders = async () => {
      if (user?.id) { 
        try {
          setLoading(true);
          const data = await orderApi.getUserOrders(user.id);
          setOrders(data.orders || []);
        } catch (error) {
          console.error("Lỗi khi tải lịch sử đơn hàng:", error);
        } finally {
          setLoading(false);
        }
      } else {
          setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const statusColors = {
    "Đã giao": "bg-green-100 text-green-800",
    "Đang giao": "bg-blue-100 text-blue-800",
    "Chờ xác nhận": "bg-yellow-100 text-yellow-800",
    "Đã hủy": "bg-red-100 text-red-800",
  };

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!user) return <div className="text-center py-12">Vui lòng đăng nhập...</div>;
  if (loading) return <div className="text-center py-12">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Lịch sử mua hàng</h1>
          <p className="text-muted-foreground mt-2">Bạn có {orders.length} đơn hàng</p>
        </div>

        <div className="space-y-4">
          {orders.length > 0 ? (
            <>
              {currentOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      {/* SỬA: Dùng order.id thay vì order.OrderID */}
                      <h3 className="font-bold text-lg">Đơn hàng #{order.id}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar size={16} />
                          {/* SỬA: Dùng order.orderDate thay vì order.OrderDate */}
                          {order.orderDate ? new Date(order.orderDate).toLocaleDateString("vi-VN", {
                            year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                          }) : "N/A"}
                        </div>
                        <div className="flex items-center gap-1">
                          <Package size={16} />
                          {/* SỬA: Dùng order.TotalItems khớp với SQL GROUP BY */}
                          {order.TotalItems || 0} sản phẩm
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {/* SỬA: Dùng order.status thay vì order.Status */}
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status] || "bg-gray-100 text-gray-800"}`}>
                        {order.status || "Chờ xác nhận"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-end justify-between pt-4 border-t">
                    <div>
                      {/* SỬA: Dùng order.discountAmount thay vì order.DiscountAmount */}
                      {(order.discountAmount > 0) && (
                        <p className="text-sm text-green-600 mb-1">
                          Đã giảm: -{(order.discountAmount || 0).toLocaleString("vi-VN")}₫
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">Tổng thanh toán</p>
                      <p className="text-2xl font-bold text-primary">
                        {/* SỬA: Dùng order.total thay vì order.Total */}
                        {(order.total || 0).toLocaleString("vi-VN")}₫
                      </p>
                    </div>
                    <button 
                        onClick={() => setSelectedOrderId(order.id)} 
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors inline-block text-center"
                    >
                        Chi tiết
                    </button>
                  </div>
                </div>
              ))}

              {/* Phân trang */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8 pt-4">
                  <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 border rounded bg-white disabled:opacity-50"><ChevronLeft size={20} /></button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button key={page} onClick={() => handlePageChange(page)} className={`w-10 h-10 rounded border ${currentPage === page ? "bg-black text-white" : "bg-white"}`}>{page}</button>
                  ))}
                  <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 border rounded bg-white disabled:opacity-50"><ChevronRight size={20} /></button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-lg p-12 text-center border border-dashed">
              <Package size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Bạn chưa có đơn hàng nào</p>
            </div>
          )}
        </div>
      </div>
      {selectedOrderId && (
        <OrderDetail 
          orderId={selectedOrderId} 
          onBack={() => setSelectedOrderId(null)} 
        />
      )}
    </div>
  );
}; 
export default Orders;