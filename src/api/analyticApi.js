const analyticApi = {
  getTotalRevenue: async () => {
    try {
      const res = await fetch('http://localhost:5000/api/analytics/revenue');
      return await res.json();
    } catch (err) { return { data: [{ revenue: 0 }] }; }
  },
  getRevenueLifeTime: async () => {
    try {
      const res = await fetch('http://localhost:5000/api/analytics/lifetime');
      return await res.json();
    } catch (err) { return { data: [] }; }
  },
  // Các hàm khác tạm thời trả về mảng rỗng để không bị lỗi
  getRevenueWeek: async () => ({ data: [] }),
  getOrderCountLifeTime: async () => ({ data: [] }),
  getBestSeller: async () => ({ data: [] }),
  fetchAnalytics: async () => ({ data: [] }),
};
export default analyticApi;