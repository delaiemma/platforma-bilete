/**
 * @file Header.jsx
 * Header component with navigation, search, and user authentication controls
 */

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import styles from '../../styles/Header.module.css';

/**
 * Header component providing site navigation, search functionality, and user actions
 * @component
 * @returns {JSX.Element} Header component
 */
function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAdmin } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const debounceTimer = useRef(null);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (value === '') {
      if (location.pathname === '/' && location.search.includes('search=')) {
        navigate('/');
      }
    } else {
      debounceTimer.current = setTimeout(() => {
        navigate(`/?search=${encodeURIComponent(value)}`);
      }, 300);
    }
  };

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);



  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        Ticket
      </Link>

      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyDown}
        />
      </div>

      <div className={styles.navButtons}>
        {location.pathname !== '/' && (
          <button className={styles.navBtn} onClick={() => navigate('/')}>
            Home
          </button>
        )}
        {location.pathname !== '/about' && (
          <button className={styles.navBtn} onClick={() => navigate('/about')}>
            About us
          </button>
        )}
        {location.pathname !== '/contact' && (
          <button className={styles.navBtn} onClick={() => navigate('/contact')}>
            Contact
          </button>
        )}
        <button className={styles.navBtn} onClick={() => navigate('/favourites')}>
          Favourites
        </button>
        <button className={styles.navBtn} onClick={() => navigate('/cart')}>
          Cart
        </button>
        {isAuthenticated && location.pathname !== '/my-tickets' && (
          <button className={styles.navBtn} onClick={() => navigate('/my-tickets')}>
            My Tickets
          </button>
        )}

        {isAuthenticated && isAdmin() && location.pathname !== '/dashboard' && (
          <button className={styles.navBtn} onClick={() => navigate('/dashboard')}>
            Dashboard
          </button>
        )}
        {isAuthenticated && isAdmin() && location.pathname !== '/admin/discounts' && (
          <button className={styles.navBtn} onClick={() => navigate('/admin/discounts')}>
            Discounts
          </button>
        )}
        {isAuthenticated ? (
          <button className={styles.navBtn} onClick={() => navigate('/profile')}>
            My Account
          </button>
        ) : (
          <button className={styles.navBtn} onClick={() => navigate('/login')}>
            Sign in
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
