// Placeholder for supplier API functions

const supplierApi = {
  getAll: async (params) => {
    // Simulate fetching supplier data
    return {
      data: [
        { id: 1, name: 'Supplier 1', description: 'Description 1' },
        { id: 2, name: 'Supplier 2', description: 'Description 2' },
      ],
      pagination: { page: 1, total: 2 }
    };
  },
  create: async (data) => {
    // Simulate creating supplier
    return { id: Date.now(), ...data };
  },
};

export default supplierApi;