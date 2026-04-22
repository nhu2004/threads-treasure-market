// Product API functions with mock data for testing

const productApi = {
  // Get all products with pagination and filters
  getAll: async (params = {}) => {
    // Mock data - simulate product list
    const products = [
      {
        ProductID: 1,
        Name: "Áo thun cotton nam",
        Price: 150000,
        BrandID: 1,
        CategoryID: 1,
        Description: "Áo thun cotton 100% thoáng mát",
      },
      {
        ProductID: 2,
        Name: "Quần jean xanh",
        Price: 350000,
        BrandID: 2,
        CategoryID: 2,
        Description: "Quần jean cao cấp",
      },
      {
        ProductID: 3,
        Name: "Đầm dạo phố",
        Price: 500000,
        BrandID: 1,
        CategoryID: 3,
        Description: "Đầm xinh cho các cô gái",
      },
      {
        ProductID: 4,
        Name: "Áo blazer nữ",
        Price: 600000,
        BrandID: 3,
        CategoryID: 1,
        Description: "Áo blazer chuyên nghiệp",
      },
      {
        ProductID: 5,
        Name: "Phụ kiện - Mũ",
        Price: 100000,
        BrandID: 1,
        CategoryID: 4,
        Description: "Mũ thời trang",
      },
      {
        ProductID: 6,
        Name: "Áo khoác gió",
        Price: 250000,
        BrandID: 2,
        CategoryID: 1,
        Description: "Áo khoác chống nước",
      },
      {
        ProductID: 7,
        Name: "Quần short",
        Price: 180000,
        BrandID: 1,
        CategoryID: 2,
        Description: "Quần short mùa hè",
      },
      {
        ProductID: 8,
        Name: "Giày sneaker",
        Price: 400000,
        BrandID: 4,
        CategoryID: 4,
        Description: "Giày sneaker thể thao",
      },
    ];

    return {
      count: products.length,
      data: products,
    };
  },

  fetchProducts: async () => {
    // Simulate fetching product data
    return [
      { id: 1, name: "Product 1", price: 100 },
      { id: 2, name: "Product 2", price: 200 },
    ];
  },
};

export default productApi;