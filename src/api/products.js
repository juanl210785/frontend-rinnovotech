import api from './client';

export const productsApi = {
  getAll: async (params = {}) => {
    const { data } = await api.get('/products', { params });
    return data;
  },
  getById: async (id) => {
    const { data } = await api.get(`/products/${id}`);
    return data;
  },
  // Endpoints administrativos
  create: async (productData) => {
    const { data } = await api.post('/admin/products', productData);
    return data;
  },
  update: async (id, productData) => {
    const { data } = await api.put(`/admin/products/${id}`, productData);
    return data;
  },
  delete: async (id) => {
    const { data } = await api.delete(`/admin/products/${id}`);
    return data;
  },
};
