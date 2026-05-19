import { useEffect, useMemo, useState } from 'react';
import AdminApp from './components/admin/AdminApp.jsx';
import ProductModal from './components/ProductModal.jsx';
import Hero from './components/Hero.jsx';
import Navbar from './components/Navbar.jsx';
import Filters from './components/Filters.jsx';
import Footer from './components/Footer.jsx';
import SearchResults from './components/SearchResults.jsx';
import Cart from './components/Cart.jsx';
import ProductCarousel from './components/ProductCarousel.jsx';
import styles from './App.module.css';

function ClientApp() {
  const baseCategories = ['iluminacion', 'ferreteria', 'limpieza'];
  const normalizeCategory = (value) => value.trim().toLowerCase();
  const pageSize = 20;
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState(null);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);

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
          return {
            id: item.sku || String(item.id_catalogo),
            name: item.nombre || 'Producto sin nombre',
            description: item.descripcion || '',
            price: Number.isFinite(item.precio) ? item.precio : 0,
            category: baseCategories.includes(normalizedCategory)
              ? normalizedCategory
              : baseCategories[0],
            image: item.imagen || '',
            currency: item.moneda || 'ARS',
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

  const filterCategories = useMemo(
    () => ['Todos', ...baseCategories],
    [baseCategories]
  );

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const description = (p.description || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      const matchesSearch = name.includes(query) || description.includes(query);
      const matchesCategory = activeCategory === 'Todos' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, activeCategory]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage]);

  const featuredProducts = useMemo(
    () => products.filter((item) => Boolean(item.raw?.destacado)),
    [products]
  );

  const offerProducts = useMemo(
    () =>
      products.filter(
        (item) =>
          Boolean(item.raw?.en_oferta) && Number(item.raw?.porcentaje_oferta || 0) > 0
      ),
    [products]
  );

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

  return (
    <div className={styles.app}>

      {/*Navbar */}
      <Navbar cartCount={cartCount} onOpenCart={() => setIsCartOpen(true)} />


      {/* Hero*/}
      <Hero />

      <ProductCarousel
        title="Destacados"
        subtitle="Los favoritos de esta semana"
        products={featuredProducts}
        onProductClick={setSelectedProduct}
        onAddToCart={addToCart}
      />

      <ProductCarousel
        title="En oferta"
        subtitle="Descuentos activos por tiempo limitado"
        products={offerProducts}
        onProductClick={setSelectedProduct}
        onAddToCart={addToCart}
      />

      {/* SearchResults */}
      <SearchResults
        filteredProducts={filteredProducts}
        paginatedProducts={paginatedProducts}
        addToCart={addToCart}
        setSearchQuery={setSearchQuery}
        setActiveCategory={setActiveCategory}
        loading={loadingProducts}
        error={productsError}
        onProductClick={setSelectedProduct}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        filters={(
          <Filters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterCategories={filterCategories}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />
        )}
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
      />

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
        />
      )}
    </div>
  );
}

export default function App() {
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    const handleChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handleChange);
    return () => window.removeEventListener('hashchange', handleChange);
  }, []);

  if (hash.startsWith('#/admin')) {
    return <AdminApp />;
  }

  return <ClientApp />;
}
