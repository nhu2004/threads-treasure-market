import { useAuth } from "@/contexts/AuthContext";
import { Package, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import orderApi from "@/api/orderApi"; // Đảm bảo đường dẫn import đúng

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- THÊM STATE CHO PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 6; // Giới hạn 6 đơn/trang theo yêu cầu

  // Lấy dữ liệu thật từ Database
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

  // Cấu hình màu sắc khớp với chuỗi Text lưu trong Database
  const statusColors = {
    "Đã giao": "bg-green-100 text-green-800",
    "Đang giao": "bg-blue-100 text-blue-800",
    "Chờ xác nhận": "bg-yellow-100 text-yellow-800",
    "Đã hủy": "bg-red-100 text-red-800",
  };

  // --- TÍNH TOÁN DỮ LIỆU PHÂN TRANG ---
  // Tìm ra vị trí bắt đầu và kết thúc của các đơn hàng trên trang hiện tại
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  // Cắt ra đúng 6 đơn hàng để hiển thị
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  // Tính tổng số trang cần có
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  // Hàm xử lý khi bấm chuyển trang
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Cuộn mượt mà lên đầu trang khi chuyển trang
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  if (loading) {
    return <div className="text-center py-12">Đang tải lịch sử mua hàng...</div>;
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
            <>
              {/* Lặp qua mảng currentOrders thay vì toàn bộ mảng orders */}
              {currentOrders.map((order) => (
                <div
                  key={order.OrderID}
                  className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg">Đơn hàng #{order.OrderID}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar size={16} />
                          {new Date(order.OrderDate).toLocaleDateString("vi-VN", {
                            year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                          })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Package size={16} />
                          {order.TotalItems} sản phẩm
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.Status] || "bg-gray-100 text-gray-800"}`}>
                        {order.Status}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-end justify-between pt-4 border-t">
                    <div>
                      {order.DiscountAmount > 0 && (
                        <p className="text-sm text-green-600 mb-1">
                          Đã giảm: -{order.DiscountAmount.toLocaleString("vi-VN")}₫
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">Tổng thanh toán</p>
                      <p className="text-2xl font-bold text-primary">
                        {order.Total.toLocaleString("vi-VN")}₫
                      </p>
                    </div>
                    <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
                      Chi tiết
                    </button>
                  </div>
                </div>
              ))}

              {/* --- GIAO DIỆN NÚT PHÂN TRANG --- */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8 pt-4">
                  {/* Nút lùi trang */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  {/* Danh sách các số trang */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 rounded border font-medium transition-colors ${
                        currentPage === page
                          ? "bg-black text-white border-black" // Màu đen đang active (bạn có thể thay bằng bg-primary)
                          : "bg-white hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  {/* Nút tiến trang */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
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