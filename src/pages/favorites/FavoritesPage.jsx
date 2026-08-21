import PlaceCard from '../../components/place/PlaceCard';
import { places } from '../../mocks/data/places';
import styles from '../shared/Pages.module.css';
export default function FavoritesPage() {
  return (
    <main className="page">
      <span className="eyebrow">SAVED PLACES</span>
      <h1 className="page-title">즐겨찾기</h1>
      <p className="page-description">멍이와 가고 싶은 장소를 모아두었어요.</p>
      <div className={`${styles.grid} ${styles.favoriteGrid}`}>
        {places
          .filter((x) => x.saved)
          .map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
      </div>
    </main>
  );
}
