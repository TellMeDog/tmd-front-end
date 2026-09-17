import { Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import FavoriteCard from '../../components/favorite/FavoriteCard';
import CustomSelect from '../../components/form/CustomSelect';
import { deleteFavorite, getFavorites } from '../../api/favorites.api';
import { getApiErrorMessage } from '../../api/client';
import { getPets } from '../../api/pets.api';
import { usePetStore } from '../../stores/pet.store';
import styles from '../shared/Pages.module.css';
export default function FavoritesPage() {
  const pets = usePetStore((state) => state.pets);
  const selectedPetId = usePetStore((state) => state.selectedPetId);
  const setPets = usePetStore((state) => state.setPets);
  const setSelectedPetId = usePetStore((state) => state.setSelectedPetId);
  const [favorites, setFavorites] = useState([]);
  const [isPetLoading, setIsPetLoading] = useState(pets.length === 0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (pets.length > 0) return;
    getPets()
      .then(setPets)
      .catch(() => setError('반려동물 정보를 불러오지 못했습니다.'))
      .finally(() => setIsPetLoading(false));
  }, [pets.length, setPets]);

  useEffect(() => {
    if (!selectedPetId) {
      setIsLoading(false);
      return;
    }
    let active = true;
    setIsLoading(true);
    setError('');
    getFavorites({ petId: selectedPetId, page, size: 10 })
      .then((response) => {
        if (!active) return;
        setFavorites(response.content);
        setTotalPages(response.totalPages);
      })
      .catch((requestError) => {
        if (active) setError(getApiErrorMessage(requestError, '즐겨찾기를 불러오지 못했습니다.'));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, selectedPetId]);

  const removeFavorite = async (placeId) => {
    setDeletingId(placeId);
    setError('');
    try {
      await deleteFavorite(placeId);
      const nextFavorites = favorites.filter((favorite) => favorite.placeId !== placeId);
      if (nextFavorites.length === 0 && page > 0) setPage((current) => current - 1);
      else setFavorites(nextFavorites);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, '즐겨찾기를 삭제하지 못했습니다.'));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="page">
      <span className="eyebrow">SAVED PLACES</span>
      <h1 className="page-title">즐겨찾기</h1>
      <p className="page-description">반려견과 가고 싶은 장소를 모아두었어요.</p>
      {/* {pets.length > 1 && (
        <div className={styles.petSelector}>
          <span>반려동물</span>
          <CustomSelect
            value={selectedPetId}
            options={pets.map((pet) => ({ value: pet.petId, label: pet.name }))}
            ariaLabel="즐겨찾기를 확인할 반려동물"
            onChange={(nextPetId) => {
              setPage(0);
              setSelectedPetId(nextPetId);
            }}
          />
        </div>
      )*/}
      {!isPetLoading && !isLoading && pets.length === 0 && (
        <section className={`card empty-state ${styles.favoriteEmpty}`}>
          <Heart size={40} />
          <h2>반려동물을 먼저 등록해 주세요.</h2>
          <p>반려동물 기준으로 저장한 장소를 보여드려요.</p>
        </section>
      )}
      {(isPetLoading || isLoading) && <p className="simple-status">즐겨찾기를 불러오는 중...</p>}
      {error && <p className="field-error">{error}</p>}
      {!isLoading && !error && pets.length > 0 && favorites.length === 0 && (
        <section className={`card empty-state ${styles.favoriteEmpty}`}>
          <Heart size={40} />
          <h2>저장한 장소가 없어요.</h2>
          <p>장소 상세에서 하트를 눌러 저장해 보세요.</p>
        </section>
      )}
      {!isLoading && favorites.length > 0 && (
        <>
          <div className={`${styles.grid} ${styles.favoriteGrid}`}>
            {favorites.map((favorite) => (
              <FavoriteCard
                key={favorite.placeId}
                favorite={favorite}
                deleting={deletingId === favorite.placeId}
                onDelete={removeFavorite}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <nav className={styles.pagination} aria-label="즐겨찾기 페이지">
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
        </>
      )}
    </main>
  );
}
