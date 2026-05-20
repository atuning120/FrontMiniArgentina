import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ShoppingCart,
  Plus,
  MapPin,
  MessageCircle,
  Search,
  Truck,
  ShieldCheck,
  CreditCard,
  Building,
  Bike,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Cart from './components/Cart.jsx';
import Footer from './components/Footer.jsx';
import Logo from './components/Logo.jsx';
import ProductModal from './components/ProductModal.jsx';
import styles from './App.module.css';

export default function App() {
  const baseCategories = ['iluminacion', 'ferreteria', 'limpieza'];
  const normalizeCategory = (value) => (value || '').trim().toLowerCase();
  const itemsPerPage = 20;
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState(null);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const offerCarouselRef = useRef(null);
  const featuredCarouselRef = useRef(null);
  const offerAnimationTimer = useRef(null);
  const featuredAnimationTimer = useRef(null);
  const [offerAnimating, setOfferAnimating] = useState(false);
  const [featuredAnimating, setFeaturedAnimating] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    async function loadProducts() {
      try {
        setLoadingProducts(true);
        setProductsError(null);
        const response = await fetch(`${baseUrl}/api/productos/hogar/electronico`);
        if (!response.ok) {
          throw new Error('Error al cargar productos');
        }
        const data = await response.json();
        const mapped = data.map((item) => {
          const normalizedCategory = normalizeCategory(item.categoria || '');
          const price = Number.isFinite(item.precio) ? item.precio : 0;
          const discountPercent = Number(item.porcentaje_oferta || 0);
          const isOffer = Boolean(item.en_oferta) && discountPercent > 0;
          const originalPrice =
            isOffer && discountPercent < 100 && price > 0
              ? Math.round(price / (1 - discountPercent / 100))
              : undefined;

          return {
            id: item.sku || String(item.id_catalogo),
            name: item.nombre || 'Producto sin nombre',
            description: item.descripcion || '',
            price,
            originalPrice,
            category: normalizedCategory || baseCategories[0],
            image: item.imagen || '/logonn-modified.png',
            featured: Boolean(item.destacado),
            raw: item,
          };
        });

        if (isMounted) {
          setProducts(mapped);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setProductsError('No se pudieron cargar los productos.');
        }
      } finally {
        if (isMounted) {
          setLoadingProducts(false);
        }
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return ['Todos', ...Array.from(cats)];
  }, [products]);

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        activeCategory === 'Todos' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, activeCategory]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / itemsPerPage)
  );
  const maxButtons = 5;
  const clampedCurrent = Math.min(currentPage, totalPages);
  const startPage = Math.max(1, clampedCurrent - Math.floor(maxButtons / 2));
  const endPage = Math.min(totalPages, startPage + maxButtons - 1);
  const pageStart = Math.max(1, endPage - maxButtons + 1);
  const pages = [];

  for (let page = pageStart; page <= endPage; page += 1) {
    pages.push(page);
  }

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const offerProducts = useMemo(
    () => products.filter((p) => p.originalPrice && p.originalPrice > p.price),
    [products]
  );

  const featuredProductsList = useMemo(
    () => products.filter((p) => p.featured),
    [products]
  );

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          const newQty = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
        .filter((item) => item.quantity > 0)
    );
  };

  const triggerCarouselAnimation = (setAnimating, timerRef) => {
    setAnimating(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setAnimating(false);
    }, 320);
  };

  const scrollCarousel = (ref, direction, setAnimating, timerRef) => {
    if (!ref.current) return;
    const container = ref.current;
    const scrollAmount = container.clientWidth * 0.75;
    container.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    triggerCarouselAnimation(setAnimating, timerRef);
  };

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <div>
          <Logo size={44} showText={true} />
        </div>

        <div className={styles.navSearch}>
          <Search className={styles.navSearchIcon} />
          <input
            type="text"
            placeholder="Buscar reflectores, focos, herramientas..."
            className={styles.navInput}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <div className={styles.navActions}>
          <button
            onClick={() => setIsCartOpen(true)}
            className={styles.cartButton}
          >
            <ShoppingCart />
            {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
          </button>
        </div>
      </nav>

      <section className={styles.heroSection}>
        <div className={styles.heroCard}>
          <div className={styles.heroBackground}>
            <div className={styles.heroGlowLeft}></div>
            <div className={styles.heroGlowRight}></div>
            <div className={styles.heroPattern}></div>
          </div>

          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <span className={styles.heroBadgeDot}></span>
              Eficiencia que ilumina tu vida
            </div>
            <h2 className={styles.heroTitle}>
              TECNOLOGIA LED <br />
              Y SUMINISTROS{' '}
              <span className={styles.heroTitleAccent}>CLEAN</span>
            </h2>
            <p className={styles.heroSubtitle}>
              Soluciones de iluminacion eficientes y sustentables, materiales de
              alto rendimiento y la mejor asesoria tecnica especializada para tus
              proyectos.
            </p>
            <div className={styles.heroActions}>
              <button
                onClick={() => {
                  const el = document.getElementById('catalog');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={styles.primaryButton}
              >
                VER PRODUCTOS
              </button>
              <button className={styles.secondaryButton}>
                <MessageCircle size={18} color="#22c55e" />
                PEDIDOS WHATSAPP
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.featureSection}>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Truck size={32} />
            </div>
            <div>
              <h4 className={styles.featureTitle}>ENVIOS TODO EL PAIS</h4>
              <p className={styles.featureSubtitle}>DESPACHO AGIL Y SEGURO</p>
            </div>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <ShieldCheck size={32} />
            </div>
            <div>
              <h4 className={styles.featureTitle}>GARANTIA TECNICA</h4>
              <p className={styles.featureSubtitle}>COMPRA CON CONFIANZA OFICIAL</p>
            </div>
          </div>
        </div>
      </section>

      {offerProducts.length > 0 && (
        <section className={styles.carouselSection}>
          <div>
            <div
              className={styles.carouselHeader}
              style={{ borderColor: '#dc2626' }}
            >
              <div>
                <h3 className={styles.carouselTitle}>
                  <span style={{ color: '#dc2626', marginRight: '0.5rem' }}>🔥</span>
                  Ofertas imperdibles
                </h3>
                <p className={styles.carouselSubtitle}>Precios exclusivos web</p>
              </div>
            </div>

            <div className={styles.carouselWrap}>
              <button
                type="button"
                className={`${styles.carouselArrow} ${styles.carouselArrowLeft}`}
                onClick={() =>
                  scrollCarousel(
                    offerCarouselRef,
                    -1,
                    setOfferAnimating,
                    offerAnimationTimer
                  )
                }
                aria-label="Desplazar ofertas hacia la izquierda"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                className={`${styles.carouselArrow} ${styles.carouselArrowRight}`}
                onClick={() =>
                  scrollCarousel(
                    offerCarouselRef,
                    1,
                    setOfferAnimating,
                    offerAnimationTimer
                  )
                }
                aria-label="Desplazar ofertas hacia la derecha"
              >
                <ChevronRight size={18} />
              </button>
              <div
                className={`${styles.carouselList} ${styles.noScrollbar} ${styles.scrollingTouch} ${
                  offerAnimating ? styles.carouselListAnimating : ''
                }`}
                ref={offerCarouselRef}
              >
                {offerProducts.map((product) => {
                  const discount = Math.round(
                    ((product.originalPrice - product.price) /
                      product.originalPrice) *
                      100
                  );

                  return (
                    <motion.div
                      key={`offer-${product.id}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      className={`${styles.product} ${styles.carouselProduct}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedProduct(product)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          setSelectedProduct(product);
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
                        <div className={styles.badges}>
                          <span className={styles.badgeOffer}>
                            Oferta {discount}%
                          </span>
                        </div>
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
                              ${product.price.toLocaleString('es-AR')}
                            </span>
                            <span className={styles.oldPrice}>
                              ${product.originalPrice.toLocaleString('es-AR')}
                            </span>
                          </div>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              addToCart(product);
                            }}
                            className={styles.cta}
                          >
                            <ShoppingCart
                              className={styles.ctaIcon}
                              aria-hidden="true"
                            />
                            Agregar
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className={styles.carouselSection}>
        <div>
          <div
            className={styles.carouselHeader}
            style={{ borderColor: 'var(--accent-500)' }}
          >
            <div>
              <h3 className={styles.carouselTitle}>Productos destacados</h3>
              <p className={styles.carouselSubtitle}>
                Calidad garantizada ElectricPro
              </p>
            </div>
          </div>

          <div className={styles.carouselWrap}>
            <button
              type="button"
              className={`${styles.carouselArrow} ${styles.carouselArrowLeft}`}
              onClick={() =>
                scrollCarousel(
                  featuredCarouselRef,
                  -1,
                  setFeaturedAnimating,
                  featuredAnimationTimer
                )
              }
              aria-label="Desplazar destacados hacia la izquierda"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className={`${styles.carouselArrow} ${styles.carouselArrowRight}`}
              onClick={() =>
                scrollCarousel(
                  featuredCarouselRef,
                  1,
                  setFeaturedAnimating,
                  featuredAnimationTimer
                )
              }
              aria-label="Desplazar destacados hacia la derecha"
            >
              <ChevronRight size={18} />
            </button>
            <div
              className={`${styles.carouselList} ${styles.noScrollbar} ${styles.scrollingTouch} ${
                featuredAnimating ? styles.carouselListAnimating : ''
              }`}
              ref={featuredCarouselRef}
            >
              {featuredProductsList.map((product) => (
                <motion.div
                  key={`featured-${product.id}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className={`${styles.product} ${styles.carouselProduct}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedProduct(product)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      setSelectedProduct(product);
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
                    <div className={styles.badges}>
                      <span className={styles.badgeFeatured}>Destacado</span>
                    </div>
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
                          ${product.price.toLocaleString('es-AR')}
                        </span>
                      </div>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          addToCart(product);
                        }}
                        className={styles.cta}
                      >
                        <ShoppingCart
                          className={styles.ctaIcon}
                          aria-hidden="true"
                        />
                        Agregar
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.catalogSection} id="catalog">
        <div className={styles.catalogHeader}>
          <div>
            <h3 className={styles.catalogTitle}>Todos los productos</h3>
            <div className={styles.catalogDivider}></div>
          </div>
          <span className={styles.catalogMeta}>
            ITEMS ENCONTRADOS: {filteredProducts.length}
          </span>

          <div className={styles.catalogControls}>
            <div className={styles.categoryList}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`${styles.categoryButton} ${
                    activeCategory === cat ? styles.categoryButtonActive : ''
                  }`}
                >
                  {cat === 'Todos' ? 'TODOS' : cat}
                </button>
              ))}
            </div>

            <div className={styles.catalogSearchWrap}>
              <Search className={styles.catalogSearchIcon} />
              <input
                type="text"
                placeholder="Buscar cables, reflectores..."
                className={styles.catalogSearchInput}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loadingProducts && (
          <div className={styles.loadingMessage}>Cargando productos...</div>
        )}

        {productsError && (
          <div className={styles.errorMessage}>{productsError}</div>
        )}

        {!loadingProducts && !productsError && (
          <div className={styles.grid}>
            <AnimatePresence mode="popLayout">
              {paginatedProducts.map((product) => {
                const hasOffer =
                  Number.isFinite(product.originalPrice) &&
                  product.originalPrice > product.price;
                const discount = hasOffer
                  ? Math.round(
                      ((product.originalPrice - product.price) /
                        product.originalPrice) *
                        100
                    )
                  : null;

                return (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    className={styles.product}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedProduct(product)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        setSelectedProduct(product);
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
                      {(hasOffer || product.featured) && (
                        <div className={styles.badges}>
                          {hasOffer ? (
                            <span className={styles.badgeOffer}>
                              Oferta {discount}%
                            </span>
                          ) : null}
                          {product.featured ? (
                            <span className={styles.badgeFeatured}>Destacado</span>
                          ) : null}
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
                            ${product.price.toLocaleString('es-AR')}
                          </span>
                          {hasOffer ? (
                            <span className={styles.oldPrice}>
                              ${product.originalPrice.toLocaleString('es-AR')}
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
              })}
            </AnimatePresence>
          </div>
        )}

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              disabled={clampedCurrent === 1}
              onClick={() => setCurrentPage(Math.max(1, clampedCurrent - 1))}
              className={styles.paginationButton}
            >
              Anterior
            </button>

            {pageStart > 1 ? (
              <>
                <button
                  className={styles.paginationPageButton}
                  onClick={() => setCurrentPage(1)}
                >
                  1
                </button>
                {pageStart > 2 ? (
                  <span className={styles.paginationEllipsis}>...</span>
                ) : null}
              </>
            ) : null}

            {pages.map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`${styles.paginationPageButton} ${
                  page === clampedCurrent ? styles.paginationPageActive : ''
                }`}
              >
                {page}
              </button>
            ))}

            {endPage < totalPages ? (
              <>
                {endPage < totalPages - 1 ? (
                  <span className={styles.paginationEllipsis}>...</span>
                ) : null}
                <button
                  className={styles.paginationPageButton}
                  onClick={() => setCurrentPage(totalPages)}
                >
                  {totalPages}
                </button>
              </>
            ) : null}

            <button
              disabled={clampedCurrent === totalPages}
              onClick={() => setCurrentPage(Math.min(totalPages, clampedCurrent + 1))}
              className={styles.paginationButton}
            >
              Siguiente
            </button>
          </div>
        )}

        {!loadingProducts && filteredProducts.length === 0 && (
          <div className={styles.emptyState}>
            <Search size={64} />
            <p className={styles.heroSubtitle}>No se encontraron productos</p>
          </div>
        )}
      </section>

      <section className={styles.infoSection}>
        <div className={styles.infoPanel}>
          <div className={styles.infoColumns}>
            <div>
              <h5 className={styles.infoColumnTitle}>LOGISTICA & PAGOS</h5>
              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>
                    <CreditCard size={32} />
                  </div>
                  <div>
                    <h6 className={styles.infoTitle}>MERCADO PAGO</h6>
                    <p className={styles.infoSubtitle}>
                      HASTA 12 CUOTAS SIN INTERES
                    </p>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>
                    <Building size={32} color="var(--midnight)" />
                  </div>
                  <div>
                    <h6 className={styles.infoTitle}>TRANSFERENCIA</h6>
                    <p className={styles.infoSubtitle}>
                      10% OFF EXTRA EN EFECTIVO
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h5 className={styles.infoColumnTitle}>CENTRAL DE ENTREGAS</h5>
              <div className={styles.infoList}>
                {[
                  { icon: Truck, title: 'EXPRESO PRO', sub: 'ENVIOS PRIORITARIOS' },
                  { icon: MapPin, title: 'PICK-UP HUB', sub: 'RETIRO SIN COSTO' },
                  { icon: ShieldCheck, title: 'PACKING', sub: 'DESPACHO PROTEGIDO' },
                  { icon: Bike, title: 'FLEX', sub: 'ENTREGA FLASH 24HS' },
                ].map((item, idx) => (
                  <div key={idx} className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      <item.icon size={20} />
                    </div>
                    <div>
                      <h6 className={styles.infoTitle}>{item.title}</h6>
                      <p className={styles.infoSubtitle}>{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <Cart
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        cart={cart}
        cartCount={cartCount}
        cartTotal={cartTotal}
        removeFromCart={removeFromCart}
        updateQuantity={updateQuantity}
      />

      {selectedProduct ? (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
        />
      ) : null}

      <a href="#" className={styles.floatingWhatsApp} title="Consultar por WhatsApp">
        <MessageCircle size={32} />
        <span className={styles.floatingTooltip}>En que podemos ayudarte?</span>
      </a>
    </div>
  );
}
