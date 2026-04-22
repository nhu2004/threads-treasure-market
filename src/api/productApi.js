// Product API calls to real Backend (Node.js + SQL Server)

const productApi = {
  // Lấy tất cả sản phẩm
  getAll: async (params = {}) => {
    try {
      // Gọi xuống Backend Node.js của bạn (đảm bảo server.js đang chạy)
      const response = await fetch('http://localhost:5000/api/products');
      const data = await response.json();
      
      // Backend của bạn sẽ trả về { products: [...], totalPage: 1 }
      return data;
    } catch (error) {
      console.error("Lỗi không thể kết nối đến Backend:", error);
      return { products: [], totalPage: 1 };
    }
  },

  // Bạn có thể giữ lại các hàm phụ khác nếu cần
  fetchProducts: async () => {
    return [];
  },
};

export default productApi;