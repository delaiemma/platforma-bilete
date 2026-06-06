/**
 * @file EventCard.jsx
 * Event card component for displaying event information in a grid layout
 */

import { useNavigate } from 'react-router-dom';
import styles from '../../styles/EventCard.module.css';

/**
 * Event card component displaying event summary with image, title, date, location, and price
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.event - Event data object
 * @param {number} props.event.event_id - Unique event identifier
 * @param {string} props.event.title - Event title
 * @param {string} props.event.date - Event date string
 * @param {string} props.event.time - Event time string
 * @param {string} props.event.location - Event location
 * @param {string} props.event.city - Event city
 * @param {string} props.event.image_path - Path to event image
 * @param {number} props.event.price - Event ticket price
 * @param {string} props.event.type - Event type/category
 * @param {boolean} props.event.has_seating - Whether event has seating options
 * @returns {JSX.Element} Event card component
 */
function EventCard({ event }) {
  const navigate = useNavigate();

  const imagePath = event.image_path ? `/images/${event.image_path}` : '/images/banner1.jpg';
  const isFree = parseFloat(event.price) === 0;
  const price = isFree ? 'Free' : event.has_seating ? `from $${event.price}` : `$${event.price}`;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    if (timeString.includes(':') && !timeString.includes('T')) {
      return timeString.substring(0, 5);
    }
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formattedDate = formatDate(event.date);
  const formattedTime = formatTime(event.time);

  const handleClick = () => {
    navigate(`/event/${event.event_id}`);
  };

  return (
    <div className={styles.eventCard} onClick={handleClick}>
      <img
        src={imagePath}
        alt={event.title}
        className={styles.eventImage}
        onError={(e) => { e.target.src = '/images/banner1.jpg'; }}
      />
      <div className={styles.eventContent}>
        <h3 className={styles.eventTitle}>{event.title}</h3>
        <div className={styles.eventDate}>{formattedDate} • {formattedTime}</div>
        <div className={styles.eventLocation}>{event.location}, {event.city}</div>
        <div className={`${styles.eventPrice} ${isFree ? styles.free : ''}`}>
          Price: {price}
        </div>
        <span className={styles.eventType}>{event.type}</span>
      </div>
    </div>
  );
}

export default EventCard;
