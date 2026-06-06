/**
 * @file Layout.jsx
 * Main layout wrapper component providing consistent page structure
 */

import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import CookieBanner from '../CookieBanner';
import NewsletterPopup from '../NewsletterPopup';
import ChatWidget from '../ChatWidget';
import styles from '../../styles/Layout.module.css';

/**
 * Main layout component providing header, footer, and content wrapper for all pages
 * @component
 * @returns {JSX.Element} Layout component with nested routes
 */
function Layout() {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
      <CookieBanner />
      <NewsletterPopup />
      <ChatWidget />
    </div>
  );
}

export default Layout;
