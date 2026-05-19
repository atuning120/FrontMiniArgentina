import { useEffect, useMemo, useState } from 'react';
import styles from './AdminApp.module.css';

export default function AdminOrderForm({ baseUrl, token }) {
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([{ sku: '', quantity: 1 }]);
  const [notes, setNotes] = useState('');
  const [notice, setNotice] = useState('');

  const headers = useMemo(
    () => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch(
          `${baseUrl}/api/admin/productos/hogar/electronico`,
          { headers }
        );
        if (!response.ok) {
          throw new Error('Error al cargar productos');
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        setNotice(error.message || 'Error al cargar productos');
      }
    };

    loadProducts();
  }, [baseUrl, headers]);

  const productMap = useMemo(() => {
    return new Map(products.map((product) => [product.sku, product]));
  }, [products]);

  const resolvedItems = items
    .map((item) => {
      const product = productMap.get(item.sku);
      return {
        sku: item.sku,
        quantity: Number(item.quantity) || 0,
        name: product?.nombre || '',
        price: product?.precio || 0,
      };
    })
    .filter((item) => item.sku);

  const total = resolvedItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handleItemChange = (index, key, value) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [key]: value } : item))
    );
  };

  const addItem = () => setItems((prev) => [...prev, { sku: '', quantity: 1 }]);

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setNotice('');

    const payloadItems = resolvedItems.filter((item) => item.quantity > 0);
    if (payloadItems.length === 0) {
      setNotice('Agrega al menos un item valido.');
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/api/admin/ordenes`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ items: payloadItems, notes }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al crear la orden');
      }
      setItems([{ sku: '', quantity: 1 }]);
      setNotes('');
      setNotice('Orden creada.');
    } catch (error) {
      setNotice(error.message || 'Error al crear la orden');
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.card}>
        <h2>Nueva orden de compra</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.orderItems}>
            {items.map((item, index) => (
              <div key={`${item.sku}-${index}`} className={styles.orderRow}>
                <select
                  value={item.sku}
                  onChange={(event) =>
                    handleItemChange(index, 'sku', event.target.value)
                  }
                  className={styles.input}
                >
                  <option value="">Seleccionar producto</option>
                  {products.map((product) => (
                    <option key={product.sku} value={product.sku}>
                      {product.nombre} ({product.sku})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(event) =>
                    handleItemChange(index, 'quantity', event.target.value)
                  }
                  className={styles.input}
                />
                <button
                  type="button"
                  className={styles.secondary}
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>

          <button type="button" className={styles.secondary} onClick={addItem}>
            Agregar item
          </button>

          <label className={styles.label}>
            Notas
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              className={styles.textarea}
            />
          </label>

          <div className={styles.orderSummary}>
            <span>Total</span>
            <strong>${total.toLocaleString('es-AR')}</strong>
          </div>

          <button type="submit" className={styles.primary}>
            Crear orden
          </button>
        </form>
        {notice ? <p className={styles.notice}>{notice}</p> : null}
      </div>
    </section>
  );
}
