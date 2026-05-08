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
getById: async (id) => {
      try {
        const response = await fetch(`http://localhost:5000/api/products/${id}`);
        if (!response.ok) throw new Error("Failed to fetch product");
        return await response.json();
      } catch (error) {
        console.error(error);
        return { product: null };
      }
    }, 
create: async (data) => {
        const response = await fetch(`http://localhost:5000/api/products`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return await response.json();
    },

    update: async (id, data) => {
        const response = await fetch(`http://localhost:5000/api/products/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return await response.json();
    },

    delete: async (id) => {
        const response = await fetch(`http://localhost:5000/api/products/${id}`, {
            method: "DELETE",
        });
        return await response.json();
    },

    // Hàm kiểm tra xem sản phẩm đã bị khóa bởi đơn hàng nào chưa
    checkIsOrdered: async (id) => {
        const response = await fetch(`http://localhost:5000/api/products/${id}/check-ordered`);
        return await response.json();
    }
};

export default productApi;