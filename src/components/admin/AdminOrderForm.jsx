import { useEffect, useMemo, useState } from 'react';
import styles from './AdminApp.module.css';

export default function AdminOrderForm({ baseUrl, token }) {
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([
    { sku: '', quantity: 1, name: '', price: '' },
  ]);
  const [notes, setNotes] = useState('');
  const [notice, setNotice] = useState('');
  const [base64Input, setBase64Input] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [resolveError, setResolveError] = useState('');
  const [ivaEnabled, setIvaEnabled] = useState(true);
  const [ivaRate, setIvaRate] = useState(21);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

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

  const normalizedItems = items
    .map((item) => {
      const product = productMap.get(item.sku);
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.price);
      const resolvedPrice = Number.isFinite(price)
        ? price
        : Number(product?.precio) || 0;

      return {
        sku: item.sku,
        quantity,
        name: item.name || product?.nombre || '',
        price: resolvedPrice,
      };
    })
    .filter((item) => item.sku);

  const subtotal = normalizedItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const ivaPercent = Number(ivaRate) || 0;
  const ivaAmount = ivaEnabled ? subtotal * (ivaPercent / 100) : 0;
  const total = subtotal + ivaAmount;

  const handleItemChange = (index, key, value) => {
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        if (key === 'sku') {
          const product = productMap.get(value);
          return {
            ...item,
            sku: value,
            name: product?.nombre || '',
            price:
              item.price !== ''
                ? item.price
                : product?.precio ?? item.price,
          };
        }
        return { ...item, [key]: value };
      })
    );
  };

  const addItem = () =>
    setItems((prev) => [...prev, { sku: '', quantity: 1, name: '', price: '' }]);

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setNotice('');

    const payloadItems = normalizedItems.filter((item) => item.quantity > 0);
    if (payloadItems.length === 0) {
      setNotice('Agrega al menos un item valido.');
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/api/admin/ordenes`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          items: payloadItems,
          notes,
          customer: {
            nombre: customerName,
            telefono: customerPhone,
          },
          tax: {
            enabled: ivaEnabled,
            rate: ivaPercent,
          },
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al crear la orden');
      }
      setItems([{ sku: '', quantity: 1, name: '', price: '' }]);
      setBase64Input('');
      setResolveError('');
      setNotes('');
      setCustomerName('');
      setCustomerPhone('');
      setIvaEnabled(true);
      setIvaRate(21);
      setNotice('Orden creada.');
    } catch (error) {
      setNotice(error.message || 'Error al crear la orden');
    }
  };

  const handleResolveBase64 = async () => {
    setResolveError('');
    setNotice('');
    if (!base64Input.trim()) {
      setResolveError('Pega el codigo base64 primero.');
      return;
    }

    const rawPayload = base64Input.trim();
    const extracted = rawPayload.match(/productos:([A-Za-z0-9+/=]+)/);
    const payload = extracted?.[1] || rawPayload;

    setIsResolving(true);
    try {
      const response = await fetch(`${baseUrl}/api/admin/ordenes/resolve`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ payload }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudo resolver el codigo');
      }

      const resolved = (data.items || []).map((item) => ({
        sku: item.sku,
        quantity: item.cantidad,
        name: item.nombre || '',
        price: item.precio ?? 0,
      }));

      if (resolved.length === 0) {
        setResolveError('No se encontraron productos validos en el codigo.');
        return;
      }

      setItems(resolved);

      if (data.telefono) {
        setCustomerPhone((prev) => prev || data.telefono);
      }

      if (Array.isArray(data.notFound) && data.notFound.length > 0) {
        setNotice(
          `Productos no encontrados: ${data.notFound
            .map((item) => String(item))
            .join(', ')}`
        );
      }
    } catch (error) {
      setResolveError(error.message || 'No se pudo resolver el codigo');
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.card}>
        <h2>Nueva orden de compra</h2>
        <div className={styles.orderBlock}>
          <h3 className={styles.orderBlockTitle}>Codigo del carrito</h3>
          <div className={styles.formGrid}>
          <label className={styles.label} style={{ gridColumn: '1 / -1' }}>
            Codigo base64 (desde WhatsApp)
            <textarea
              value={base64Input}
              onChange={(event) => setBase64Input(event.target.value)}
              rows={3}
              className={styles.textarea}
              placeholder="Pega aqui el codigo base64..."
            />
          </label>
          <div className={styles.orderInlineActions}>
            <button
              type="button"
              className={styles.secondary}
              onClick={handleResolveBase64}
              disabled={isResolving}
            >
              {isResolving ? 'Resolviendo...' : 'Convertir codigo'}
            </button>
          </div>
          {resolveError ? <p className={styles.error}>{resolveError}</p> : null}
          </div>
        </div>

        <div className={styles.orderBlock}>
          <h3 className={styles.orderBlockTitle}>Datos del cliente</h3>
          <div className={styles.formGrid}>
          <label className={styles.label}>
            Nombre del cliente
            <input
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              className={styles.input}
              placeholder="Nombre y apellido"
            />
          </label>
          <label className={styles.label}>
            Telefono del cliente
            <input
              value={customerPhone}
              onChange={(event) => setCustomerPhone(event.target.value)}
              className={styles.input}
              placeholder="Ej: +54 9 11 1234 5678"
            />
          </label>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.orderBlock}>
            <h3 className={styles.orderBlockTitle}>Items de la orden</h3>
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
                <input
                  type="number"
                  min="0"
                  value={item.price}
                  onChange={(event) =>
                    handleItemChange(index, 'price', event.target.value)
                  }
                  className={styles.input}
                  placeholder="Precio"
                />
                <div className={styles.orderLineTotal}>
                  ${
                    (
                      (Number(item.price) ||
                        Number(productMap.get(item.sku)?.precio) ||
                        0) *
                      (Number(item.quantity) || 0)
                    ).toLocaleString('es-AR')
                  }
                </div>
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
          </div>

          <div className={styles.orderSideBySide}>
            <div className={`${styles.orderBlock} ${styles.orderNotesBlock}`}>
              <h3 className={styles.orderBlockTitle}>Notas e impuestos</h3>
              <label className={styles.label}>
                Notas
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={3}
                  className={styles.textarea}
                />
              </label>

              <div className={styles.orderInlineActions}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={ivaEnabled}
                    onChange={(event) => setIvaEnabled(event.target.checked)}
                  />
                  Aplicar IVA
                </label>
                <label className={styles.label}>
                  IVA (%)
                  <input
                    type="number"
                    min="0"
                    value={ivaRate}
                    onChange={(event) => setIvaRate(event.target.value)}
                    className={styles.input}
                    disabled={!ivaEnabled}
                  />
                </label>
              </div>
            </div>

            <div className={`${styles.orderBlock} ${styles.orderSummaryBlock}`}>
              <h3 className={styles.orderBlockTitle}>Resumen</h3>
              <div className={styles.orderSummary}>
                <span>Subtotal</span>
                <strong>${subtotal.toLocaleString('es-AR')}</strong>
              </div>
              <div className={styles.orderSummary}>
                <span>IVA</span>
                <strong>${ivaAmount.toLocaleString('es-AR')}</strong>
              </div>
              <div className={styles.orderSummary}>
                <span>Total</span>
                <strong>${total.toLocaleString('es-AR')}</strong>
              </div>
            </div>
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
