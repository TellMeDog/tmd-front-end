import { ImagePlus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { completeImageUpload, getPresignedUrl, uploadToPresignedUrl } from '../../api/images.api';
import { createPets, updatePet } from '../../api/pets.api';
import { getApiErrorMessage } from '../../api/client';
import { getPetImageSrc, getPetSizeLabel } from '../../utils/pet';
import BreedCombobox from './BreedCombobox';
import styles from './PetFormModal.module.css';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export default function PetFormModal({ pet, onClose, onSaved }) {
  const isEdit = Boolean(pet);
  const [name, setName] = useState(pet?.name ?? '');
  const [breed, setBreed] = useState(pet?.breed ?? '');
  const [weight, setWeight] = useState(() => {
    const currentSize = Number(pet?.size);
    return Number.isFinite(currentSize) ? String(currentSize) : '';
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(() => getPetImageSrc(pet?.imageUrl));
  const [uploadedImageKey, setUploadedImageKey] = useState('');
  const [pendingStep, setPendingStep] = useState('');
  const [error, setError] = useState('');

  useEffect(
    () => () => {
      if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

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
    setUploadedImageKey('');
    setPreviewUrl(URL.createObjectURL(file));
    setError('');
  };

  const submit = async (event) => {
    event.preventDefault();
    const numericWeight = weight === '' ? null : Number(weight);

    if (!name.trim()) return setError('이름을 입력해 주세요.');
    if (!breed) return setError('목록에서 견종을 선택해 주세요.');
    if (!isEdit && numericWeight === null) return setError('몸무게를 입력해 주세요.');
    if (numericWeight !== null && (!Number.isFinite(numericWeight) || numericWeight <= 0)) {
      return setError('몸무게는 0보다 큰 숫자로 입력해 주세요.');
    }

    setError('');
    try {
      let imageKey = uploadedImageKey;
      if (imageFile && !imageKey) {
        setPendingStep('이미지 업로드 준비 중...');
        const presignedData = await getPresignedUrl(imageFile, 'PET');
        setPendingStep('이미지 업로드 중...');
        await uploadToPresignedUrl(imageFile, presignedData);
        const { imageUrl } = await completeImageUpload(presignedData.uploadId);
        imageKey = imageUrl;
        setUploadedImageKey(imageKey);
      }

      const payload = {
        name: name.trim(),
        breed,
        size: numericWeight === null ? pet.size : numericWeight,
        imageUrl: imageKey || pet?.imageUrl || null,
      };

      setPendingStep(isEdit ? '반려동물 수정 중...' : '반려동물 등록 중...');
      const savedPet = isEdit
        ? await updatePet(pet.petId, payload)
        : (await createPets([payload]))[0];
      onSaved(savedPet);
      onClose();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, '반려동물 정보를 저장하지 못했습니다.'));
    } finally {
      setPendingStep('');
    }
  };

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pet-form-title"
      >
        <div className={styles.header}>
          <div>
            <span className="eyebrow">MY PET</span>
            <h2 id="pet-form-title">반려동물 {isEdit ? '수정' : '추가'}</h2>
          </div>
          <button type="button" onClick={onClose} disabled={Boolean(pendingStep)} aria-label="닫기">
            <X size={22} />
          </button>
        </div>

        <form className={styles.form} onSubmit={submit}>
          <label className={styles.imagePicker}>
            {previewUrl ? <img src={previewUrl} alt="선택한 반려동물" /> : <ImagePlus size={30} />}
            <span>{previewUrl ? '사진 변경' : '사진 선택'}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={selectImage}
            />
          </label>
          <p className={styles.imageHelp}>JPG, PNG, GIF, WEBP · 최대 10MB</p>

          <div className="field">
            <label htmlFor="petName">이름</label>
            <input
              id="petName"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="반려동물 이름"
            />
          </div>
          <div className="field">
            <label htmlFor="petBreed">견종</label>
            <BreedCombobox value={breed} onChange={setBreed} disabled={Boolean(pendingStep)} />
          </div>
          <div className="field">
            <label htmlFor="petWeight">몸무게</label>
            <div className={styles.weightInput}>
              <input
                id="petWeight"
                type="number"
                inputMode="decimal"
                min="0.1"
                step="0.1"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
                placeholder={
                  isEdit ? `현재 ${getPetSizeLabel(pet.size)} · 변경 시 입력` : '예: 3.5'
                }
              />
              <span>kg</span>
            </div>
          </div>

          {error && <p className="field-error">{error}</p>}
          {pendingStep && <p className={styles.pending}>{pendingStep}</p>}
          <div className={styles.footer}>
            <button
              className="button button--secondary"
              type="button"
              onClick={onClose}
              disabled={Boolean(pendingStep)}
            >
              취소
            </button>
            <button
              className="button button--primary"
              type="submit"
              disabled={Boolean(pendingStep)}
            >
              {isEdit ? '수정하기' : '등록하기'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
