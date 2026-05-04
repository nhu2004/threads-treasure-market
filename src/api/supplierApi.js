const API_URL = 'http://localhost:5000/api/suppliers';

const supplierApi = {
  // Lấy danh sách tất cả nhà cung cấp
  getAll: async (params) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', params.page);
      
      const res = await fetch(`${API_URL}?${queryParams.toString()}`);
      const json = await res.json();
      return {
        data: json.data || json.suppliers || [],
        pagination: json.pagination || { page: 1, total: 0 }
      };
    } catch (err) {
      console.error('Lỗi lấy danh sách nhà cung cấp:', err);
      return { data: [], pagination: { page: 1, total: 0 } };
    }
  },

  // Tạo nhà cung cấp mới
  create: async (data) => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err) {
      console.error('Lỗi tạo nhà cung cấp:', err);
      throw err;
    }
  },

  // Cập nhật nhà cung cấp
  update: async (id, data) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err) {
      console.error('Lỗi cập nhật nhà cung cấp:', err);
      throw err;
    }
  },

  // Xóa nhà cung cấp
  delete: async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      return await res.json();
    } catch (err) {
      console.error('Lỗi xóa nhà cung cấp:', err);
      throw err;
    }
  }
};

export default supplierApi;