// Client/src/api/categoryApi.js
const API_URL = 'http://localhost:5000/api/categories';

const categoryApi = {
  getAll: async (params) => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      
      const formattedData = (data.categories || []).map(cat => ({
          ...cat,
          _id: cat.CategoryID,
          name: cat.Name,
          productCount: cat.ProductCount // NHẬN THÊM TRƯỜNG NÀY
      }));

      return { data: formattedData, pagination: { page: 1, total: formattedData.length } };
    } catch (err) { 
      return { data: [], pagination: { page: 1, total: 0 } }; 
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
  // THÊM 2 HÀM NÀY
  exportProducts: async (id) => {
    const res = await fetch(`${API_URL}/${id}/export-products`);
    return await res.json();
  },
  exportOrders: async (id) => {
    const res = await fetch(`${API_URL}/${id}/export-orders`);
    return await res.json();
  },
};
export default categoryApi; 