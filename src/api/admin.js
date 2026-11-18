import api from './client';

export const adminApi = {
  // Productos Administrativos
  getProducts: async (params = {}) => {
    const { data } = await api.get('/admin/products', { params });
    return data;
  },
  getProductById: async (id) => {
    const { data } = await api.get(`/admin/products/${id}`);
    return data;
  },
  createProduct: async (formData) => {
    const headers = formData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const { data } = await api.post('/admin/products', formData, { headers });
    return data;
  },
  updateProduct: async (id, formData) => {
    const headers = formData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    // Laravel espera POST con _method=PUT para procesar multipart con imágenes
    const { data } = await api.post(`/admin/products/${id}?_method=PUT`, formData, { headers });
    return data;
  },
  deleteProduct: async (id) => {
    const { data } = await api.delete(`/admin/products/${id}`);
    return data;
  },

  // Opciones y Features
  getOptions: async () => {
    const { data } = await api.get('/admin/options');
    return data;
  },
  createOption: async (optionData) => {
    const { data } = await api.post('/admin/options', optionData);
    return data;
  },
  updateOption: async (optionId, optionData) => {
    const { data } = await api.put(`/admin/options/${optionId}`, optionData);
    return data;
  },
  deleteOption: async (optionId) => {
    const { data } = await api.delete(`/admin/options/${optionId}`);
    return data;
  },
  addFeature: async (optionId, featureData) => {
    const { data } = await api.post(`/admin/options/${optionId}/features`, featureData);
    return data;
  },
  deleteFeature: async (featureId) => {
    const { data } = await api.delete(`/admin/features/${featureId}`);
    return data;
  },

  // Vinculación Opción <-> Subcategoría
  getSubcategoryOptions: async (subcategoryId) => {
    const { data } = await api.get(`/admin/subcategories/${subcategoryId}/options`);
    return data;
  },
  syncSubcategoryOptions: async (subcategoryId, optionIds) => {
    const { data } = await api.post(`/admin/subcategories/${subcategoryId}/options`, {
      options: optionIds,
    });
    return data;
  },

  // Árbol de Categorías
  getCategories: async () => {
    const { data } = await api.get('/categories');
    return data;
  },

  // Órdenes Administrativas y Auditoría de Pagos BDV
  getOrders: async (params = {}) => {
    const { data } = await api.get('/admin/orders', { params });
    return data;
  },
  getOrderStats: async () => {
    const { data } = await api.get('/admin/orders/stats');
    return data;
  },
  getOrderById: async (orderId) => {
    const { data } = await api.get(`/admin/orders/${orderId}`);
    return data;
  },
  updateOrderStatus: async (orderId, statusData) => {
    const { data } = await api.patch(`/admin/orders/${orderId}/status`, statusData);
    return data;
  },
};
