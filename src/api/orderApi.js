const orderApi = {
  getAll: async (params = {}) => {
    try {
      // Lấy thêm các biến lọc từ params
      const { page = 1, limit = 10, search, status, startDate, endDate } = params;
      
      // Khởi tạo URL cơ bản
      let url = `http://localhost:5000/api/orders?page=${page}&limit=${limit}`;

      // Nối thêm các tham số nếu người dùng có nhập
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (status) url += `&status=${encodeURIComponent(status)}`;
      if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`;
      if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`;

      const res = await fetch(url);
      const data = await res.json();
      
      return { 
        count: data.total || data.orders?.length || 0, 
        data: data.orders || [],
        pagination: {
          totalPage: data.totalPage || 1
        },
        stats: data.stats // <--- BỔ SUNG DÒNG NÀY ĐỂ TRUYỀN LÊN HOOK
      };
    } catch (err) { 
      return { count: 0, data: [], pagination: { totalPage: 1 } }; 
    }
  },

  getById: async (id, params = {}) => {
    const res = await fetch(`http://localhost:5000/api/orders/${id}`);
    if (!res.ok) throw new Error("Failed to fetch");
    return await res.json();
  },

  updateOrderStatus: async (id, data) => {
    const res = await fetch(`http://localhost:5000/api/orders/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update");
    return await res.json();
  },
// Hàm mới để lấy đơn hàng theo User đang đăng nhập
  getUserOrders: async (userId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/user/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch user orders");
      return await res.json();
    } catch (err) {
      console.error(err);
      return { orders: [] };
    }
  },
  printInvoiceAndShip: async (id) => {
    const res = await fetch(`http://localhost:5000/api/orders/${id}/invoice-and-ship`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    if (!res.ok) throw new Error("Failed to print invoice and ship");
    return await res.json();
  },

  // BỔ SUNG: API up ảnh xác nhận và chuyển trạng thái "Đã giao"
  confirmDelivery: async (id, formData) => {
    // Lưu ý: Gửi file qua form-data KHÔNG set header Content-Type, trình duyệt sẽ tự set boundary
    const res = await fetch(`http://localhost:5000/api/orders/${id}/confirm-delivery`, {
      method: "PUT",
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to confirm delivery");
    return await res.json();
  },
  // Hủy đơn hàng (Kèm lý do và người hủy)
  cancelOrder: async (id, data) => {
    const res = await fetch(`http://localhost:5000/api/orders/${id}/cancel`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to cancel order");
    return await res.json();
  },

  // Cập nhật thông tin đơn hàng (Giảm giá, Ghi chú)
  updateOrderDetails: async (id, data) => {
    const res = await fetch(`http://localhost:5000/api/orders/${id}/details`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update details");
    return await res.json();
  }
};
export default orderApi;