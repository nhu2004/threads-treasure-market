const API_URL = 'http://localhost:5000/api/brands';

const brandApi = {
  // Lấy danh sách tất cả thương hiệu
  getAll: async (params) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', params.page);
      
      const res = await fetch(`${API_URL}?${queryParams.toString()}`);
      const json = await res.json();
      return {
        data: json.data || json.brands || [],
        pagination: json.pagination || { page: 1, total: 0 }
      };
    } catch (err) {
      console.error('Lỗi lấy danh sách thương hiệu:', err);
      return { data: [], pagination: { page: 1, total: 0 } };
    }
  },

  // Tạo thương hiệu mới
  create: async (data) => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err) {
      console.error('Lỗi tạo thương hiệu:', err);
      throw err;
    }
  },

  // Cập nhật thương hiệu
  update: async (id, data) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err) {
      console.error('Lỗi cập nhật thương hiệu:', err);
      throw err;
    }
  },

  // Xóa thương hiệu
  delete: async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      return await res.json();
    } catch (err) {
      console.error('Lỗi xóa thương hiệu:', err);
      throw err;
    }
  }
};

export default brandApi;