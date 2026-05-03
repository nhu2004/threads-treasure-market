const orderApi = {
  getAll: async (params = {}) => {
    try {
      const { page = 1, limit = 10 } = params;
      const res = await fetch(`http://localhost:5000/api/orders?page=${page}&limit=${limit}`);
      const data = await res.json();
      
      return { 
        count: data.total || data.orders?.length || 0, 
        data: data.orders || [],
        pagination: {
          totalPage: data.totalPage || 1
        }
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
  }
};
export default orderApi;