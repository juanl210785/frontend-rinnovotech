import api from './client';

export const authApi = {
  login: async (credentials) => {
    const { data } = await api.post('/login', credentials);
    return data;
  },
  register: async (userData) => {
    const { data } = await api.post('/register', userData);
    return data;
  },
  logout: async () => {
    const { data } = await api.post('/logout');
    return data;
  },
  getProfile: async () => {
    const { data } = await api.get('/user');
    return data;
  },
};
