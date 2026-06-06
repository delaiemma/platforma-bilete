import client from './client';

export const authAPI = {
  login: (credentials) => client.post('/user/login', credentials),
  signup: (userData) => client.post('/user/signup', userData)
};
