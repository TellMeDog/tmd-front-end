import { apiRequest } from './client';

export const getFavorites = ({ petId, page = 0, size = 10 } = {}) =>
  apiRequest(`/favorites?petId=${petId}&page=${page}&size=${size}`);

// 지도 화면에서 즐겨찾기 추가를 연결할 때 사용합니다.
export const addFavorite = (placeId) => apiRequest(`/favorites/${placeId}`, { method: 'POST' });

export const deleteFavorite = (placeId) =>
  apiRequest(`/favorites/${placeId}`, { method: 'DELETE' });
