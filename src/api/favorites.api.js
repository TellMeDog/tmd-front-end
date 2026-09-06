import { apiRequest } from './client';

export const getFavorites = ({ page = 0, size = 10 } = {}) =>
  apiRequest(`/favorites?page=${page}&size=${size}`);

export const getFavoriteStatus = (placeId) => apiRequest(`/favorites/${placeId}`);

export const addFavorite = (placeId) => apiRequest(`/favorites/${placeId}`, { method: 'POST' });

export const deleteFavorite = (placeId) =>
  apiRequest(`/favorites/${placeId}`, { method: 'DELETE' });
