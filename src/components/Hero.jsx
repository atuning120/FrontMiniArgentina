import { motion } from 'motion/react';
import styles from './Hero.module.css';

const Hero = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.glow} aria-hidden="true" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className={styles.content}
      >
        <h2 className={styles.title}>
          Suministros <span>Eléctricos de Calidad</span>
        </h2>
        <p className={styles.subtitle}>La base sólida para tu infraestructura</p>
      </motion.div>
    </section>
  );
};

export default Hero;
