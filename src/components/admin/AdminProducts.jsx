import { useEffect, useMemo, useState } from 'react';
import styles from './AdminApp.module.css';

const BASE_CATEGORIES = ['iluminacion', 'ferreteria', 'limpieza'];

const emptyForm = {
  sku: '',
  nombre: '',
  descripcion: '',
  precio: '',
  categoria: BASE_CATEGORIES[0],
  moneda: 'ARS',
  imagen: '',
  en_oferta: false,
  porcentaje_oferta: 0,
  destacado: false,
  id_catalogo: '',
};

export default function AdminProducts({ baseUrl, token }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createForm, setCreateForm] = useState(emptyForm);
  const [editingSku, setEditingSku] = useState('');
  const [editForm, setEditForm] = useState(emptyForm);
  const [notice, setNotice] = useState('');

  const headers = useMemo(
    () => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const resetNotice = () => setNotice('');

  const loadProducts = async () => {
    setLoading(true);
    setError('');
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
    } catch (err) {
      setError(err.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const toPayload = (form) => {
    const price = Number(form.precio);
    const porcentaje = Number(form.porcentaje_oferta);
    const idCatalogo = form.id_catalogo === '' ? undefined : Number(form.id_catalogo);

    return {
      sku: form.sku.trim(),
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      precio: Number.isFinite(price) ? price : 0,
      categoria: form.categoria,
      moneda: form.moneda.trim() || 'ARS',
      imagen: form.imagen.trim(),
      en_oferta: Boolean(form.en_oferta),
      destacado: Boolean(form.destacado),
      porcentaje_oferta: form.en_oferta && Number.isFinite(porcentaje) ? porcentaje : 0,
      id_catalogo: idCatalogo,
    };
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    resetNotice();
    try {
      const payload = toPayload(createForm);
      if (!payload.sku) {
        setNotice('El SKU es obligatorio.');
        return;
      }
      const response = await fetch(
        `${baseUrl}/api/admin/productos/hogar/electronico`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el producto');
      }
      setCreateForm(emptyForm);
      setNotice('Producto creado.');
      await loadProducts();
    } catch (err) {
      setNotice(err.message || 'Error al crear el producto');
    }
  };

  const startEdit = (product) => {
    resetNotice();
    setEditingSku(product.sku);
    setEditForm({
      sku: product.sku || '',
      nombre: product.nombre || '',
      descripcion: product.descripcion || '',
      precio: product.precio ?? '',
      categoria: product.categoria || BASE_CATEGORIES[0],
      moneda: product.moneda || 'ARS',
      imagen: product.imagen || '',
      en_oferta: Boolean(product.en_oferta),
      porcentaje_oferta: product.porcentaje_oferta ?? 0,
      destacado: Boolean(product.destacado),
      id_catalogo: product.id_catalogo ?? '',
    });
  };

  const cancelEdit = () => {
    setEditingSku('');
    setEditForm(emptyForm);
  };

  const handleUpdate = async () => {
    resetNotice();
    try {
      const payload = toPayload(editForm);
      const response = await fetch(
        `${baseUrl}/api/admin/productos/hogar/electronico/${editingSku}`,
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar');
      }
      setNotice('Producto actualizado.');
      setEditingSku('');
      setEditForm(emptyForm);
      await loadProducts();
    } catch (err) {
      setNotice(err.message || 'Error al actualizar');
    }
  };

  const handleDelete = async (sku) => {
    resetNotice();
    const confirmed = window.confirm('Eliminar este producto?');
    if (!confirmed) return;

    try {
      const response = await fetch(
        `${baseUrl}/api/admin/productos/hogar/electronico/${sku}`,
        {
          method: 'DELETE',
          headers,
        }
      );
      if (!response.ok && response.status !== 204) {
        const data = await response.json();
        throw new Error(data.error || 'Error al eliminar');
      }
      setNotice('Producto eliminado.');
      await loadProducts();
    } catch (err) {
      setNotice(err.message || 'Error al eliminar');
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.card}>
        <h2>Crear producto</h2>
        <form className={styles.formGrid} onSubmit={handleCreate}>
          <label className={styles.label}>
            SKU
            <input
              value={createForm.sku}
              onChange={(event) =>
                setCreateForm((prev) => ({ ...prev, sku: event.target.value }))
              }
              className={styles.input}
              required
            />
          </label>
          <label className={styles.label}>
            Nombre
            <input
              value={createForm.nombre}
              onChange={(event) =>
                setCreateForm((prev) => ({ ...prev, nombre: event.target.value }))
              }
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            Precio
            <input
              type="number"
              value={createForm.precio}
              onChange={(event) =>
                setCreateForm((prev) => ({ ...prev, precio: event.target.value }))
              }
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            Categoria
            <select
              value={createForm.categoria}
              onChange={(event) =>
                setCreateForm((prev) => ({ ...prev, categoria: event.target.value }))
              }
              className={styles.input}
            >
              {BASE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.label}>
            Moneda
            <input
              value={createForm.moneda}
              onChange={(event) =>
                setCreateForm((prev) => ({ ...prev, moneda: event.target.value }))
              }
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            Imagen URL
            <input
              value={createForm.imagen}
              onChange={(event) =>
                setCreateForm((prev) => ({ ...prev, imagen: event.target.value }))
              }
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            ID Catalogo
            <input
              type="number"
              value={createForm.id_catalogo}
              onChange={(event) =>
                setCreateForm((prev) => ({ ...prev, id_catalogo: event.target.value }))
              }
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            Descripcion
            <textarea
              value={createForm.descripcion}
              onChange={(event) =>
                setCreateForm((prev) => ({ ...prev, descripcion: event.target.value }))
              }
              className={styles.textarea}
              rows={3}
            />
          </label>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={createForm.en_oferta}
              onChange={(event) =>
                setCreateForm((prev) => ({ ...prev, en_oferta: event.target.checked }))
              }
            />
            En oferta
          </label>
          <label className={styles.label}>
            Porcentaje oferta
            <input
              type="number"
              value={createForm.porcentaje_oferta}
              onChange={(event) =>
                setCreateForm((prev) => ({
                  ...prev,
                  porcentaje_oferta: event.target.value,
                }))
              }
              className={styles.input}
              disabled={!createForm.en_oferta}
            />
          </label>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={createForm.destacado}
              onChange={(event) =>
                setCreateForm((prev) => ({ ...prev, destacado: event.target.checked }))
              }
            />
            Destacado
          </label>
          <div className={styles.formActions}>
            <button type="submit" className={styles.primary}>
              Crear producto
            </button>
          </div>
        </form>
        {notice ? <p className={styles.notice}>{notice}</p> : null}
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Productos</h2>
          <button type="button" onClick={loadProducts} className={styles.secondary}>
            Recargar
          </button>
        </div>

        {loading ? <p>Cargando...</p> : null}
        {error ? <p className={styles.error}>{error}</p> : null}

        {!loading && products.length === 0 ? <p>No hay productos.</p> : null}

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Nombre</th>
                <th>Categoria</th>
                <th>Precio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.sku}>
                  <td>{product.sku}</td>
                  <td>{product.nombre}</td>
                  <td>{product.categoria}</td>
                  <td>{product.precio}</td>
                  <td className={styles.tableActions}>
                    <button
                      type="button"
                      className={styles.secondary}
                      onClick={() => startEdit(product)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className={styles.danger}
                      onClick={() => handleDelete(product.sku)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editingSku ? (
          <div className={styles.editPanel}>
            <h3>Editar producto</h3>
            <div className={styles.formGrid}>
              <label className={styles.label}>
                SKU
                <input value={editForm.sku} className={styles.input} disabled />
              </label>
              <label className={styles.label}>
                Nombre
                <input
                  value={editForm.nombre}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, nombre: event.target.value }))
                  }
                  className={styles.input}
                />
              </label>
              <label className={styles.label}>
                Precio
                <input
                  type="number"
                  value={editForm.precio}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, precio: event.target.value }))
                  }
                  className={styles.input}
                />
              </label>
              <label className={styles.label}>
                Categoria
                <select
                  value={editForm.categoria}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, categoria: event.target.value }))
                  }
                  className={styles.input}
                >
                  {BASE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.label}>
                Moneda
                <input
                  value={editForm.moneda}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, moneda: event.target.value }))
                  }
                  className={styles.input}
                />
              </label>
              <label className={styles.label}>
                Imagen URL
                <input
                  value={editForm.imagen}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, imagen: event.target.value }))
                  }
                  className={styles.input}
                />
              </label>
              <label className={styles.label}>
                ID Catalogo
                <input
                  type="number"
                  value={editForm.id_catalogo}
                  onChange={(event) =>
                    setEditForm((prev) => ({
                      ...prev,
                      id_catalogo: event.target.value,
                    }))
                  }
                  className={styles.input}
                />
              </label>
              <label className={styles.label}>
                Descripcion
                <textarea
                  value={editForm.descripcion}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, descripcion: event.target.value }))
                  }
                  className={styles.textarea}
                  rows={3}
                />
              </label>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={editForm.en_oferta}
                  onChange={(event) =>
                    setEditForm((prev) => ({
                      ...prev,
                      en_oferta: event.target.checked,
                    }))
                  }
                />
                En oferta
              </label>
              <label className={styles.label}>
                Porcentaje oferta
                <input
                  type="number"
                  value={editForm.porcentaje_oferta}
                  onChange={(event) =>
                    setEditForm((prev) => ({
                      ...prev,
                      porcentaje_oferta: event.target.value,
                    }))
                  }
                  className={styles.input}
                  disabled={!editForm.en_oferta}
                />
              </label>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={editForm.destacado}
                  onChange={(event) =>
                    setEditForm((prev) => ({
                      ...prev,
                      destacado: event.target.checked,
                    }))
                  }
                />
                Destacado
              </label>
            </div>
            <div className={styles.formActions}>
              <button type="button" className={styles.primary} onClick={handleUpdate}>
                Guardar cambios
              </button>
              <button type="button" className={styles.secondary} onClick={cancelEdit}>
                Cancelar
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
