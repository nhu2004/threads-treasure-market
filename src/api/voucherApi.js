//src/api/voucherApi.js
import axios from 'axios'; 

const API_URL = 'http://localhost:5000/api/vouchers';  

const voucherApi = {
  getAll: async (params = {}) => {
    const { page = 1, limit = 10 } = params;
    const response = await axios.get(`${API_URL}?page=${page}&limit=${limit}`);
    return response.data;
  },
  
  // Endpoint mới gọi theo user
  getUserVouchers: async (userId) => {
    const response = await axios.get(`${API_URL}/user/${userId}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await axios.post(`${API_URL}/add`, data);
    return response.data;
  },
  getTopUsed: async () => {
      const response = await axios.get(`${API_URL}/top-used`);
      return response.data;
    },
    // Thêm hàm Update
    update: async (id, data) => {
      const response = await axios.put(`${API_URL}/${id}`, data);
      return response.data;
    },
    // Thêm hàm Delete
    delete: async (id) => {
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data;
    }
  };

export default voucherApi;