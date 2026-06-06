/**
 * @file DashboardFinal.jsx
 * Final production dashboard component
 */

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { statisticsAPI } from '../api/statistics';
import { useSocket } from '../hooks/useSocket';
import styles from '../styles/Dashboard.module.css';

/**
 * Final production dashboard component with statistics and recent purchases
 * @component
 * @returns {JSX.Element} Final dashboard page
 */
function DashboardFinal() {
  const queryClient = useQueryClient();
  const socket = useSocket();

  const { data: overview } = useQuery({
    queryKey: ['statistics', 'overview'],
    queryFn: statisticsAPI.getOverview,
    refetchInterval: 30000
  });

  const { data: recentPurchases } = useQuery({
    queryKey: ['statistics', 'recent-purchases'],
    queryFn: statisticsAPI.getRecentPurchases,
    refetchInterval: 30000
  });

  useEffect(() => {
    if (!socket) return;

    const handleEventCreated = (data) => {
      console.log('📡 [Dashboard] Event created:', data);
      queryClient.invalidateQueries(['statistics', 'overview']);
    };

    const handleEventDeleted = (data) => {
      console.log('📡 [Dashboard] Event deleted:', data);
      queryClient.invalidateQueries(['statistics', 'overview']);
    };

    const handleTicketsUpdated = (data) => {
      console.log('📡 [Dashboard] Tickets updated:', data);
      queryClient.invalidateQueries(['statistics', 'overview']);
      queryClient.invalidateQueries(['statistics', 'recent-purchases']);
    };

    const handleUserRegistered = (data) => {
      console.log('📡 [Dashboard] User registered:', data);
      queryClient.invalidateQueries(['statistics', 'overview']);
    };

    const attachListeners = () => {
      if (!socket.socket) return;
      console.log('🎧 [Dashboard] Attaching event listeners...');
      socket.socket.on('event-created', handleEventCreated);
      socket.socket.on('event-deleted', handleEventDeleted);
      socket.socket.on('tickets-updated', handleTicketsUpdated);
      socket.socket.on('user-registered', handleUserRegistered);
      console.log('✅ [Dashboard] Listeners attached');
    };

    if (socket.socket?.connected) {
      console.log('🔌 [Dashboard] Socket already connected, attaching listeners immediately');
      attachListeners();
    }

    if (socket.socket) {
      socket.socket.on('connect', () => {
        console.log('🔌 [Dashboard] Socket connected, attaching listeners');
        attachListeners();
      });
    }

    return () => {
      console.log('🧹 [Dashboard] Cleaning up listeners');
      if (socket.socket) {
        socket.socket.off('connect', attachListeners);
        socket.socket.off('event-created', handleEventCreated);
        socket.socket.off('event-deleted', handleEventDeleted);
        socket.socket.off('tickets-updated', handleTicketsUpdated);
        socket.socket.off('user-registered', handleUserRegistered);
      }
    };
  }, [socket, queryClient]);

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

      {/* Charts Placeholder - Note about charts */}
      <div className={styles.chartsPlaceholder}>
        <div className={styles.chartNote}>
          <h2>📈 Analytics Charts</h2>
          <p>Statistical charts (Bar, Line, Pie, Doughnut) are available in the legacy version.</p>
          <p>This React version focuses on core statistics and recent activity.</p>
        </div>
      </div>

      {/* Recent Purchases Table */}
      <div className={styles.tableCard}>
        <h2>Recent Purchases</h2>
        <div className={styles.tableContainer}>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>User</th>
                <th>Event</th>
                <th>Quantity</th>
                <th>Total Price</th>
              </tr>
            </thead>
            <tbody>
              {recentPurchases?.purchases?.length > 0 ? (
                recentPurchases.purchases.map((purchase, index) => (
                  <tr key={index}>
                    <td>{new Date(purchase.purchase_date).toLocaleDateString()}</td>
                    <td>{purchase.user_email}</td>
                    <td>{purchase.event_title}</td>
                    <td>{purchase.quantity}</td>
                    <td>${parseFloat(purchase.total_price).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className={styles.loading}>
                    {recentPurchases ? 'No purchases yet' : 'Loading...'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DashboardFinal;
