import { Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import FavoriteCard from '../../components/favorite/FavoriteCard';
import { deleteFavorite, getFavorites } from '../../api/favorites.api';
import { getApiErrorMessage } from '../../api/client';
import styles from '../shared/Pages.module.css';
export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError('');
    getFavorites({ page, size: 10 })
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
  }, [page]);

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
      {isLoading && <p className="simple-status">즐겨찾기를 불러오는 중...</p>}
      {error && <p className="field-error">{error}</p>}
      {!isLoading && !error && favorites.length === 0 && (
        <section className="card empty-state">
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
