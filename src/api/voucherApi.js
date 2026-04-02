// Placeholder for voucher API functions

const voucherApi = {
  getAll: async (params) => {
    // Simulate fetching voucher data
    return {
      data: [
        { id: 1, code: 'VOUCHER1', value: 10, by: 'percent' },
        { id: 2, code: 'VOUCHER2', value: 50, by: 'amount' },
      ],
      pagination: { page: 1, total: 2 }
    };
  },
  create: async (data) => {
    // Simulate creating voucher
    return { id: Date.now(), ...data };
  },
};

export default voucherApi;