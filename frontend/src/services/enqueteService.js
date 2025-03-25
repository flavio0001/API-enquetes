import api from './api';

export const getLatestEnquetes = async (limit = 5) => {
  try {
    const response = await api.get(`/api/enquetes/public?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar enquetes recentes:', error);
    throw error;
  }
};