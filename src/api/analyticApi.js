// Analytic API functions with mock data for testing

const analyticApi = {
  // Get total revenue
  getTotalRevenue: async () => {
    // Mock data - in production, this would come from the backend
    return {
      data: [
        {
          revenue: 15000000, // 15 million VND
        },
      ],
    };
  },

  // Get revenue lifetime
  getRevenueLifeTime: async () => {
    // Mock data - simulate monthly revenue over time
    return {
      data: [
        { _id: "Tháng 1", revenue: 1000000 },
        { _id: "Tháng 2", revenue: 1500000 },
        { _id: "Tháng 3", revenue: 1200000 },
        { _id: "Tháng 4", revenue: 2000000 },
        { _id: "Tháng 5", revenue: 1800000 },
        { _id: "Tháng 6", revenue: 2500000 },
        { _id: "Tháng 7", revenue: 3000000 },
        { _id: "Tháng 8", revenue: 2200000 },
      ],
    };
  },

  // Get revenue by week
  getRevenueWeek: async (params) => {
    // Mock data - simulate daily revenue for a week
    return {
      data: [
        { _id: "Thứ 2", revenue: 300000 },
        { _id: "Thứ 3", revenue: 350000 },
        { _id: "Thứ 4", revenue: 280000 },
        { _id: "Thứ 5", revenue: 420000 },
        { _id: "Thứ 6", revenue: 500000 },
        { _id: "Thứ 7", revenue: 450000 },
        { _id: "Chủ nhật", revenue: 200000 },
      ],
    };
  },

  // Get order count lifetime
  getOrderCountLifeTime: async () => {
    // Mock data - simulate monthly order counts
    return {
      data: [
        { _id: "Tháng 1", total: 45 },
        { _id: "Tháng 2", total: 62 },
        { _id: "Tháng 3", total: 58 },
        { _id: "Tháng 4", total: 78 },
        { _id: "Tháng 5", total: 69 },
        { _id: "Tháng 6", total: 95 },
        { _id: "Tháng 7", total: 112 },
        { _id: "Tháng 8", total: 87 },
      ],
    };
  },

  // Get best selling products
  getBestSeller: async () => {
    // Mock data - simulate best selling products
    return {
      data: [
        {
          _id: "product_1",
          count: 156,
          product: [
            {
              _id: "1",
              name: "Áo thun cotton nam",
            },
          ],
        },
        {
          _id: "product_2",
          count: 143,
          product: [
            {
              _id: "2",
              name: "Quần jean xanh",
            },
          ],
        },
        {
          _id: "product_3",
          count: 128,
          product: [
            {
              _id: "3",
              name: "Đầm dạo phố",
            },
          ],
        },
        {
          _id: "product_4",
          count: 95,
          product: [
            {
              _id: "4",
              name: "Áo blazer nữ",
            },
          ],
        },
        {
          _id: "product_5",
          count: 87,
          product: [
            {
              _id: "5",
              name: "Phụ kiện - Mũ",
            },
          ],
        },
        {
          _id: "product_6",
          count: 76,
          product: [
            {
              _id: "6",
              name: "Áo khoác gió",
            },
          ],
        },
        {
          _id: "product_7",
          count: 65,
          product: [
            {
              _id: "7",
              name: "Quần short",
            },
          ],
        },
      ],
    };
  },

  fetchAnalytics: async () => {
    // Simulate fetching analytics data
    return [
      { id: 1, metric: "Sales", value: 10000 },
      { id: 2, metric: "Users", value: 500 },
    ];
  },
};

export default analyticApi;