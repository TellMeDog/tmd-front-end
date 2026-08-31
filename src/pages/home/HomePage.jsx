import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getNearbyPlaces } from '../../api/places.api';
import PlaceCard from '../../components/place/PlaceCard';
import PlaceFilterBar from '../../components/place/PlaceFilterBar';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';
import { places } from '../../mocks/data/places';
import styles from '../shared/Pages.module.css';
import KakaoMapPreview from './KakaoMapPreview';

const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY;
const NEARBY_CATEGORIES = ['카페', '음식점'];
const PREVIEW_COUNT = 3;

export default function HomePage() {
  const navigate = useNavigate();
  const { location } = useCurrentLocation();
  const [nearbyPreview, setNearbyPreview] = useState([]);

  const handleSelectCategory = (category) => {
    navigate(category ? `/map?category=${encodeURIComponent(category)}` : '/map');
  };

  useEffect(() => {
    if (!location) return;
    getNearbyPlaces(location, { categories: NEARBY_CATEGORIES }).then(({ data }) => {
      setNearbyPreview(data.slice(0, PREVIEW_COUNT));
    });
  }, [location]);

  return (
    <main className="page">
      <section className={styles.hero}>
        <div>
          <h1>
            멍이와 갈 수 있는 곳,
            <br />
            <em>미리 알고 출발해요.</em>
          </h1>
          <p>장소 규정과 멍이의 프로필을 비교해 입장 조건과 준비물을 알려드려요.</p>
          <div className={styles.search}>
            <Search size={20} />
            <input placeholder="어디로 함께 떠나볼까요?" />
            <button aria-label="검색">
              <Search size={20} />
            </button>
          </div>
          <PlaceFilterBar className={styles.chips} onSelect={handleSelectCategory} />
        </div>
      </section>
      <section>
        <Link to="/map" className={styles.mapPreview}>
          {KAKAO_MAP_KEY ? (
            <KakaoMapPreview apiKey={KAKAO_MAP_KEY} places={nearbyPreview} />
          ) : (
            <span className={styles.mapPlaceholder}>지도 준비중</span>
          )}
        </Link>
      </section>
      <section>
        <div className={styles.sectionHead}>
          <div>
            <span className="eyebrow">RECOMMENDED</span>
            <h2>멍이에게 추천해요</h2>
          </div>
        </div>
        <div className={styles.grid}>
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      </section>
    </main>
  );
}
