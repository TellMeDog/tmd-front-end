import { CustomOverlayMap, Map, MapMarker, useKakaoLoader } from 'react-kakao-maps-sdk';
import styles from './MapPage.module.css';

export default function KakaoMapView({ apiKey, userLocation, places, selectedPlace, onSelectPlace }) {
  const [loading, error] = useKakaoLoader({ appkey: apiKey, libraries: ['services'] });

  if (loading || error) {
    return (
      <span className={styles.mapStatus}>
        {error ? '지도를 불러오지 못했어요.' : '지도를 불러오는 중이에요...'}
      </span>
    );
  }

  return (
    <Map
      center={selectedPlace ?? userLocation}
      level={5}
      isPanto
      className={styles.map}
    >
      <CustomOverlayMap position={userLocation}>
        <span className={styles.meMarker} />
      </CustomOverlayMap>
      {places.map((place) => (
        <MapMarker
          key={place.id}
          position={{ lat: place.lat, lng: place.lng }}
          onClick={() => onSelectPlace(place.id)}
          zIndex={place.id === selectedPlace?.id ? 10 : 1}
        />
      ))}
      {selectedPlace && (
        <CustomOverlayMap position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }} zIndex={20}>
          <span className={styles.markerLabel}>{selectedPlace.name}</span>
        </CustomOverlayMap>
      )}
    </Map>
  );
}
