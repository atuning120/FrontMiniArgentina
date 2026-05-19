import { Filter, Search } from 'lucide-react';
import styles from './Filters.module.css';

export default function Filters({
  searchQuery,
  setSearchQuery,
  filterCategories,
  activeCategory,
  setActiveCategory,
}) {
  return (
    <div className={styles.filters}>
      <div className={styles.inner}>
        <div className={styles.search}>
          <Search className={styles.icon} />
          <input
            type="text"
            placeholder="Buscar cables, reflectores..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.input}
          />
        </div>

        <div className={styles.categories}>
          <Filter className={styles.icon} />
          {filterCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`${styles.button} ${activeCategory === cat ? styles.isActive : ''
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
