import { useRef, useState, useEffect } from 'react';
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
  isPaused,
}) {
  const carouselRef = useRef(null);
  const [isInteractionActive, setIsInteractionActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el || products.length === 0) return;

    let animationId;
    let accumulatedScroll = el.scrollLeft;
    let lastTime = performance.now();

    const scroll = (time) => {
      const delta = time - lastTime;
      lastTime = time;

      if (!isInteractionActive && !isPaused) {
        const speed = 0.05; // Ajusta la velocidad si es necesario
        accumulatedScroll += speed * delta;
        
        if (accumulatedScroll >= el.scrollWidth / 2) {
          accumulatedScroll -= el.scrollWidth / 2;
        }
        
        el.scrollLeft = accumulatedScroll;
      } else {
        accumulatedScroll = el.scrollLeft;
      }

      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationId);
  }, [isInteractionActive, isPaused, products?.length]);

  if (!products || products.length === 0) return null;

  const duplicatedProducts = [...products, ...products, ...products, ...products];

  const handleTouchStart = () => {
    const el = carouselRef.current;
    if (el) {
      if (el.scrollLeft <= 10) {
        el.scrollLeft += el.scrollWidth / 2;
      } else if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 10) {
        el.scrollLeft -= el.scrollWidth / 2;
      }
    }
    setIsInteractionActive(true);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setHasDragged(false);
    const el = carouselRef.current;
    if (el) {
      if (el.scrollLeft <= 10) {
        el.scrollLeft += el.scrollWidth / 2;
      } else if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 10) {
        el.scrollLeft -= el.scrollWidth / 2;
      }
      setStartX(e.pageX - el.offsetLeft);
      setScrollLeft(el.scrollLeft);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    setHasDragged(true);
    const el = carouselRef.current;
    if (el) {
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.5;
      el.scrollLeft = scrollLeft - walk;
    }
  };

  const handleClickCapture = (e) => {
    if (hasDragged) {
      e.stopPropagation();
      e.preventDefault();
      setHasDragged(false);
    }
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
            <div
              className={`${styles.carouselList} ${styles.infiniteScrollList} ${isDragging ? styles.dragging : ''}`}
              ref={carouselRef}
              onMouseEnter={() => setIsInteractionActive(true)}
              onMouseLeave={() => {
                setIsInteractionActive(false);
                setIsDragging(false);
              }}
              onMouseDown={handleMouseDown}
              onMouseUp={() => setIsDragging(false)}
              onMouseMove={handleMouseMove}
              onClickCapture={handleClickCapture}
              onTouchStart={handleTouchStart}
              onTouchEnd={() => setIsInteractionActive(false)}
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
