import { Truck, ShieldCheck, MapPin, Bike, CreditCard, Building } from 'lucide-react';
import styles from './InfoSection.module.css';

export default function InfoSection() {
  return (
    <section className={styles.infoSection}>
      <div className={styles.infoPanel}>
        <div className={styles.infoColumns}>
          <div>
            <h5 className={styles.infoColumnTitle}>LOGISTICA & PAGOS</h5>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <div className={styles.infoIcon}>
                  <CreditCard size={32} />
                </div>
                <div>
                  <h6 className={styles.infoTitle}>MERCADO PAGO</h6>
                  <p className={styles.infoSubtitle}>
                    HASTA 12 CUOTAS SIN INTERES
                  </p>
                </div>
              </div>
              <div className={styles.infoItem}>
                <div className={styles.infoIcon}>
                  <Building size={32} color="var(--midnight)" />
                </div>
                <div>
                  <h6 className={styles.infoTitle}>TRANSFERENCIA</h6>
                  <p className={styles.infoSubtitle}>
                    10% OFF EXTRA EN EFECTIVO
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h5 className={styles.infoColumnTitle}>CENTRAL DE ENTREGAS</h5>
            <div className={styles.infoList}>
              {[
                { icon: Truck, title: 'EXPRESO PRO', sub: 'ENVIOS PRIORITARIOS' },
                { icon: MapPin, title: 'PICK-UP HUB', sub: 'RETIRO SIN COSTO' },
                { icon: ShieldCheck, title: 'PACKING', sub: 'DESPACHO PROTEGIDO' },
                { icon: Bike, title: 'FLEX', sub: 'ENTREGA FLASH 24HS' },
              ].map((item, idx) => (
                <div key={idx} className={styles.infoItem}>
                  <div className={styles.infoIcon}>
                    <item.icon size={20} />
                  </div>
                  <div>
                    <h6 className={styles.infoTitle}>{item.title}</h6>
                    <p className={styles.infoSubtitle}>{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
