import { Heart, MapPin } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { addFavorite, deleteFavorite } from '../../api/favorites.api';
import { PLACE_STATUS_META } from '../../constants/placeStatus';
import { useAuthStore } from '../../stores/auth.store';
import styles from './PlaceCard.module.css';

export default function PlaceCard({ place }) {
  const navigate = useNavigate();
  const location = useLocation();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [favorite, setFavorite] = useState(place.favorite);
  const [isPending, setIsPending] = useState(false);
  const status = PLACE_STATUS_META[place.status] ?? PLACE_STATUS_META.unknown;

  const handleToggleFavorite = async () => {
    if (!accessToken) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (isPending) return;

    const nextFavorite = !favorite;
    setFavorite(nextFavorite);
    setIsPending(true);
    try {
      if (nextFavorite) await addFavorite(place.id);
      else await deleteFavorite(place.id);
    } catch {
      setFavorite(!nextFavorite);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <article className={styles.card}>
      <Link className={`${styles.visual} ${styles[status.tone]}`} to={`/places/${place.id}`} data-role="visual">
        {place.image ? <img src={place.image} alt="" /> : <MapPin size={36} />}
      </Link>
      <div className={styles.content}>
        <div className={styles.meta}>
          {[place.distanceLabel, place.rating > 0 ? `★ ${place.rating.toFixed(1)}` : null]
            .filter(Boolean)
            .join(' · ')}
        </div>
        <h3>
          <Link to={`/places/${place.id}`}>{place.name}</Link>
        </h3>
        <div>
          <span className={`${styles.badge} ${styles[status.tone]}`}>{status.label}</span>
        </div>
      </div>
      <button
        type="button"
        className={`${styles.save} ${favorite ? styles.saved : ''}`}
        onClick={handleToggleFavorite}
        disabled={isPending}
        aria-label={favorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
      >
        <Heart size={20} fill={favorite ? 'currentColor' : 'none'} />
      </button>
    </article>
  );
}
