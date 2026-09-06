import { Heart, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './FavoriteCard.module.css';

export default function FavoriteCard({ favorite, deleting, onDelete }) {
  return (
    <article className={`card ${styles.card}`}>
      <Link className={styles.visual} to={`/places/${favorite.placeId}`}>
        {favorite.thumbnailUrl ? (
          <img src={favorite.thumbnailUrl} alt="" />
        ) : (
          <MapPin size={36} aria-hidden="true" />
        )}
      </Link>
      <div className={styles.content}>
        <h2>
          <Link to={`/places/${favorite.placeId}`}>{favorite.title}</Link>
        </h2>
        <p>{favorite.addr || '주소 정보가 없습니다.'}</p>
      </div>
      <button
        className={styles.deleteButton}
        type="button"
        onClick={() => onDelete(favorite.placeId)}
        disabled={deleting}
        aria-label={`${favorite.title} 즐겨찾기 삭제`}
      >
        <Heart size={20} fill="currentColor" />
      </button>
    </article>
  );
}
