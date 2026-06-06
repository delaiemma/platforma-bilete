/**
 * @file HeroSlideshow.jsx
 * Auto-rotating hero banner slideshow component
 */

import { useState, useEffect } from 'react';
import styles from '../../styles/HeroSlideshow.module.css';

/**
 * Slide configuration array
 * @constant
 */
const SLIDES = [
  { id: 1, image: '/images/banner1.png', alt: 'Banner 1' },
  { id: 2, image: '/images/banner2.png', alt: 'Banner 2' }
];

/**
 * Slide rotation interval in milliseconds
 * @constant
 */
const SLIDE_INTERVAL = 4000;

/**
 * Auto-rotating hero slideshow component for homepage banner
 * @component
 * @returns {JSX.Element} Hero slideshow component
 */
function HeroSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, SLIDE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className={styles.heroSection}>
      <div className={styles.heroSlideshow}>
        {SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={`${styles.heroSlide} ${index === currentSlide ? styles.active : ''}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          />
        ))}
      </div>
      <div className={styles.slideIndicators}>
        {SLIDES.map((_, index) => (
          <div
            key={index}
            className={`${styles.indicator} ${index === currentSlide ? styles.active : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
}

export default HeroSlideshow;
