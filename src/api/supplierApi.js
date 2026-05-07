const API_URL = 'http://localhost:5000/api/suppliers';

const supplierApi = {
  getAll: async (params) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', params.page);
      
      const res = await fetch(`${API_URL}?${queryParams.toString()}`);
      const json = await res.json();
      
      // Map lại trường dữ liệu cho khớp Frontend
      const formattedData = (json.data || json.suppliers || []).map(sup => ({
          ...sup,
          _id: sup.SupplierID, // Gán id
          name: sup.Name,      // Gán tên
          productCount: sup.ProductCount // Số lượng SP
      }));

      return {
        data: formattedData,
        pagination: json.pagination || { page: 1, total: Math.ceil(formattedData.length/10) || 1 }
      };
    } catch (err) {
      return { data: [], pagination: { page: 1, total: 1 } };
    }
  },

  create: async (data) => {
    const res = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    return await res.json();
  },
  update: async (id, data) => {
    const res = await fetch(`${API_URL}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    return await res.json();
  },
  delete: async (id) => {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    return await res.json();
  },
  // Thêm 2 API Xuất File
  exportProducts: async (id) => {
    const res = await fetch(`${API_URL}/${id}/export-products`);
    return await res.json();
  },
  exportOrders: async (id) => {
    const res = await fetch(`${API_URL}/${id}/export-orders`);
    return await res.json();
  },
};

export default supplierApi;