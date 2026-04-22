// Order API functions with mock data for testing

const orderApi = {
  // Get all orders with pagination and filters
  getAll: async (params = {}) => {
    // Mock data - simulate orders
    const orders = [
      {
        OrderID: 1,
        UserID: 1,
        OrderDate: "2024-08-01",
        Status: "Completed",
        Total: 1500000,
      },
      {
        OrderID: 2,
        UserID: 2,
        OrderDate: "2024-08-02",
        Status: "Pending",
        Total: 2500000,
      },
      {
        OrderID: 3,
        UserID: 3,
        OrderDate: "2024-08-03",
        Status: "Completed",
        Total: 1800000,
      },
      {
        OrderID: 4,
        UserID: 1,
        OrderDate: "2024-08-04",
        Status: "Completed",
        Total: 2000000,
      },
      {
        OrderID: 5,
        UserID: 4,
        OrderDate: "2024-08-05",
        Status: "Cancelled",
        Total: 900000,
      },
      {
        OrderID: 6,
        UserID: 5,
        OrderDate: "2024-08-06",
        Status: "Completed",
        Total: 3200000,
      },
      {
        OrderID: 7,
        UserID: 2,
        OrderDate: "2024-08-07",
        Status: "Pending",
        Total: 1200000,
      },
      {
        OrderID: 8,
        UserID: 6,
        OrderDate: "2024-08-08",
        Status: "Completed",
        Total: 2800000,
      },
    ];

    return {
      count: orders.length,
      data: orders,
    };
  },

  fetchOrders: async () => {
    // Simulate fetching order data
    return [
      { id: 1, status: "Pending", total: 500 },
      { id: 2, status: "Completed", total: 1000 },
    ];
  },
};

export default orderApi;