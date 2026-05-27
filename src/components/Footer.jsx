import { Mail, MapPin, MessageCircle } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <h4>
              LED <span>CLEAN</span>
            </h4>
            <p>
              Empresa especializada en la importación y distribución técnica de componentes
              eléctricos. Soluciones integrales para proyectos de gran escala.
            </p>
            {/* 
            <div className={styles.social}>
              <a href="#" title="Instagram">
                <FaInstagram className={styles.icon} />
              </a>
              <a href="#" title="YouTube">
                <FaYoutube className={styles.icon} />
              </a>
              <a href="#" title="Facebook">
                <FaFacebookF className={styles.icon} />
              </a>
            </div>
            */}
          </div>

          <div className={styles.contact}>
            <h5>Central de Contacto</h5>
            <div className={styles.columns}>
              <ul>
                <li className={styles.contactCard}>
                  <div className={`${styles.iconContainer} ${styles.isAccent}`}>
                    <Mail className={styles.icon} />
                  </div>
                  <div>
                    <span>Email Corporativo</span>
                    <strong>ventas@ledclean.ar</strong>
                  </div>
                </li>
              </ul>
              <ul>
                <li className={styles.contactCard}>
                  <div className={`${styles.iconContainer} ${styles.isGreen}`}>
                    <MessageCircle className={styles.icon} />
                  </div>
                  <div>
                    <span>WhatsApp Soporte</span>
                    <strong>+54 9 11 1234-5678</strong>
                  </div>
                </li>
              </ul>
              <ul>
                <li className={styles.contactCard}>
                  <div className={styles.iconContainer}>
                    <MapPin className={styles.icon} />
                  </div>
                  <div>
                    <span>Nuestra Sede</span>
                    <strong>Pque. Industrial, Buenos Aires.</strong>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>&copy; 2026 LED CLEAN. TRABAJAMOS CON LOS MEJORES.</p>
          <span>PAGOS PROCESADOS POR MERCADO PAGO</span>
        </div>
      </div>
    </footer>
  );
}
