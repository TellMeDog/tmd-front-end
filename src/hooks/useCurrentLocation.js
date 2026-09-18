import { Geolocation } from '@capacitor/geolocation';
import { useEffect, useState } from 'react';

// 한국관광공사 서울센터(청계천로 40) — 위치 접근이 불가능하거나 거부된 경우 사용하는 기본 좌표
const DEFAULT_LOCATION = { lat: 37.5685426, lng: 126.9816242 };

// 카카오맵과 장소 데이터는 국내 좌표를 기준으로 제공됩니다. 에뮬레이터나
// 해외 단말의 기본 위치가 들어오면 지도 타일/주변 장소 조회가 실패할 수 있어
// 국내 서비스 범위를 벗어난 좌표는 서울 기본 위치로 대체합니다.
const isSupportedLocation = ({ lat, lng }) =>
  Number.isFinite(lat) &&
  Number.isFinite(lng) &&
  lat >= 32 &&
  lat <= 39 &&
  lng >= 124 &&
  lng <= 132;

export function useCurrentLocation() {
  const [location, setLocation] = useState(null);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    let active = true;

    Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 300000,
    })
      .then((position) => {
        if (!active) return;
        const currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        if (!isSupportedLocation(currentLocation)) {
          setLocation(DEFAULT_LOCATION);
          setIsFallback(true);
          return;
        }

        setLocation(currentLocation);
        setIsFallback(false);
      })
      .catch(() => {
        if (!active) return;
        setLocation(DEFAULT_LOCATION);
        setIsFallback(true);
      });

    return () => {
      active = false;
    };
  }, []);

  return { location, isFallback };
}
