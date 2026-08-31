import { reviews } from '../mocks/data/reviews';
import { mockRequest } from './client';

export const getPlaceReviews = (placeId) =>
  mockRequest(reviews.filter((review) => review.placeId === Number(placeId)));
