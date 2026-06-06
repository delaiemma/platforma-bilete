/**
 * @file SeatMapModal.jsx
 * Modal wrapper component for seat selection interface
 */

import { useEffect } from 'react';
import SeatMap from './SeatMap';
import styles from '../../styles/SeatMapModal.module.css';

/**
 * Modal wrapper for seat map component with backdrop and keyboard controls
 * @component
 * @param {Object} props - Component props
 * @param {number} props.eventId - Event ID for seat selection
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Callback to close the modal
 * @param {Function} props.onSeatsConfirmed - Callback when seats are confirmed
 * @returns {JSX.Element|null} Seat map modal or null if closed
 */
function SeatMapModal({ eventId, isOpen, onClose, onSeatsConfirmed }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSeatsConfirmed = (selectedSeats) => {
    onSeatsConfirmed(selectedSeats);
    onClose();
  };

  return (
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          ✕
        </button>
        <SeatMap eventId={eventId} onSeatsConfirmed={handleSeatsConfirmed} />
      </div>
    </div>
  );
}

export default SeatMapModal;
