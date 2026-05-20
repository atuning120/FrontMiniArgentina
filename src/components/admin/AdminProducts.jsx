import { useEffect, useMemo, useState } from 'react';
import Filters from '../Filters.jsx';
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

const buildSkuFromName = (name) => {
  const normalized = (name || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  return normalized
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
};

const getNextCatalogId = (items) => {
  const ids = (items || [])
    .map((item) => Number(item.id_catalogo))
    .filter((value) => Number.isFinite(value));

  if (ids.length === 0) return 1;
  return Math.max(...ids) + 1;
};

export default function AdminProducts({ baseUrl, token }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createForm, setCreateForm] = useState(emptyForm);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSku, setEditingSku] = useState('');
  const [editForm, setEditForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [notice, setNotice] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('todos');
  const [selectedSkus, setSelectedSkus] = useState(() => new Set());

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
    event?.preventDefault();
    resetNotice();
    try {
      const catalogId = Number(createForm.id_catalogo);
      const hasDuplicateCatalogId = products.some(
        (product) => Number(product.id_catalogo) === catalogId
      );

      if (!Number.isFinite(catalogId)) {
        setNotice('El ID Catalogo es obligatorio.');
        return;
      }

      if (hasDuplicateCatalogId) {
        setNotice('El ID Catalogo ya existe en otro producto.');
        return;
      }

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
      setIsCreateOpen(false);
      await loadProducts();
    } catch (err) {
      setNotice(err.message || 'Error al crear el producto');
    }
  };

  const openCreate = () => {
    resetNotice();
    const nextCatalogId = getNextCatalogId(products);
    setCreateForm((prev) => ({
      ...emptyForm,
      id_catalogo: nextCatalogId,
      sku: prev?.sku || '',
    }));
    setEditingSku('');
    setIsCreateOpen(true);
  };

  const closeCreate = () => {
    setIsCreateOpen(false);
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

  const confirmDelete = (product) => {
    resetNotice();
    setDeleteTarget(product);
  };

  const toggleSelected = (sku) => {
    setSelectedSkus((prev) => {
      const next = new Set(prev);
      if (next.has(sku)) {
        next.delete(sku);
      } else {
        next.add(sku);
      }
      return next;
    });
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget?.sku) return;
    resetNotice();

    try {
      const response = await fetch(
        `${baseUrl}/api/admin/productos/hogar/electronico/${deleteTarget.sku}`,
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
      setDeleteTarget(null);
      await loadProducts();
    } catch (err) {
      setNotice(err.message || 'Error al eliminar');
    }
  };

  const editPercentage = Number(editForm.porcentaje_oferta || 0);
  const editHasOffer = Boolean(editForm.en_oferta) && editPercentage > 0;
  const editPrice = Number(editForm.precio);
  const editOldPrice =
    editHasOffer && Number.isFinite(editPrice) && editPrice > 0
      ? Math.round(editPrice / (1 - editPercentage / 100))
      : null;

  const createPercentage = Number(createForm.porcentaje_oferta || 0);
  const createHasOffer = Boolean(createForm.en_oferta) && createPercentage > 0;
  const createPrice = Number(createForm.precio);
  const createOldPrice =
    createHasOffer && Number.isFinite(createPrice) && createPrice > 0
      ? Math.round(createPrice / (1 - createPercentage / 100))
      : null;

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      activeCategory === 'todos' || product.categoria === activeCategory;
    if (!matchesCategory) return false;

    if (!normalizedQuery) return true;

    const searchable = [
      product.nombre,
      product.descripcion,
      product.sku,
      product.categoria,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return searchable.includes(normalizedQuery);
  });

  return (
    <section className={styles.section}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Productos</h2>
          <div className={styles.cardHeaderActions}>
            <button type="button" onClick={openCreate} className={styles.primary}>
              Crear producto
            </button>
            <button type="button" onClick={loadProducts} className={styles.secondary}>
              Recargar
            </button>
          </div>
        </div>

        {notice ? <p className={styles.notice}>{notice}</p> : null}

        {loading ? <p>Cargando...</p> : null}
        {error ? <p className={styles.error}>{error}</p> : null}

        <Filters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterCategories={['todos', ...BASE_CATEGORIES]}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />

        {!loading && products.length === 0 ? <p>No hay productos.</p> : null}
        {!loading && products.length > 0 && filteredProducts.length === 0 ? (
          <p className={styles.notice}>No hay productos que coincidan.</p>
        ) : null}

        <div className={styles.productsGrid}>
          {filteredProducts.map((product) => {
            const percentage = Number(product.porcentaje_oferta || 0);
            const hasOffer = Boolean(product.en_oferta) && percentage > 0;
            const oldPrice = hasOffer
              ? Math.round(product.precio / (1 - percentage / 100))
              : null;

            return (
              <div key={product.sku} className={styles.productCard}>
                <div className={styles.productMedia}>
                  <label
                    className={`${styles.selectWrap} ${
                      selectedSkus.has(product.sku) ? styles.selectWrapActive : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSkus.has(product.sku)}
                      onChange={() => toggleSelected(product.sku)}
                    />
                    <span className={styles.selectMark} aria-hidden="true" />
                  </label>
                  {product.imagen?.trim() ? (
                    <img
                      src={product.imagen}
                      alt={product.nombre}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className={styles.noImage}>No hay imagen</div>
                  )}
                  <div className={styles.productBadges}>
                    {hasOffer && (
                      <span className={`${styles.badge} ${styles.badgeOffer}`}>
                        Oferta {percentage}%
                      </span>
                    )}
                    {product.destacado && (
                      <span className={`${styles.badge} ${styles.badgeFeatured}`}>
                        Destacado
                      </span>
                    )}
                  </div>
                  
                  <div className={styles.adminOverlay}>
                    <button onClick={() => startEdit(product)} className={styles.overlayBtn}>
                      Editar
                    </button>
                    <button
                      onClick={() => confirmDelete(product)}
                      className={`${styles.overlayBtn} ${styles.overlayBtnDanger}`}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
                
                <div className={styles.productContent}>
                  <span className={styles.productTag}>{product.categoria}</span>
                  <h4 className={styles.productTitle}>{product.nombre}</h4>
                  <p className={styles.productDesc}>
                    {product.descripcion?.substring(0, 80)}
                    {product.descripcion?.length > 80 ? '...' : ''}
                  </p>
                  
                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                    <span className={styles.productPrice}>${product.precio?.toLocaleString()}</span>
                    {hasOffer && oldPrice && (
                      <span style={{ fontSize: '0.8rem', textDecoration: 'line-through', color: 'rgba(255,255,255,0.45)' }}>
                        ${oldPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {editingSku ? (
          <div className={styles.modalOverlay} onClick={cancelEdit}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <button className={styles.closeBtn} onClick={cancelEdit}>&times;</button>

              <div className={styles.modalPreview}>
                <div className={`${styles.productCard} ${styles.modalPreviewCard}`}>
                  <div className={styles.productMedia}>
                    {editForm.imagen?.trim() ? (
                      <img
                        src={editForm.imagen}
                        alt={editForm.nombre}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className={styles.noImage}>No hay imagen</div>
                    )}
                    <div className={styles.productBadges}>
                      {editHasOffer && (
                        <span className={`${styles.badge} ${styles.badgeOffer}`}>
                          Oferta {editPercentage}%
                        </span>
                      )}
                      {editForm.destacado && (
                        <span className={`${styles.badge} ${styles.badgeFeatured}`}>
                          Destacado
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={styles.productContent}>
                    <span className={styles.productTag}>
                      {editForm.categoria || BASE_CATEGORIES[0]}
                    </span>
                    <h4 className={styles.productTitle}>
                      {editForm.nombre || 'Nombre del producto'}
                    </h4>
                    <p className={styles.productDesc}>
                      {editForm.descripcion
                        ? editForm.descripcion.substring(0, 90)
                        : 'Descripcion corta del producto para la tarjeta.'}
                      {editForm.descripcion?.length > 90 ? '...' : ''}
                    </p>

                    <div className={styles.previewPriceRow}>
                      <span className={styles.productPrice}>
                        ${Number(editForm.precio || 0).toLocaleString()}
                      </span>
                      {editHasOffer && editOldPrice && (
                        <span className={styles.previewOldPrice}>
                          ${editOldPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.modalFormArea}>
                <h3>Editar producto</h3>
                <div className={styles.formGrid}>
                  <label className={styles.label} style={{ gridColumn: '1 / -1' }}>
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
                    SKU
                    <input value={editForm.sku} className={styles.input} disabled />
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

                  <div style={{ 
                    gridColumn: '1 / -1', 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
                    gap: '1rem', 
                    padding: '1.25rem', 
                    background: 'rgba(255,255,255,0.03)', 
                    borderRadius: '1rem', 
                    border: '1px solid rgba(255,255,255,0.05)',
                    marginTop: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
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

                  <label className={styles.label} style={{ gridColumn: '1 / -1' }}>
                    Imagen URL
                    <input
                      value={editForm.imagen}
                      onChange={(event) =>
                        setEditForm((prev) => ({ ...prev, imagen: event.target.value }))
                      }
                      className={styles.input}
                    />
                  </label>
                  
                  <label className={styles.label} style={{ gridColumn: '1 / -1' }}>
                    Descripcion
                    <textarea
                      value={editForm.descripcion}
                      onChange={(event) =>
                        setEditForm((prev) => ({ ...prev, descripcion: event.target.value }))
                      }
                      className={styles.textarea}
                      rows={4}
                    />
                  </label>
                </div>
                <div className={styles.formActions} style={{ marginTop: '2.5rem' }}>
                  <button type="button" className={styles.primary} onClick={handleUpdate}>
                    Guardar cambios
                  </button>
                  <button type="button" className={styles.secondary} onClick={cancelEdit}>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {isCreateOpen ? (
          <div className={styles.modalOverlay} onClick={closeCreate}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <button className={styles.closeBtn} onClick={closeCreate}>&times;</button>

              <div className={styles.modalPreview}>
                <div className={`${styles.productCard} ${styles.modalPreviewCard}`}>
                  <div className={styles.productMedia}>
                    {createForm.imagen?.trim() ? (
                      <img
                        src={createForm.imagen}
                        alt={createForm.nombre}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className={styles.noImage}>No hay imagen</div>
                    )}
                    <div className={styles.productBadges}>
                      {createHasOffer && (
                        <span className={`${styles.badge} ${styles.badgeOffer}`}>
                          Oferta {createPercentage}%
                        </span>
                      )}
                      {createForm.destacado && (
                        <span className={`${styles.badge} ${styles.badgeFeatured}`}>
                          Destacado
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={styles.productContent}>
                    <span className={styles.productTag}>
                      {createForm.categoria || BASE_CATEGORIES[0]}
                    </span>
                    <h4 className={styles.productTitle}>
                      {createForm.nombre || 'Nombre del producto'}
                    </h4>
                    <p className={styles.productDesc}>
                      {createForm.descripcion
                        ? createForm.descripcion.substring(0, 90)
                        : 'Descripcion corta del producto para la tarjeta.'}
                      {createForm.descripcion?.length > 90 ? '...' : ''}
                    </p>

                    <div className={styles.previewPriceRow}>
                      <span className={styles.productPrice}>
                        ${Number(createForm.precio || 0).toLocaleString()}
                      </span>
                      {createHasOffer && createOldPrice && (
                        <span className={styles.previewOldPrice}>
                          ${createOldPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.modalFormArea}>
                <h3>Crear producto</h3>
                <form className={styles.formGrid} onSubmit={handleCreate}>
                  <label className={styles.label} style={{ gridColumn: '1 / -1' }}>
                    Nombre
                    <input
                      value={createForm.nombre}
                      onChange={(event) =>
                        setCreateForm((prev) => {
                          const nombre = event.target.value;
                          return {
                            ...prev,
                            nombre,
                            sku: buildSkuFromName(nombre),
                          };
                        })
                      }
                      className={styles.input}
                    />
                  </label>

                  <label className={styles.label}>
                    SKU
                    <input
                      value={createForm.sku}
                      onChange={(event) =>
                        setCreateForm((prev) => ({ ...prev, sku: event.target.value }))
                      }
                      className={styles.input}
                      required
                      readOnly
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
                    ID Catalogo
                    <input
                      type="number"
                      value={createForm.id_catalogo}
                      onChange={(event) =>
                        setCreateForm((prev) => ({ ...prev, id_catalogo: event.target.value }))
                      }
                      className={styles.input}
                      readOnly
                    />
                  </label>

                  <div
                    style={{
                      gridColumn: '1 / -1',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                      gap: '1rem',
                      padding: '1.25rem',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '1rem',
                      border: '1px solid rgba(255,255,255,0.05)',
                      marginTop: '0.5rem',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <label className={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={createForm.en_oferta}
                        onChange={(event) =>
                          setCreateForm((prev) => ({
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
                          setCreateForm((prev) => ({
                            ...prev,
                            destacado: event.target.checked,
                          }))
                        }
                      />
                      Destacado
                    </label>
                  </div>

                  <label className={styles.label} style={{ gridColumn: '1 / -1' }}>
                    Imagen URL
                    <input
                      value={createForm.imagen}
                      onChange={(event) =>
                        setCreateForm((prev) => ({ ...prev, imagen: event.target.value }))
                      }
                      className={styles.input}
                    />
                  </label>

                  <label className={styles.label} style={{ gridColumn: '1 / -1' }}>
                    Descripcion
                    <textarea
                      value={createForm.descripcion}
                      onChange={(event) =>
                        setCreateForm((prev) => ({ ...prev, descripcion: event.target.value }))
                      }
                      className={styles.textarea}
                      rows={4}
                    />
                  </label>

                  <div className={styles.formActions} style={{ marginTop: '2.5rem' }}>
                    <button type="submit" className={styles.primary}>
                      Crear producto
                    </button>
                    <button type="button" className={styles.secondary} onClick={closeCreate}>
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        ) : null}

        {deleteTarget ? (
          <div className={styles.modalOverlay} onClick={cancelDelete}>
            <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
              <h3>Confirmar eliminacion</h3>
              <p>
                Vas a eliminar <strong>{deleteTarget.nombre || deleteTarget.sku}</strong>.
                Esta accion no se puede deshacer.
              </p>
              <div className={styles.confirmActions}>
                <button type="button" className={styles.danger} onClick={handleDelete}>
                  Eliminar
                </button>
                <button type="button" className={styles.secondary} onClick={cancelDelete}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
