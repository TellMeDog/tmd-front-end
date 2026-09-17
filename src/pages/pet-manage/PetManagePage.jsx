import { ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { deletePet, getPets } from '../../api/pets.api';
import { getApiErrorMessage } from '../../api/client';
import PetFormModal from '../../components/pet/PetFormModal';
import FeedbackModal from '../../components/feedback/FeedbackModal';
import { usePetStore } from '../../stores/pet.store';
import { getPetBreedLabel, getPetImageSrc, getPetSizeLabel } from '../../utils/pet';
import styles from '../shared/ServiceFlows.module.css';
export default function PetManagePage() {
  const pets = usePetStore((state) => state.pets);
  const setPets = usePetStore((state) => state.setPets);
  const appendPets = usePetStore((state) => state.appendPets);
  const replacePet = usePetStore((state) => state.replacePet);
  const removePet = usePetStore((state) => state.removePet);
  const [isLoading, setIsLoading] = useState(pets.length === 0);
  const [error, setError] = useState('');
  const [formState, setFormState] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    let active = true;
    getPets()
      .then((data) => {
        if (active) setPets(data);
      })
      .catch((requestError) => {
        if (active)
          setError(getApiErrorMessage(requestError, '반려견 목록을 불러오지 못했습니다.'));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [setPets]);

  const handleSaved = (savedPet) => {
    if (formState?.mode === 'edit') replacePet(savedPet);
    else appendPets([savedPet]);
  };

  const handleDelete = async (pet) => {
    setDeletingId(pet.petId);
    setError('');
    try {
      await deletePet(pet.petId);
      removePet(pet.petId);
      setDeleteTarget(null);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, '반려동물 정보를 삭제하지 못했습니다.'));
      setDeleteTarget(null);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="page">
      <span className="eyebrow">MY PETS</span>
      <h1 className="page-title">반려동물 관리</h1>
      <p className="page-description">함께 외출할 반려동물의 정보를 관리해요.</p>
      {isLoading && pets.length === 0 && (
        <p className="simple-status">반려동물 정보를 불러오는 중...</p>
      )}
      {error && <p className="field-error">{error}</p>}
      {!isLoading && !error && pets.length === 0 && (
        <section className="card empty-state">
          <PawEmpty />
          <h2>등록된 반려동물이 없어요.</h2>
          <p>반려동물을 등록하면 맞춤 장소 정보를 확인할 수 있어요.</p>
        </section>
      )}
      {pets.map((pet) => (
        <section className={`card ${styles.petCard}`} key={pet.petId}>
          <div className={styles.petPhoto}>
            {getPetImageSrc(pet.imageUrl) ? (
              <img src={getPetImageSrc(pet.imageUrl)} alt={`${pet.name} 사진`} />
            ) : (
              '🐶'
            )}
          </div>
          <div>
            <h2>{pet.name}</h2>
            <p className="page-description">
              {getPetBreedLabel(pet.breed)} · {getPetSizeLabel(pet.weight)} · {pet.weight}kg
            </p>
          </div>
          <div className={styles.petActions}>
            <button
              className="button button--secondary"
              type="button"
              onClick={() => setFormState({ mode: 'edit', pet })}
              disabled={deletingId === pet.petId}
            >
              수정 <ChevronRight size={18} />
            </button>
            <button
              className={`${styles.deletePetButton} button`}
              type="button"
              onClick={() => setDeleteTarget(pet)}
              disabled={deletingId === pet.petId}
            >
              <Trash2 size={17} />
              {deletingId === pet.petId ? '삭제 중' : '삭제'}
            </button>
          </div>
        </section>
      ))}
      <div className={styles.addPetAction}>
        <button
          className="button button--primary"
          type="button"
          onClick={() => setFormState({ mode: 'create' })}
        >
          <Plus size={18} />
          반려동물 추가
        </button>
      </div>
      {formState && (
        <PetFormModal
          key={formState.mode === 'edit' ? formState.pet.petId : 'create'}
          pet={formState.pet}
          onClose={() => setFormState(null)}
          onSaved={handleSaved}
        />
      )}
      <FeedbackModal
        open={Boolean(deleteTarget)}
        type="confirm"
        tone="danger"
        title={`${deleteTarget?.name ?? ''} 정보를 삭제할까요?`}
        description="삭제하면 이 반려동물을 기준으로 저장한 정보를 이용하기 어려울 수 있어요."
        confirmLabel="삭제"
        pending={deletingId === deleteTarget?.petId}
        onConfirm={() => handleDelete(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
      />
    </main>
  );
}

function PawEmpty() {
  return <span className={styles.emptyPetIcon}>🐾</span>;
}
