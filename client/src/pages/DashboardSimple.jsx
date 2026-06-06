/**
 * @file DashboardSimple.jsx
 * Simplified dashboard component for testing
 */

import { useQuery } from '@tanstack/react-query';
import { statisticsAPI } from '../api/statistics';
import styles from '../styles/Dashboard.module.css';

/**
 * Simplified dashboard component with basic statistics overview
 * @component
 * @returns {JSX.Element} Simple dashboard page
 */
function DashboardSimple() {
  const { data: overview, isLoading, error } = useQuery({
    queryKey: ['statistics', 'overview'],
    queryFn: statisticsAPI.getOverview,
    refetchInterval: 30000
  });

  console.log('Dashboard rendering...', { overview, isLoading, error });

  if (isLoading) {
    return (
      <div className={styles.dashboardMain}>
        <h1 className={styles.dashboardTitle}>Loading Dashboard...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboardMain}>
        <h1 className={styles.dashboardTitle}>Error Loading Dashboard</h1>
        <p style={{ color: 'red' }}>{error.message}</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboardMain}>
      <h1 className={styles.dashboardTitle}>Statistics Dashboard</h1>

      {/* Quick Stats Cards */}
      <div className={styles.statsCards}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📊</div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Total Events</div>
            <div className={styles.statValue}>
              {overview?.stats?.totalEvents || '0'}
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>🎫</div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Tickets Sold</div>
            <div className={styles.statValue}>
              {overview?.stats?.totalTicketsSold || '0'}
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>💰</div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Total Revenue</div>
            <div className={styles.statValue}>
              ${(overview?.stats?.totalRevenue || 0).toFixed(2)}
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>👥</div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Total Users</div>
            <div className={styles.statValue}>
              {overview?.stats?.totalUsers || '0'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '40px', padding: '20px', background: 'white', border: '1px solid #e0e0e0' }}>
        <h2>Dashboard is working!</h2>
        <p>If you see this, the basic dashboard loads correctly.</p>
        <p>Charts will be added next once we confirm this works.</p>

        <h3 style={{ marginTop: '20px' }}>Raw Data:</h3>
        <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
          {JSON.stringify(overview, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default DashboardSimple;
