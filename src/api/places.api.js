import { places } from '../mocks/data/places';
import { haversineDistanceKm, formatDistanceKm } from '../utils/geo';
import { mockRequest } from './client';

export const getPlaces = () => mockRequest(places);
export const getPlace = (placeId) => mockRequest(places.find(({ id }) => id === Number(placeId)));

export const getNearbyPlaces = (origin, { categories } = {}) => {
  const candidates = categories?.length
    ? places.filter((place) => categories.includes(place.category))
    : places;

  const withDistance = candidates
    .map((place) => {
      const distanceKm = haversineDistanceKm(origin, place);
      return { ...place, distanceKm, distanceLabel: formatDistanceKm(distanceKm) };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return mockRequest(withDistance);
};
