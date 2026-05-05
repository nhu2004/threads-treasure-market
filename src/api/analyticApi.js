// analyticApi.js

const BASE_URL = 'http://localhost:5000/api/analytics';

const analyticApi = {
  // 1. Lấy tổng doanh thu (Card)
  getTotalRevenue: async () => {
    try {
      const res = await fetch(`${BASE_URL}/revenue`);
      const json = await res.json();
      return json.data ? json : { data: [json] }; 
    } catch (err) { 
      return { data: [{ revenue: 0 }] }; 
    }
  },

  // 2. Lấy doanh thu theo mốc thời gian (Biểu đồ Line) - ĐÃ FIX LỖI AXIOS
  getLifetimeRevenue: async (timeValue) => {
    try {
      // Chuyển sang dùng fetch để đồng nhất và tránh lỗi 'axiosClient is not defined'
      const res = await fetch(`${BASE_URL}/lifetime?time=${timeValue}`);
      const json = await res.json();
      return json; // Backend đã trả về { data: [...] }
    } catch (err) { 
      console.error("Lỗi getLifetimeRevenue:", err);
      return { data: [] }; 
    }
  },

  // 3. Lấy số lượng đơn hàng
  getOrderCountLifeTime: async () => {
    try {
      const res = await fetch(`${BASE_URL}/lifetime`); 
      return await res.json();
    } catch (err) { 
      return { data: [] }; 
    }
  },

  // 4. Lấy sản phẩm bán chạy (Biểu đồ Pie)
  getBestSeller: async () => {
    try {
      const res = await fetch(`${BASE_URL}/bestseller`);
      const json = await res.json();
      // Khớp cấu trúc với hook mong đợi: item.product[0].name
      const formattedData = (json.data || []).map(item => ({
        product: [{ name: item._id }],
        count: item.count
      }));
      return { data: formattedData };
    } catch (err) { 
      return { data: [] }; 
    }
  },

  // 5. Khách hàng mới
  getCustomersThisYear: async () => {
    try {
      const res = await fetch(`${BASE_URL}/customers-this-year`);
      return await res.json();
    } catch (err) { 
      return { count: 0 }; 
    }
  },

  // 6. Trạng thái đơn hàng
  getOrdersStatus: async () => {
    try {
      const res = await fetch(`${BASE_URL}/orders-status`);
      return await res.json();
    } catch (err) { 
      return { data: [] }; 
    }
  }
};

export default analyticApi;