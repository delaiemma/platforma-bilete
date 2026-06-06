/**
 * @file Seat.jsx
 * Individual seat button component for seat selection
 */

import styles from '../../styles/SeatMap.module.css';

/**
 * Single seat button component with status-based styling
 * @component
 * @param {Object} props - Component props
 * @param {string} props.row - Row letter identifier (e.g., 'A')
 * @param {number} props.number - Seat number (1-based)
 * @param {string} props.status - Seat status: 'available', 'sold', 'reserved', or 'selected'
 * @param {string} props.zoneColor - Hex color code from the zone
 * @param {string} props.zoneName - Zone display name
 * @param {number} props.price - Price for this zone
 * @param {Function} props.onClick - Callback when user clicks an available or selected seat
 * @returns {JSX.Element} Seat button component
 */
function Seat({ row, number, status, zoneColor, zoneName, price, size, fontSize, accessibility, onClick }) {
  const isSelected = status === 'selected';
  const isClickable = status === 'available' || isSelected;

  let statusClass = styles.seatAvailable;
  let bgColor = zoneColor;

  if (isSelected) {
    statusClass = styles.seatSelected;
    bgColor = undefined;
  } else if (status === 'sold') {
    statusClass = styles.seatSold;
    bgColor = '#9E9E9E';
  } else if (status === 'reserved') {
    statusClass = styles.seatReserved;
    bgColor = '#9E9E9E';
  } else if (accessibility) {
    bgColor = '#7DB9E8';
  }

  const accessibilityNote = accessibility ? ' — Accessibility seat' : '';
  const tooltip = isSelected
    ? `${row}${number} — ${zoneName} $${price} (click to deselect)`
    : status === 'sold'
      ? `${row}${number} — Sold${accessibilityNote}`
      : status === 'reserved'
        ? `${row}${number} — Reserved${accessibilityNote}`
        : `${row}${number} — ${zoneName} $${price}${accessibilityNote}`;

  return (
    <div
      className={`${styles.seat} ${statusClass}`}
      style={{
        ...(bgColor ? { backgroundColor: bgColor } : {}),
        ...(size ? { width: size, height: size } : {}),
        ...(fontSize ? { fontSize } : {})
      }}
      onClick={isClickable ? onClick : undefined}
      title={tooltip}
    >
      {number}
    </div>
  );
}

export default Seat;
