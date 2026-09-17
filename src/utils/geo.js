const EARTH_RADIUS_KM = 6371;

const toRadians = (deg) => (deg * Math.PI) / 180;

export function haversineDistanceKm(from, to) {
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);

  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

export function formatDistanceKm(km) {
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
}

// 실제 화면(viewport)보다 넓게 검색해서, 화면 이동 시 바로 앞서 받아둔 범위 안이면 재검색을 건너뛸 수 있게 함
export function expandBounds({ sw, ne }, scale = 1.5) {
  const latPad = ((ne.lat - sw.lat) * (scale - 1)) / 2;
  const lngPad = ((ne.lng - sw.lng) * (scale - 1)) / 2;

  return {
    sw: { lat: sw.lat - latPad, lng: sw.lng - lngPad },
    ne: { lat: ne.lat + latPad, lng: ne.lng + lngPad },
  };
}

export function isBoundsContained(inner, outer) {
  return (
    inner.sw.lat >= outer.sw.lat &&
    inner.sw.lng >= outer.sw.lng &&
    inner.ne.lat <= outer.ne.lat &&
    inner.ne.lng <= outer.ne.lng
  );
}
