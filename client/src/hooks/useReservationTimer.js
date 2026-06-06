/**
 * @file useReservationTimer.js
 * Custom hook for managing ticket reservation countdown timer
 */

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { cartAPI } from '../api/cart';
import { seatsAPI } from '../api/seats';

/**
 * Custom hook for tracking reservation expiration timer
 * @hook
 * @returns {Object} Reservation timer state
 * @returns {number|null} return.timeRemaining - Time remaining in milliseconds
 * @returns {string|null} return.formattedTime - Formatted time string (MM:SS)
 * @returns {boolean} return.hasReservations - Whether user has active reservations
 * @description Monitors cart and seat reservations, automatically invalidates queries when expired
 */
export const useReservationTimer = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [timeRemaining, setTimeRemaining] = useState(null);

  const { data: cartData } = useQuery({
    queryKey: ['cart-reservations', user?.id],
    queryFn: () => cartAPI.getReservations(user.id),
    enabled: !!user,
    refetchInterval: 10000
  });

  const { data: seatData } = useQuery({
    queryKey: ['seat-reservations', user?.id],
    queryFn: () => seatsAPI.getUserReservations(user.id),
    enabled: !!user,
    refetchInterval: 10000
  });

  const cartReservations = cartData?.reservations || [];
  const seatReservations = seatData?.reservations || [];

  const reservations = [...cartReservations, ...seatReservations];

  useEffect(() => {
    if (!reservations || reservations.length === 0) {
      setTimeRemaining(null);
      return;
    }

    const earliestExpiry = Math.min(
      ...reservations.map(r => new Date(r.expires_at).getTime())
    );

    const updateTimer = () => {
      const remaining = earliestExpiry - Date.now();

      if (remaining <= 0) {
        queryClient.invalidateQueries(['cart']);
        queryClient.invalidateQueries(['reservations']);
        queryClient.invalidateQueries(['events']);
        setTimeRemaining(0);
      } else {
        setTimeRemaining(remaining);
      }
    };

    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [reservations, queryClient]);

  const formatTime = (ms) => {
    if (ms === null || ms <= 0) return null;

    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    timeRemaining,
    formattedTime: formatTime(timeRemaining),
    hasReservations: reservations && reservations.length > 0
  };
};
