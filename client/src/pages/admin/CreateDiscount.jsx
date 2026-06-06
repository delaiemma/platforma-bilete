/**
 * @file CreateDiscount.jsx
 * Admin page for creating new discount codes
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import Header from '../../components/layout/Header';
import styles from '../../styles/Discounts.module.css';

/**
 * Create Discount admin page component for adding new discount codes
 * @component
 * @returns {JSX.Element|null} Create discount page or null if not authorized
 */
function CreateDiscount() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuthStore();

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    validFrom: '',
    validUntil: '',
    firstPurchaseOnly: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || !isAdmin()) {
      navigate('/');
    }
  }, [user, isAdmin, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.code.trim()) {
      setError('Discount code is required');
      return;
    }

    if (!formData.discountValue || parseFloat(formData.discountValue) <= 0) {
      setError('Discount value must be greater than 0');
      return;
    }

    if (formData.discountType === 'percentage' && parseFloat(formData.discountValue) > 100) {
      setError('Percentage discount cannot exceed 100%');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim() || null,
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        validFrom: formData.validFrom || null,
        validUntil: formData.validUntil || null,
        maxUses: null,
        firstPurchaseOnly: formData.firstPurchaseOnly,
        isActive: true
      };

      await axios.post('http://localhost:3000/api/discounts', payload);
      navigate('/admin/discounts');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create discount code');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.discountsContainer}>
      <Header />

      <main className={styles.discountsMain}>
        <div className={styles.formContainer}>
          <h1 className={styles.formTitle}>Create Discount Code</h1>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="code">Discount Code *</label>
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="SUMMER2026"
                required
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="25% summer special discount"
                rows="3"
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="discountType">Discount Type *</label>
                <select
                  id="discountType"
                  name="discountType"
                  value={formData.discountType}
                  onChange={handleChange}
                  required
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed_amount">Fixed Amount ($)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="discountValue">
                  Discount Value * {formData.discountType === 'percentage' ? '(%)' : '($)'}
                </label>
                <input
                  type="number"
                  id="discountValue"
                  name="discountValue"
                  value={formData.discountValue}
                  onChange={handleChange}
                  placeholder={formData.discountType === 'percentage' ? '10' : '50.00'}
                  step={formData.discountType === 'percentage' ? '1' : '0.01'}
                  min="0"
                  max={formData.discountType === 'percentage' ? '100' : undefined}
                  required
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="validFrom">Valid From</label>
                <input
                  type="datetime-local"
                  id="validFrom"
                  name="validFrom"
                  value={formData.validFrom}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="validUntil">Valid Until</label>
                <input
                  type="datetime-local"
                  id="validUntil"
                  name="validUntil"
                  value={formData.validUntil}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '15px', cursor: 'pointer', whiteSpace: 'nowrap', marginLeft: '5px' }}>
                <input
                  type="checkbox"
                  name="firstPurchaseOnly"
                  checked={formData.firstPurchaseOnly}
                  onChange={handleChange}
                />
                <span>First-time customers only</span>
              </label>
            </div>

            <div className={styles.buttonGroup}>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() => navigate('/admin/discounts')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`${styles.btn} ${styles.btnPrimary}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Discount Code'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default CreateDiscount;
