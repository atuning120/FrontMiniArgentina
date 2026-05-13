import { useMemo, useState } from 'react';
import {
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { PRODUCTS } from './constants';
import Hero from './components/Hero.jsx';
import Navbar from './components/Navbar.jsx';
import Filters from './components/Filters.jsx';
import Footer from './components/Footer.jsx';
import SearchResults from './components/SearchResults.jsx';
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

      {/* Filtros*/}
      <Filters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      <SearchResults
        filteredProducts={filteredProducts}
        addToCart={addToCart}
        setSearchQuery={setSearchQuery}
        setActiveCategory={setActiveCategory}
      />

      <Footer />

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
