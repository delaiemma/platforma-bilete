/**
 * @file Profile.jsx
 * User profile management page component
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { userAPI } from '../api/user';
import styles from '../styles/Auth.module.css';

/**
 * Profile page component for managing user account information and password
 * @component
 * @returns {JSX.Element|null} Profile page component or null if not authenticated
 */
function Profile() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setName(user.name || '');
    setEmail(user.email || '');
  }, [user, navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileLoading(true);

    try {
      const data = await userAPI.updateProfile({ name, email });

      if (data.success) {
        updateUser(data.user);
        setName(data.user.name);
        setEmail(data.user.email);
        setShowProfilePopup(true);
      } else {
        setProfileError(data.message || 'Failed to update profile');
      }
      setProfileLoading(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setProfileError(error.message || 'Failed to update profile. Please try again.');
      setProfileLoading(false);
    }
  };

  const closeProfilePopup = () => {
    setShowProfilePopup(false);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError('New password must be different from current password');
      return;
    }

    setPasswordLoading(true);

    try {
      const data = await userAPI.updatePassword({ currentPassword, newPassword });

      if (data.success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordPopup(true);
      } else {
        setPasswordError(data.message || 'Failed to update password');
      }
      setPasswordLoading(false);
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordError(error.message || 'Failed to update password. Please try again.');
      setPasswordLoading(false);
    }
  };

  const closePasswordPopup = () => {
    setShowPasswordPopup(false);
  };

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1 className={styles.authTitle}>My Account</h1>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'profile' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'password' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('password')}
          >
            Change Password
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleUpdateProfile} className={styles.authForm}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>Name</label>
              <input
                id="name"
                type="text"
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>Email</label>
              <input
                id="email"
                type="email"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {profileError && <div className={styles.error}>{profileError}</div>}

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={profileLoading}
            >
              {profileLoading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <form onSubmit={handleUpdatePassword} className={styles.authForm}>
            <div className={styles.formGroup}>
              <label htmlFor="currentPassword" className={styles.label}>Current Password</label>
              <input
                id="currentPassword"
                type="password"
                className={styles.input}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="newPassword" className={styles.label}>New Password</label>
              <input
                id="newPassword"
                type="password"
                className={styles.input}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>Confirm New Password</label>
              <input
                id="confirmPassword"
                type="password"
                className={styles.input}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {passwordError && <div className={styles.error}>{passwordError}</div>}

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={passwordLoading}
            >
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}

        {/* Sign Out Button */}
        <div className={styles.signOutSection}>
          <button onClick={handleSignOut} className={styles.signOutBtn}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Profile Update Success Popup */}
      {showProfilePopup && (
        <div className={styles.successPopup}>
          <div className={styles.popupContent}>
            <button className={styles.closeBtn} onClick={closeProfilePopup}>×</button>
            <h2>Profile updated successfully!</h2>
            <p>Your profile information has been updated.</p>
          </div>
        </div>
      )}

      {/* Password Update Success Popup */}
      {showPasswordPopup && (
        <div className={styles.successPopup}>
          <div className={styles.popupContent}>
            <button className={styles.closeBtn} onClick={closePasswordPopup}>×</button>
            <h2>Password updated successfully!</h2>
            <p>Your password has been changed. Please use your new password for future logins.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
