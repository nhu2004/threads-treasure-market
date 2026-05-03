//src/api/voucherApi.js
import axios from 'axios'; 

const API_URL = 'http://localhost:5000/api/vouchers';  

const voucherApi = {
  getAll: async () => {
    const response = await axios.get(API_URL);
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
};

export default voucherApi;