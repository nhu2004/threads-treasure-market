// Client/src/api/invoicesAPI.js
const API_URL = 'http://localhost:5000/api/invoices';

const invoiceApi = {
  getAll: async (params = {}) => {
    try {
      // 1. Lấy tất cả các biến lọc từ params
      const { page = 1, search, status, startDate, endDate } = params;
      
      let url = `${API_URL}?page=${page}`;

      // 2. Nối thêm các tham số vào URL nếu người dùng có nhập
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (status) url += `&status=${encodeURIComponent(status)}`;
      if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`;
      if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`;

      const res = await fetch(url);
      const json = await res.json();
      
      // 3. Trả về đúng format mà Invoices/index.jsx đang chờ
      return {
          invoices: json.data || [], 
          totalPage: json.pagination?.totalPage || 1
      };
    } catch (err) {
      console.error(err);
      return { invoices: [], totalPage: 1 };
    }
  },
  getDetail: async (id) => {
    const res = await fetch(`${API_URL}/${id}`);
    return await res.json();
  }
};
export default invoiceApi;