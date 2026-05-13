// Product API calls to real Backend (Node.js + SQL Server)
const productApi = {
    getAll: async (params = {}) => {
      try {
        const search = params.search || '';
        let url = `http://localhost:5000/api/products?search=${encodeURIComponent(search)}`;
        
        // QUAN TRỌNG: Gửi cờ admin xuống Backend
        if (params.admin) url += `&admin=true`;
        
        const response = await fetch(url);
        return await response.json();
      } catch (error) {
        console.error("Lỗi API:", error);
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
    }
};

export default productApi;