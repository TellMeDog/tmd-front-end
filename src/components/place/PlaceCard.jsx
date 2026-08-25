import { Heart, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './PlaceCard.module.css';

export default function PlaceCard({ place }) {
  return (
    <article className={styles.card}>
      <Link className={`${styles.visual} ${styles[place.status]}`} to={`/places/${place.id}`} data-role="visual">
        <MapPin size={36} />
      </Link>
      <div className={styles.content}>
        <div className={styles.meta}>
          {place.category} · {place.distance}
        </div>
        <h3>
          <Link to={`/places/${place.id}`}>{place.name}</Link>
        </h3>
        <p>{place.reason}</p>
        <div>
          <span className={`${styles.badge} ${styles[place.status]}`}>{place.statusLabel}</span>
          <span className={styles.area}>{place.area}</span>
        </div>
      </div>
      <button className={`${styles.save} ${place.saved ? styles.saved : ''}`} aria-label="즐겨찾기">
        <Heart size={20} fill={place.saved ? 'currentColor' : 'none'} />
      </button>
    </article>
  );
}
