/**
 * @file Favorites.jsx
 * User favorites page component
 */

import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';
import { eventsAPI } from '../api/events';
import styles from '../styles/FavoritesNew.module.css';

/**
 * Favorites page component displaying user's favorite events
 * @component
 * @returns {JSX.Element} Favorites page component
 */
function Favorites() {
  const navigate = useNavigate();
  const { items: favoriteIds, removeFavorite } = useFavorites();

  console.log('Favorites component render, favoriteIds:', favoriteIds);
  console.log('FavoriteIds type:', typeof favoriteIds, 'Is array:', Array.isArray(favoriteIds));

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['favorites', favoriteIds],
    queryFn: async () => {
      if (favoriteIds.length === 0) return [];

      const eventPromises = favoriteIds.map(id =>
        eventsAPI.getById(String(id)).catch(() => null)
      );

      const results = await Promise.all(eventPromises);
      return results.filter(event => event !== null);
    },
    enabled: favoriteIds.length > 0
  });

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

  const handleRemove = async (e, eventId) => {
    e.stopPropagation();
    console.log('Removing favorite:', eventId, 'Type:', typeof eventId);
    console.log('Current favorites:', favoriteIds);
    try {
      await removeFavorite(eventId);
      console.log('Successfully removed');
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const handleItemClick = (eventId) => {
    navigate(`/event/${eventId}`);
  };

  if (isLoading) {
    return (
      <main className={styles.favouritesMain}>
        <div className={styles.favouritesContentContainer}>
          <h1 className={styles.favouritesTitle}>My Favourites</h1>
          <div className={styles.loading}>Loading your favourites...</div>
        </div>
      </main>
    );
  }

  if (favoriteIds.length === 0 || events.length === 0) {
    return (
      <main className={styles.favouritesMain}>
        <div className={styles.favouritesContentContainer}>
          <h1 className={styles.favouritesTitle}>My Favourites</h1>
          <div className={styles.emptyFavourites}>
            <h3>No favourites yet</h3>
            <p>Start exploring events and add them to your favourites!</p>
            <button className={styles.browseEventsBtn} onClick={() => navigate('/')}>
              Browse Events
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.favouritesMain}>
      <div className={styles.favouritesContentContainer}>
        <h1 className={styles.favouritesTitle}>My Favourites</h1>

        <div className={styles.favouritesContent}>
          <div className={styles.favouritesItems}>
            {events.map(event => {
              const imagePath = event.image_path ? `/images/${event.image_path}` : '/images/banner1.jpg';
              const isFree = parseFloat(event.price) === 0;
              const price = isFree ? 'Free' : event.has_seating ? `from $${event.price}` : `$${event.price}`;
              const priceClass = isFree ? styles.free : '';

              return (
                <div
                  key={event.event_id}
                  className={styles.favouriteItem}
                  onClick={() => handleItemClick(event.event_id)}
                >
                  <img
                    src={imagePath}
                    alt={event.title}
                    className={styles.itemImage}
                    onError={(e) => { e.target.src = '/images/banner1.jpg'; }}
                  />
                  <div className={styles.itemDetails}>
                    <div className={styles.itemTitle}>{event.title}</div>
                    <div className={styles.itemLocation}>
                      {event.location}, {event.city}
                    </div>
                    <div className={styles.itemDate}>
                      {formatDate(event.date)} • {formatTime(event.time)}
                    </div>
                    <div className={`${styles.itemPrice} ${priceClass}`}>
                      Price: {price}
                    </div>
                    <div className={styles.itemType}>{event.type}</div>
                  </div>
                  <button
                    className={styles.removeItemBtn}
                    onClick={(e) => handleRemove(e, event.event_id)}
                    title="Remove from favourites"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}

export default Favorites;
