import { places } from '../mocks/data/places';
import { usePetStore } from '../stores/pet.store';
import { formatDistanceKm } from '../utils/geo';
import { apiRequest, mockRequest } from './client';

export const getPlaces = () => mockRequest(places);
export const getPlace = (placeId) => mockRequest(places.find(({ id }) => id === Number(placeId)));

// 사용자가 선택한 반려동물(없으면 대표(첫 번째) 반려동물)의 petId를 사용
const getRepresentativePetId = () => {
  const { pets, selectedPetId } = usePetStore.getState();
  return selectedPetId ?? pets[0]?.petId;
};

const MARKER_COLOR_STATUS = {
  GREEN: 'available',
  YELLOW: 'conditional',
  RED: 'verify',
  GREY: 'unknown',
};

const toPlace = (marker, category) => {
  const distanceKm = marker.distance / 1000;
  return {
    id: marker.placeId,
    lat: marker.mapY,
    lng: marker.mapX,
    category,
    status: MARKER_COLOR_STATUS[marker.markerColor] ?? 'unknown',
    name: marker.title,
    image: marker.firstImage || '',
    rating: marker.averageRating,
    favorite: marker.favorite,
    distanceKm,
    distanceLabel: formatDistanceKm(distanceKm),
  };
};

const fetchPlacesByCategory = ({ sw, ne }, category, petId, origin) => {
  const query = new URLSearchParams({
    swLat: sw.lat,
    swLng: sw.lng,
    neLat: ne.lat,
    neLng: ne.lng,
    currMapX: origin.lng,
    currMapY: origin.lat,
    petId,
  });
  if (category) query.set('category', category);

  return apiRequest(`/places/search/category?${query}`).then((data) =>
    data.map((marker) => toPlace(marker, category)),
  );
};

export const getNearbyPlaces = async (
  bounds,
  { category, origin, petId = getRepresentativePetId() } = {},
) => {
  if (!bounds || !petId || !origin) return { success: true, data: [] };

  const candidates = await fetchPlacesByCategory(bounds, category, petId, origin);
  const data = [...candidates].sort((a, b) => a.distanceKm - b.distanceKm);

  return { success: true, data };
};

export const getPlaceDetail = async (
  placeId,
  { mapX, mapY, petId = getRepresentativePetId(), reviewSize = 10, reviewSort = 'latest' } = {},
) => {
  const query = new URLSearchParams({ mapX, mapY, reviewSize, reviewSort });
  if (petId) query.set('petId', petId);

  const data = await apiRequest(`/places/${placeId}?${query}`);

  return { success: true, data };
};

export const searchPlacesByKeyword = async (
  keyword,
  { petId = getRepresentativePetId(), origin } = {},
) => {
  if (!keyword || !petId || !origin) return { success: true, data: [] };

  const query = new URLSearchParams({ keyword, petId, currMapX: origin.lng, currMapY: origin.lat });
  const markers = await apiRequest(`/places/search/keyword?${query}`);

  return { success: true, data: markers.map((marker) => toPlace(marker, null)) };
};
