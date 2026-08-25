import { CustomOverlayMap, Map, MapMarker, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';
import mapStyles from '../map/MapPage.module.css';
import styles from '../shared/Pages.module.css';

export default function KakaoMapPreview({ apiKey, places = [] }) {
  const { location } = useCurrentLocation();
  const [loading, error] = useKakaoLoader({ appkey: apiKey });

  if (loading || error || !location) {
    return <span className={styles.mapPlaceholder}>지도를 불러오는 중이에요</span>;
  }

  return (
    <Map
      center={location}
      level={5}
      draggable={false}
      zoomable={false}
      scrollwheel={false}
      disableDoubleClick
      disableDoubleClickZoom
      keyboardShortcuts={false}
      className={styles.mapPreviewMap}
    >
      <CustomOverlayMap position={location}>
        <span className={mapStyles.meMarker} />
      </CustomOverlayMap>
      {places.map((place) => (
        <MapMarker key={place.id} position={{ lat: place.lat, lng: place.lng }} clickable={false} />
      ))}
    </Map>
  );
}
