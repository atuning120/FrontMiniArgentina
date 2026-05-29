import { useRef, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import ProductCard from './ProductCard.jsx';
import styles from './ProductCarousel.module.css';

export default function ProductCarousel({
  id,
  title,
  subtitle,
  icon,
  themeColor,
  products,
  type,
  onProductClick,
  onAddToCart,
}) {
  const carouselRef = useRef(null);
  const animationTimer = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);

  if (!products || products.length === 0) return null;

  const triggerCarouselAnimation = () => {
    setIsAnimating(true);
    if (animationTimer.current) {
      clearTimeout(animationTimer.current);
    }
    animationTimer.current = setTimeout(() => {
      setIsAnimating(false);
    }, 320);
  };

  // Duplicamos los productos para el efecto de scroll infinito
  const duplicatedProducts = [...products, ...products, ...products, ...products];

  // Calculamos la duración dinámicamente para que la velocidad física sea la misma
  // sin importar cuántos productos tenga cada carrusel.
  // Si asume ~7.5s por producto, la animación de 2 ciclos (50%) tardará products.length * 15 segundos.
  const animationDuration = products.length * 15;

  return (
    <section id={id} className={styles.carouselSection}>
      <div>
        <div
          className={styles.carouselHeader}
          style={{ borderColor: themeColor }}
        >
          <div>
            <h3 className={styles.carouselTitle}>
              {icon && <span style={{ color: themeColor, marginRight: '0.5rem' }}>{icon}</span>}
              {title}
            </h3>
            <p className={styles.carouselSubtitle}>{subtitle}</p>
          </div>
        </div>

          <div className={`${styles.carouselWrap} ${styles.infiniteMarquee}`}>
            <div
              className={`${styles.carouselList} ${styles.infiniteScrollList}`}
              ref={carouselRef}
              style={{ animationDuration: `${animationDuration}s` }}
            >
              {duplicatedProducts.map((product, index) => {
                const hasOffer = type === 'offer';
                let discount = null;
                
                if (hasOffer && product.originalPrice) {
                  discount = Math.round(
                    ((product.originalPrice - product.price) / product.originalPrice) * 100
                  );
                }

                return (
                  <ProductCard
                    key={`${type}-${product.id}-${index}`}
                    product={product}
                    type={type}
                    isCarousel={true}
                    onProductClick={onProductClick}
                    onAddToCart={onAddToCart}
                  />
                );
              })}
            </div>
          </div>
      </div>
    </section>
  );
}
