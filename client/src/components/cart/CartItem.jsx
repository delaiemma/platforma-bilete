/**
 * @file CartItem.jsx
 * Cart item component for displaying individual event items in the shopping cart
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import styles from '../../styles/CartItem.module.css';

/**
 * Cart item component displaying event information with quantity controls
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.event - Event data object
 * @param {number} props.event.event_id - Unique event identifier
 * @param {string} props.event.title - Event title
 * @param {string} props.event.date - Event date
 * @param {string} props.event.time - Event time
 * @param {string} props.event.location - Event location
 * @param {string} props.event.city - Event city
 * @param {string} props.event.image_path - Path to event image
 * @param {number} props.event.price - Event ticket price
 * @param {number} props.event.available_tickets - Number of available tickets
 * @param {number} props.quantity - Quantity of tickets in cart
 * @param {boolean} props.selected - Whether item is selected for purchase
 * @param {Function} props.onToggleSelect - Callback to toggle item selection
 * @returns {JSX.Element} Cart item component
 */
function CartItem({ event, quantity, selected, onToggleSelect }) {
  const navigate = useNavigate();
  const { updateQuantity, removeItem } = useCartStore();
  const [isUpdating, setIsUpdating] = useState(false);

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

  const handleQuantityChange = async (change) => {
    if (isUpdating) return;

    const newQuantity = quantity + change;
    if (newQuantity < 1) return;

    if (newQuantity > event.available_tickets) {
      alert(`Only ${event.available_tickets} tickets available`);
      return;
    }

    setIsUpdating(true);
    try {
      await updateQuantity(event.event_id, change);
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (confirm('Remove this item from cart?')) {
      try {
        await removeItem(event.event_id);
      } catch (error) {
        console.error('Error removing item:', error);
        alert('Failed to remove item');
      }
    }
  };

  const imagePath = event.image_path ? `/images/${event.image_path}` : '/images/banner1.jpg';
  const price = parseFloat(event.price) === 0 ? 'Free' : `$${event.price}`;
  const subtotal = parseFloat(event.price) * quantity;

  return (
    <div className={styles.cartItem}>
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onToggleSelect(event.event_id)}
        className={styles.checkbox}
      />

      <img
        src={imagePath}
        alt={event.title}
        className={styles.image}
        onClick={() => navigate(`/event/${event.event_id}`)}
        onError={(e) => { e.target.src = '/images/banner1.jpg'; }}
      />

      <div className={styles.details}>
        <h3
          className={styles.title}
          onClick={() => navigate(`/event/${event.event_id}`)}
        >
          {event.title}
        </h3>
        <div className={styles.info}>
          <span>{formatDate(event.date)} • {formatTime(event.time)}</span>
        </div>
        <div className={styles.info}>
          <span>📍 {event.location}, {event.city}</span>
        </div>
        <div className={styles.price}>Price: {price}</div>
      </div>

      <div className={styles.controls}>
        <div className={styles.quantityControl}>
          <button
            onClick={() => handleQuantityChange(-1)}
            disabled={isUpdating || quantity <= 1}
            className={styles.quantityBtn}
          >
            −
          </button>
          <span className={styles.quantity}>{quantity}</span>
          <button
            onClick={() => handleQuantityChange(1)}
            disabled={isUpdating}
            className={styles.quantityBtn}
          >
            +
          </button>
        </div>

        <div className={styles.subtotal}>
          ${subtotal.toFixed(2)}
        </div>

        <button
          onClick={handleRemove}
          className={styles.removeBtn}
          title="Remove from cart"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

export default CartItem;
