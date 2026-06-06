import client from './client';

export const statisticsAPI = {
  getOverview: () => client.get('/statistics/overview'),
  getSalesByEvent: () => client.get('/statistics/sales-by-event'),
  getRevenueOverTime: () => client.get('/statistics/revenue-over-time'),
  getTopEvents: () => client.get('/statistics/top-events'),
  getEventTypes: () => client.get('/statistics/event-types'),
  getRecentPurchases: () => client.get('/statistics/recent-purchases')
};
