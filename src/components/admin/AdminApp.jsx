import { useMemo, useState } from 'react';
import AdminLogin from './AdminLogin.jsx';
import AdminProducts from './AdminProducts.jsx';
import AdminOrderForm from './AdminOrderForm.jsx';
import AdminOrders from './AdminOrders.jsx';
import styles from './AdminApp.module.css';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const VIEWS = [
  { key: 'products', label: 'Productos' },
  { key: 'create-order', label: 'Crear orden' },
  { key: 'orders', label: 'Ordenes' },
];

export default function AdminApp() {
  const [token, setToken] = useState(() => localStorage.getItem('adminToken') || '');
  const [view, setView] = useState('products');

  const handleLogin = (nextToken) => {
    localStorage.setItem('adminToken', nextToken);
    setToken(nextToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken('');
  };

  const viewLabel = useMemo(
    () => VIEWS.find((item) => item.key === view)?.label || '',
    [view]
  );

  if (!token) {
    return <AdminLogin baseUrl={BASE_URL} onSuccess={handleLogin} />;
  }

  return (
    <div className={styles.admin}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Panel administrador</p>
          <h1>{viewLabel}</h1>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={styles.logout} onClick={handleLogout}>
            Salir
          </button>
          <nav className={styles.nav}>
            {VIEWS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setView(item.key)}
                className={`${styles.navButton} ${
                  view === item.key ? styles.navButtonActive : ''
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        {view === 'products' && (
          <AdminProducts baseUrl={BASE_URL} token={token} />
        )}
        {view === 'create-order' && (
          <AdminOrderForm baseUrl={BASE_URL} token={token} />
        )}
        {view === 'orders' && (
          <AdminOrders baseUrl={BASE_URL} token={token} />
        )}
      </main>
    </div>
  );
}
