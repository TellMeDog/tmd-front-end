import { Heart, MapPin, Star } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import styles from './PlaceListBottomSheet.module.css';

const STATUS_META = {
  available: { label: '입장 가능', tone: 'available' },
  conditional: { label: '조건부 가능', tone: 'conditional' },
  verify: { label: '확인 필요', tone: 'verify' },
  unknown: { label: '정보 없음', tone: 'unknown' },
};

const PEEK_HEIGHT_PX = 96;
const HALF_RATIO = 0.5;
const FULL_RATIO = 0.97;

export default function PlaceListBottomSheet({ places, onSelectPlace }) {
  const [heightState, setHeightState] = useState('peek');
  const [dragHeight, setDragHeight] = useState(null);
  const sheetRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    setHeightState('peek');
    setDragHeight(null);
  }, [places]);

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
        if (currentHeight >= midHalfFull) setHeightState('full');
        else if (currentHeight >= midPeekHalf) setHeightState('half');
        else setHeightState('peek');
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
          const status = STATUS_META[place.status] ?? STATUS_META.unknown;
          return (
            <li key={place.id}>
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
                  {place.favorite && <Heart size={16} fill="currentColor" className={styles.favoriteIcon} />}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
