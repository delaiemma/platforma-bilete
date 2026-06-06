/**
 * @file ReservationTimer.jsx
 * Countdown timer component for ticket reservations
 */

import { useReservationTimer } from '../../hooks/useReservationTimer';
import styles from '../../styles/CartNew.module.css';

/**
 * Reservation timer component displaying countdown for reserved tickets
 * @component
 * @returns {JSX.Element|null} Timer component or null if no active reservations
 */
function ReservationTimer() {
  const { timeRemaining, formattedTime, hasReservations } = useReservationTimer();

  if (!hasReservations) return null;

  const isWarning = timeRemaining !== null && timeRemaining <= 60000;

  return (
    <div className={styles.reservationTimer}>
      <h3>Reservation Timer</h3>
      <p>Your tickets are reserved for:</p>
      <div className={styles.countdownDisplay}>
        <span className={`${styles.timeRemaining} ${isWarning ? styles.warning : ''}`}>
          {formattedTime}
        </span>
      </div>
      <p className={styles.timerWarning}>Complete your purchase before time runs out!</p>
    </div>
  );
}

export default ReservationTimer;
