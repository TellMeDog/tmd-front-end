import { ImagePlus, Star, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { completeImageUpload, getPresignedUrl, uploadToPresignedUrl } from '../../api/images.api';
import { createReview } from '../../api/reviews.api';
import { getApiErrorMessage } from '../../api/client';
import { usePetStore } from '../../stores/pet.store';
import { withConjunctiveParticle } from '../../utils/korean';
import styles from './ReviewFormModal.module.css';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const FEEDBACK_OPTIONS = [
  { value: 'ENTERED', label: '잘 맞아요', tone: 'fit' },
  { value: 'MISMATCHED_INFO', label: '조건과 달랐어요', tone: 'different' },
  { value: 'DENIED', label: '거부 당했어요', tone: 'rejected' },
];

const MISMATCH_OPTIONS = [
  { value: 'STAFF_UNWARE', label: '직원이 안내 사항을 몰랐어요' },
  { value: 'CARRIED_REQUIRED', label: '이동장이 필요했어요' },
  { value: 'MUZZLE_REQUIRED', label: '입마개가 필요했어요' },
  { value: 'LEASH_REQUIRED', label: '목줄이 필요했어요' },
  { value: 'ETC', label: '기타' },
];

export default function ReviewFormModal({ placeId, petId, onClose, onCreated }) {
  const petName = usePetStore((state) => state.pets.find((pet) => pet.petId === petId)?.name);
  const [feedbackType, setFeedbackType] = useState('');
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [mismatchReasons, setMismatchReasons] = useState([]);
  const [etcReason, setEtcReason] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingStep, setPendingStep] = useState('');
  const [error, setError] = useState('');

  useEffect(
    () => () => {
      if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  const toggleMismatchReason = (value) => {
    setMismatchReasons((current) =>
      current.includes(value) ? current.filter((reason) => reason !== value) : [...current, value],
    );
  };

  const selectImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError('JPG, PNG, GIF, WEBP 이미지만 등록할 수 있습니다.');
      event.target.value = '';
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError('이미지는 10MB 이하만 등록할 수 있습니다.');
      event.target.value = '';
      return;
    }

    if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError('');
  };

  const removeImage = () => {
    if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setImageFile(null);
    setPreviewUrl('');
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!feedbackType) return setError('방문 결과를 선택해 주세요.');
    if (!rating) return setError('별점을 선택해 주세요.');

    setError('');
    setIsSubmitting(true);
    try {
      let imageUploadId;
      if (imageFile) {
        setPendingStep('이미지 업로드 준비 중...');
        const presignedData = await getPresignedUrl(imageFile, 'REVIEW');
        setPendingStep('이미지 업로드 중...');
        await uploadToPresignedUrl(imageFile, presignedData);
        await completeImageUpload(presignedData.uploadId);
        imageUploadId = presignedData.uploadId;
      }

      setPendingStep('리뷰 등록 중...');
      await createReview(placeId, {
        petId,
        feedbackType,
        rating,
        content: content.trim(),
        mismatchReasons: feedbackType === 'MISMATCHED_INFO' ? mismatchReasons : [],
        etcReasons: mismatchReasons.includes('ETC') ? etcReason.trim() : undefined,
        imageUploadId,
      });
      onCreated();
      onClose();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, '리뷰를 등록하지 못했습니다.'));
    } finally {
      setIsSubmitting(false);
      setPendingStep('');
    }
  };

  return createPortal(
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="review-form-title">
        <div className={styles.header}>
          <h2 id="review-form-title">리뷰 작성</h2>
          <button type="button" onClick={onClose} disabled={isSubmitting} aria-label="닫기">
            <X size={22} />
          </button>
        </div>

        <form className={styles.form} onSubmit={submit}>
          <div className={styles.scrollArea}>
            <div className="field">
              <label>방문 결과</label>
              <div className={styles.feedbackOptions}>
                {FEEDBACK_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`${styles.feedbackOption} ${styles[option.tone]} ${
                      feedbackType === option.value ? styles.selected : ''
                    }`}
                    onClick={() => setFeedbackType(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {feedbackType === 'MISMATCHED_INFO' && (
              <div className="field">
                <label>어떤 점이 달랐나요?</label>
                <div className={styles.mismatchOptions}>
                  {MISMATCH_OPTIONS.map((option) => (
                    <label key={option.value} className={styles.mismatchOption}>
                      <input
                        type="checkbox"
                        checked={mismatchReasons.includes(option.value)}
                        onChange={() => toggleMismatchReason(option.value)}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
                {mismatchReasons.includes('ETC') && (
                  <input
                    className={styles.etcInput}
                    value={etcReason}
                    onChange={(event) => setEtcReason(event.target.value)}
                    placeholder="기타 사유를 입력해 주세요"
                  />
                )}
              </div>
            )}

            <div className="field">
              <label>별점</label>
              <div className={styles.stars}>
                {Array.from({ length: 5 }).map((_, index) => {
                  const value = index + 1;
                  return (
                    <button key={value} type="button" onClick={() => setRating(value)} aria-label={`${value}점`}>
                      <Star size={26} fill={value <= rating ? 'currentColor' : 'none'} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="field">
              <label htmlFor="reviewContent">내용 (선택)</label>
              <textarea
                id="reviewContent"
                rows={4}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder={`${withConjunctiveParticle(petName ?? '멍이')} 함께한 경험을 남겨주세요.`}
              />
            </div>

            <div className="field">
              <label>사진 (선택)</label>
              <div className={styles.imageField}>
                <label className={styles.imagePicker}>
                  {previewUrl ? <img src={previewUrl} alt="선택한 사진" /> : <ImagePlus size={24} />}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={selectImage}
                    disabled={isSubmitting}
                  />
                </label>
                {previewUrl && (
                  <button
                    type="button"
                    className={styles.removeImage}
                    onClick={removeImage}
                    disabled={isSubmitting}
                    aria-label="사진 제거"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {error && <p className="field-error">{error}</p>}
            {pendingStep && <p className={styles.pending}>{pendingStep}</p>}
          </div>

          <div className={styles.footer}>
            <button className="button button--secondary" type="button" onClick={onClose} disabled={isSubmitting}>
              취소
            </button>
            <button className="button button--primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? '등록 중...' : '등록하기'}
            </button>
          </div>
        </form>
      </section>
    </div>,
    document.body,
  );
}
