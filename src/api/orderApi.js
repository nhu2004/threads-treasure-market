const orderApi = {
  getAll: async (params = {}) => {
    try {
      const res = await fetch('http://localhost:5000/api/orders');
      const data = await res.json();
      return { count: data.orders?.length || 0, data: data.orders || [] };
    } catch (err) { return { count: 0, data: [] }; }
  },
  fetchOrders: async () => { return []; },
};
export default orderApi;