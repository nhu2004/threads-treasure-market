// Product API calls to real Backend (Node.js + SQL Server)
const productApi = {
    getAll: async (params = {}) => {
    try {
      const search = params.search || '';
      const page = params.page || 1;
      const limit = params.limit || 7; // Mặc định hiển thị 7 sản phẩm

      // Dựng URL cơ bản với các tham số tìm kiếm và phân trang
      let url = `http://localhost:5000/api/products?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`;

      // QUAN TRỌNG: Gửi cờ admin xuống Backend nếu đang ở trang quản trị
      if (params.admin) {
          url += `&admin=true`;
      }

      const response = await fetch(url);
      const data = await response.json();

      return data; // Trả về object chứa { products, totalPage, ... }
    } catch (error) {
      console.error("Lỗi không thể kết nối đến Backend:", error);
      // Trả về dữ liệu rỗng an toàn để Frontend không bị sập
      return { products: [], totalPage: 1 };
    }
  },
    
    getById: async (id) => { 
        const response = await fetch(`http://localhost:5000/api/products/${id}`);
        const data = await response.json();
        return data.product;
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
    
};

export default productApi;