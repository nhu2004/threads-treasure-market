// Client/src/api/categoryApi.js
const API_URL = 'http://localhost:5000/api/categories';

const categoryApi = {
  // HỢP NHẤT LOGIC: Xử lý tìm kiếm, phân trang và cờ admin (nếu cần)
  getAll: async (params = {}) => {
    try {
      const search = params.search || '';
      const page = params.page || 1;
      const limit = params.limit || 10;

      // Dựng URL kèm Query String chuẩn xác
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      queryParams.append('page', page);
      queryParams.append('limit', limit);

      const res = await fetch(`${API_URL}?${queryParams.toString()}`);
      const responseData = await res.json();
       const rawList = responseData.data || responseData.categories || [];
      
      const formattedData = rawList.map(cat => ({
          ...cat,
          _id: cat.CategoryID || cat._id, // Map ID linh hoạt
          name: cat.Name || cat.name,       // Map tên linh hoạt
          productCount: cat.productCount || cat.ProductCount || 0
      }));

      return { 
        data: formattedData, 
        pagination: responseData.pagination || { page: 1, totalPage: 1 } 
      };
    } catch (err) { 
      console.error("Lỗi kết nối API Danh mục:", err);
      return { data: [], pagination: { page: 1, totalPage: 1 } }; 
    }
  },
  
  create: async (data) => { 
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return await res.json();
  },

  update: async (id, data) => {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return await res.json();
  },

  delete: async (id) => {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    return await res.json();
  },

  exportProducts: async (id) => {
    const res = await fetch(`${API_URL}/${id}/export-products`);
    return await res.json();
  },

  exportOrders: async (id) => {
    const res = await fetch(`${API_URL}/${id}/export-orders`);
    return await res.json();
  }
};

export default categoryApi;