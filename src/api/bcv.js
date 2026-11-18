import api from './client';

export const bcvApi = {
  getRate: async () => {
    const { data } = await api.get('/bcv-rate');
    return data;
  },
};
