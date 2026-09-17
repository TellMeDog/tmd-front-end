import { LocateFixed, PawPrint } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  region,
  regionDetail,
  onLocate,
}) {
  const [loading, error] = useKakaoLoader({ appkey: apiKey, libraries: ['services', 'clusterer'] });
  const mapRef = useRef(null);
  // 지도가 지역 중심으로 이동한 뒤, 바텀시트 높이 변화로 인한 재중심 계산에서도
  // 사용자 위치가 아닌 이 좌표를 기준으로 삼기 위해 저장해 둠 (region이 풀렸을 때
  // 이 값이 null로 바뀌는 것 자체가 지도를 다시 이동시키지는 않도록 ref로도 들고 있음)
  const [regionCenter, setRegionCenter] = useState(null);
  const regionCenterRef = useRef(null);

  useEffect(() => {
    regionCenterRef.current = regionCenter;
  }, [regionCenter]);

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

  // "현재 위치로" 버튼을 눌렀을 때만 지역 중심 기준을 명시적으로 내 위치로 되돌리고,
  // 선택돼 있던 지역 select도 함께 해제
  const handleRecenter = useCallback(() => {
    setRegionCenter(null);
    centerWithOffset(userLocation);
    onLocate?.();
  }, [centerWithOffset, userLocation, onLocate]);

  // 시도/시군구를 선택하면 그 지역의 대표 좌표로 지도를 이동.
  // 지번 주소 검색으로 행정구역 중심 좌표를 찾고, 실패하면 키워드 검색으로 대체
  const centerOnRegion = useCallback(
    (regionName, regionDetailName) => {
      const services = window.kakao?.maps?.services;
      if (!services) return;

      const address = `${regionName} ${regionDetailName}`;
      const applyCenter = (lat, lng) => {
        setRegionCenter({ lat, lng });
        centerWithOffset({ lat, lng });
      };

      new services.Geocoder().addressSearch(address, (result, status) => {
        if (status === services.Status.OK && result[0]) {
          applyCenter(Number(result[0].y), Number(result[0].x));
          return;
        }

        new services.Places().keywordSearch(address, (placeResult, placeStatus) => {
          if (placeStatus !== services.Status.OK || !placeResult[0]) return;
          applyCenter(Number(placeResult[0].y), Number(placeResult[0].x));
        });
      });
    },
    [centerWithOffset],
  );

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
      if (region && regionDetail) centerOnRegion(region, regionDetail);
    },
    [emitBounds, centerOnRegion, region, regionDetail],
  );

  // 지도가 이미 떠 있는 상태에서 지역을 바꾸면 그 지역으로 이동.
  // 카테고리 선택 등으로 지역 파라미터가 사라져도(예: 지역 안에서 카테고리만 걸러보기)
  // 이미 이동해 둔 지역 중심은 그대로 유지 — "현재 위치로" 버튼을 눌러야만 초기화됨
  useEffect(() => {
    if (!mapRef.current || !region || !regionDetail) return;
    centerOnRegion(region, regionDetail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region, regionDetail]);

  // 장소를 선택했을 때 그 위치로 이동. 선택된 장소가 없으면 상단바/바텀시트 높이가
  // 바뀔 때 선택된 지역(없으면 현재 위치)이 가려지지 않도록 다시 맞춰줌.
  // 닫을 때(선택 해제)는 지도를 그대로 둠.
  // regionCenter는 ref로 최신값만 참조하고 의존성에는 넣지 않음 — 카테고리 선택 등으로
  // 지역 모드가 풀릴 때 그 자체로 지도가 현재 위치로 튕기지 않도록 하기 위함
  useEffect(() => {
    if (!mapRef.current) return;
    centerWithOffset(selectedPlace ?? regionCenterRef.current ?? userLocation);
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
