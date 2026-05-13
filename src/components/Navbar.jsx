import styles from './Navbar.module.css';
import shoppingcart from '../assets/shopping-cart.svg';

const Navbar = ({ cartCount, onOpenCart }) => {
    return (
        <nav className={styles.nav}>
            <h1 className={styles.brand}>
                ELECTRIC<span>PRO</span>
            </h1>

            <div className={styles.actions}>
                <button
                    onClick={onOpenCart}
                    className={styles.cartButton}
                    id="cart-button"
                    aria-label="Abrir carrito"
                >
                    <img src={shoppingcart} className={styles.icon} alt="Carrito" />
                    {cartCount > 0 && (
                        <span className={styles.cartBadge}>{cartCount}</span>
                    )}
                </button>
            </div>
        </nav>
    );
};

export default Navbar;