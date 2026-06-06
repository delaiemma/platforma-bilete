/**
 * @file Login.jsx
 * User login page component
 */

import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import styles from '../styles/Login.module.css';

/**
 * Login page component with form validation and authentication
 * @component
 * @returns {JSX.Element} Login page component
 */
function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);

    try {
      await login({
        email: data.email,
        password: data.password
      });

      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleManageCookies = (e) => {
    e.preventDefault();
    window.dispatchEvent(new Event('showCookieBanner'));
  };

  return (
    <div className={styles.loginContainer}>
      <header className={styles.loginHeader}>
        <Link to="/" className={styles.logo}>
          Ticket
        </Link>
      </header>

      <div className={styles.loginMain}>
        <div className={styles.loginFormContainer}>
          <h1 className={styles.loginTitle}>Log In</h1>

          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <form className={styles.loginForm} onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email address</label>
              <input
                type="email"
                id="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
              />
              {errors.email && (
                <span className={styles.error}>{errors.email.message}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
              />
              {errors.password && (
                <span className={styles.error}>{errors.password.message}</span>
              )}
            </div>

            <button
              type="submit"
              className={styles.connectBtn}
              disabled={loading}
            >
              {loading ? 'Connecting...' : 'Connect'}
            </button>
          </form>

          <div className={styles.signupLink}>
            <p>If you don't already have an account,</p>
            <p>click the button below to create one</p>
            <Link to="/signup" className={styles.createAccountLink}>
              Create Account
            </Link>
          </div>

          <div className={styles.signupLink}>
            <p>Forgot your password?</p>
            <Link to="/forgot-password" className={styles.createAccountLink}>
              Reset Password
            </Link>
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerLogo}>Ticket</div>
        <div className={styles.footerText}>© 2025 Ticket Created by De Lai Emma</div>
        <div className={styles.footerLinks}>
          <Link to="/terms">Terms</Link>
          <span>•</span>
          <Link to="/privacy">Privacy</Link>
          <span>•</span>
          <Link to="/accessibility">Accessibility</Link>
          <span>•</span>
          <Link to="/cookie-policy">Cookies</Link>
          <span>•</span>
          <a href="#" onClick={handleManageCookies}>Manage Cookies Preferences</a>
          <span>•</span>
          <Link to="/privacy#data-rights">Do Not Sell or Share My Personal Information</Link>
        </div>
      </footer>
    </div>
  );
}

export default Login;
