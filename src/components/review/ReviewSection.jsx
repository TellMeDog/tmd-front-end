import { PawPrint, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../../api/client';
import { getPlaceReviewsPage } from '../../api/reviews.api';
import { useAuthStore } from '../../stores/auth.store';
import { usePetStore } from '../../stores/pet.store';
import { withSubjectParticle } from '../../utils/korean';
import CustomSelect from '../form/CustomSelect';
import ReviewFormModal from './ReviewFormModal';
import StarRating from './StarRating';
import styles from './ReviewSection.module.css';

const FEEDBACK_LABEL = {
  ENTERED: '조건이 맞아요',
  MISMATCHED_INFO: '조건이 달랐어요',
  DENIED: '입장을 거부당했어요',
};

function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' }).format(new Date(value));
}

export default function ReviewSection({ placeId, reviews: providedReviews, topBreeds, onReviewCreated }) {
  const navigate = useNavigate();
  const location = useLocation();
  const accessToken = useAuthStore((state) => state.accessToken);
  const petId = usePetStore((state) => state.selectedPetId);

  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sort, setSort] = useState('latest');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (providedReviews) {
      setIsLoading(false);
      return undefined;
    }
    let active = true;
    setIsLoading(true);
    setError('');
    getPlaceReviewsPage(placeId, { page, size: 5, sort })
      .then((response) => {
        if (!active) return;
        setReviews(response?.content ?? []);
        setTotalPages(response?.totalPages ?? 0);
      })
      .catch((requestError) => {
        if (active) setError(getApiErrorMessage(requestError, '리뷰를 불러오지 못했습니다.'));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, placeId, providedReviews, sort, reloadKey]);

  const visibleReviews = providedReviews ?? reviews;

  const handleWriteReview = () => {
    if (!accessToken) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    setIsFormOpen(true);
  };

  const handleReviewCreated = () => {
    setPage(0);
    setReloadKey((key) => key + 1);
    onReviewCreated?.();
  };

  return (
    <section className={`card ${styles.section}`}>
      <div className={styles.sectionHead}>
        <h2>장소 리뷰</h2>
        <div className={styles.headActions}>
          {!providedReviews && (
            <CustomSelect
              value={sort}
              options={[
                { value: 'latest', label: '최신순' },
                { value: 'rating', label: '별점순' },
              ]}
              ariaLabel="리뷰 정렬"
              onChange={(nextSort) => {
                setPage(0);
                setSort(nextSort);
              }}
            />
          )}
          <button type="button" className={styles.writeButton} onClick={handleWriteReview}>
            <Plus size={14} />
            리뷰 작성
          </button>
        </div>
      </div>

      {topBreeds?.length > 0 && (
        <p className={styles.insight}>
          <PawPrint size={14} />
          {withSubjectParticle(topBreeds.join(', '))} 많이 방문했어요
        </p>
      )}

      {isLoading && <p className={styles.empty}>리뷰를 불러오는 중...</p>}
      {error && <p className="field-error">{error}</p>}
      {!isLoading && !error && visibleReviews.length === 0 && (
        <p className={styles.empty}>아직 등록된 리뷰가 없어요.</p>
      )}
      <ul className={styles.list}>
        {visibleReviews.map((review) => (
          <li key={review.reviewId ?? review.id} className={styles.item}>
            <div className={styles.thumb}>
              {review.imageUrl ? <img src={review.imageUrl} alt="" /> : <PawPrint size={20} />}
            </div>
            <div className={styles.itemBody}>
              <div className={styles.itemHead}>
                <strong>{review.petName ?? review.nickname}</strong>
                <StarRating value={review.rating} size={14} />
              </div>
              <span className={styles.date}>
                {FEEDBACK_LABEL[review.feedbackType] ?? review.tagLabel ?? ''} ·{' '}
                {formatDate(review.createdAt ?? review.date)}
              </span>
              {(review.content ?? review.text) && (
                <p className={styles.text}>{review.content ?? review.text}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
      {!providedReviews && totalPages > 1 && (
        <nav className={styles.pagination} aria-label="리뷰 페이지">
          <button type="button" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>
            이전
          </button>
          <span>
            {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            다음
          </button>
        </nav>
      )}

      {isFormOpen && (
        <ReviewFormModal
          placeId={placeId}
          petId={petId}
          onClose={() => setIsFormOpen(false)}
          onCreated={handleReviewCreated}
        />
      )}
    </section>
  );
}
