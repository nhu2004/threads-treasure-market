// Placeholder for brand API functions

const brandApi = {
  getAll: async (params) => {
    // Simulate fetching brand data
    return {
      data: [
        { id: 1, name: 'Brand 1', year: 2020 },
        { id: 2, name: 'Brand 2', year: 2021 },
      ],
      pagination: { page: 1, total: 2 }
    };
  },
  create: async (data) => {
    // Simulate creating brand
    return { id: Date.now(), ...data };
  },
};

export default brandApi;