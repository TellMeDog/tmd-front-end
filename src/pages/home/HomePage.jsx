import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getHomePlaces } from '../../api/places.api';
import PlaceCard from '../../components/place/PlaceCard';
import PlaceFilterBar from '../../components/place/PlaceFilterBar';
import RegionSelectBox from '../../components/place/RegionSelectBox';
import { usePetStore } from '../../stores/pet.store';
import { useCurrentLocation } from '../../hooks/useCurrentLocation';
import { withConjunctiveParticle } from '../../utils/korean';
import styles from '../shared/Pages.module.css';
import KakaoMapPreview from './KakaoMapPreview';

const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY;

export default function HomePage() {
  const navigate = useNavigate();
  const pets = usePetStore((state) => state.pets);
  const petId = usePetStore((state) => state.selectedPetId);
  const petName = pets.find((pet) => pet.petId === petId)?.name ?? '멍이';
  const { location } = useCurrentLocation();
  const [homePlaces, setHomePlaces] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [regionName, setRegionName] = useState(null);
  const [regionDetailName, setRegionDetailName] = useState(null);

  const handleSelectCategory = (category) => {
    navigate(category ? `/map?category=${encodeURIComponent(category)}` : '/map');
  };

  const handleSelectRegion = (nextRegionName, nextRegionDetailName) => {
    setRegionName(nextRegionName);
    setRegionDetailName(nextRegionDetailName);
    if (!nextRegionName || !nextRegionDetailName) return;
    const query = new URLSearchParams({ region: nextRegionName, regionDetail: nextRegionDetailName });
    navigate(`/map?${query}`);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const trimmed = keyword.trim();
    if (!trimmed) return;
    navigate(`/map?keyword=${encodeURIComponent(trimmed)}`);
  };

  useEffect(() => {
    if (!location) return;
    getHomePlaces({ origin: location, petId }).then(({ data }) => {
      setHomePlaces(data);
    });
  }, [location, petId]);

  return (
    <main className="page">
      <section className={styles.hero}>
        <div>
          <h1>
            {withConjunctiveParticle(petName)} 갈 수 있는 곳,
            <br />
            <em>미리 알고 출발해요.</em>
          </h1>
          <p>장소 규정과 {petName}의 프로필을 비교해 입장 조건과 준비물을 알려드려요.</p>
          <form className={styles.search} onSubmit={handleSearchSubmit}>
            <Search size={20} />
            <input
              placeholder="어디로 함께 떠나볼까요?"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
            <button type="submit" aria-label="검색">
              <Search size={20} />
            </button>
          </form>
          <div className={styles.regionRow}>
            <RegionSelectBox
              regionName={regionName}
              regionDetailName={regionDetailName}
              onSelect={handleSelectRegion}
            />
          </div>
          <PlaceFilterBar className={styles.chips} onSelect={handleSelectCategory} />
        </div>
      </section>
      <section>
        <Link to="/map" className={styles.mapPreview}>
          {KAKAO_MAP_KEY ? (
            <KakaoMapPreview apiKey={KAKAO_MAP_KEY} places={homePlaces} />
          ) : (
            <span className={styles.mapPlaceholder}>지도 준비중</span>
          )}
        </Link>
      </section>
      <section>
        <div className={styles.sectionHead}>
          <div>
            <span className="eyebrow">RECOMMENDED</span>
            <h2>{petName}에게 추천해요</h2>
          </div>
        </div>
        <div className={styles.grid}>
          {homePlaces.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      </section>
    </main>
  );
}
