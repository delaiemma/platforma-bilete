/**
 * @file EventDetails.jsx
 * Event details page component (legacy version)
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useFavorites } from '../hooks/useFavorites';
import { eventsAPI } from '../api/events';
import { useEventRoom } from '../hooks/useSocket';
import styles from '../styles/EventDetails.module.css';

/**
 * Event details page component showing event information and ticket purchasing
 * @component
 * @returns {JSX.Element} Event details page component
 */
function EventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['events', eventId],
    queryFn: () => eventsAPI.getById(eventId),
    enabled: !!eventId
  });

  console.log('🎯 EventDetails rendering, eventId:', eventId);
  const socket = useEventRoom(eventId);
  console.log('🎯 Socket service returned:', socket);

  useEffect(() => {
    console.log('🎯 useEffect running for tickets-updated listener');
    if (!eventId) {
      console.log('🎯 No eventId, returning early');
      return;
    }

    const handleTicketsUpdated = (data) => {
      if (data.eventId === parseInt(eventId)) {
        console.log(`📡 Received tickets-updated:`, data);
        queryClient.invalidateQueries(['events', eventId]);
      }
    };

    socket.on('tickets-updated', handleTicketsUpdated);

    return () => {
      socket.off('tickets-updated', handleTicketsUpdated);
    };
  }, [eventId, socket, queryClient]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      if (confirm('You need to be logged in to add items to cart. Go to login?')) {
        navigate('/login');
      }
      return;
    }

    if (event.available_tickets <= 0) {
      alert('Sorry, this event is sold out!');
      return;
    }

    try {
      await addItem(event.event_id, 1);
      alert('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart. Please try again.');
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      if (confirm('You need to be logged in to add favorites. Go to login?')) {
        navigate('/login');
      }
      return;
    }

    try {
      if (isFavorite(event.event_id)) {
        await removeFavorite(event.event_id);
        alert('Removed from favorites');
      } else {
        await addFavorite(event.event_id);
        alert('Added to favorites!');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorites. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading event details...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Event not found</h2>
          <p>The event you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => navigate('/')} className={styles.backBtn}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const imagePath = event.image_path ? `/images/${event.image_path}` : '/images/banner1.jpg';
  const price = parseFloat(event.price) === 0 ? 'Free' : `$${event.price}`;
  const isFree = parseFloat(event.price) === 0;
  const soldOut = event.available_tickets <= 0;
  const isFav = isFavorite(event.event_id);

  return (
    <div className={styles.container}>
      <button onClick={() => navigate(-1)} className={styles.backBtn}>
        ← Back
      </button>

      <div className={styles.eventDetails}>
        <div className={styles.imageContainer}>
          <img
            src={imagePath}
            alt={event.title}
            className={styles.eventImage}
            onError={(e) => { e.target.src = '/images/banner1.jpg'; }}
          />
        </div>

        <div className={styles.eventInfo}>
          <div className={styles.header}>
            <h1 className={styles.title}>{event.title}</h1>
            <button
              onClick={handleToggleFavorite}
              className={`${styles.favoriteBtn} ${isFav ? styles.active : ''}`}
              title={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFav ? '❤️' : '🤍'}
            </button>
          </div>

          <div className={styles.type}>{event.type}</div>

          <div className={styles.infoSection}>
            <div className={styles.infoItem}>
              <span className={styles.icon}>📅</span>
              <div>
                <div className={styles.label}>Date & Time</div>
                <div className={styles.value}>
                  {formatDate(event.date)} at {formatTime(event.time)}
                </div>
              </div>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.icon}>📍</span>
              <div>
                <div className={styles.label}>Location</div>
                <div className={styles.value}>
                  {event.location}, {event.city}
                </div>
              </div>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.icon}>💵</span>
              <div>
                <div className={styles.label}>Price</div>
                <div className={`${styles.value} ${isFree ? styles.freePrice : ''}`}>
                  {price}
                </div>
              </div>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.icon}>🎟️</span>
              <div>
                <div className={styles.label}>Available Tickets</div>
                <div className={`${styles.value} ${soldOut ? styles.soldOut : ''}`}>
                  {soldOut ? 'SOLD OUT' : `${event.available_tickets} tickets`}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.description}>
            <h2>About this event</h2>
            <p>{event.description || 'No description available.'}</p>
          </div>

          <div className={styles.actions}>
            <button
              onClick={handleAddToCart}
              disabled={soldOut}
              className={`${styles.addToCartBtn} ${soldOut ? styles.disabled : ''}`}
            >
              {soldOut ? 'Sold Out' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetails;
