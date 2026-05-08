// Client/src/api/invoiceApi.js
const API_URL = 'http://localhost:5000/api/invoices';

const invoiceApi = {
  getAll: async (params) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}?${query}`);
    const json = await res.json();
    return json.data || [];
  },
  getDetail: async (id) => {
    const res = await fetch(`${API_URL}/${id}`);
    return await res.json();
  }
};
export default invoiceApi;