// Product API calls to real Backend (Node.js + SQL Server)

const productApi = {
    getAll: async (params = {}) => {
      try {
        // ĐÃ SỬA: Lấy từ khóa tìm kiếm ra từ params và gắn vào đường dẫn URL
        const search = params.search || '';
        const url = `http://localhost:5000/api/products?search=${encodeURIComponent(search)}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
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