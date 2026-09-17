import { PawPrint, Plus, Star } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { usePetStore } from '../../stores/pet.store';
import { withSubjectParticle } from '../../utils/korean';
import ReviewFormModal from './ReviewFormModal';
import styles from './ReviewSection.module.css';

const TAG_META = [
  { key: 'ENTERED', label: '잘 맞아요', tone: 'fit' },
  { key: 'MISMATCHED_INFO', label: '조건과 달랐어요', tone: 'different' },
  { key: 'DENIED', label: '거부 당했어요', tone: 'rejected' },
];

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value ?? '';
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

export default function ReviewSection({ reviews, topBreeds, placeId, onReviewCreated }) {
  const navigate = useNavigate();
  const location = useLocation();
  const accessToken = useAuthStore((state) => state.accessToken);
  const petId = usePetStore((state) => state.selectedPetId);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleWriteReview = () => {
    if (!accessToken) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    setIsFormOpen(true);
  };

  const writeButton = (
    <button type="button" className={styles.writeButton} onClick={handleWriteReview}>
      <Plus size={14} />
      리뷰 작성
    </button>
  );

  const formModal = isFormOpen && (
    <ReviewFormModal
      placeId={placeId}
      petId={petId}
      onClose={() => setIsFormOpen(false)}
      onCreated={() => onReviewCreated?.()}
    />
  );

  if (!reviews || reviews.length === 0) {
    return (
      <div className={styles.section}>
        <div className={styles.headingRow}>
          <h3 className={styles.heading}>리뷰</h3>
          {writeButton}
        </div>
        <p className={styles.empty}>아직 등록된 리뷰가 없어요.</p>
        {formModal}
      </div>
    );
  }

  const counts = reviews.reduce((acc, review) => {
    acc[review.feedbackType] = (acc[review.feedbackType] ?? 0) + 1;
    return acc;
  }, {});
  const recentDate = reviews.reduce(
    (latest, review) => (review.createdAt > latest ? review.createdAt : latest),
    reviews[0].createdAt,
  );

  return (
    <div className={styles.section}>
      <div className={styles.headingRow}>
        <h3 className={styles.heading}>리뷰</h3>
        {writeButton}
      </div>

      <div className={styles.tags}>
        {TAG_META.map((meta) => (
          <span key={meta.key} className={`${styles.tag} ${styles[meta.tone]}`}>
            {meta.label} <b>{counts[meta.key] ?? 0}</b>
          </span>
        ))}
      </div>

      <p className={styles.recent}>최근 리뷰 {formatDate(recentDate)}</p>

      {topBreeds?.length > 0 && (
        <p className={styles.insight}>
          <PawPrint size={14} />
          {withSubjectParticle(topBreeds.join(', '))} 많이 방문했어요
        </p>
      )}

      <ul className={styles.list}>
        {reviews.map((review) => (
          <li key={review.reviewId} className={styles.item}>
            <div className={styles.thumb}>
              <PawPrint size={20} />
            </div>
            <div className={styles.itemBody}>
              <div className={styles.itemHead}>
                <span className={styles.nickname}>{review.petName ?? '익명'}</span>
                <span className={styles.stars} aria-label={`별점 ${review.rating}점`}>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} size={12} fill={index < review.rating ? 'currentColor' : 'none'} />
                  ))}
                </span>
              </div>
              <span className={styles.date}>{formatDate(review.createdAt)}</span>
              <p className={styles.text}>{review.content}</p>
            </div>
          </li>
        ))}
      </ul>
      {formModal}
    </div>
  );
}
