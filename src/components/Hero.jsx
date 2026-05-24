import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  MapPin,
  CreditCard,
  Building,
  Clock
} from 'lucide-react';
import WhatsAppModal from './WhatsAppModal.jsx';
import styles from './Hero.module.css';

const HERO_SLIDES = [
  {
    id: 1,
    badge: "Eficiencia que Ilumina tu Vida",
    badgeClass: styles.badgeCyan,
    titlePrimary: "TECNOLOGÍA LED",
    titleSecondary: "Y SUMINISTROS",
    titleHighlight: "CLEAN",
    description: "Soluciones de iluminación eficientes y sustentables, materiales de alto rendimiento y la mejor asesoría técnica para tus proyectos.",
    image: "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?q=80&w=1600&auto=format&fit=crop",
    ctaText: "VER PRODUCTOS",
    ctaAction: "catalog",
    whatsappBadge: true,
  },
  {
    id: 2,
    badge: "Punto de Retiro",
    badgeClass: styles.badgeEmerald,
    titlePrimary: "CONOCÉ NUESTRA",
    titleSecondary: "TIENDA",
    titleHighlight: "FÍSICA",
    description: "El lugar ideal para retirar tus compras online de forma rápida y segura. Aprovechá tu visita para ver los productos en nuestra tienda y recibir la mejor atención.",
    detailInfo: {
      address: "Pque. Industrial Oeste, Buenos Aires, AR",
      hours: "Lunes a Viernes 08:30 a 18:00hs • Sábados 09:00 a 13:00hs",
    },
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600&auto=format&fit=crop",
    ctaText: "CÓMO LLEGAR",
    ctaAction: "location",
    whatsappBadge: false,
  },
  {
    id: 3,
    badge: "Retiro Inmediato en Sucursal",
    badgeClass: styles.badgeAmber,
    titlePrimary: "COMPRÁ ONLINE Y",
    titleSecondary: "RETIRÁ EN",
    titleHighlight: "EL LOCAL",
    description: "Preparamos tus pedidos al instante. Comprá a través de la web y pasá a retirar tu mercadería por nuestra sucursal de forma ágil y segura.",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1600&auto=format&fit=crop",
    ctaText: "VER OFERTAS",
    ctaAction: "offers",
    whatsappBadge: true,
  },
  {
    id: 4,
    badge: "Mercado Pago & Transferencia",
    badgeClass: styles.badgeIndigo,
    titlePrimary: "PAGÁ DE LA FORMA",
    titleSecondary: "MÁS SIMPLE Y",
    titleHighlight: "CONVENIENTE",
    description: "Realizá tus compras abonando de manera 100% segura mediante Mercado Pago (todas las tarjetas de crédito y débito) o transferencia bancaria directa.",
    detailInfo: {
      address: "Tarjetas de crédito, débito y dinero en cuenta",
      hours: "Transferencias directas inmediatas en pesos",
    },
    image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=1600&auto=format&fit=crop",
    ctaText: "VER PRODUCTOS",
    ctaAction: "catalog",
    whatsappBadge: true,
  }
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHoveringCarousel, setIsHoveringCarousel] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  useEffect(() => {
    if (isHoveringCarousel) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isHoveringCarousel]);

  const handleCtaAction = (action) => {
    if (action === 'catalog') {
      const el = document.getElementById('catalog');
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (action === 'location') {
      const el = document.getElementById('footer-location');
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (action === 'offers') {
      const el = document.getElementById('offers-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        const catalogEl = document.getElementById('catalog');
        catalogEl?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <section className={styles.heroSection}>
        <div
          className={styles.heroContainer}
          onMouseEnter={() => setIsHoveringCarousel(true)}
          onMouseLeave={() => setIsHoveringCarousel(false)}
        >
          <div className={styles.carouselWrapper}>
            <AnimatePresence mode="wait">
              {HERO_SLIDES.map((slide, idx) => {
                if (idx !== currentSlide) return null;
                return (
                  <motion.div
                    key={slide.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className={styles.slide}
                  >
                    <div className={styles.slideBackground}>
                      <img src={slide.image} alt="" className={styles.slideImage} />
                      <div className={styles.slidePattern}></div>
                      <div className={styles.slideGradientBottom}></div>
                      <div className={styles.slideGradientRight}></div>
                    </div>

                    <div className={styles.slideContent}>
                      <div className={`${styles.badge} ${slide.badgeClass}`}>
                        <span className={styles.badgeDot}></span>
                        {slide.badge}
                      </div>

                      <h2 className={styles.title}>
                        {slide.titlePrimary} <br className={styles.hideMobile} />
                        {slide.titleSecondary} <span className={styles.titleHighlight}>{slide.titleHighlight}</span>
                      </h2>

                      <p className={styles.description}>
                        {slide.description}
                      </p>

                      {slide.detailInfo && (
                        <div className={styles.infoBox}>
                          <div className={styles.infoItem}>
                            {slide.id === 4 ? (
                              <CreditCard className={styles.infoIconIndigo} />
                            ) : (
                              <MapPin className={styles.infoIconAccent} />
                            )}
                            <div>
                              <p className={styles.infoLabel}>
                                {slide.id === 4 ? "MERCADO PAGO" : "DIRECCIÓN"}
                              </p>
                              <p className={styles.infoValue}>{slide.detailInfo.address}</p>
                            </div>
                          </div>
                          <div className={`${styles.infoItem} ${styles.infoItemBorder}`}>
                            {slide.id === 4 ? (
                              <Building className={styles.infoIconIndigo} />
                            ) : (
                              <Clock className={styles.infoIconAccent} />
                            )}
                            <div>
                              <p className={styles.infoLabel}>
                                {slide.id === 4 ? "TRANSFERENCIAS" : "HORARIOS"}
                              </p>
                              <p className={styles.infoValue}>{slide.detailInfo.hours}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className={styles.actions}>
                        <button
                          onClick={() => handleCtaAction(slide.ctaAction)}
                          className={styles.primaryButton}
                        >
                          {slide.ctaText}
                        </button>

                        {slide.whatsappBadge && (
                          <button
                            onClick={() => setIsWhatsAppModalOpen(true)}
                            className={styles.secondaryButton}
                          >
                            <MessageCircle size={16} className={styles.whatsappIcon} />
                            PEDIDOS WHATSAPP
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            <button
              onClick={() => setCurrentSlide(prev => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
              className={`${styles.navButton} ${styles.navButtonLeft}`}
              aria-label="Previous Slide"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length)}
              className={`${styles.navButton} ${styles.navButtonRight}`}
              aria-label="Next Slide"
            >
              <ChevronRight size={20} />
            </button>

            <div className={styles.indicators}>
              {HERO_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`${styles.indicatorDot} ${idx === currentSlide ? styles.indicatorDotActive : ''}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>


          </div>
        </div>
      </section>



      <WhatsAppModal isOpen={isWhatsAppModalOpen} onClose={() => setIsWhatsAppModalOpen(false)} />
    </>
  );
}
