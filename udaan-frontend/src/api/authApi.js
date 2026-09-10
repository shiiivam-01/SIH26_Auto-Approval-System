import api from './axios';

export const login = async (credentials) => {
  const { data } = await api.post('/auth/login', credentials);
  return data;
};

export const register = async (userData) => {
  const { data } = await api.post('/auth/register', userData);
  return data;
};

export const googleLogin = async (payload) => {
  const { data } = await api.post('/auth/google', payload);
  return data;
};

