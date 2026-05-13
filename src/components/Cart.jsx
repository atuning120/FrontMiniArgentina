import { AnimatePresence, motion } from 'motion/react';
import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import styles from './Cart.module.css';

export default function Cart({
  isCartOpen,
  setIsCartOpen,
  cart,
  cartCount,
  cartTotal,
  removeFromCart,
  updateQuantity,
  error,
  loadingCheckout,
  handleCheckout,
}) {
  return (
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
            <div className={styles.header}>
              <div>
                <h4>Tu Orden</h4>
                <p>{cartCount} Artículos en revisión</p>
              </div>
              <button onClick={() => setIsCartOpen(false)} aria-label="Cerrar carrito">
                <X className={styles.icon} />
              </button>
            </div>

            <div className={styles.items}>
              {cart.length === 0 ? (
                <div className={styles.empty}>
                  <div className={styles.emptyRing}>
                    <ShoppingCart className={styles.icon} />
                  </div>
                  <p>Orden Vacía</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className={styles.item}>
                    <div className={styles.thumb}>
                      <img src={item.image} alt={item.name} referrerPolicy="no-referrer" />
                    </div>
                    <div className={styles.info}>
                      <div className={styles.title}>
                        <span>{item.name}</span>
                        <button onClick={() => removeFromCart(item.id)} aria-label="Quitar">
                          <Trash2 className={styles.icon} />
                        </button>
                      </div>
                      <div className={styles.price}>
                        ${item.price.toLocaleString()}
                      </div>
                      <div className={styles.qty}>
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
              <div className={styles.summary}>
                {error && <div className={styles.error}>{error}</div>}
                <div className={styles.total}>
                  <span>Monto Total</span>
                  <strong>${cartTotal.toLocaleString()}</strong>
                </div>
                <div className={styles.checkout}>
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
  );
}
