import { apiRequest } from './client';

export const createReview = (placeId, payload) =>
  apiRequest(`/reviews/${placeId}`, { method: 'POST', body: payload });
