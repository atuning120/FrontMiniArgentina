import { MessageCircle } from 'lucide-react';
import styles from './WhatsAppButton.module.css';

export default function WhatsAppButton() {
  return (
    <a href="#" className={styles.floatingWhatsApp} title="Consultar por WhatsApp">
      <MessageCircle size={32} />
      <span className={styles.floatingTooltip}>En que podemos ayudarte?</span>
    </a>
  );
}
