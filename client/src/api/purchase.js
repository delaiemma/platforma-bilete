import client from './client';

export const purchaseAPI = {
  process: (purchaseData) => client.post('/purchase', purchaseData),
  createPaymentIntent: (data) => client.post('/payments/create-intent', data),
  confirmPayment: (paymentIntentId) => client.post('/payments/confirm', { paymentIntentId }),
};
