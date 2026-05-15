import axios from "axios";
const API_URL = "http://localhost:5000/api/purchase-orders";

export const purchaseOrderApi = {
    getAll: async () => (await axios.get(API_URL)).data,
    getDetails: async (id) => (await axios.get(`${API_URL}/${id}/details`)).data,
    create: async (data) => (await axios.post(API_URL, data)).data,
    updateStatus: async (id, status) => (await axios.put(`${API_URL}/${id}/status`, { status })).data,
    complete: async (id, items) => (await axios.put(`${API_URL}/${id}/complete`, { items })).data,
    getById: async (id) => (await axios.get(`${API_URL}/${id}`)).data,
};