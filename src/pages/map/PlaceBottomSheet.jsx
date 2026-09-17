import { Heart, MapPin, Navigation, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../../api/client';
import { addFavorite, deleteFavorite } from '../../api/favorites.api';
import { PLACE_STATUS_META } from '../../constants/placeStatus';
import { useAuthStore } from '../../stores/auth.store';
import { useDraggableSheet } from './useDraggableSheet';
import styles from './PlaceBottomSheet.module.css';

// 장소 상세 정보(리뷰/정책/방문 통계 등)는 더 이상 여기서 조회하지 않음.
// 마커를 눌렀을 때는 마커 응답만으로 가벼운 미리보기만 보여주고,
// "상세보기"를 눌러야 실제 상세 페이지(/places/:placeId)에서 조회함
export default function PlaceBottomSheet({ place, onClose, onHeightStateChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoritePending, setIsFavoritePending] = useState(false);
  const [favoriteError, setFavoriteError] = useState('');
  const { sheetRef, expanded, dragHeight, reset, dragHandlers } = useDraggableSheet(onClose, (isExpanded) =>
    onHeightStateChange?.(isExpanded ? 'full' : 'half'),
  );

  useEffect(() => {
    setFavoriteError('');
    setIsFavorite(place?.favorite ?? false);
  }, [place?.id, place?.favorite]);

  useEffect(() => {
    if (!place) return;
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place?.id]);

  const handleToggleFavorite = async () => {
    if (!place) return;
    if (!accessToken) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    const nextFavorite = !isFavorite;
    setFavoriteError('');
    setIsFavoritePending(true);
    setIsFavorite(nextFavorite);
    try {
      if (nextFavorite) await addFavorite(place.id);
      else await deleteFavorite(place.id);
    } catch (requestError) {
      setIsFavorite(!nextFavorite);
      setFavoriteError(getApiErrorMessage(requestError, '즐겨찾기를 변경하지 못했습니다.'));
    } finally {
      setIsFavoritePending(false);
    }
  };

  if (!place) return null;
  const status = PLACE_STATUS_META[place.status] ?? PLACE_STATUS_META.unknown;

  return (
    <section
      ref={sheetRef}
      className={`${styles.sheet} ${expanded ? styles.full : ''} ${dragHeight != null ? styles.dragging : ''}`}
      style={dragHeight != null ? { height: `${dragHeight}px` } : undefined}
      role="dialog"
      aria-label={`${place.name} 상세 정보`}
    >
      <div className={styles.header} {...dragHandlers}>
        <span className={styles.handle} />
        <button type="button" className={styles.close} onClick={onClose} aria-label="닫기">
          <X size={20} />
        </button>
      </div>

      <div className={styles.photo} data-tone={status.tone}>
        {place.image ? <img src={place.image} alt="" /> : <MapPin size={40} />}
      </div>

      <div className={styles.body}>
        <div className={styles.meta}>
          {[place.category, place.distanceLabel, place.rating > 0 ? `★ ${place.rating.toFixed(1)}` : null]
            .filter(Boolean)
            .join(' · ')}
        </div>
        <h2>{place.name}</h2>
        <span className={`${styles.badge} ${styles[status.tone]}`}>{status.label}</span>

        {favoriteError && <p className="field-error">{favoriteError}</p>}

        <div className={styles.actions}>
          <button
            type="button"
            className={`button button--secondary ${styles.saveButton} ${isFavorite ? styles.saved : ''}`}
            onClick={handleToggleFavorite}
            disabled={isFavoritePending}
          >
            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
            {isFavorite ? '저장됨' : '즐겨찾기'}
          </button>
          <Link className="button button--primary" to={`/places/${place.id}`}>
            <Navigation size={18} />
            상세보기
          </Link>
        </div>
      </div>
    </section>
  );
}
