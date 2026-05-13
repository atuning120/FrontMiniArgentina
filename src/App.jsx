import { useMemo, useState } from 'react';
import {
  Filter,
  Mail,
  MapPin,
  MessageCircle,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  X,
} from 'lucide-react';
import { FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa';
import { AnimatePresence, motion } from 'motion/react';
import { PRODUCTS } from './constants';
import Hero from './components/Hero.jsx';
import Navbar from './components/Navbar.jsx';
import styles from './App.module.css';

export default function App() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');

  const categories = useMemo(() => {
    const cats = new Set(PRODUCTS.map((p) => p.category));
    return ['Todos', ...Array.from(cats)];
  }, []);

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'Todos' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = Math.max(0, item.quantity + delta);
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoadingCheckout(true);
    setError(null);

    try {
      const response = await fetch('/api/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.init_point) {
        window.location.href = data.init_point;
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al iniciar el pago. Intenta de nuevo más tarde.');
    } finally {
      setLoadingCheckout(false);
    }
  };

  return (
    <div className={styles.app}>

      {/*NAVBAR */}
      <Navbar cartCount={cartCount} onOpenCart={() => setIsCartOpen(true)} />


      {/* HERO*/}
      <Hero />

      <div className={styles.filters}>
        <div className={styles.filters__inner}>
          <div className={styles.search}>
            <Search className={styles.search__icon} />
            <input
              type="text"
              placeholder="Buscar cables, reflectores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.search__input}
            />
          </div>

          <div className={styles.categories}>
            <Filter className={styles.categories__icon} />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`${styles.categories__button} ${
                  activeCategory === cat ? styles.isActive : ''
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className={styles.products}>
        <div className={styles.products__header}>
          <div>
            <h3 className={styles.products__title}>Resultados de Búsqueda</h3>
            <p className={styles.products__subtitle}>
              Encuentra lo que necesitas para tu obra
            </p>
          </div>
          <div className={styles.products__count}>
            ITEMS ENCONTRADOS: {filteredProducts.length}
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className={styles.products__grid}>
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={styles.product}
              >
                <div className={styles.product__media}>
                  <img src={product.image} alt={product.name} referrerPolicy="no-referrer" />
                  <span className={styles.product__tag}>{product.category}</span>
                </div>

                <div className={styles.product__content}>
                  <div className={styles.product__headline}>
                    <h4>{product.name}</h4>
                    <span>${product.price.toLocaleString()}</span>
                  </div>
                  <p>{product.description}</p>
                  <button
                    onClick={() => addToCart(product)}
                    className={styles.product__cta}
                  >
                    Agregar
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className={styles.products__empty}>
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

      <footer className={styles.footer}>
        <div className={styles.footer__inner}>
          <div className={styles.footer__grid}>
            <div className={styles.footer__brand}>
              <h4>
                ELECTRIC<span>PRO</span>
              </h4>
              <p>
                Empresa especializada en la importación y distribución técnica de componentes
                eléctricos. Soluciones integrales para proyectos de gran escala.
              </p>
              <div className={styles.footer__social}>
                <a href="#" title="Instagram">
                  <FaInstagram className={styles.icon} />
                </a>
                <a href="#" title="YouTube">
                  <FaYoutube className={styles.icon} />
                </a>
                <a href="#" title="Facebook">
                  <FaFacebookF className={styles.icon} />
                </a>
              </div>
            </div>

            <div className={styles.footer__contact}>
              <h5>Central de Contacto</h5>
              <div className={styles.footer__columns}>
                <ul>
                  <li>
                    <div className={`${styles.footer__icon} ${styles.isAccent}`}>
                      <Mail className={styles.icon} />
                    </div>
                    <div>
                      <span>Email Corporativo</span>
                      <strong>info@electricpro.com</strong>
                    </div>
                  </li>
                </ul>
                <ul>
                  <li>
                    <div className={`${styles.footer__icon} ${styles.isGreen}`}>
                      <MessageCircle className={styles.icon} />
                    </div>
                    <div>
                      <span>WhatsApp Soporte</span>
                      <strong>+54 9 11 1234-5678</strong>
                    </div>
                  </li>
                </ul>
                <ul>
                  <li>
                    <div className={styles.footer__icon}>
                      <MapPin className={styles.icon} />
                    </div>
                    <div>
                      <span>Nuestra Sede</span>
                      <strong>Pque. Industrial, Buenos Aires.</strong>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className={styles.footer__bottom}>
            <p>&copy; 2026 ELECTRICPRO SOLUTIONS. TRABAJAMOS CON LOS MEJORES.</p>
            <span>PAGOS PROCESADOS POR MERCADO PAGO</span>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className={styles.cartOverlay}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
              className={styles.cart}
            >
              <div className={styles.cart__header}>
                <div>
                  <h4>Tu Orden</h4>
                  <p>{cartCount} Artículos en revisión</p>
                </div>
                <button onClick={() => setIsCartOpen(false)} aria-label="Cerrar carrito">
                  <X className={styles.icon} />
                </button>
              </div>

              <div className={styles.cart__items}>
                {cart.length === 0 ? (
                  <div className={styles.cart__empty}>
                    <div className={styles.cart__emptyRing}>
                      <ShoppingCart className={styles.icon} />
                    </div>
                    <p>Orden Vacía</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className={styles.cart__item}>
                      <div className={styles.cart__thumb}>
                        <img src={item.image} alt={item.name} referrerPolicy="no-referrer" />
                      </div>
                      <div className={styles.cart__info}>
                        <div className={styles.cart__title}>
                          <span>{item.name}</span>
                          <button onClick={() => removeFromCart(item.id)} aria-label="Quitar">
                            <Trash2 className={styles.icon} />
                          </button>
                        </div>
                        <div className={styles.cart__price}>
                          ${item.price.toLocaleString()}
                        </div>
                        <div className={styles.cart__qty}>
                          <button onClick={() => updateQuantity(item.id, -1)} aria-label="Restar">
                            <Minus className={styles.icon} />
                          </button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} aria-label="Sumar">
                            <Plus className={styles.icon} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className={styles.cart__summary}>
                  {error && <div className={styles.cart__error}>{error}</div>}
                  <div className={styles.cart__total}>
                    <span>Monto Total</span>
                    <strong>${cartTotal.toLocaleString()}</strong>
                  </div>
                  <div className={styles.cart__checkout}>
                    <button disabled={loadingCheckout} onClick={handleCheckout}>
                      <span>
                        {loadingCheckout
                          ? 'Enlazando Checkout...'
                          : 'Proceder al Pago con'}
                      </span>
                      <strong>Mercado Pago</strong>
                    </button>
                    <p>Seguridad Bancaria • Mercado Pago Partner</p>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
