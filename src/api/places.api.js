import { usePetStore } from '../stores/pet.store';
import { formatDistanceKm } from '../utils/geo';
import { apiRequest } from './client';

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

// 장소 상세 페이지에서도 마커 응답을 동일한 형태로 다뤄야 해서 export
export const toPlace = (marker, category) => {
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

// petId가 없으면(비로그인 또는 반려동물 미선택) 회색 마커로 응답하므로,
// petId 없이도 조회 자체는 계속 진행해야 함
const fetchPlacesByCategory = ({ sw, ne }, category, petId, origin) => {
  const query = new URLSearchParams({
    swLat: sw.lat,
    swLng: sw.lng,
    neLat: ne.lat,
    neLng: ne.lng,
    currMapX: origin.lng,
    currMapY: origin.lat,
  });
  if (category) query.set('category', category);
  if (petId) query.set('petId', petId);

  return apiRequest(`/places/search/category?${query}`).then((data) =>
    data.map((marker) => toPlace(marker, category)),
  );
};

export const getNearbyPlaces = async (
  bounds,
  { category, origin, petId = getRepresentativePetId() } = {},
) => {
  if (!bounds || !origin) return { success: true, data: [] };

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

// 메인 화면 미니 지도/추천 목록에 쓰는, 현재 좌표 6km 이내 10곳 조회
export const getHomePlaces = async ({ origin, petId = getRepresentativePetId() } = {}) => {
  if (!origin) return { success: true, data: [] };

  const query = new URLSearchParams({ currMapX: origin.lng, currMapY: origin.lat });
  if (petId) query.set('petId', petId);

  const markers = await apiRequest(`/places/init?${query}`);
  return { success: true, data: markers.map((marker) => toPlace(marker, null)) };
};

export const getPlacesByRegion = async (
  regionName,
  regionDetailName,
  { petId = getRepresentativePetId(), origin } = {},
) => {
  if (!regionName || !regionDetailName || !origin) return { success: true, data: [] };

  const query = new URLSearchParams({ currMapX: origin.lng, currMapY: origin.lat });
  if (petId) query.set('petId', petId);
  const markers = await apiRequest(
    `/places/region/${encodeURIComponent(regionName)}/${encodeURIComponent(regionDetailName)}?${query}`,
  );

  return { success: true, data: markers.map((marker) => toPlace(marker, null)) };
};

export const searchPlacesByKeyword = async (
  keyword,
  { petId = getRepresentativePetId(), origin } = {},
) => {
  if (!keyword || !origin) return { success: true, data: [] };

  const query = new URLSearchParams({ keyword, currMapX: origin.lng, currMapY: origin.lat });
  if (petId) query.set('petId', petId);
  const markers = await apiRequest(`/places/search/keyword?${query}`);

  return { success: true, data: markers.map((marker) => toPlace(marker, null)) };
};
