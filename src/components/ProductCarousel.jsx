import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { motion } from 'motion/react';
import ProductCard from './ProductCard.jsx';
import styles from './ProductCarousel.module.css';

const MProductCard = motion(ProductCard);

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

  const scrollCarousel = (direction) => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const scrollAmount = container.clientWidth * 0.75;
    container.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    triggerCarouselAnimation();
  };

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

        <div className={styles.carouselWrap}>
          <button
            type="button"
            className={`${styles.carouselArrow} ${styles.carouselArrowLeft}`}
            onClick={() => scrollCarousel(-1)}
            aria-label={`Desplazar ${title} hacia la izquierda`}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            className={`${styles.carouselArrow} ${styles.carouselArrowRight}`}
            onClick={() => scrollCarousel(1)}
            aria-label={`Desplazar ${title} hacia la derecha`}
          >
            <ChevronRight size={18} />
          </button>
          <div
            className={`${styles.carouselList} ${styles.noScrollbar} ${styles.scrollingTouch} ${
              isAnimating ? styles.carouselListAnimating : ''
            }`}
            ref={carouselRef}
          >
            {products.map((product) => {
              const hasOffer = type === 'offer';
              const isFeatured = type === 'featured';
              let discount = null;
              
              if (hasOffer && product.originalPrice) {
                discount = Math.round(
                  ((product.originalPrice - product.price) / product.originalPrice) * 100
                );
              }

              return (
                <MProductCard
                  key={`${type}-${product.id}`}
                  product={product}
                  type={type}
                  isCarousel={true}
                  onProductClick={onProductClick}
                  onAddToCart={onAddToCart}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
