/**
 * @file ManageDiscounts.jsx
 * Admin page for managing discount codes
 */

import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import Header from '../../components/layout/Header';
import styles from '../../styles/Discounts.module.css';

/**
 * Discounts API utility object
 * @constant
 */
const discountsAPI = {
  getAll: async () => {
    const { data } = await axios.get('http://localhost:3000/api/discounts');
    return data;
  },
  delete: async (id) => {
    const { data } = await axios.delete(`http://localhost:3000/api/discounts/${id}`);
    return data;
  }
};

/**
 * Manage Discounts admin page component for viewing and deleting discount codes
 * @component
 * @returns {JSX.Element|null} Manage discounts page or null if not authorized
 */
function ManageDiscounts() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user || !isAdmin()) {
      navigate('/');
    }
  }, [user, isAdmin, navigate]);

  const { data: discountsData, isLoading } = useQuery({
    queryKey: ['discounts'],
    queryFn: discountsAPI.getAll
  });

  const deleteMutation = useMutation({
    mutationFn: discountsAPI.delete,
    onSuccess: () => queryClient.invalidateQueries(['discounts'])
  });

  const discounts = discountsData?.discounts || [];

  const handleDelete = async (codeId, code) => {
    if (!window.confirm(`Delete discount code "${code}"? This cannot be undone.`)) return;
    try {
      await deleteMutation.mutateAsync(codeId);
    } catch (err) {
      alert(err.message);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No expiration';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className={styles.discountsContainer}>
        <header className={styles.discountsHeader}>
          <Link to="/" className={styles.logo}>
            Ticket
          </Link>
        </header>
        <main className={styles.discountsMain}>
          <p className={styles.loading}>Loading discount codes...</p>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.discountsContainer}>
      <Header />

      <main className={styles.discountsMain}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.pageTitle}>Discount Codes</h1>
            <p className={styles.pageSubtitle}>Manage promotional codes and special offers</p>
          </div>
          <Link to="/admin/discounts/create" className={`${styles.btn} ${styles.btnPrimary}`}>
            + Create Discount Code
          </Link>
        </div>

        {discounts.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🎫</div>
            <p>No discount codes yet. Create one to start offering promotions.</p>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Value</th>
                  <th>Uses</th>
                  <th>Valid Until</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {discounts.map(discount => (
                  <tr key={discount.code_id}>
                    <td>
                      <strong style={{ fontFamily: 'monospace', fontSize: '14px' }}>
                        {discount.code}
                      </strong>
                      {discount.description && (
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                          {discount.description}
                        </div>
                      )}
                    </td>
                    <td>
                      {discount.discount_type === 'percentage'
                        ? `${discount.discount_value}%`
                        : `$${parseFloat(discount.discount_value).toFixed(2)}`
                      }
                    </td>
                    <td>
                      {discount.current_uses || 0}
                    </td>
                    <td>{formatDate(discount.valid_until)}</td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button
                          className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}
                          onClick={() => navigate(`/admin/discounts/${discount.code_id}/edit`)}
                        >
                          Edit
                        </button>
                        <button
                          className={`${styles.btn} ${styles.btnDanger} ${styles.btnSmall}`}
                          onClick={() => handleDelete(discount.code_id, discount.code)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default ManageDiscounts;
