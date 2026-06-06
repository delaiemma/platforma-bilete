import client from './client';

export const eventsAPI = {
  getAll: () => client.get('/events'),
  getUpcoming: () => client.get('/events/upcoming'),
  getPast: () => client.get('/events/past'),
  getById: (id) => client.get(`/events/${id}`),
  create: (eventData) => client.post('/events', eventData),
  update: (id, eventData) => client.put(`/events/${id}`, eventData),
  delete: (id) => client.delete(`/events/${id}`),
  search: (params = {}) => {
    const query = new URLSearchParams();
    if (params.q)        query.set('q', params.q);
    if (params.types?.length)  query.set('types', params.types.join(','));
    if (params.cities?.length) query.set('cities', params.cities.join(','));
    if (params.minPrice !== undefined) query.set('minPrice', params.minPrice);
    if (params.maxPrice !== undefined) query.set('maxPrice', params.maxPrice);
    if (params.dateFrom) query.set('dateFrom', params.dateFrom);
    if (params.dateTo)   query.set('dateTo', params.dateTo);
    if (params.sort)     query.set('sort', params.sort);
    if (params.order)    query.set('order', params.order);
    return client.get(`/events/search?${query.toString()}`);
  },
  getCities: () => client.get('/events/cities'),
  getRecommendations: (userId, limit = 3) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (userId) {
      params.append('userId', userId.toString());
    }
    return client.get(`/recommendations?${params.toString()}`);
  }
};
