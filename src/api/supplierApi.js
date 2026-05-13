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

  // SỬA ĐỔI: Dù hook gọi hàm "delete" nhưng ta sẽ call API "toggle-status" (Ngừng hợp tác) thay vì xóa hẳn
  delete: async (id) => {
    const res = await fetch(`${API_URL}/${id}/toggle-status`, { method: 'PUT' });
    return await res.json();
  },

  // API MỚI: Đổi trạng thái (Dành cho việc gọi trực tiếp nếu cần)
  toggleStatus: async (id) => {
    const res = await fetch(`${API_URL}/${id}/toggle-status`, { method: 'PUT' });
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

  // API MỚI: Lấy lịch sử nhập hàng (Purchase Orders)
  getPurchaseOrders: async (id) => {
    const res = await fetch(`${API_URL}/${id}/purchases`);
    return await res.json();
  }
};

export default supplierApi;