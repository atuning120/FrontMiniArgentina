import { useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import styles from './ProductCarousel.module.css';

export default function ProductCarousel({
  title,
  subtitle,
  products,
  onProductClick,
  onAddToCart,
}) {
  const trackRef = useRef(null);

  const hasProducts = products.length > 0;

  const scrollBy = (direction) => {
    if (!trackRef.current) return;
    const width = trackRef.current.clientWidth;
    trackRef.current.scrollBy({
      left: direction * Math.max(260, width * 0.8),
      behavior: 'smooth',
    });
  };

  const cards = useMemo(() => products.slice(0, 12), [products]);

  if (!hasProducts) return null;

  return (
    <section className={styles.carousel}>
      <div className={styles.header}>
        <div>
          <h3>{title}</h3>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </div>

      <div className={styles.trackWrapper}>
        <div className={styles.track} ref={trackRef}>
        {cards.map((product) => {
          const percentage = Number(product.raw?.porcentaje_oferta || 0);
          const hasOffer = Boolean(product.raw?.en_oferta) && percentage > 0;
          const oldPrice = hasOffer
            ? Math.round(product.price / (1 - percentage / 100))
            : null;

          return (
            <article
              key={product.id}
              className={styles.card}
              onClick={() => onProductClick(product)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  onProductClick(product);
                }
              }}
            >
              <div className={styles.media}>
                {product.image?.trim() ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className={styles.noImage}>No hay imagen</div>
                )}
                {(hasOffer || product.raw?.destacado) && (
                  <div className={styles.badges}>
                    {hasOffer && (
                      <span className={styles.badgeOffer}>Oferta {percentage}%</span>
                    )}
                    {product.raw?.destacado && (
                      <span className={styles.badgeFeatured}>Destacado</span>
                    )}
                  </div>
                )}
              </div>
              <div className={styles.body}>
                <span className={styles.category}>{product.category}</span>
                <h4>{product.name}</h4>
                <div className={styles.priceRow}>
                  <span className={styles.price}>${product.price.toLocaleString()}</span>
                  {hasOffer && oldPrice ? (
                    <span className={styles.oldPrice}>
                      ${oldPrice.toLocaleString()}
                    </span>
                  ) : null}
                </div>
                <button
                  type="button"
                  className={styles.cta}
                  onClick={(event) => {
                    event.stopPropagation();
                    onAddToCart(product);
                  }}
                >
                  <ShoppingCart className={styles.ctaIcon} aria-hidden="true" />
                  Agregar
                </button>
              </div>
            </article>
          );
        })}
        </div>
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label="Anterior"
          className={`${styles.navButton} ${styles.navLeft}`}
        >
          <ChevronLeft className={styles.icon} />
        </button>
        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label="Siguiente"
          className={`${styles.navButton} ${styles.navRight}`}
        >
          <ChevronRight className={styles.icon} />
        </button>
      </div>
    </section>
  );
}
