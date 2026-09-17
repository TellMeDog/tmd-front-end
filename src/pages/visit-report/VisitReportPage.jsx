import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getApiErrorMessage } from '../../api/client';
import { getPets } from '../../api/pets.api';
import { createReview } from '../../api/reviews.api';
import { uploadImage } from '../../api/images.api';
import ReviewForm from '../../components/review/ReviewForm';
import { usePetStore } from '../../stores/pet.store';
import styles from '../shared/ServiceFlows.module.css';

export default function VisitReportPage() {
  const { placeId } = useParams();
  const navigate = useNavigate();
  const pets = usePetStore((state) => state.pets);
  const setPets = usePetStore((state) => state.setPets);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (pets.length === 0)
      getPets()
        .then(setPets)
        .catch(() => setError('반려동물 정보를 불러오지 못했습니다.'));
  }, [pets.length, setPets]);

  const submit = async (value) => {
    setPending(true);
    setError('');
    try {
      const imageUploadId = value.imageFile ? await uploadImage(value.imageFile, 'REVIEW') : null;
      await createReview(placeId, {
        petId: value.petId,
        feedbackType: value.feedbackType,
        mismatchReasons: value.feedbackType === 'MISMATCHED_INFO' ? value.mismatchReasons : [],
        etcReasons: value.etcReason,
        rating: value.rating,
        content: value.content.trim(),
        imageUploadId,
      });
      navigate(`/places/${placeId}`, { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, '리뷰를 등록하지 못했습니다.'));
    } finally {
      setPending(false);
    }
  };

  return (
    <main className={styles.flow}>
      <section className={`card ${styles.flowHead}`}>
        <span className="eyebrow">VISIT REVIEW</span>
        <h1>방문 결과를 알려주세요</h1>
        <p className="page-description">보호자님의 경험이 다른 반려가족의 헛걸음을 줄여요.</p>
      </section>
      <section className={`card ${styles.reviewFormPanel}`}>
        {pets.length > 0 ? (
          <ReviewForm
            pets={pets}
            onSubmit={submit}
            onCancel={() => navigate(-1)}
            pending={pending}
            submitLabel="리뷰 등록"
          />
        ) : (
          <p className="simple-status">등록된 반려동물이 필요합니다.</p>
        )}
        {error && <p className="field-error">{error}</p>}
      </section>
    </main>
  );
}
