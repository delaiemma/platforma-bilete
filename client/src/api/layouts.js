import client from './client';

export const layoutsAPI = {
  getAll: () => client.get('/layouts'),
  getById: (layoutId) => client.get(`/layouts/${layoutId}`),
  create: (layoutData) => client.post('/layouts', layoutData),
  update: (layoutId, data) => client.put(`/layouts/${layoutId}`, data),
  delete: (layoutId) => client.delete(`/layouts/${layoutId}`),

  addZone: (layoutId, zoneData) => client.post(`/layouts/${layoutId}/zones`, zoneData),
  updateZone: (zoneId, zoneData) => client.put(`/layouts/zones/${zoneId}`, zoneData),
  deleteZone: (zoneId) => client.delete(`/layouts/zones/${zoneId}`),

  addRow: (layoutId, rowData) => client.post(`/layouts/${layoutId}/rows`, rowData),
  updateRow: (rowId, rowData) => client.put(`/layouts/rows/${rowId}`, rowData),
  deleteRow: (rowId) => client.delete(`/layouts/rows/${rowId}`)
};
