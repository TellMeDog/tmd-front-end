import { PawPrint } from 'lucide-react';
import { useCallback } from 'react';
import { CustomOverlayMap, Map, useKakaoLoader } from 'react-kakao-maps-sdk';
import { CATEGORY_ICON_MAP } from '../../constants/placeCategories';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';
import mapStyles from '../map/MapPage.module.css';
import styles from '../shared/Pages.module.css';

const STATUS_PIN_CLASS = {
  available: 'pinAvailable',
  conditional: 'pinConditional',
  verify: 'pinVerify',
  unknown: 'pinUnknown',
};

export default function KakaoMapPreview({ apiKey, places = [], onBoundsChange }) {
  const { location } = useCurrentLocation();
  const [loading, error] = useKakaoLoader({ appkey: apiKey });

  const handleCreate = useCallback(
    (map) => {
      const bounds = map.getBounds();
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      onBoundsChange?.({
        sw: { lat: sw.getLat(), lng: sw.getLng() },
        ne: { lat: ne.getLat(), lng: ne.getLng() },
      });
    },
    [onBoundsChange],
  );

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
      onCreate={handleCreate}
    >
      <CustomOverlayMap position={location}>
        <span className={mapStyles.meMarker} />
      </CustomOverlayMap>
      {places.map((place) => {
        const toneClass = mapStyles[STATUS_PIN_CLASS[place.status] ?? 'pinConditional'];
        const CategoryIcon = CATEGORY_ICON_MAP[place.category] ?? PawPrint;
        return (
          <CustomOverlayMap key={place.id} position={{ lat: place.lat, lng: place.lng }} yAnchor={1}>
            <span className={`${mapStyles.pin} ${toneClass}`}>
              <CategoryIcon
                size={14}
                strokeWidth={2.5}
                style={place.category === '카페' ? { transform: 'rotate(45deg) translateX(0.75px)' } : undefined}
              />
            </span>
          </CustomOverlayMap>
        );
      })}
    </Map>
  );
}
