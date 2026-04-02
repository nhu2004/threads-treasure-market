// Placeholder for category API functions

const categoryApi = {
  getAll: async (params) => {
    // Simulate fetching category data
    return {
      data: [
        { id: 1, name: 'Category 1' },
        { id: 2, name: 'Category 2' },
      ],
      pagination: { page: 1, total: 2 }
    };
  },
  create: async (data) => {
    // Simulate creating category
    return { id: Date.now(), ...data };
  },
};

export default categoryApi;