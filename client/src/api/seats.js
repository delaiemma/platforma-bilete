import client from './client';

export const seatsAPI = {
  reserve: (userId, eventId, seats) => client.post('/seats/reserve', { userId, eventId, seats }),
  unreserve: (userId, eventId, seats) => client.post('/seats/unreserve', { userId, eventId, seats }),
  extendReservation: (userId, eventId) => client.post('/seats/extend-reservation', { userId, eventId }),
  getAvailability: (eventId, userId) => {
    const params = userId ? `?userId=${userId}` : '';
    return client.get(`/seats/event/${eventId}/availability${params}`);
  },
  getUserReservations: (userId) => client.get(`/seats/user/${userId}/reservations`),
  getUserTickets: (userId) => client.get(`/seats/user/${userId}/tickets`),
  verifyTicket: (ticketId) => client.get(`/seats/verify/${ticketId}`),
  recommend: (eventId, count, maxBudget) => client.post(`/seats/event/${eventId}/recommend`, { count, maxBudget })
};

export const eventLayoutAPI = {
  assign: (eventId, layoutId, zonePricing) => client.post(`/events/${eventId}/layout`, { layoutId, zonePricing }),
  remove: (eventId) => client.delete(`/events/${eventId}/layout`),
  updatePricing: (eventId, zonePricing) => client.put(`/events/${eventId}/layout/pricing`, { zonePricing }),
  getLayout: (eventId) => client.get(`/events/${eventId}/layout`),
};
