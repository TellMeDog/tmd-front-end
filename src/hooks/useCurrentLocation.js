import { useEffect, useState } from 'react';

// 한국관광공사 서울센터(청계천로 40) — 위치 접근이 불가능하거나 거부된 경우 사용하는 기본 좌표
const DEFAULT_LOCATION = { lat: 37.5685426, lng: 126.9816242 };

export function useCurrentLocation() {
  const [location, setLocation] = useState(null);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation(DEFAULT_LOCATION);
      setIsFallback(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      () => {
        setLocation(DEFAULT_LOCATION);
        setIsFallback(true);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  return { location, isFallback };
}
