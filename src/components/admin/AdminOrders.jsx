import { useEffect, useMemo, useState } from 'react';
import styles from './AdminApp.module.css';

export default function AdminOrders({ baseUrl, token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${baseUrl}/api/admin/ordenes`, { headers });
      if (!response.ok) {
        throw new Error('Error al cargar ordenes');
      }
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err.message || 'Error al cargar ordenes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <section className={styles.section}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Ordenes de compra</h2>
          <button type="button" className={styles.secondary} onClick={loadOrders}>
            Recargar
          </button>
        </div>

        {loading ? <p>Cargando...</p> : null}
        {error ? <p className={styles.error}>{error}</p> : null}

        {!loading && orders.length === 0 ? <p>No hay ordenes.</p> : null}

        <div className={styles.ordersList}>
          {orders.map((order) => (
            <div key={order._id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div>
                  <h3>Orden #{order._id}</h3>
                  <p>{order.createdAt}</p>
                </div>
                <span className={styles.orderStatus}>{order.status}</span>
              </div>
              <ul className={styles.orderListItems}>
                {order.items.map((item, index) => (
                  <li key={`${order._id}-${index}`}>
                    {item.name || item.sku} - {item.quantity} x ${item.price}
                  </li>
                ))}
              </ul>
              <div className={styles.orderTotal}>
                Total: ${Number(order.total || 0).toLocaleString('es-AR')}
              </div>
              {order.notes ? (
                <p className={styles.orderNotes}>Notas: {order.notes}</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
