/**
 * @file Home.jsx
 * Homepage component displaying event recommendations and listings
 */

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { eventsAPI } from '../api/events';
import { useAuthStore } from '../store/authStore';
import { useSocket } from '../hooks/useSocket';
import HeroSlideshow from '../components/events/HeroSlideshow';
import EventCard from '../components/events/EventCard';
import styles from '../styles/Home.module.css';

/**
 * Homepage component with hero slideshow, recommendations, and event listings
 * @component
 * @returns {JSX.Element} Home page component
 */
function Home() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, isAdmin, user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const queryClient = useQueryClient();
  const socket = useSocket();

  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      setSearchTerm(searchFromUrl);
      setIsSearching(true);
    } else {
      setSearchTerm('');
      setIsSearching(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!socket) return;

    const handleEventCreated = (data) => {
      console.log('📡 [Home] Event created:', data);
      queryClient.invalidateQueries(['events', 'upcoming']);
      queryClient.invalidateQueries(['events', 'past']);
      queryClient.invalidateQueries(['recommendations', user?.id]);
    };

    const handleEventUpdated = (data) => {
      console.log('📡 [Home] Event updated:', data);
      queryClient.invalidateQueries(['events', 'upcoming']);
      queryClient.invalidateQueries(['events', 'past']);
      queryClient.invalidateQueries(['recommendations', user?.id]);
    };

    const handleEventDeleted = (data) => {
      console.log('📡 [Home] Event deleted:', data);
      queryClient.invalidateQueries(['events', 'upcoming']);
      queryClient.invalidateQueries(['events', 'past']);
      queryClient.invalidateQueries(['recommendations', user?.id]);
    };

    const handleTicketsUpdated = (data) => {
      console.log('📡 [Home] Tickets updated for event:', data.eventId);
      queryClient.invalidateQueries(['events', 'upcoming']);
      queryClient.invalidateQueries(['events', 'past']);
    };

    const attachListeners = () => {
      if (!socket.socket) return;
      console.log('🎧 [Home] Attaching event listeners...');
      socket.socket.on('event-created', handleEventCreated);
      socket.socket.on('event-updated', handleEventUpdated);
      socket.socket.on('event-deleted', handleEventDeleted);
      socket.socket.on('tickets-updated', handleTicketsUpdated);
      console.log('✅ [Home] Listeners attached');
    };

    if (socket.socket?.connected) {
      console.log('🔌 [Home] Socket already connected, attaching listeners immediately');
      attachListeners();
    }

    if (socket.socket) {
      socket.socket.on('connect', () => {
        console.log('🔌 [Home] Socket connected, attaching listeners');
        attachListeners();
      });
    }

    return () => {
      console.log('🧹 [Home] Cleaning up listeners');
      if (socket.socket) {
        socket.socket.off('connect', attachListeners);
        socket.socket.off('event-created', handleEventCreated);
        socket.socket.off('event-updated', handleEventUpdated);
        socket.socket.off('event-deleted', handleEventDeleted);
        socket.socket.off('tickets-updated', handleTicketsUpdated);
      }
    };
  }, [socket, queryClient, user?.id]);

  const { data: recommendationsData, isLoading: loadingRecommendations } = useQuery({
    queryKey: ['recommendations', user?.id],
    queryFn: () => eventsAPI.getRecommendations(user?.id, 3)
  });

  const { data: upcomingEvents = [], isLoading: loadingUpcoming } = useQuery({
    queryKey: ['events', 'upcoming'],
    queryFn: eventsAPI.getUpcoming
  });

  const { data: pastEvents = [], isLoading: loadingPast } = useQuery({
    queryKey: ['events', 'past'],
    queryFn: eventsAPI.getPast
  });

  const isEventExpired = (event) => {
    if (!event.date) return false;

    try {
      let eventDateTime;

      if (typeof event.date === 'string' && event.date.includes('T')) {
        eventDateTime = new Date(event.date);
      } else {
        const datePart = event.date.split('T')[0];
        const timePart = event.time || '00:00:00';
        const eventDateTimeStr = `${datePart}T${timePart}`;
        eventDateTime = new Date(eventDateTimeStr);
      }

      const now = new Date();
      return eventDateTime < now;
    } catch (error) {
      console.error('Error parsing event date/time:', event, error);
      return false;
    }
  };

  const filterEvents = (events, shouldBeUpcoming = false) => {
    let filtered = events;
    if (shouldBeUpcoming) {
      filtered = events.filter(event => !isEventExpired(event));
    }

    if (!isSearching || !searchTerm) return filtered;

    return filtered.filter(event =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.city.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredRecommendations = recommendationsData?.recommendations?.filter(event => !isEventExpired(event)) || [];

  const filteredUpcoming = filterEvents(upcomingEvents, true).slice(0, 6);
  const filteredPast = filterEvents(pastEvents, false);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      const term = e.target.value.trim();
      if (term) {
        setSearchTerm(term);
        setIsSearching(true);
      } else {
        setSearchTerm('');
        setIsSearching(false);
      }
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setIsSearching(false);
    setSearchParams({});
  };

  const handleAddEvent = () => {
    if (!isAuthenticated || !isAdmin()) {
      alert('Only admins can add events. Please log in as admin.');
      navigate('/login');
      return;
    }
    navigate('/add-event');
  };

  return (
    <div className={styles.homeContainer}>
      <HeroSlideshow />

      {/* Recommendations Section */}
      {!loadingRecommendations && filteredRecommendations.length > 0 && (
        <section className={styles.recommendationsSection}>
          <div className={styles.eventsContainer}>
            <div className={styles.eventsTitle}>
              {recommendationsData.personalized
                ? 'Recommendations - Personalized for You'
                : 'Recommendations - Popular Events'}
            </div>
            <div className={styles.eventsGrid}>
              {filteredRecommendations.map(event => (
                <EventCard key={event.event_id} event={event} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Events Section */}
      <section className={styles.eventsSection}>
        <div className={styles.eventsContainer}>
          <div className={styles.eventsTitle}>Upcoming Events</div>

          {loadingUpcoming ? (
            <div className={styles.loading}>Loading events...</div>
          ) : filteredUpcoming.length === 0 ? (
            <p className={styles.noEvents}>
              {isSearching
                ? `No events found for: "${searchTerm}"`
                : 'No upcoming events available.'}
            </p>
          ) : (
            <div className={styles.eventsGrid}>
              {filteredUpcoming.map(event => (
                <EventCard key={event.event_id} event={event} />
              ))}
            </div>
          )}

          {/* More Events Button */}
          <div className={styles.moreEventsContainer}>
            <button className={styles.moreEventsBtn} onClick={() => navigate('/more-events')}>
              More Events
            </button>
          </div>
        </div>
      </section>

      {/* Past Events Section */}
      <section className={styles.eventsSection}>
        <div className={styles.eventsContainer}>
          <div className={styles.eventsTitle}>Past Events</div>

          {loadingPast ? (
            <div className={styles.loading}>Loading past events...</div>
          ) : filteredPast.length === 0 ? (
            <p className={styles.noEvents}>
              {isSearching
                ? `No past events found for: "${searchTerm}"`
                : 'No past events.'}
            </p>
          ) : (
            <div className={styles.eventsGrid}>
              {filteredPast.map(event => (
                <EventCard key={event.event_id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Add Event Section - Admin Only */}
      {isAuthenticated && isAdmin() && (
        <section className={styles.addEventSection}>
          <div className={styles.addEventText}>
            Are you a manager or hosting your own event?<br />
            Add it here!
          </div>
          <button className={styles.addEventBtn} onClick={handleAddEvent}>
            Add Event
          </button>
        </section>
      )}
    </div>
  );
}

export default Home;
