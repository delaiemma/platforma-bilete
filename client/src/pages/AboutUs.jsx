/**
 * @file AboutUs.jsx
 * About Us page component
 */

import { useNavigate } from 'react-router-dom';
import styles from '../styles/AboutUs.module.css';

/**
 * About Us page component displaying company information and statistics
 * @component
 * @returns {JSX.Element} About Us page component
 */
function AboutUs() {
  const navigate = useNavigate();

  const handleExploreEvents = () => {
    navigate('/more-events');
  };

  return (
    <main className={styles.aboutMain}>
      {/* Hero - Typography First with SVG Splashes */}
      <div className={styles.heroSection}>
        {/* SVG Organic Splashes */}
        <svg className={styles.splash1} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="rgba(75, 192, 192, 0.5)" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.2,73.1,42.8C64.8,56.4,53.8,69,39.8,75.8C25.8,82.6,8.8,83.6,-7.3,80.3C-23.4,77,-38.8,69.4,-52.1,58.8C-65.4,48.2,-76.6,34.6,-82.3,18.7C-88,-2.8,-88.2,-26.6,-80.7,-46.8C-73.2,-67,-58,-83.6,-40.8,-88.8C-23.6,-94,-11.8,-88.8,1.4,-91.5C14.6,-94.2,30.6,-83.6,44.7,-76.4Z" transform="translate(100 100)" />
        </svg>

        <svg className={styles.splash2} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="rgba(54, 162, 235, 0.45)" d="M39.5,-65.5C50.5,-58.2,58.3,-46.3,65.3,-33.6C72.3,-20.9,78.5,-7.4,78.8,6.3C79.1,20,73.5,34,64.8,45.8C56.1,57.6,44.3,67.2,30.8,72.4C17.3,77.6,2.1,78.4,-13.5,76.1C-29.1,73.8,-45.1,68.4,-57.8,58.2C-70.5,48,-79.9,33,-83.5,16.8C-87.1,0.6,-84.9,-16.8,-77.8,-31.4C-70.7,-46,-58.7,-57.8,-44.8,-64.2C-30.9,-70.6,-15.5,-71.6,-0.7,-70.4C14.1,-69.2,28.5,-72.8,39.5,-65.5Z" transform="translate(100 100)" />
        </svg>

        <svg className={styles.splash3} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="rgba(102, 187, 106, 0.42)" d="M47.3,-78.7C60.9,-71.2,71.4,-58.5,77.7,-43.9C84,-29.3,86.1,-12.8,84.5,3.2C82.9,19.2,77.6,34.7,68.8,47.8C60,60.9,47.7,71.6,33.8,76.8C19.9,82,4.4,81.7,-11.3,78.8C-27,75.9,-43,70.4,-56.3,60.5C-69.6,50.6,-80.2,36.3,-84.4,20.2C-88.6,4.1,-86.4,-13.8,-78.9,-28.4C-71.4,-43,-58.6,-54.3,-44.3,-61.3C-30,-68.3,-15,-70.9,0.5,-71.8C16,-72.7,33.7,-86.2,47.3,-78.7Z" transform="translate(100 100)" />
        </svg>

        <svg className={styles.splash4} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="rgba(75, 192, 192, 0.38)" d="M41.3,-70.8C54.4,-63.7,66.6,-54.2,73.9,-41.3C81.2,-28.4,83.6,-12.1,81.5,3.2C79.4,18.5,72.8,32.8,63.6,44.8C54.4,56.8,42.6,66.5,28.9,71.8C15.2,77.1,-0.4,78,-15.2,74.5C-30,71,-44,63.1,-55.8,52C-67.6,40.9,-77.2,26.6,-80.5,10.8C-83.8,-5,-80.8,-22.3,-72.9,-36.8C-65,-51.3,-52.2,-63,-38.2,-69.5C-24.2,-76,-12.1,-77.3,1.2,-79.2C14.5,-81.1,28.2,-77.9,41.3,-70.8Z" transform="translate(100 100)" />
        </svg>

        <svg className={styles.splash5} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="rgba(54, 162, 235, 0.4)" d="M37.8,-63.3C49.1,-56.4,58.3,-45.7,64.8,-33.2C71.3,-20.7,75.1,-6.4,74.2,7.5C73.3,21.4,67.7,34.9,58.8,45.8C49.9,56.7,37.7,65,24.3,69.2C10.9,73.4,-3.7,73.5,-17.8,69.9C-31.9,66.3,-45.5,59,-56.4,48.3C-67.3,37.6,-75.5,23.5,-77.8,8.5C-80.1,-6.5,-76.5,-22.4,-68.4,-35.8C-60.3,-49.2,-47.7,-60.1,-33.8,-65.8C-19.9,-71.5,-4.7,-72,10.8,-69.8C26.3,-67.6,26.5,-70.2,37.8,-63.3Z" transform="translate(100 100)" />
        </svg>

        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Bringing people together through unforgettable experiences
          </h1>
          <p className={styles.heroSubtitle}>
            We connect event lovers with the moments that matter most
          </p>
          <button className={styles.heroButton} onClick={handleExploreEvents}>
            Explore Events
          </button>
        </div>
      </div>

      <div className={styles.container}>
        {/* Mission Section */}
        <section className={styles.missionSection}>
          <h2 className={styles.sectionTitle}>Our Mission</h2>
          <p className={styles.missionText}>
            We're a platform dedicated to connecting people with the events they love. From intimate concerts to large-scale festivals,
            from theatrical performances to sports competitions — we make discovering and attending events seamless and enjoyable.
          </p>
        </section>

        {/* Statistics */}
        <section className={styles.statsSection}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>10K+</div>
            <div className={styles.statLabel}>Events Hosted</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>500K+</div>
            <div className={styles.statLabel}>Tickets Sold</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>50+</div>
            <div className={styles.statLabel}>Cities Covered</div>
          </div>
        </section>

        {/* Values Section */}
        <section className={styles.valuesSection}>
          <h2 className={styles.sectionTitle}>What We Value</h2>
          <div className={styles.valuesGrid}>
            <div className={styles.valueCard}>
              <h3 className={styles.valueTitle}>Simplicity</h3>
              <p className={styles.valueText}>
                Intuitive design that makes finding and booking tickets effortless for everyone.
              </p>
            </div>
            <div className={styles.valueCard}>
              <h3 className={styles.valueTitle}>Trust</h3>
              <p className={styles.valueText}>
                Secure transactions and verified events ensure peace of mind for all our users.
              </p>
            </div>
            <div className={styles.valueCard}>
              <h3 className={styles.valueTitle}>Community</h3>
              <p className={styles.valueText}>
                Building connections between event organizers and passionate attendees.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className={styles.contactSection}>
          <h2 className={styles.sectionTitle}>Get in Touch</h2>
          <p className={styles.contactText}>
            Have questions or want to partner with us? We'd love to hear from you.
          </p>
          <div className={styles.contactInfo}>
            <div className={styles.contactItem}>
              <span className={styles.contactLabel}>Email</span>
              <span className={styles.contactValue}>contact@ticketplatform.com</span>
            </div>
            <div className={styles.contactItem}>
              <span className={styles.contactLabel}>Phone</span>
              <span className={styles.contactValue}>+40 123 456 789</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default AboutUs;
