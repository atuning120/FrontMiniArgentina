import { Search, ShoppingCart } from 'lucide-react';
import { motion } from 'motion/react';
import styles from './SearchResults.module.css';

export default function SearchResults({
  filteredProducts,
  paginatedProducts,
  addToCart,
  setSearchQuery,
  setActiveCategory,
  loading,
  error,
  onProductClick,
  filters,
  currentPage,
  totalPages,
  onPageChange,
}) {
  const maxButtons = 5;
  const clampedCurrent = Math.min(currentPage, totalPages);
  const startPage = Math.max(1, clampedCurrent - Math.floor(maxButtons / 2));
  const endPage = Math.min(totalPages, startPage + maxButtons - 1);
  const pageStart = Math.max(1, endPage - maxButtons + 1);

  const pages = [];
  for (let page = pageStart; page <= endPage; page += 1) {
    pages.push(page);
  }

  return (
    <main className={styles.products}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Todos los productos</h3>
        </div>
        <div className={styles.count}>
          ITEMS ENCONTRADOS: {filteredProducts.length}
        </div>
      </div>

      {filters ? <div className={styles.filtersWrap}>{filters}</div> : null}

      {error ? (
        <div className={styles.empty}>
          <Search className={styles.icon} />
          <p>{error}</p>
        </div>
      ) : loading ? (
        <div className={styles.empty}>
          <Search className={styles.icon} />
          <p>Cargando productos...</p>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className={styles.grid}>
          {paginatedProducts.map((product) => (
            (() => {
              const percentage = Number(product.raw?.porcentaje_oferta || 0);
              const hasOffer = Boolean(product.raw?.en_oferta) && percentage > 0;
              const oldPrice = hasOffer
                ? Math.round(product.price / (1 - percentage / 100))
                : null;

              return (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles.product}
              role="button"
              tabIndex={0}
              onClick={() => onProductClick(product)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  onProductClick(product);
                }
              }}
            >
              <div className={styles.media}>
                <img
                  src={product.image}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                />
                {(hasOffer || product.raw?.destacado) && (
                  <div className={styles.badges}>
                    {hasOffer && (
                      <span className={styles.badgeOffer}>
                        Oferta {percentage}%
                      </span>
                    )}
                    {product.raw?.destacado && (
                      <span className={styles.badgeFeatured}>Destacado</span>
                    )}
                  </div>
                )}
              </div>

              <div className={styles.content}>
                <span className={styles.tag}>{product.category}</span>
                <div className={styles.headline}>
                  <h4>{product.name}</h4>
                </div>
                <p>{product.description}</p>
                <div className={styles.actions}>
                  <div className={styles.priceStack}>
                    <span className={styles.price}>
                      ${product.price.toLocaleString()}
                    </span>
                    {hasOffer && oldPrice ? (
                      <span className={styles.oldPrice}>
                        ${oldPrice.toLocaleString()}
                      </span>
                    ) : null}
                  </div>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      addToCart(product);
                    }}
                    className={styles.cta}
                  >
                    <ShoppingCart className={styles.ctaIcon} aria-hidden="true" />
                    Agregar
                  </button>
                </div>
              </div>
            </motion.div>
              );
            })()
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

      {totalPages > 1 && !loading && !error ? (
        <div className={styles.pagination}>
          <button
            type="button"
            className={styles.pageButton}
            onClick={() => onPageChange(Math.max(1, clampedCurrent - 1))}
            disabled={clampedCurrent === 1}
          >
            Anterior
          </button>

          {pageStart > 1 ? (
            <>
              <button
                type="button"
                className={styles.pageButton}
                onClick={() => onPageChange(1)}
              >
                1
              </button>
              {pageStart > 2 ? (
                <span className={styles.pageEllipsis}>...</span>
              ) : null}
            </>
          ) : null}

          {pages.map((page) => (
            <button
              key={page}
              type="button"
              className={`${styles.pageButton} ${
                page === clampedCurrent ? styles.pageButtonActive : ''
              }`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ))}

          {endPage < totalPages ? (
            <>
              {endPage < totalPages - 1 ? (
                <span className={styles.pageEllipsis}>...</span>
              ) : null}
              <button
                type="button"
                className={styles.pageButton}
                onClick={() => onPageChange(totalPages)}
              >
                {totalPages}
              </button>
            </>
          ) : null}

          <button
            type="button"
            className={styles.pageButton}
            onClick={() => onPageChange(Math.min(totalPages, clampedCurrent + 1))}
            disabled={clampedCurrent === totalPages}
          >
            Siguiente
          </button>
        </div>
      ) : null}
    </main>
  );
}
