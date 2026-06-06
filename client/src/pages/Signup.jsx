/**
 * @file Signup.jsx
 * User registration page component
 */

import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import styles from '../styles/Signup.module.css';

/**
 * Signup page component with form validation and user registration
 * @component
 * @returns {JSX.Element} Signup page component
 */
function Signup() {
  const navigate = useNavigate();
  const signup = useAuthStore((state) => state.signup);
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
      const fullName = `${data.firstName} ${data.lastName}`.trim();

      await signup({
        name: fullName,
        email: data.email,
        password: data.password
      });

      navigate('/');
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManageCookies = (e) => {
    e.preventDefault();
    window.dispatchEvent(new Event('showCookieBanner'));
  };

  return (
    <div className={styles.signupContainer}>
      <header className={styles.signupHeader}>
        <Link to="/" className={styles.logo}>
          Ticket
        </Link>
      </header>

      <div className={styles.signupMain}>
        <div className={styles.signupFormContainer}>
          <h1 className={styles.signupTitle}>Sign Up</h1>

          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <form className={styles.signupForm} onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.formRow}>
              <div className={`${styles.formGroup} ${styles.half}`}>
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  {...register('firstName', {
                    required: 'First name is required',
                    minLength: {
                      value: 2,
                      message: 'First name must be at least 2 characters'
                    }
                  })}
                />
                {errors.firstName && (
                  <span className={styles.error}>{errors.firstName.message}</span>
                )}
              </div>

              <div className={`${styles.formGroup} ${styles.half}`}>
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  {...register('lastName', {
                    required: 'Last name is required',
                    minLength: {
                      value: 2,
                      message: 'Last name must be at least 2 characters'
                    }
                  })}
                />
                {errors.lastName && (
                  <span className={styles.error}>{errors.lastName.message}</span>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                {...register('phoneNumber', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^[0-9+\-\s()]+$/,
                    message: 'Invalid phone number'
                  }
                })}
              />
              {errors.phoneNumber && (
                <span className={styles.error}>{errors.phoneNumber.message}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="dateOfBirth">Date of Birth</label>
              <input
                type="text"
                id="dateOfBirth"
                placeholder="dd/mm/yyyy"
                {...register('dateOfBirth', {
                  required: 'Date of birth is required',
                  pattern: {
                    value: /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
                    message: 'Please enter date in dd/mm/yyyy format'
                  },
                  validate: (value) => {
                    const parts = value.split('/');
                    const day = parseInt(parts[0]);
                    const month = parseInt(parts[1]) - 1;
                    const year = parseInt(parts[2]);
                    const date = new Date(year, month, day);
                    const today = new Date();
                    const age = today.getFullYear() - date.getFullYear();
                    return age >= 13 || 'You must be at least 13 years old';
                  }
                })}
              />
              {errors.dateOfBirth && (
                <span className={styles.error}>{errors.dateOfBirth.message}</span>
              )}
            </div>

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
              className={styles.continueBtn}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Continue'}
            </button>
          </form>

          <div className={styles.loginLink}>
            <p>If you already have an account,</p>
            <Link to="/login" className={styles.backToLoginLink}>
              Log In
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

export default Signup;
