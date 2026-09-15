import { ImagePlus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getApiErrorMessage } from '../../api/client';
import { uploadImage } from '../../api/images.api';
import { getPets, updatePet } from '../../api/pets.api';
import BreedCombobox from '../../components/pet/BreedCombobox';
import PetEquipmentFields from '../../components/pet/PetEquipmentFields';
import { usePetStore } from '../../stores/pet.store';
import { getPetImageSrc } from '../../utils/pet';
import styles from './PetEditPage.module.css';

export default function PetEditPage() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const pets = usePetStore((state) => state.pets);
  const setPets = usePetStore((state) => state.setPets);
  const replacePet = usePetStore((state) => state.replacePet);
  const pet = useMemo(() => pets.find((item) => String(item.petId) === petId), [petId, pets]);
  const [form, setForm] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(!pet);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (pet) return;
    getPets()
      .then(setPets)
      .catch((requestError) =>
        setError(getApiErrorMessage(requestError, '반려동물 정보를 불러오지 못했습니다.')),
      )
      .finally(() => setIsLoading(false));
  }, [pet, setPets]);

  useEffect(() => {
    if (!pet) return;
    setForm({
      name: pet.name ?? '',
      breed: pet.breed ?? '',
      weight: String(pet.weight ?? ''),
      hasLeash: Boolean(pet.hasLeash),
      hasMuzzle: Boolean(pet.hasMuzzle),
      hasCarrier: Boolean(pet.hasCarrier),
    });
    setPreviewUrl(getPetImageSrc(pet.imageUrl));
    setIsLoading(false);
  }, [pet]);

  useEffect(
    () => () => {
      if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  const change = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const selectImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      setError('JPG, PNG, GIF, WEBP 이미지만 등록할 수 있습니다.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('이미지는 10MB 이하만 등록할 수 있습니다.');
      return;
    }
    if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError('');
  };

  const submit = async (event) => {
    event.preventDefault();
    const weight = Number(form.weight);
    if (!form.name.trim() || !form.breed.trim() || !Number.isFinite(weight) || weight <= 0) {
      setError('이름, 견종, 몸무게를 올바르게 입력해 주세요.');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      const imageUploadId = imageFile ? await uploadImage(imageFile, 'PET') : null;
      const savedPet = await updatePet(pet.petId, {
        ...form,
        name: form.name.trim(),
        breed: form.breed.trim(),
        weight,
        imageUploadId,
        removeImage: false,
      });
      replacePet(savedPet);
      navigate('/my', { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, '반려동물 정보를 수정하지 못했습니다.'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <main className="page simple-status">불러오는 중...</main>;
  if (!pet || !form)
    return <main className="page field-error">{error || '반려동물을 찾을 수 없습니다.'}</main>;

  return (
    <main className={`page ${styles.page}`}>
      <span className="eyebrow">EDIT MY PET</span>
      <h1 className="page-title">반려동물 정보 수정</h1>
      <p className="page-description">맞춤 판정에 사용할 정보를 최신 상태로 관리해 주세요.</p>
      <form className={`card ${styles.form}`} onSubmit={submit}>
        <label className={styles.imagePicker}>
          {previewUrl ? <img src={previewUrl} alt={`${pet.name} 사진`} /> : <ImagePlus size={28} />}
          <span>사진 변경</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={selectImage}
          />
        </label>
        <div className="field">
          <label htmlFor="editPetName">이름</label>
          <input
            id="editPetName"
            value={form.name}
            onChange={(event) => change('name', event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="editPetBreed">견종</label>
          <BreedCombobox
            value={form.breed}
            onChange={(value) => change('breed', value)}
            disabled={isSaving}
          />
        </div>
        <div className="field">
          <label htmlFor="editPetWeight">몸무게 (kg)</label>
          <input
            id="editPetWeight"
            type="number"
            min="0.1"
            step="0.1"
            value={form.weight}
            onChange={(event) => change('weight', event.target.value)}
          />
        </div>
        <PetEquipmentFields values={form} onChange={change} />
        {error && <p className="field-error">{error}</p>}
        <div className={styles.actions}>
          <button
            className="button button--secondary"
            type="button"
            onClick={() => navigate(-1)}
            disabled={isSaving}
          >
            취소
          </button>
          <button className="button button--primary" type="submit" disabled={isSaving}>
            {isSaving ? '수정 중...' : '수정'}
          </button>
        </div>
      </form>
    </main>
  );
}
