import { places } from '../mocks/data/places';
import { haversineDistanceKm, formatDistanceKm } from '../utils/geo';
import { mockRequest } from './client';

export const getPlaces = () => mockRequest(places);
export const getPlace = (placeId) => mockRequest(places.find(({ id }) => id === Number(placeId)));

const isWithinBounds = (place, bounds) => {
  const { sw, ne } = bounds;
  return place.lat >= sw.lat && place.lat <= ne.lat && place.lng >= sw.lng && place.lng <= ne.lng;
};

export const getPlacesInBounds = (bounds, { categories, origin } = {}) => {
  const candidates = categories?.length
    ? places.filter((place) => categories.includes(place.category))
    : places;

  const withinBounds = bounds ? candidates.filter((place) => isWithinBounds(place, bounds)) : candidates;

  const result = origin
    ? withinBounds
        .map((place) => {
          const distanceKm = haversineDistanceKm(origin, place);
          return { ...place, distanceKm, distanceLabel: formatDistanceKm(distanceKm) };
        })
        .sort((a, b) => a.distanceKm - b.distanceKm)
    : withinBounds;

  return mockRequest(result);
};
