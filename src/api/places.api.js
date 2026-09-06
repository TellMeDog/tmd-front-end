import { places } from '../mocks/data/places';
import { haversineDistanceKm, formatDistanceKm } from '../utils/geo';
import { apiRequest, mockRequest } from './client';

export const getPlaces = () => mockRequest(places);
export const getPlace = (placeId) => mockRequest(places.find(({ id }) => id === Number(placeId)));

// TODO: 백엔드에 "전체" 카테고리 조회가 추가되면 기본값을 제거하고 그쪽을 호출하도록 변경
const DEFAULT_CATEGORY = '카페';

const MARKER_COLOR_STATUS = {
  GREEN: 'available',
  YELLOW: 'conditional',
  RED: 'verify',
};

const toPlace = (marker, category) => ({
  id: marker.placeId,
  lat: marker.mapY,
  lng: marker.mapX,
  category,
  status: MARKER_COLOR_STATUS[marker.markerColor] ?? 'conditional',
});

const fetchPlacesByCategory = ({ sw, ne }, category, petId) =>
  apiRequest('/places/search/category', {
    params: { swLat: sw.lat, swLng: sw.lng, neLat: ne.lat, neLng: ne.lng, category, petId },
  }).then(({ data }) => data.map((marker) => toPlace(marker, category)));

export const getNearbyPlaces = async (
  bounds,
  { category, origin, petId = Number(import.meta.env.VITE_DEFAULT_PET_ID) } = {},
) => {
  if (!bounds) return { success: true, data: [] };

  const candidates = await fetchPlacesByCategory(bounds, category ?? DEFAULT_CATEGORY, petId);

  const data = origin
    ? candidates
        .map((place) => {
          const distanceKm = haversineDistanceKm(origin, place);
          return { ...place, distanceKm, distanceLabel: formatDistanceKm(distanceKm) };
        })
        .sort((a, b) => a.distanceKm - b.distanceKm)
    : candidates;

  return { success: true, data };
};
