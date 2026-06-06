import client from './client';

export const reviewsAPI = {
    getEventReviews: (eventId) => client.get(`/reviews/event/${eventId}`),
    createOrUpdate: (eventId, data) => client.post(`/reviews/event/${eventId}`, data),
    deleteReview: (reviewId) => client.delete(`/reviews/${reviewId}`)
};
