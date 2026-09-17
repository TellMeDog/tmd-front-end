import { Heart, MapPin, Star } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { addFavorite, deleteFavorite } from '../../api/favorites.api';
import { PLACE_STATUS_META } from '../../constants/placeStatus';
import { useAuthStore } from '../../stores/auth.store';
import styles from './PlaceListBottomSheet.module.css';

const PEEK_HEIGHT_PX = 128;
const HALF_RATIO = 0.5;
const FULL_RATIO = 0.97;

export default function PlaceListBottomSheet({ places, onSelectPlace, onHeightStateChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [heightState, setHeightState] = useState('half');
  const [dragHeight, setDragHeight] = useState(null);
  const [favoriteOverrides, setFavoriteOverrides] = useState({});
  const [pendingIds, setPendingIds] = useState(() => new Set());
  const sheetRef = useRef(null);
  const dragRef = useRef(null);

  const updateHeightState = (next) => {
    setHeightState(next);
    onHeightStateChange?.(next);
  };

  useEffect(() => {
    updateHeightState('half');
    setDragHeight(null);
    setFavoriteOverrides({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places]);

  const isFavorite = (place) => favoriteOverrides[place.id] ?? place.favorite;

  const handleToggleFavorite = async (event, place) => {
    event.stopPropagation();
    if (!accessToken) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (pendingIds.has(place.id)) return;

    const nextFavorite = !isFavorite(place);
    setFavoriteOverrides((prev) => ({ ...prev, [place.id]: nextFavorite }));
    setPendingIds((prev) => new Set(prev).add(place.id));
    try {
      if (nextFavorite) await addFavorite(place.id);
      else await deleteFavorite(place.id);
    } catch {
      setFavoriteOverrides((prev) => ({ ...prev, [place.id]: !nextFavorite }));
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(place.id);
        return next;
      });
    }
  };

  const handlePointerDown = (event) => {
    const containerHeight = sheetRef.current?.parentElement?.clientHeight;
    if (!sheetRef.current || !containerHeight) return;
    dragRef.current = {
      startY: event.clientY,
      startHeight: sheetRef.current.getBoundingClientRect().height,
      containerHeight,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!dragRef.current) return;
    const { startY, startHeight, containerHeight } = dragRef.current;
    const maxHeight = containerHeight * FULL_RATIO;
    const nextHeight = Math.min(maxHeight, Math.max(PEEK_HEIGHT_PX, startHeight + (startY - event.clientY)));
    setDragHeight(nextHeight);
  };

  const handlePointerUp = () => {
    if (!dragRef.current) return;
    const { containerHeight } = dragRef.current;
    dragRef.current = null;
    setDragHeight((currentHeight) => {
      if (currentHeight != null) {
        const halfPx = containerHeight * HALF_RATIO;
        const fullPx = containerHeight * FULL_RATIO;
        const midPeekHalf = (PEEK_HEIGHT_PX + halfPx) / 2;
        const midHalfFull = (halfPx + fullPx) / 2;
        if (currentHeight >= midHalfFull) updateHeightState('full');
        else if (currentHeight >= midPeekHalf) updateHeightState('half');
        else updateHeightState('peek');
      }
      return null;
    });
  };

  if (places.length === 0) return null;

  return (
    <section
      ref={sheetRef}
      className={`${styles.sheet} ${styles[heightState]} ${dragHeight != null ? styles.dragging : ''}`}
      style={dragHeight != null ? { height: `${dragHeight}px` } : undefined}
      role="dialog"
      aria-label="주변 장소 목록"
    >
      <div
        className={styles.header}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <b className={styles.title}>주변 장소 {places.length}곳</b>
        <span className={styles.handle} />
      </div>

      <ul className={styles.list}>
        {places.map((place) => {
          const status = PLACE_STATUS_META[place.status] ?? PLACE_STATUS_META.unknown;
          const favorite = isFavorite(place);
          return (
            <li key={place.id} className={styles.item}>
              <button type="button" className={styles.card} onClick={() => onSelectPlace(place.id)}>
                <span className={styles.thumb} data-tone={status.tone}>
                  {place.image ? <img src={place.image} alt="" /> : <MapPin size={20} />}
                </span>
                <span className={styles.info}>
                  <span className={styles.name}>{place.name}</span>
                  <span className={styles.meta}>
                    <span className={`${styles.dot} ${styles[status.tone]}`} />
                    {status.label} · {place.distanceLabel}
                  </span>
                </span>
                <span className={styles.side}>
                  {place.rating > 0 && (
                    <span className={styles.rating}>
                      <Star size={13} fill="currentColor" />
                      {place.rating.toFixed(1)}
                    </span>
                  )}
                </span>
              </button>
              <button
                type="button"
                className={`${styles.favoriteButton} ${favorite ? styles.favoriteActive : ''}`}
                onClick={(event) => handleToggleFavorite(event, place)}
                aria-label={favorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
              >
                <Heart size={16} fill={favorite ? 'currentColor' : 'none'} />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
