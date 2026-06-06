import client from './client';

export const favoritesAPI = {
  get: (userId) => client.get(`/user/favourites/${userId}`),
  add: (userId, eventId) =>
    client.post('/user/favourites', { userId, eventId }),
  remove: (userId, eventId) =>
    client.delete('/user/favourites', { data: { userId, eventId } })
};
