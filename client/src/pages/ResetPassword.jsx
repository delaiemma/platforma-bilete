/**
 * @file ResetPassword.jsx
 * Password reset page component
 */

import { useForm } from 'react-hook-form';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/Login.module.css';

/**
 * Reset password page component for setting new password via reset token
 * @component
 * @returns {JSX.Element} Reset password page component
 */
function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const newPassword = watch('newPassword');

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/api/user/reset-password', {
        token: token,
        newPassword: data.newPassword
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to reset password. The link may have expired.');
      }
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
          <h1 className={styles.loginTitle}>Create New Password</h1>

          {success ? (
            <div className={styles.successMessage}>
              <h3>Password reset successful!</h3>
              <p>Your password has been updated successfully.</p>
              <p>Redirecting to login page...</p>
            </div>
          ) : (
            <>
              <p className={styles.forgotPasswordText}>
                Please enter your new password below.
              </p>

              {error && (
                <div className={styles.errorMessage}>
                  {error}
                </div>
              )}

              <form className={styles.loginForm} onSubmit={handleSubmit(onSubmit)}>
                <div className={styles.formGroup}>
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    {...register('newPassword', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                  />
                  {errors.newPassword && (
                    <span className={styles.error}>{errors.newPassword.message}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) =>
                        value === newPassword || 'Passwords do not match'
                    })}
                  />
                  {errors.confirmPassword && (
                    <span className={styles.error}>{errors.confirmPassword.message}</span>
                  )}
                </div>

                <button
                  type="submit"
                  className={styles.connectBtn}
                  disabled={loading || !token}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword;
