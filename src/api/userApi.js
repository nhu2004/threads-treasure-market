const userApi = {
  getAll: async (params) => {
    try {
      const res = await fetch('http://localhost:5000/api/users');
      const data = await res.json();
      return { data: data.users || [], pagination: { page: 1, total: data.users?.length || 0 } };
    } catch (err) { return { data: [], pagination: { page: 1, total: 0 } }; }
  },
  create: async (data) => { return { id: Date.now(), ...data }; },



  updateProfile: async (id, data) => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // Nếu có token hãy thêm: 'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (err) {
      throw err;
    }
  },
};
export default userApi;