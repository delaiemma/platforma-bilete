/**
 * @file ForgotPassword.jsx
 * Forgot password page component
 */

import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import styles from '../styles/Login.module.css';

/**
 * Forgot password page component for requesting password reset link
 * @component
 * @returns {JSX.Element} Forgot password page component
 */
function ForgotPassword() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/api/user/forgot-password', {
        email: data.email
      });

      if (response.data.success) {
        setSubmitted(true);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
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
          <h1 className={styles.loginTitle}>Reset Password</h1>

          {submitted ? (
            <div className={styles.successMessage}>
              <h3>Check your email</h3>
              <p>If an account exists with that email address, we've sent you a password reset link.</p>
              <p>The link will expire in 1 hour.</p>
              <Link to="/login" className={styles.backToLogin}>
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <p className={styles.forgotPasswordText}>
                Enter your email address and we'll send you a link to reset your password.
              </p>

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

                <button
                  type="submit"
                  className={styles.connectBtn}
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <div className={styles.signupLink}>
                <p>Remember your password?</p>
                <p>Click the button below to log in</p>
                <Link to="/login" className={styles.createAccountLink}>
                  Back to Login
                </Link>
              </div>
            </>
          )}
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

export default ForgotPassword;
