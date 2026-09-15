import { CircleAlert, CircleCheck, CircleX, ImagePlus } from 'lucide-react';
import { useState } from 'react';
import CustomSelect from '../form/CustomSelect';
import StarRating from './StarRating';
import styles from './ReviewForm.module.css';

const FEEDBACKS = [
  ['ENTERED', CircleCheck, '조건이 맞아요'],
  ['MISMATCHED_INFO', CircleAlert, '조건이 달랐어요'],
  ['DENIED', CircleX, '입장을 거부당했어요'],
];
const REASONS = [
  ['STAFF_UNWARE', '직원이 규정을 몰랐어요'],
  ['CARRIED_REQUIRED', '이동장이 필요했어요'],
  ['MUZZLE_REQUIRED', '입마개가 필요했어요'],
  ['LEASH_REQUIRED', '목줄이 필요했어요'],
  ['ETC', '기타'],
];

export default function ReviewForm({
  initialValue = {},
  pets = [],
  onSubmit,
  onCancel,
  submitLabel = '등록하기',
  pending,
  requirePet = true,
}) {
  const [value, setValue] = useState({
    petId: initialValue.petId ?? pets[0]?.petId ?? '',
    feedbackType: initialValue.feedbackType ?? '',
    mismatchReasons: initialValue.mismatchReasons ?? [],
    rating: initialValue.rating ?? 0,
    content: initialValue.content ?? '',
    etcReason: initialValue.etcReason ?? '',
  });
  const change = (key, next) => setValue((current) => ({ ...current, [key]: next }));
  const toggleReason = (reason) =>
    change(
      'mismatchReasons',
      value.mismatchReasons.includes(reason)
        ? value.mismatchReasons.filter((item) => item !== reason)
        : [...value.mismatchReasons, reason],
    );
  const selectImage = (event) => {
    const file = event.target.files?.[0];
    if (file) change('imageFile', file);
  };

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(value);
      }}
    >
      {pets.length > 0 && (
        <div className={styles.selectLabel}>
          함께 방문한 반려동물
          <CustomSelect
            value={value.petId}
            options={pets.map((pet) => ({ value: pet.petId, label: pet.name }))}
            ariaLabel="함께 방문한 반려동물"
            onChange={(petId) => change('petId', petId)}
          />
        </div>
      )}
      <fieldset>
        <legend>방문 결과</legend>
        <div className={styles.feedbacks}>
          {FEEDBACKS.map(([id, Icon, label]) => (
            <button
              className={value.feedbackType === id ? styles.active : ''}
              key={id}
              type="button"
              onClick={() => change('feedbackType', id)}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </fieldset>
      {value.feedbackType === 'MISMATCHED_INFO' && (
        <fieldset>
          <legend>달랐던 조건을 선택해 주세요</legend>
          <div className={styles.reasons}>
            {REASONS.map(([id, label]) => (
              <label key={id}>
                <input
                  type="checkbox"
                  checked={value.mismatchReasons.includes(id)}
                  onChange={() => toggleReason(id)}
                />
                {label}
              </label>
            ))}
          </div>
          {value.mismatchReasons.includes('ETC') && (
            <input
              value={value.etcReason}
              onChange={(event) => change('etcReason', event.target.value)}
              placeholder="달랐던 내용을 입력해 주세요."
            />
          )}
        </fieldset>
      )}
      <fieldset>
        <legend>별점</legend>
        <StarRating
          value={value.rating}
          onChange={(rating) => change('rating', rating)}
          size={28}
        />
      </fieldset>
      <label className={styles.contentLabel}>
        리뷰
        <textarea
          rows="5"
          value={value.content}
          onChange={(event) => change('content', event.target.value)}
          placeholder="현장에서 확인한 내용을 알려주세요."
        />
      </label>
      <label className={styles.imageField}>
        <ImagePlus size={20} />
        <span>{value.imageFile?.name ?? '현장 사진 추가'}</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={selectImage}
        />
      </label>
      <div className={styles.actions}>
        {onCancel && (
          <button
            className="button button--secondary"
            type="button"
            onClick={onCancel}
            disabled={pending}
          >
            취소
          </button>
        )}
        <button
          className="button button--primary"
          type="submit"
          disabled={pending || (requirePet && !value.petId) || !value.feedbackType || !value.rating}
        >
          {pending ? '처리 중...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
