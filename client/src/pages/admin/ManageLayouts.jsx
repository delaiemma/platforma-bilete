/**
 * @file ManageLayouts.jsx
 * Admin page for managing seat layouts
 */

import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { layoutsAPI } from '../../api/layouts';
import { useAuthStore } from '../../store/authStore';
import styles from '../../styles/Layouts.module.css';

/**
 * Manage Layouts admin page component for viewing and deleting seat layouts
 * @component
 * @returns {JSX.Element|null} Manage layouts page or null if not authorized
 */
function ManageLayouts() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuthStore();
  const queryClient = useQueryClient();

  if (!user || !isAdmin()) {
    navigate('/');
    return null;
  }

  const { data: layoutsData, isLoading } = useQuery({
    queryKey: ['layouts'],
    queryFn: layoutsAPI.getAll
  });

  const deleteMutation = useMutation({
    mutationFn: layoutsAPI.delete,
    onSuccess: () => queryClient.invalidateQueries(['layouts'])
  });

  const layouts = layoutsData?.layouts || [];

  const handleDelete = async (layoutId, layoutName) => {
    if (!window.confirm(`Delete layout "${layoutName}"? This cannot be undone.`)) return;
    try {
      await deleteMutation.mutateAsync(layoutId);
    } catch (err) {
      alert(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <p style={{ fontStyle: 'italic', color: '#888' }}>Loading layouts...</p>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>Venue Layouts</h1>
          <p className={styles.pageSubtitle}>Manage reusable seat layouts for your events</p>
        </div>
        <Link to="/admin/layouts/create" className={`${styles.btn} ${styles.btnPrimary}`}>
          + Create Layout
        </Link>
      </div>

      {layouts.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🪑</div>
          <p>No layouts yet. Create one to enable seat selection for your events.</p>
        </div>
      ) : (
        <div className={styles.cardsGrid}>
          {layouts.map(layout => (
            <div key={layout.layout_id} className={styles.card}>
              <h3 className={styles.cardTitle}>{layout.name}</h3>
              <p className={styles.cardDesc}>{layout.description || '—'}</p>
              <p className={styles.cardMeta}>
                {layout.zone_count || 0} zone(s) · {layout.row_count || 0} row(s)
              </p>
              <div className={styles.cardActions}>
                <button
                  className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}
                  onClick={() => navigate(`/admin/layouts/${layout.layout_id}`)}
                >
                  Edit
                </button>
                <button
                  className={`${styles.btn} ${styles.btnDanger} ${styles.btnSmall}`}
                  onClick={() => handleDelete(layout.layout_id, layout.name)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ManageLayouts;
