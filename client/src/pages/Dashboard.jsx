/**
 * @file Dashboard.jsx
 * Admin analytics dashboard with charts and statistics
 */

import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { statisticsAPI } from '../api/statistics';
import styles from '../styles/Dashboard.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * Admin dashboard component with analytics, charts, and event management
 * @component
 * @returns {JSX.Element} Dashboard page component
 */
function Dashboard() {
  const { data: overview } = useQuery({
    queryKey: ['statistics', 'overview'],
    queryFn: statisticsAPI.getOverview,
    refetchInterval: 30000
  });

  const { data: salesByEvent } = useQuery({
    queryKey: ['statistics', 'sales-by-event'],
    queryFn: statisticsAPI.getSalesByEvent,
    refetchInterval: 30000
  });

  const { data: revenueOverTime } = useQuery({
    queryKey: ['statistics', 'revenue-over-time'],
    queryFn: statisticsAPI.getRevenueOverTime,
    refetchInterval: 30000
  });

  const { data: topEvents } = useQuery({
    queryKey: ['statistics', 'top-events'],
    queryFn: statisticsAPI.getTopEvents,
    refetchInterval: 30000
  });

  const { data: eventTypes } = useQuery({
    queryKey: ['statistics', 'event-types'],
    queryFn: statisticsAPI.getEventTypes,
    refetchInterval: 30000
  });

  const { data: recentPurchases } = useQuery({
    queryKey: ['statistics', 'recent-purchases'],
    queryFn: statisticsAPI.getRecentPurchases,
    refetchInterval: 30000
  });

  const salesByEventChartData = {
    labels: salesByEvent?.events?.map(e => e.title) || [],
    datasets: [{
      label: 'Tickets Sold',
      data: salesByEvent?.events?.map(e => e.tickets_sold) || [],
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    }]
  };

  const salesByEventOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  const revenueOverTimeChartData = {
    labels: revenueOverTime?.revenue?.map(r => r.date) || [],
    datasets: [{
      label: 'Revenue ($)',
      data: revenueOverTime?.revenue?.map(r => r.total) || [],
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.4,
      fill: true
    }]
  };

  const revenueOverTimeOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toFixed(2);
          }
        }
      }
    }
  };

  const colors = [
    'rgba(255, 99, 132, 0.6)',
    'rgba(54, 162, 235, 0.6)',
    'rgba(255, 206, 86, 0.6)',
    'rgba(75, 192, 192, 0.6)',
    'rgba(153, 102, 255, 0.6)'
  ];

  const topEventsChartData = {
    labels: topEvents?.events?.map(e => e.title) || [],
    datasets: [{
      data: topEvents?.events?.map(e => e.revenue) || [],
      backgroundColor: colors,
      borderColor: colors.map(c => c.replace('0.6', '1')),
      borderWidth: 1
    }]
  };

  const topEventsOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'right'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return context.label + ': $' + context.parsed.toFixed(2);
          }
        }
      }
    }
  };

  const eventTypesChartData = {
    labels: eventTypes?.types?.map(t => t.type) || [],
    datasets: [{
      data: eventTypes?.types?.map(t => t.count) || [],
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 159, 64, 0.6)'
      ],
      borderWidth: 1
    }]
  };

  const eventTypesOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'right'
      }
    }
  };

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
              {overview?.stats?.totalEvents || '-'}
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>🎫</div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Tickets Sold</div>
            <div className={styles.statValue}>
              {overview?.stats?.totalTicketsSold || '-'}
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
              {overview?.stats?.totalUsers || '-'}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className={styles.chartsContainer}>
        {/* Sales by Event */}
        <div className={styles.chartCard}>
          <h2>Tickets Sold by Event</h2>
          {salesByEvent?.events?.length > 0 ? (
            <Bar data={salesByEventChartData} options={salesByEventOptions} />
          ) : (
            <div className={styles.loading}>No data available</div>
          )}
        </div>

        {/* Revenue Over Time */}
        <div className={styles.chartCard}>
          <h2>Revenue Over Time</h2>
          {revenueOverTime?.revenue?.length > 0 ? (
            <Line data={revenueOverTimeChartData} options={revenueOverTimeOptions} />
          ) : (
            <div className={styles.loading}>No data available</div>
          )}
        </div>

        {/* Top Events */}
        <div className={styles.chartCard}>
          <h2>Top 5 Events by Revenue</h2>
          {topEvents?.events?.length > 0 ? (
            <Pie data={topEventsChartData} options={topEventsOptions} />
          ) : (
            <div className={styles.loading}>No data available</div>
          )}
        </div>

        {/* Event Types Distribution */}
        <div className={styles.chartCard}>
          <h2>Event Types Distribution</h2>
          {eventTypes?.types?.length > 0 ? (
            <Doughnut data={eventTypesChartData} options={eventTypesOptions} />
          ) : (
            <div className={styles.loading}>No data available</div>
          )}
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

export default Dashboard;
