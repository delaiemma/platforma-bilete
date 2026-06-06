import client from './client';

export const userAPI = {
  getProfile: () => client.get('/user/profile'),
  updateProfile: (data) => client.put('/user/profile', data),
  updatePassword: (data) => client.put('/user/password', data)
};
