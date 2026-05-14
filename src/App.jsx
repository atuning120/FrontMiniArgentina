import { useMemo, useState } from 'react';

import { PRODUCTS } from './constants';
import Hero from './components/Hero.jsx';
import Navbar from './components/Navbar.jsx';
import Filters from './components/Filters.jsx';
import Footer from './components/Footer.jsx';
import SearchResults from './components/SearchResults.jsx';
import Cart from './components/Cart.jsx';
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

      {/*Navbar */}
      <Navbar cartCount={cartCount} onOpenCart={() => setIsCartOpen(true)} />


      {/* Hero*/}
      <Hero />

      {/* Filtros*/}
      <Filters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      {/* SearchResults */}
      <SearchResults
        filteredProducts={filteredProducts}
        addToCart={addToCart}
        setSearchQuery={setSearchQuery}
        setActiveCategory={setActiveCategory}
      />

      {/* Footer */}
      <Footer />


      {/* Cart */}
      <Cart
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        cart={cart}
        cartCount={cartCount}
        cartTotal={cartTotal}
        removeFromCart={removeFromCart}
        updateQuantity={updateQuantity}
        error={error}
        loadingCheckout={loadingCheckout}
        handleCheckout={handleCheckout}
      />
    </div>
  );
}
