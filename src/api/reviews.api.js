import { apiRequest } from './client';

export const getPlaceReviewsPage = (placeId, { page = 0, size = 5, sort = 'latest' } = {}) =>
  apiRequest(`/reviews/${placeId}?page=${page}&size=${size}&sort=${sort}`);

export const getMyReviews = (petId, { page = 0, size = 10 } = {}) =>
  apiRequest(`/reviews/mypage/${petId}?page=${page}&size=${size}`);

export const createReview = (placeId, review) =>
  apiRequest(`/reviews/${placeId}`, { method: 'POST', body: review });

export const updateReview = (reviewId, review) =>
  apiRequest(`/reviews/${reviewId}`, { method: 'PUT', body: review });

export const deleteReview = (reviewId) => apiRequest(`/reviews/${reviewId}`, { method: 'DELETE' });
