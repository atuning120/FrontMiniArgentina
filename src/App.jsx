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
import './App.css';

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
    <div className="app">
      <nav className="nav">
        <h1 className="nav__brand">
          ELECTRIC<span>PRO</span>
        </h1>

        <div className="nav__actions">
          <button
            onClick={() => setIsCartOpen(true)}
            className="nav__cart-button"
            id="cart-button"
            aria-label="Abrir carrito"
          >
            <ShoppingCart className="icon" />
            {cartCount > 0 && <span className="nav__cart-badge">{cartCount}</span>}
          </button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero__glow" aria-hidden="true" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="hero__content"
        >
          <h2 className="hero__title">
            Suministros <span>Eléctricos de Calidad</span>
          </h2>
          <p className="hero__subtitle">La base sólida para tu infraestructura</p>
        </motion.div>
      </section>

      <div className="filters">
        <div className="filters__inner">
          <div className="search">
            <Search className="search__icon" />
            <input
              type="text"
              placeholder="Buscar cables, reflectores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search__input"
            />
          </div>

          <div className="categories">
            <Filter className="categories__icon" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`categories__button ${
                  activeCategory === cat ? 'is-active' : ''
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="products">
        <div className="products__header">
          <div>
            <h3 className="products__title">Resultados de Búsqueda</h3>
            <p className="products__subtitle">Encuentra lo que necesitas para tu obra</p>
          </div>
          <div className="products__count">ITEMS ENCONTRADOS: {filteredProducts.length}</div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="products__grid">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="product"
              >
                <div className="product__media">
                  <img src={product.image} alt={product.name} referrerPolicy="no-referrer" />
                  <span className="product__tag">{product.category}</span>
                </div>

                <div className="product__content">
                  <div className="product__headline">
                    <h4>{product.name}</h4>
                    <span>${product.price.toLocaleString()}</span>
                  </div>
                  <p>{product.description}</p>
                  <button onClick={() => addToCart(product)} className="product__cta">
                    Agregar
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="products__empty">
            <Search className="icon" />
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

      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__grid">
            <div className="footer__brand">
              <h4>
                ELECTRIC<span>PRO</span>
              </h4>
              <p>
                Empresa especializada en la importación y distribución técnica de componentes
                eléctricos. Soluciones integrales para proyectos de gran escala.
              </p>
              <div className="footer__social">
                <a href="#" title="Instagram">
                  <FaInstagram className="icon" />
                </a>
                <a href="#" title="YouTube">
                  <FaYoutube className="icon" />
                </a>
                <a href="#" title="Facebook">
                  <FaFacebookF className="icon" />
                </a>
              </div>
            </div>

            <div className="footer__contact">
              <h5>Central de Contacto</h5>
              <div className="footer__columns">
                <ul>
                  <li>
                    <div className="footer__icon is-accent">
                      <Mail className="icon" />
                    </div>
                    <div>
                      <span>Email Corporativo</span>
                      <strong>info@electricpro.com</strong>
                    </div>
                  </li>
                </ul>
                <ul>
                  <li>
                    <div className="footer__icon is-green">
                      <MessageCircle className="icon" />
                    </div>
                    <div>
                      <span>WhatsApp Soporte</span>
                      <strong>+54 9 11 1234-5678</strong>
                    </div>
                  </li>
                </ul>
                <ul>
                  <li>
                    <div className="footer__icon">
                      <MapPin className="icon" />
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

          <div className="footer__bottom">
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
              className="cart-overlay"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
              className="cart"
            >
              <div className="cart__header">
                <div>
                  <h4>Tu Orden</h4>
                  <p>{cartCount} Artículos en revisión</p>
                </div>
                <button onClick={() => setIsCartOpen(false)} aria-label="Cerrar carrito">
                  <X className="icon" />
                </button>
              </div>

              <div className="cart__items">
                {cart.length === 0 ? (
                  <div className="cart__empty">
                    <div className="cart__empty-ring">
                      <ShoppingCart className="icon" />
                    </div>
                    <p>Orden Vacía</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="cart__item">
                      <div className="cart__thumb">
                        <img src={item.image} alt={item.name} referrerPolicy="no-referrer" />
                      </div>
                      <div className="cart__info">
                        <div className="cart__title">
                          <span>{item.name}</span>
                          <button onClick={() => removeFromCart(item.id)} aria-label="Quitar">
                            <Trash2 className="icon" />
                          </button>
                        </div>
                        <div className="cart__price">${item.price.toLocaleString()}</div>
                        <div className="cart__qty">
                          <button onClick={() => updateQuantity(item.id, -1)} aria-label="Restar">
                            <Minus className="icon" />
                          </button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} aria-label="Sumar">
                            <Plus className="icon" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="cart__summary">
                  {error && <div className="cart__error">{error}</div>}
                  <div className="cart__total">
                    <span>Monto Total</span>
                    <strong>${cartTotal.toLocaleString()}</strong>
                  </div>
                  <div className="cart__checkout">
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
