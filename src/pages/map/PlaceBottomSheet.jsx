import { Heart, MapPin, Navigation, PawPrint, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPlaceReviews } from '../../api/reviews.api';
import ReviewSection from '../../components/review/ReviewSection';
import styles from './PlaceBottomSheet.module.css';

const STATUS_META = {
  available: { label: '입장 가능', tone: 'available' },
  conditional: { label: '조건부 가능', tone: 'conditional' },
  verify: { label: '확인 필요', tone: 'verify' },
};

export default function PlaceBottomSheet({ place, onClose }) {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (!place) return;
    getPlaceReviews(place.id).then(({ data }) => setReviews(data));
  }, [place]);

  if (!place) return null;
  const status = STATUS_META[place.status] ?? STATUS_META.conditional;

  return (
    <section className={styles.sheet} role="dialog" aria-label={`${place.name} 상세 정보`}>
      <div className={styles.header}>
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
