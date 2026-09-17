import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getApiErrorMessage } from '../../api/client';
import { updateReview } from '../../api/reviews.api';
import { uploadImage } from '../../api/images.api';
import ReviewForm from '../../components/review/ReviewForm';
import styles from './ReviewEditPage.module.css';

export default function ReviewEditPage() {
  const { reviewId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const submit = async (value) => {
    setPending(true);
    setError('');
    try {
      const imageUploadId = value.imageFile ? await uploadImage(value.imageFile, 'REVIEW') : null;
      await updateReview(reviewId, {
        feedbackType: value.feedbackType,
        mismatchReasons: value.feedbackType === 'MISMATCHED_INFO' ? value.mismatchReasons : [],
        etcReason: value.etcReason,
        rating: value.rating,
        content: value.content.trim(),
        imageUploadId,
        removeImage: false,
      });
      navigate(state?.petId ? `/my/reviews/${state.petId}` : '/my/reviews', { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, '리뷰를 수정하지 못했습니다.'));
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="page">
      <span className="eyebrow">EDIT REVIEW</span>
      <h1 className="page-title">리뷰 수정</h1>
      <p className="page-description">
        {state?.review?.placeTitle ?? '방문 장소'}의 현재 경험으로 다시 작성해 주세요.
      </p>
      <section className={`card ${styles.panel}`}>
        <ReviewForm
          initialValue={state?.review}
          onSubmit={submit}
          onCancel={() => navigate(-1)}
          submitLabel="수정"
          pending={pending}
          requirePet={false}
        />
        {error && <p className="field-error">{error}</p>}
      </section>
    </main>
  );
}
