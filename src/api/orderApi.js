const orderApi = {
  getAll: async (params = {}) => {
    try {
      const { page = 1, limit = 10 } = params;
      // Gửi query params lên backend để SQL thực hiện OFFSET/FETCH
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
};
export default orderApi;