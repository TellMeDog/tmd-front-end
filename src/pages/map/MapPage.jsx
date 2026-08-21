import styles from '../shared/Pages.module.css';

export default function MapPage() {
  return (
    <main className={styles.mapLayout}>
      <section className={styles.mapFull}>
        <span className={styles.mapPlaceholder}>지도 준비중</span>
      </section>
    </main>
  );
}
