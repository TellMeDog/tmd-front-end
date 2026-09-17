import { LocateFixed, PawPrint } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import { CustomOverlayMap, Map, MarkerClusterer, useKakaoLoader } from 'react-kakao-maps-sdk';
import { CATEGORY_ICON_MAP } from '../../constants/placeCategories';
import styles from './MapPage.module.css';

const STATUS_PIN_CLASS = {
  available: 'pinAvailable',
  conditional: 'pinConditional',
  verify: 'pinVerify',
  unknown: 'pinUnknown',
};

const MOBILE_BREAKPOINT = 767;
// 리스트 시트의 peek 높이(PlaceListBottomSheet.jsx)와 맞춰둠
const SHEET_PEEK_HEIGHT_PX = 128;
// 상단 검색바+카테고리 필터바가 가리는 대략적인 높이
const TOP_BAR_HEIGHT_PX = 120;
// 보이는 영역의 "아래"에서부터 이 비율만큼 되는 지점에 대상을 위치시킴
const VISIBLE_BOTTOM_RATIO = 0.4;

// 상단바/바텀시트에 가려지지 않는 실제 보이는 영역을 기준으로 대상 좌표를 계산
function getVisibleTargetY(sheetHeightState, containerHeight) {
  const isMobile = typeof window === 'undefined' || window.innerWidth <= MOBILE_BREAKPOINT;
  const bottomObstructed = !isMobile
    ? 0
    : sheetHeightState === 'half'
      ? containerHeight * 0.5
      : sheetHeightState === 'full'
        ? containerHeight * 0.97
        : sheetHeightState === 'peek'
          ? SHEET_PEEK_HEIGHT_PX
          : 0;

  const visibleTop = TOP_BAR_HEIGHT_PX;
  const visibleBottom = containerHeight - bottomObstructed;
  return visibleBottom - VISIBLE_BOTTOM_RATIO * (visibleBottom - visibleTop);
}

// 줌아웃했을 때 마커가 너무 빽빽해 보이지 않도록 묶어서 보여줄 때 쓰는 클러스터 뱃지 스타일
const CLUSTER_STYLE = {
  width: '40px',
  height: '40px',
  lineHeight: '40px',
  textAlign: 'center',
  borderRadius: '50%',
  border: '3px solid #fff',
  background: '#f6951c',
  color: '#fff',
  fontSize: '14px',
  fontWeight: '700',
  boxShadow: '0 2px 6px rgba(20, 20, 10, 0.25)',
};

export default function KakaoMapView({
  apiKey,
  userLocation,
  places,
  selectedPlace,
  onSelectPlace,
  onBoundsChange,
  sheetHeightState,
}) {
  const [loading, error] = useKakaoLoader({ appkey: apiKey, libraries: ['services', 'clusterer'] });
  const mapRef = useRef(null);

  // 상단바/바텀시트에 가리지 않는 보이는 영역의 아래쪽 40% 지점에 대상이 오도록 이동
  const centerWithOffset = useCallback(
    (target) => {
      const map = mapRef.current;
      if (!map || !target) return;

      const targetLatLng = new window.kakao.maps.LatLng(target.lat, target.lng);
      const node = map.getNode();
      const height = node.clientHeight;
      const desiredY = getVisibleTargetY(sheetHeightState, height);

      const projection = map.getProjection();
      const targetPoint = projection.containerPointFromCoords(targetLatLng);
      const centerPoint = new window.kakao.maps.Point(targetPoint.x, targetPoint.y + (height / 2 - desiredY));
      map.panTo(projection.coordsFromContainerPoint(centerPoint));
    },
    [sheetHeightState],
  );

  const handleRecenter = useCallback(() => {
    centerWithOffset(userLocation);
  }, [centerWithOffset, userLocation]);

  const emitBounds = useCallback(
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

  const handleCreate = useCallback(
    (map) => {
      mapRef.current = map;
      emitBounds(map);
    },
    [emitBounds],
  );

  // 장소를 선택했을 때 그 위치로 이동. 선택된 장소가 없으면 상단바/바텀시트 높이가
  // 바뀔 때 현재 위치가 가려지지 않도록 다시 맞춰줌. 닫을 때(선택 해제)는 지도를 그대로 둠
  useEffect(() => {
    if (!mapRef.current) return;
    centerWithOffset(selectedPlace ?? userLocation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlace?.id, sheetHeightState]);

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
        center={userLocation}
        level={5}
        isPanto
        className={styles.map}
        onCreate={handleCreate}
        onIdle={emitBounds}
      >
        <CustomOverlayMap position={userLocation}>
          <span className={styles.meMarker} />
        </CustomOverlayMap>
        <MarkerClusterer gridSize={60} minLevel={6} styles={[CLUSTER_STYLE]}>
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
        </MarkerClusterer>
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
