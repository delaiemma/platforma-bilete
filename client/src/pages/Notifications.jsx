import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { waitlistAPI } from '../api/waitlist';
import styles from '../styles/Notifications.module.css';

function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await waitlistAPI.getNotifications();
        setNotifications(data.notifications || []);
        await waitlistAPI.markRead();
      } catch (err) {
        console.error('Error loading notifications:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <div className={styles.container}><p>Loading...</p></div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Notifications</h1>
      {notifications.length === 0 ? (
        <p className={styles.empty}>No notifications yet.</p>
      ) : (
        <div className={styles.list}>
          {notifications.map(n => (
            <div
              key={n.notification_id}
              className={`${styles.card} ${n.is_read ? styles.read : styles.unread}`}
            >
              <p className={styles.message}>{n.message}</p>
              <p className={styles.time}>
                {new Date(n.created_at).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </p>
              {n.event_id && (
                <button
                  className={styles.viewBtn}
                  onClick={() => navigate(`/events/${n.event_id}`)}
                >
                  View Event →
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;
