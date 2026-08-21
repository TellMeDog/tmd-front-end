import {
  BedDouble,
  Coffee,
  MapPin,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Utensils,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PlaceCard from '../../components/place/PlaceCard';
import { places } from '../../mocks/data/places';
import styles from '../shared/Pages.module.css';

export default function HomePage() {
  const categories = [
    { label: '전체', Icon: SlidersHorizontal },
    { label: '관광지', Icon: MapPin },
    { label: '카페', Icon: Coffee },
    { label: '음식점', Icon: Utensils },
    { label: '숙박', Icon: BedDouble },
    { label: '쇼핑', Icon: ShoppingBag },
  ];

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
          <div className={styles.chips}>
            {categories.map(({ label, Icon }) => (
              <button key={label}>
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>
      <section>
        <Link to="/map" className={styles.mapPreview}>
          <span className={styles.mapPlaceholder}>지도 준비중</span>
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
