import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getNearbyPlaces } from '../../api/places.api';
import PlaceFilterBar from '../../components/place/PlaceFilterBar';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';
import pageStyles from '../shared/Pages.module.css';
import KakaoMapView from './KakaoMapView';
import styles from './MapPage.module.css';
import PlaceBottomSheet from './PlaceBottomSheet';

const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY;

export default function MapPage() {
  const { location } = useCurrentLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category');
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const handleSelectCategory = (nextCategory) => {
    setSelectedId(null);
    setSearchParams(nextCategory ? { category: nextCategory } : {});
  };

  useEffect(() => {
    if (!location) return;
    getNearbyPlaces(location, { categories: category ? [category] : undefined }).then(({ data }) => {
      setNearbyPlaces(data);
    });
  }, [location, category]);

  const selectedPlace = useMemo(
    () => nearbyPlaces.find((place) => place.id === selectedId) ?? null,
    [nearbyPlaces, selectedId],
  );

  return (
    <main className={pageStyles.mapLayout}>
      <section className={`${pageStyles.mapFull} ${styles.mapWrap}`}>
        {KAKAO_MAP_KEY && location ? (
          <KakaoMapView
            apiKey={KAKAO_MAP_KEY}
            userLocation={location}
            places={nearbyPlaces}
            selectedPlace={selectedPlace}
            onSelectPlace={setSelectedId}
          />
        ) : (
          <span className={pageStyles.mapPlaceholder}>
            {location ? '카카오맵 API 키를 설정하면 지도가 표시돼요' : '현재 위치를 확인하는 중이에요'}
          </span>
        )}

        <PlaceFilterBar active={category} onSelect={handleSelectCategory} className={styles.filterBar} />

        <PlaceBottomSheet place={selectedPlace} onClose={() => setSelectedId(null)} />
      </section>
    </main>
  );
}
