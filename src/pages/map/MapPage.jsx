import { Search, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getNearbyPlaces, searchPlacesByKeyword } from '../../api/places.api';
import PlaceFilterBar from '../../components/place/PlaceFilterBar';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';
import { usePetStore } from '../../stores/pet.store';
import { expandBounds, isBoundsContained } from '../../utils/geo';
import pageStyles from '../shared/Pages.module.css';
import KakaoMapView from './KakaoMapView';
import styles from './MapPage.module.css';
import PlaceBottomSheet from './PlaceBottomSheet';
import PlaceListBottomSheet from './PlaceListBottomSheet';

const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY;
// 화면 이동/줌이 잦을 수 있어 멈춘 뒤 일정 시간이 지나야 재검색하도록 지연
const BOUNDS_DEBOUNCE_MS = 1000;

export default function MapPage() {
  const { location } = useCurrentLocation();
  const petId = usePetStore((state) => state.selectedPetId);
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category');
  const keyword = searchParams.get('keyword');
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [bounds, setBounds] = useState(null);
  const [fetchedRegion, setFetchedRegion] = useState(null);
  const [fetchError, setFetchError] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [keywordInput, setKeywordInput] = useState(keyword ?? '');
  const [sheetHeightState, setSheetHeightState] = useState(null);
  const boundsDebounceRef = useRef(null);

  useEffect(() => {
    setKeywordInput(keyword ?? '');
  }, [keyword]);

  const handleSelectCategory = (nextCategory) => {
    setSelectedId(null);
    setSearchParams(nextCategory ? { category: nextCategory } : {});
  };

  const handleClearKeyword = () => {
    setSelectedId(null);
    setSearchParams({});
  };

  const handleKeywordSubmit = (event) => {
    event.preventDefault();
    const trimmed = keywordInput.trim();
    setSelectedId(null);
    if (trimmed) setSearchParams({ keyword: trimmed });
    else handleClearKeyword();
  };

  const handleBoundsChange = useCallback((nextBounds) => {
    if (boundsDebounceRef.current) clearTimeout(boundsDebounceRef.current);
    boundsDebounceRef.current = setTimeout(() => setBounds(nextBounds), BOUNDS_DEBOUNCE_MS);
  }, []);

  useEffect(() => () => clearTimeout(boundsDebounceRef.current), []);

  useEffect(() => {
    if (!keyword || !petId || !location) return;
    setFetchedRegion(null);
    setFetchError(false);
    setHasFetched(false);
    searchPlacesByKeyword(keyword, { petId, origin: location })
      .then(({ data }) => {
        setNearbyPlaces(data);
        setHasFetched(true);
      })
      .catch(() => {
        setNearbyPlaces([]);
        setFetchError(true);
        setHasFetched(true);
      });
  }, [keyword, petId, location]);

  useEffect(() => {
    if (keyword || !bounds || !petId || !location) return;

    const isCached =
      fetchedRegion &&
      fetchedRegion.category === category &&
      fetchedRegion.petId === petId &&
      isBoundsContained(bounds, fetchedRegion.bounds);
    if (isCached) return;

    const searchBounds = expandBounds(bounds);
    setFetchError(false);
    setHasFetched(false);
    getNearbyPlaces(searchBounds, { origin: location, category, petId })
      .then(({ data }) => {
        setNearbyPlaces(data);
        setFetchedRegion({ bounds: searchBounds, category, petId });
        setHasFetched(true);
      })
      .catch(() => {
        setNearbyPlaces([]);
        setFetchError(true);
        setHasFetched(true);
      });
  }, [bounds, location, category, keyword, petId, fetchedRegion]);

  const selectedPlace = useMemo(
    () => nearbyPlaces.find((place) => place.id === selectedId) ?? null,
    [nearbyPlaces, selectedId],
  );
  const showList = !selectedPlace && nearbyPlaces.length > 0;

  useEffect(() => {
    if (!showList && !selectedPlace) setSheetHeightState(null);
  }, [showList, selectedPlace]);

  return (
    <main className={pageStyles.mapLayout}>
      <section className={`${pageStyles.mapFull} ${styles.mapWrap}`} data-sheet={sheetHeightState ?? 'none'}>
        {KAKAO_MAP_KEY && location ? (
          <KakaoMapView
            apiKey={KAKAO_MAP_KEY}
            userLocation={location}
            places={nearbyPlaces}
            selectedPlace={selectedPlace}
            onSelectPlace={setSelectedId}
            onBoundsChange={handleBoundsChange}
            sheetHeightState={sheetHeightState}
          />
        ) : (
          <span className={pageStyles.mapPlaceholder}>
            {location ? '카카오맵 API 키를 설정하면 지도가 표시돼요' : '현재 위치를 확인하는 중이에요'}
          </span>
        )}

        <div className={styles.topBar}>
          <form className={styles.keywordBar} onSubmit={handleKeywordSubmit}>
            <Search size={16} />
            <input
              value={keywordInput}
              onChange={(event) => setKeywordInput(event.target.value)}
              placeholder="장소명으로 검색"
              aria-label="장소 검색"
            />
            {keywordInput.trim() && (
              <button type="button" onClick={handleClearKeyword} aria-label="검색어 지우기">
                <X size={16} />
              </button>
            )}
          </form>

          <PlaceFilterBar
            active={keyword ? undefined : category}
            onSelect={handleSelectCategory}
            className={styles.filterBar}
          />

          {fetchError && !showList && !selectedPlace && (
            <span className={styles.errorBanner}>장소를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</span>
          )}

          {!fetchError && hasFetched && !showList && !selectedPlace && (
            <span className={styles.emptyBanner}>이 지역에는 조건에 맞는 장소가 없어요 (0건)</span>
          )}
        </div>

        {showList ? (
          <PlaceListBottomSheet
            places={nearbyPlaces}
            onSelectPlace={setSelectedId}
            onHeightStateChange={setSheetHeightState}
          />
        ) : (
          <PlaceBottomSheet
            place={selectedPlace}
            onClose={() => setSelectedId(null)}
            onHeightStateChange={setSheetHeightState}
          />
        )}
      </section>
    </main>
  );
}
