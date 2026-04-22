const userApi = {
  getAll: async (params) => {
    try {
      const res = await fetch('http://localhost:5000/api/users');
      const data = await res.json();
      return { data: data.users || [], pagination: { page: 1, total: data.users?.length || 0 } };
    } catch (err) { return { data: [], pagination: { page: 1, total: 0 } }; }
  },
  create: async (data) => { return { id: Date.now(), ...data }; },
};
export default userApi;