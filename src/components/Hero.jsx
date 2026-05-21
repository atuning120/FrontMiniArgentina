import { useState } from 'react';
import { MessageCircle, Store, ShieldCheck } from 'lucide-react';
import WhatsAppModal from './WhatsAppModal.jsx';
import styles from './Hero.module.css';

export default function Hero() {
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  return (
    <>
      <section className={styles.heroSection}>
        <div className={styles.heroCard}>
          <div className={styles.heroBackground}>
            <div className={styles.heroGlowLeft}></div>
            <div className={styles.heroGlowRight}></div>
            <div className={styles.heroPattern}></div>
          </div>

          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <span className={styles.heroBadgeDot}></span>
              Eficiencia que ilumina tu vida
            </div>
            <h2 className={styles.heroTitle}>
              TECNOLOGIA LED <br />
              Y SUMINISTROS{' '}
              <span className={styles.heroTitleAccent}>CLEAN</span>
            </h2>
            <p className={styles.heroSubtitle}>
              Soluciones de iluminacion eficientes y sustentables, materiales de
              alto rendimiento y la mejor asesoria tecnica especializada para tus
              proyectos.
            </p>
            <div className={styles.heroActions}>
              <button
                onClick={() => {
                  const el = document.getElementById('catalog');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={styles.primaryButton}
              >
                VER PRODUCTOS
              </button>
              <button 
                onClick={() => setIsWhatsAppModalOpen(true)}
                className={styles.secondaryButton}
              >
                <MessageCircle size={18} color="#22c55e" />
                PEDIDOS WHATSAPP
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.featureSection}>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Store size={32} />
            </div>
            <div>
              <h4 className={styles.featureTitle}>RETIRO EN TIENDA O LOCAL</h4>
              <p className={styles.featureSubtitle}>DESPACHO AGIL Y SEGURO</p>
            </div>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <ShieldCheck size={32} />
            </div>
            <div>
              <h4 className={styles.featureTitle}>GARANTIA TECNICA</h4>
              <p className={styles.featureSubtitle}>COMPRA CON CONFIANZA OFICIAL</p>
            </div>
          </div>
        </div>
      </section>

      <WhatsAppModal isOpen={isWhatsAppModalOpen} onClose={() => setIsWhatsAppModalOpen(false)} />
    </>
  );
}
