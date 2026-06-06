import client from './client';

export const waitlistAPI = {
  join: (eventId) => client.post(`/events/${eventId}/waitlist`),
  leave: (eventId) => client.delete(`/events/${eventId}/waitlist`),
  getStatus: (eventId) => client.get(`/events/${eventId}/waitlist/status`),
  getNotifications: () => client.get('/notifications'),
  markRead: () => client.put('/notifications/read'),
};
