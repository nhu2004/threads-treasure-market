// analyticApi.js
const analyticApi = {
  getTotalRevenue: async () => {
    try {
      const res = await fetch('http://localhost:5000/api/analytics/revenue');
      const json = await res.json();
      // Đảm bảo trả về đúng cấu trúc { data: [...] }
      return json.data ? json : { data: [json] }; 
    } catch (err) { return { data: [{ revenue: 0 }] }; }
  },
  getRevenueLifeTime: async () => {
    try {
      const res = await fetch('http://localhost:5000/api/analytics/lifetime');
      const json = await res.json();
      return json.data ? json : { data: json || [] };
    } catch (err) { return { data: [] }; }
  },
  // Bổ sung các hàm đang trả về rỗng để biểu đồ có dữ liệu test 
  getOrderCountLifeTime: async () => {
      try {
        const res = await fetch('http://localhost:5000/api/analytics/lifetime'); 
        return await res.json();
      } catch (err) { return { data: [] }; }
    },

    getBestSeller: async () => {
      try {
        const res = await fetch('http://localhost:5000/api/analytics/bestseller');
        const json = await res.json();
        // Khớp cấu trúc với hook mong đợi: item.product[0].name
        const formattedData = json.data.map(item => ({
          product: [{ name: item._id }],
          count: item.count
        }));
        return { data: formattedData };
      } catch (err) { return { data: [] }; }
    },
    getCustomersThisYear: async () => {
      const res = await fetch('http://localhost:5000/api/analytics/customers-this-year');
      return await res.json();
    },
    getOrdersStatus: async () => {
      const res = await fetch('http://localhost:5000/api/analytics/orders-status');
      return await res.json();
    }
  };

export default analyticApi;