import { MapPin, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getApiErrorMessage } from '../../api/client';
import { getPets } from '../../api/pets.api';
import { deleteReview, getMyReviews } from '../../api/reviews.api';
import FeedbackModal from '../../components/feedback/FeedbackModal';
import CustomSelect from '../../components/form/CustomSelect';
import { usePetStore } from '../../stores/pet.store';
import styles from './MyReviewsPage.module.css';

export default function MyReportsPage() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const pets = usePetStore((state) => state.pets);
  const setPets = usePetStore((state) => state.setPets);
  const setSelectedPetId = usePetStore((state) => state.setSelectedPetId);
  const routePetId = Number(petId);
  const selectedPet = pets.find((pet) => pet.petId === routePetId);
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [deletingId, setDeletingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isPetsLoading, setIsPetsLoading] = useState(pets.length === 0);

  useEffect(() => {
    if (pets.length > 0) {
      setIsPetsLoading(false);
      return;
    }

    getPets()
      .then(setPets)
      .catch((requestError) =>
        setError(getApiErrorMessage(requestError, '반려동물 정보를 불러오지 못했습니다.')),
      )
      .finally(() => setIsPetsLoading(false));
  }, [pets.length, setPets]);

  useEffect(() => {
    if (isPetsLoading || pets.length === 0) return;
    if (!petId) {
      navigate(`/my/reviews/${pets[0].petId}`, { replace: true });
      return;
    }
    if (selectedPet) setSelectedPetId(selectedPet.petId);
  }, [isPetsLoading, navigate, petId, pets, selectedPet, setSelectedPetId]);

  useEffect(() => {
    setPage(0);
  }, [petId]);

  useEffect(() => {
    if (!selectedPet) {
      setIsLoading(false);
      setReviews([]);
      return undefined;
    }

    let active = true;
    setIsLoading(true);
    setError('');
    setReviews([]);
    getMyReviews(selectedPet.petId, { page, size: 10 })
      .then((response) => {
        if (!active) return;
        setReviews(response?.content ?? []);
        setTotalPages(response?.totalPages ?? 0);
      })
      .catch((requestError) => {
        if (active) setError(getApiErrorMessage(requestError, '내 리뷰를 불러오지 못했습니다.'));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, reloadKey, selectedPet]);

  const remove = async (review) => {
    setDeletingId(review.reviewId);
    try {
      await deleteReview(review.reviewId);
      setDeleteTarget(null);
      if (reviews.length === 1 && page > 0) setPage((current) => current - 1);
      else setReloadKey((current) => current + 1);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, '리뷰를 삭제하지 못했습니다.'));
      setDeleteTarget(null);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="page">
      <span className="eyebrow">MY REVIEWS</span>
      <h1 className="page-title">내 리뷰</h1>
      <p className="page-description">내가 남긴 방문 경험을 확인하고 관리할 수 있어요.</p>
      {pets.length > 1 && selectedPet && (
        <div className={styles.petSelector}>
          <span>반려동물</span>
          <CustomSelect
            value={selectedPet.petId}
            options={pets.map((pet) => ({ value: pet.petId, label: pet.name }))}
            ariaLabel="리뷰를 확인할 반려동물"
            onChange={(nextPetId) => navigate(`/my/reviews/${nextPetId}`)}
          />
        </div>
      )}
      {(isPetsLoading || isLoading) && <p className="simple-status">리뷰를 불러오는 중...</p>}
      {error && <p className="field-error">{error}</p>}
      {!isPetsLoading && pets.length === 0 && !error && (
        <section className={`card empty-state ${styles.reviewEmpty}`}>
          <MapPin size={40} />
          <h2>반려동물을 먼저 등록해 주세요.</h2>
          <p>반려동물을 등록하면 작성한 리뷰를 확인할 수 있어요.</p>
        </section>
      )}
      {!isPetsLoading && petId && !selectedPet && pets.length > 0 && !error && (
        <section className={`card empty-state ${styles.reviewEmpty}`}>
          <MapPin size={40} />
          <h2>반려동물을 찾을 수 없어요.</h2>
          <p>삭제되었거나 내 반려동물이 아닌지 확인해 주세요.</p>
        </section>
      )}
      {!isLoading && selectedPet && !error && reviews.length === 0 && (
        <section className={`card empty-state ${styles.reviewEmpty}`}>
          <MapPin size={40} />
          <h2>작성한 리뷰가 없어요.</h2>
          <p>방문한 장소에서 첫 리뷰를 남겨보세요.</p>
        </section>
      )}
      <div className={styles.list}>
        {reviews.map((review) => (
          <article className={`card ${styles.card}`} key={review.reviewId}>
            <div className={styles.thumbnail}>
              {review.imageKey ? <img src={review.imageKey} alt="" /> : <MapPin size={28} />}
            </div>
            <div className={styles.content}>
              <h2>
                <Link to={`/places/${review.placeId}`}>{review.placeTitle}</Link>
              </h2>
              <p>
                {[review.placeAddr1, review.placeAddr2].filter(Boolean).join(' ') ||
                  '주소 정보가 없습니다.'}
              </p>
            </div>
            <div className={styles.actions}>
              <Link
                className="button button--secondary"
                to={`/my/reviews/${review.reviewId}/edit`}
                state={{ review, petId: selectedPet.petId }}
              >
                <Pencil size={16} />
                수정
              </Link>
              <button
                className={styles.delete}
                type="button"
                onClick={() => setDeleteTarget(review)}
                disabled={deletingId === review.reviewId}
              >
                <Trash2 size={16} />
                {deletingId === review.reviewId ? '삭제 중' : '삭제'}
              </button>
            </div>
          </article>
        ))}
      </div>
      {selectedPet && totalPages > 1 && (
        <nav className={styles.pagination}>
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((current) => current - 1)}
          >
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
      <FeedbackModal
        open={Boolean(deleteTarget)}
        type="confirm"
        tone="danger"
        title="리뷰를 삭제할까요?"
        description={`${deleteTarget?.placeTitle ?? '이 장소'}에 남긴 리뷰가 영구적으로 삭제됩니다.`}
        confirmLabel="삭제"
        pending={deletingId === deleteTarget?.reviewId}
        onConfirm={() => remove(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
      />
    </main>
  );
}
