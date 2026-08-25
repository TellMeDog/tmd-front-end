import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNearbyPlaces } from '../../api/places.api';
import PlaceCard from '../../components/place/PlaceCard';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';
import pageStyles from '../shared/Pages.module.css';
import KakaoMapView from './KakaoMapView';
import styles from './MapPage.module.css';

const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY;
const NEARBY_CATEGORIES = ['카페', '음식점'];

export default function MapPage() {
  const navigate = useNavigate();
  const { location } = useCurrentLocation();
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const tickerItemRefs = useRef(new Map());

  useEffect(() => {
    if (selectedId == null) return;
    tickerItemRefs.current.get(selectedId)?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [selectedId]);

  useEffect(() => {
    if (!location) return;
    getNearbyPlaces(location, { categories: NEARBY_CATEGORIES }).then(({ data }) => {
      setNearbyPlaces(data);
    });
  }, [location]);

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

        {nearbyPlaces.length > 0 && (
          <div className={styles.ticker}>
            {nearbyPlaces.map((place) => (
              <div
                key={place.id}
                ref={(node) => {
                  if (node) tickerItemRefs.current.set(place.id, node);
                  else tickerItemRefs.current.delete(place.id);
                }}
                className={`${styles.tickerItem} ${place.id === selectedId ? styles.tickerItemActive : ''}`}
                onClickCapture={(event) => event.preventDefault()}
                onClick={(event) => {
                  if (event.target.closest('button')) return;
                  if (event.target.closest('[data-role="visual"]')) {
                    setSelectedId(place.id);
                  } else {
                    navigate(`/places/${place.id}`);
                  }
                }}
              >
                <PlaceCard place={{ ...place, distance: place.distanceLabel }} />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
