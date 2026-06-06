import client from './client';

export const cartAPI = {
  getCart: (userId) => client.get(`/cart/${userId}`),
  add: (userId, eventId, quantity) =>
    client.post('/cart', { userId, eventId, quantity }),
  update: (userId, eventId, quantity) =>
    client.put('/cart', { userId, eventId, quantity }),
  remove: (userId, eventId) =>
    client.delete('/cart', { data: { userId, eventId } }),
  getReservations: (userId) =>
    client.get(`/cart/${userId}`)
};
