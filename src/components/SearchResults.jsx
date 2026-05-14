import { Search, ShoppingCart } from 'lucide-react';
import { motion } from 'motion/react';
import styles from './SearchResults.module.css';

export default function SearchResults({
  filteredProducts,
  addToCart,
  setSearchQuery,
  setActiveCategory,
}) {
  return (
    <main className={styles.products}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Resultados de Búsqueda</h3>
          <p className={styles.subtitle}>
            Encuentra lo que necesitas para tu obra
          </p>
        </div>
        <div className={styles.count}>
          ITEMS ENCONTRADOS: {filteredProducts.length}
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className={styles.grid}>
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles.product}
            >
              <div className={styles.media}>
                <img src={product.image} alt={product.name} referrerPolicy="no-referrer" />
              </div>

              <div className={styles.content}>
                <span className={styles.tag}>{product.category}</span>
                <div className={styles.headline}>
                  <h4>{product.name}</h4>
                </div>
                <p>{product.description}</p>
                <div className={styles.actions}>
                  <span className={styles.price}>
                    ${product.price.toLocaleString()}
                  </span>
                  <button
                    onClick={() => addToCart(product)}
                    className={styles.cta}
                  >
                    <ShoppingCart className={styles.ctaIcon} aria-hidden="true" />
                    Agregar
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <Search className={styles.icon} />
          <p>No se encontraron productos</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('Todos');
            }}
          >
            Reiniciar filtros
          </button>
        </div>
      )}
    </main>
  );
}
