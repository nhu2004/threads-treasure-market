// Placeholder for user API functions

const userApi = {
  getAll: async (params) => {
    // Simulate fetching user data
    return {
      data: [
        { id: 1, username: 'user1', role: 'customer' },
        { id: 2, username: 'staff1', role: 'staff' },
        { id: 3, username: 'admin1', role: 'admin' },
      ],
      pagination: { page: 1, total: 3 }
    };
  },
  create: async (data) => {
    // Simulate creating user
    return { id: Date.now(), ...data };
  },
};

export default userApi;