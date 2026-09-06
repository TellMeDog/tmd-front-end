import { Heart, MapPin, Navigation, PawPrint, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPlaceReviews } from '../../api/reviews.api';
import ReviewSection from '../../components/review/ReviewSection';
import styles from './PlaceBottomSheet.module.css';

const STATUS_META = {
  available: { label: '입장 가능', tone: 'available' },
  conditional: { label: '조건부 가능', tone: 'conditional' },
  verify: { label: '확인 필요', tone: 'verify' },
};

const MOBILE_BREAKPOINT = 767;
const HALF_RATIO = 0.5;
const FULL_RATIO = 0.97;

export default function PlaceBottomSheet({ place, onClose }) {
  const [reviews, setReviews] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [dragHeight, setDragHeight] = useState(null);
  const sheetRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    if (!place) return;
    getPlaceReviews(place.id).then(({ data }) => setReviews(data));
  }, [place]);

  useEffect(() => {
    setExpanded(false);
    setDragHeight(null);
  }, [place?.id]);

  const handlePointerDown = (event) => {
    const containerHeight = sheetRef.current?.parentElement?.clientHeight;
    if (!sheetRef.current || !containerHeight || window.innerWidth > MOBILE_BREAKPOINT) return;
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
    const minHeight = containerHeight * HALF_RATIO;
    const maxHeight = containerHeight * FULL_RATIO;
    const nextHeight = Math.min(maxHeight, Math.max(minHeight, startHeight + (startY - event.clientY)));
    setDragHeight(nextHeight);
  };

  const handlePointerUp = () => {
    if (!dragRef.current) return;
    const { containerHeight } = dragRef.current;
    dragRef.current = null;
    setDragHeight((currentHeight) => {
      if (currentHeight != null) {
        const midpoint = (containerHeight * (HALF_RATIO + FULL_RATIO)) / 2;
        setExpanded(currentHeight >= midpoint);
      }
      return null;
    });
  };

  if (!place) return null;
  const status = STATUS_META[place.status] ?? STATUS_META.conditional;

  return (
    <section
      ref={sheetRef}
      className={`${styles.sheet} ${expanded ? styles.full : ''} ${dragHeight != null ? styles.dragging : ''}`}
      style={dragHeight != null ? { height: `${dragHeight}px` } : undefined}
      role="dialog"
      aria-label={`${place.name} 상세 정보`}
    >
      <div
        className={styles.header}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <span className={styles.handle} />
        <button type="button" className={styles.close} onClick={onClose} aria-label="닫기">
          <X size={20} />
        </button>
      </div>

      <div className={styles.photo} data-tone={status.tone}>
        <MapPin size={40} />
      </div>

      <div className={styles.body}>
        <div className={styles.meta}>
          {place.category} · {place.area} · {place.distanceLabel ?? place.distance}
        </div>
        <h2>{place.name}</h2>
        <span className={`${styles.badge} ${styles[status.tone]}`}>{status.label}</span>

        <p className={styles.desc}>{place.reason}</p>

        <div className={styles.policy}>
          <b>
            <PawPrint size={16} />
            반려동반 정책
          </b>
          <p>{place.reason}</p>
        </div>

        <ReviewSection reviews={reviews} />

        <div className={styles.actions}>
          <button
            type="button"
            className={`button button--secondary ${styles.saveButton} ${place.saved ? styles.saved : ''}`}
          >
            <Heart size={18} fill={place.saved ? 'currentColor' : 'none'} />
            즐겨찾기
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
