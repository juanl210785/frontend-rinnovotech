import api from './client';

export const ordersApi = {
  create: async (orderData) => {
    const { data } = await api.post('/orders', orderData);
    return data;
  },
  getActive: async () => {
    const { data } = await api.get('/orders/active');
    return data;
  },
  cancel: async (orderId) => {
    const { data } = await api.post(`/orders/${orderId}/cancel`);
    return data;
  },
  addItem: async (orderId, { variant_id, quantity = 1 }) => {
    const { data } = await api.post(`/orders/${orderId}/items`, { variant_id, quantity });
    return data;
  },
  removeItem: async (orderId, itemId) => {
    const { data } = await api.delete(`/orders/${orderId}/items/${itemId}`);
    return data;
  },
  getById: async (id) => {
    const { data } = await api.get(`/orders/${id}`);
    return data;
  },
  confirmPayment: async (orderId, paymentData) => {
    const { data } = await api.post(`/orders/${orderId}/confirm-payment`, paymentData);
    return data;
  },
  getMyOrders: async (params = {}) => {
    const { data } = await api.get('/orders', { params });
    return data;
  },
  getAll: async (params = {}) => {
    const { data } = await api.get('/admin/orders', { params });
    return data;
  },
};
