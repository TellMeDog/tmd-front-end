import { LocateFixed, PawPrint } from 'lucide-react';
import { useCallback, useRef } from 'react';
import { CustomOverlayMap, Map, useKakaoLoader } from 'react-kakao-maps-sdk';
import { CATEGORY_ICON_MAP } from '../../constants/placeCategories';
import styles from './MapPage.module.css';

const STATUS_PIN_CLASS = {
  available: 'pinAvailable',
  conditional: 'pinConditional',
  verify: 'pinVerify',
};

export default function KakaoMapView({ apiKey, userLocation, places, selectedPlace, onSelectPlace }) {
  const [loading, error] = useKakaoLoader({ appkey: apiKey, libraries: ['services'] });
  const mapRef = useRef(null);

  const handleRecenter = useCallback(() => {
    const map = mapRef.current;
    if (!map || !userLocation) return;
    map.panTo(new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng));
  }, [userLocation]);

  if (loading || error) {
    return (
      <span className={styles.mapStatus}>
        {error ? '지도를 불러오지 못했어요.' : '지도를 불러오는 중이에요...'}
      </span>
    );
  }

  return (
    <>
      <Map
        center={selectedPlace ?? userLocation}
        level={5}
        isPanto
        className={styles.map}
        onCreate={(map) => {
          mapRef.current = map;
        }}
      >
        <CustomOverlayMap position={userLocation}>
          <span className={styles.meMarker} />
        </CustomOverlayMap>
        {places.map((place) => {
          const isSelected = place.id === selectedPlace?.id;
          const toneClass = styles[STATUS_PIN_CLASS[place.status] ?? 'pinConditional'];
          const CategoryIcon = CATEGORY_ICON_MAP[place.category] ?? PawPrint;
          return (
            <CustomOverlayMap
              key={place.id}
              position={{ lat: place.lat, lng: place.lng }}
              zIndex={isSelected ? 20 : 1}
              yAnchor={1}
            >
              <button
                type="button"
                className={`${styles.pin} ${toneClass} ${isSelected ? styles.pinSelected : ''}`}
                onClick={() => onSelectPlace(place.id)}
                aria-label={place.name}
              >
                <CategoryIcon
                  size={14}
                  strokeWidth={2.5}
                  style={place.category === '카페' ? { transform: 'rotate(45deg) translateX(0.75px)' } : undefined}
                />
              </button>
            </CustomOverlayMap>
          );
        })}
      </Map>

      <button
        type="button"
        className={styles.locateButton}
        onClick={handleRecenter}
        aria-label="현재 위치로 이동"
      >
        <LocateFixed size={20} />
      </button>
    </>
  );
}
