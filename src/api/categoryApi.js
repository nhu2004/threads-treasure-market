
const categoryApi = {
  getAll: async (params) => {
    try {
      const res = await fetch('http://localhost:5000/api/categories');
      const data = await res.json();
      return { data: data.categories || [], pagination: { page: 1, total: data.categories?.length || 0 } };
    } catch (err) { return { data: [], pagination: { page: 1, total: 0 } }; }
  },
  create: async (data) => { return { id: Date.now(), ...data }; },
};
export default categoryApi;