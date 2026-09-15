import { reviews } from '../mocks/data/reviews';
import { apiRequest, mockRequest } from './client';

// 지도 담당 화면이 아직 mock 응답 형식을 사용하므로 기존 계약을 유지합니다.
export const getPlaceReviews = (placeId) =>
  mockRequest(reviews.filter((review) => review.placeId === Number(placeId)));

export const getPlaceReviewsPage = (placeId, { page = 0, size = 5, sort = 'latest' } = {}) =>
  apiRequest(`/reviews/${placeId}?page=${page}&size=${size}&sort=${sort}`);

export const getMyReviews = (petId, { page = 0, size = 10 } = {}) =>
  apiRequest(`/reviews/mypage/${petId}?page=${page}&size=${size}`);

export const createReview = (placeId, review) =>
  apiRequest(`/reviews/${placeId}`, { method: 'POST', body: review });

export const updateReview = (reviewId, review) =>
  apiRequest(`/reviews/${reviewId}`, { method: 'PUT', body: review });

export const deleteReview = (reviewId) => apiRequest(`/reviews/${reviewId}`, { method: 'DELETE' });
