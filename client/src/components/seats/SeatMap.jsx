/**
 * @file SeatMap.jsx
 * Interactive seat selection map component
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { seatsAPI } from '../../api/seats';
import { useAuthStore } from '../../store/authStore';
import { useEventRoom } from '../../hooks/useSocket';
import Seat from './Seat';
import styles from '../../styles/SeatMap.module.css';

/**
 * Interactive seat map component for selecting event seats
 * @component
 * @param {Object} props - Component props
 * @param {number} props.eventId - Event ID to display seats for
 * @param {Function} props.onSeatsConfirmed - Callback with selected seats when user confirms selection
 * @returns {JSX.Element} Seat map component with interactive seat selection
 */
function SeatMap({ eventId, onSeatsConfirmed }) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [recCount, setRecCount] = useState(2);
  const [recBudget, setRecBudget] = useState('');
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState('');
  const [pendingAccessibilitySeat, setPendingAccessibilitySeat] = useState(null);

  const socket = useEventRoom(eventId);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['seatAvailability', eventId, user?.id],
    queryFn: () => seatsAPI.getAvailability(eventId, user?.id),
    refetchInterval: 10000
  });

  useEffect(() => {
    setSelectedSeats([]);
  }, [eventId]);

  useEffect(() => {
    if (!eventId || !socket || !socket.socket) return;

    const handleSeatsReserved = (data) => {
      console.log('📡 [SeatMap] Received seats-reserved:', data);
      if (data.eventId === parseInt(eventId)) {
        queryClient.invalidateQueries(['seatAvailability', eventId, user?.id]);
      }
    };

    const handleSeatsReleased = (data) => {
      console.log('📡 [SeatMap] Received seats-released:', data);
      if (data.eventId === parseInt(eventId)) {
        queryClient.invalidateQueries(['seatAvailability', eventId, user?.id]);
      }
    };

    socket.socket.on('seats-reserved', handleSeatsReserved);
    socket.socket.on('seats-released', handleSeatsReleased);

    return () => {
      socket.socket.off('seats-reserved', handleSeatsReserved);
      socket.socket.off('seats-released', handleSeatsReleased);
    };
  }, [eventId, socket, queryClient, user?.id]);

  const layout = data?.layout;
  const availability = data?.availability || {};

  const zoneMap = {};
  if (layout?.zones) {
    layout.zones.forEach(z => {
      zoneMap[z.zone_id] = { name: z.name, color: z.color, price: parseFloat(z.price) || 0 };
    });
  }

  const getSeatStatus = useCallback((rowLetter, seatNumber) => {
    const key = `${rowLetter}-${seatNumber}`;

    if (selectedSeats.some(s => s.row === rowLetter && s.number === seatNumber)) {
      return 'selected';
    }

    const info = availability[key];
    if (!info) return 'available';
    return info.status;
  }, [availability, selectedSeats]);

  const doSelectSeat = (rowLetter, seatNumber, zoneId) => {
    const zone = zoneMap[zoneId];
    setSelectedSeats(prev => [...prev, {
      row: rowLetter,
      number: seatNumber,
      zone_id: zoneId,
      zone_name: zone?.name || '',
      price: zone?.price || 0
    }]);
  };

  const handleSeatClick = (rowLetter, seatNumber, zoneId) => {
    const key = `${rowLetter}-${seatNumber}`;
    const status = availability[key]?.status;
    const isAccessibility = availability[key]?.accessibility;

    if (status === 'sold' || status === 'reserved') return;

    const isCurrentlySelected = selectedSeats.some(s => s.row === rowLetter && s.number === seatNumber);

    if (isCurrentlySelected) {
      setSelectedSeats(prev => prev.filter(s => !(s.row === rowLetter && s.number === seatNumber)));
      return;
    }

    if (isAccessibility) {
      setPendingAccessibilitySeat({ rowLetter, seatNumber, zoneId });
      return;
    }

    doSelectSeat(rowLetter, seatNumber, zoneId);
  };

  const handleConfirmAccessibility = () => {
    if (pendingAccessibilitySeat) {
      const { rowLetter, seatNumber, zoneId } = pendingAccessibilitySeat;
      doSelectSeat(rowLetter, seatNumber, zoneId);
      setPendingAccessibilitySeat(null);
    }
  };

  const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  const maxSeatsInRow = layout ? Math.max(...layout.rows.map(r => r.seats_in_row)) : 20;
  const seatGap = maxSeatsInRow > 25 ? 2 : 4;
  const seatSize = Math.min(32, Math.max(18, Math.floor((840 - 36 - (maxSeatsInRow - 1) * seatGap) / maxSeatsInRow)));
  const seatFontSize = Math.max(8, Math.floor(seatSize * 0.38));

  const handleRecommend = async () => {
    setRecError('');
    setRecLoading(true);
    try {
      const result = await seatsAPI.recommend(eventId, recCount, recBudget || null);
      if (result.success) {
        setSelectedSeats(result.seats);
      } else {
        setRecError(result.message);
      }
    } catch (err) {
      setRecError('Could not find seats. Try different criteria.');
    } finally {
      setRecLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (selectedSeats.length === 0) return;
    onSeatsConfirmed(selectedSeats);
  };

  if (isLoading) {
    return <div className={styles.infoMessage}>Loading seat map...</div>;
  }

  if (isError || !layout) {
    return <div className={styles.infoMessage}>Could not load seat map.</div>;
  }

  return (
    <div className={styles.seatMapContainer}>
      <div className={styles.seatMapHeader}>
        <h3 className={styles.seatMapTitle}>Select Your Seats</h3>
        <p className={styles.summary}>
          {selectedSeats.length} seat(s) selected —{' '}
          <span className={styles.summaryPrice}>${totalPrice.toFixed(2)}</span>
        </p>
      </div>

      <div className={styles.recommendBox}>
        <p className={styles.recommendTitle}>Find seats automatically</p>
        <div className={styles.recommendForm}>
          <div className={styles.recommendField}>
            <label className={styles.recommendLabel}>Seats</label>
            <input
              type="number"
              min="1"
              max="10"
              value={recCount}
              onChange={e => setRecCount(parseInt(e.target.value) || 1)}
              className={styles.recommendInput}
            />
          </div>
          <div className={styles.recommendField}>
            <label className={styles.recommendLabel}>Max budget ($)</label>
            <input
              type="number"
              min="0"
              placeholder="Any"
              value={recBudget}
              onChange={e => setRecBudget(e.target.value)}
              className={styles.recommendInput}
            />
          </div>
          <button
            className={styles.recommendBtn}
            onClick={handleRecommend}
            disabled={recLoading}
          >
            {recLoading ? 'Searching...' : 'Find seats'}
          </button>
        </div>
        {recError && <p className={styles.recommendError}>{recError}</p>}
      </div>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={`${styles.legendDot} ${styles.legendSelected}`} />
          Your Selection
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendDot} ${styles.legendSold}`} />
          Sold
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendDot} style={{ backgroundColor: '#7DB9E8' }} />
          Accessibility seat
        </div>
      </div>

      <div className={styles.legend}>
        {layout.zones.map(z => (
          <div key={z.zone_id} className={styles.legendItem}>
            <div className={styles.legendDot} style={{ backgroundColor: z.color }} />
            {z.name} — ${parseFloat(z.price).toFixed(2)}
          </div>
        ))}
      </div>

      <div className={styles.stageWrapper}>
        <div className={styles.stage}>Stage</div>
      </div>

      <div className={styles.seatGrid} style={{ gap: seatGap }}>
        {layout.rows.map(row => (
          <div key={row.row_letter} className={styles.seatRow} style={{ gap: seatGap }}>
            <span className={styles.rowLabel} style={{ fontSize: Math.max(10, seatSize * 0.45) }}>{row.row_letter}</span>
            {[...Array(row.seats_in_row)].map((_, idx) => {
              const seatNum = idx + 1;
              const zone = zoneMap[row.zone_id] || {};
              return (
                <Seat
                  key={seatNum}
                  row={row.row_letter}
                  number={seatNum}
                  status={getSeatStatus(row.row_letter, seatNum)}
                  zoneColor={zone.color}
                  zoneName={zone.name}
                  price={zone.price}
                  size={seatSize}
                  fontSize={seatFontSize}
                  accessibility={availability[`${row.row_letter}-${seatNum}`]?.accessibility}
                  onClick={() => handleSeatClick(row.row_letter, seatNum, row.zone_id)}
                />
              );
            })}
          </div>
        ))}
      </div>

      {selectedSeats.length > 0 && (
        <div className={styles.selectedSeatsList}>
          {selectedSeats.map(s => (
            <span key={`${s.row}${s.number}`} className={styles.seatBadge}>
              {s.row}{s.number} <span className={styles.seatBadgeZone}>({s.zone_name})</span>
            </span>
          ))}
        </div>
      )}

      <div className={styles.addToCartSection}>
        <button
          className={styles.addToCartBtn}
          disabled={selectedSeats.length === 0}
          onClick={handleAddToCart}
        >
          Add {selectedSeats.length} Seat{selectedSeats.length !== 1 ? 's' : ''} to Cart — ${totalPrice.toFixed(2)}
        </button>
      </div>

      {pendingAccessibilitySeat && (
        <div className={styles.accessibilityOverlay}>
          <div className={styles.accessibilityDialog}>
            <p className={styles.accessibilityDialogText}>
              This seat is reserved for people with disabilities.
            </p>
            <p className={styles.accessibilityDialogSub}>
              Please confirm that you require an accessible seat.
            </p>
            <div className={styles.accessibilityDialogActions}>
              <button className={styles.accessibilityConfirmBtn} onClick={handleConfirmAccessibility}>
                I confirm
              </button>
              <button className={styles.accessibilityCancelBtn} onClick={() => setPendingAccessibilitySeat(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SeatMap;
