/**
 * @file MoreEvents.jsx
 * Events search and filtering page component
 */

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { eventsAPI } from '../api/events';
import { useSocket } from '../hooks/useSocket';
import EventCard from '../components/events/EventCard';
import styles from '../styles/MoreEvents.module.css';

/**
 * Custom hook for debouncing values
 * @hook
 * @param {*} value - Value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {*} Debounced value
 */
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/**
 * Available event type options
 * @constant
 */
const EVENT_TYPES = ['Concert', 'Seminar', 'Event', 'Theater', 'Cinema', 'Exhibition', 'General'];

/**
 * More Events page component with advanced search and filtering
 * @component
 * @returns {JSX.Element} More events page component
 */
function MoreEvents() {
  const [searchText, setSearchText]         = useState('');
  const [minPrice, setMinPrice]             = useState(0);
  const [maxPrice, setMaxPrice]             = useState(1000);
  const [selectedTypes, setSelectedTypes]   = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [dateFrom, setDateFrom]             = useState('');
  const [dateTo, setDateTo]                 = useState('');
  const [sort, setSort]                     = useState('date');
  const [order, setOrder]                   = useState('asc');
  const queryClient = useQueryClient();
  const socket = useSocket();

  const debouncedSearch = useDebounce(searchText, 350);

  useEffect(() => {
    if (!socket) return;

    const handleEventCreated = (data) => {
      console.log('📡 [MoreEvents] Event created:', data);
      queryClient.invalidateQueries(['events', 'search']);
      queryClient.invalidateQueries(['cities']);
    };

    const handleEventUpdated = (data) => {
      console.log('📡 [MoreEvents] Event updated:', data);
      queryClient.invalidateQueries(['events', 'search']);
    };

    const handleEventDeleted = (data) => {
      console.log('📡 [MoreEvents] Event deleted:', data);
      queryClient.invalidateQueries(['events', 'search']);
    };

    const handleTicketsUpdated = (data) => {
      console.log('📡 [MoreEvents] Tickets updated for event:', data.eventId);
      queryClient.invalidateQueries(['events', 'search']);
    };

    const attachListeners = () => {
      if (!socket.socket) return;
      console.log('🎧 [MoreEvents] Attaching event listeners...');
      socket.socket.on('event-created', handleEventCreated);
      socket.socket.on('event-updated', handleEventUpdated);
      socket.socket.on('event-deleted', handleEventDeleted);
      socket.socket.on('tickets-updated', handleTicketsUpdated);
      console.log('✅ [MoreEvents] Listeners attached');
    };

    if (socket.socket?.connected) {
      console.log('🔌 [MoreEvents] Socket already connected, attaching listeners immediately');
      attachListeners();
    }

    if (socket.socket) {
      socket.socket.on('connect', () => {
        console.log('🔌 [MoreEvents] Socket connected, attaching listeners');
        attachListeners();
      });
    }

    return () => {
      console.log('🧹 [MoreEvents] Cleaning up listeners');
      if (socket.socket) {
        socket.socket.off('connect', attachListeners);
        socket.socket.off('event-created', handleEventCreated);
        socket.socket.off('event-updated', handleEventUpdated);
        socket.socket.off('event-deleted', handleEventDeleted);
        socket.socket.off('tickets-updated', handleTicketsUpdated);
      }
    };
  }, [socket, queryClient]);

  const { data: availableCities = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: eventsAPI.getCities,
    staleTime: 5 * 60 * 1000
  });

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events', 'search', debouncedSearch, selectedTypes, selectedCities, minPrice, maxPrice, dateFrom, dateTo, sort, order],
    queryFn: () => eventsAPI.search({
      q: debouncedSearch,
      types: selectedTypes,
      cities: selectedCities,
      minPrice,
      maxPrice,
      dateFrom,
      dateTo,
      sort,
      order
    })
  });

  const toggleType = (type) =>
    setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);

  const toggleCity = (city) =>
    setSelectedCities(prev => prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]);

  const clearFilters = () => {
    setSearchText('');
    setMinPrice(0);
    setMaxPrice(1000);
    setSelectedTypes([]);
    setSelectedCities([]);
    setDateFrom('');
    setDateTo('');
    setSort('date');
    setOrder('asc');
  };

  const hasActiveFilters = searchText || selectedTypes.length || selectedCities.length ||
    minPrice > 0 || maxPrice < 1000 || dateFrom || dateTo;

  return (
    <div className={styles.mainContent}>
      <aside className={styles.filtersSidebar}>
        <div className={styles.filterHeader}>
          <h3 className={styles.filterTitle}>Filters</h3>
          {hasActiveFilters && (
            <button className={styles.clearFiltersBtn} onClick={clearFilters}>
              Clear all
            </button>
          )}
        </div>

        {/* Search */}
        <div className={styles.filterGroup}>
          <div className={styles.filterLabel}>Search</div>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search events..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        {/* Price */}
        <div className={styles.filterGroup}>
          <div className={styles.filterLabel}>Price</div>
          <div className={styles.priceRange}>
            <input type="range" min="0" max="1000" value={minPrice}
              onChange={(e) => setMinPrice(parseInt(e.target.value))} />
            <input type="range" min="0" max="1000" value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))} />
            <div className={styles.priceDisplay}>
              <span>${minPrice}</span>
              <span>${maxPrice}</span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className={styles.filterGroup}>
          <div className={styles.filterLabel}>Category</div>
          <div className={styles.checkboxGroup}>
            {EVENT_TYPES.map(type => (
              <label key={type}>
                <input type="checkbox"
                  checked={selectedTypes.includes(type)}
                  onChange={() => toggleType(type)} />
                {type}
              </label>
            ))}
          </div>
        </div>

        {/* Location - real cities from DB */}
        {availableCities.length > 0 && (
          <div className={styles.filterGroup}>
            <div className={styles.filterLabel}>Location</div>
            <div className={styles.checkboxGroup}>
              {availableCities.map(city => (
                <label key={city}>
                  <input type="checkbox"
                    checked={selectedCities.includes(city)}
                    onChange={() => toggleCity(city)} />
                  {city}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Date Range */}
        <div className={styles.filterGroup}>
          <div className={styles.filterLabel}>Date</div>
          <div className={styles.dateRange}>
            <input type="date" className={styles.dateInput}
              placeholder="From"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)} />
            <input type="date" className={styles.dateInput}
              placeholder="To"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)} />
          </div>
        </div>

        {/* Sort */}
        <div className={styles.filterGroup}>
          <div className={styles.filterLabel}>Sort by</div>
          <select className={styles.sortSelect}
            value={`${sort}-${order}`}
            onChange={(e) => { const [s, o] = e.target.value.split('-'); setSort(s); setOrder(o); }}>
            <option value="date-asc">Date (ascending)</option>
            <option value="date-desc">Date (descending)</option>
            <option value="price-asc">Price (ascending)</option>
            <option value="price-desc">Price (descending)</option>
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
          </select>
        </div>
      </aside>

      {/* Events */}
      <div className={styles.eventsSection}>
        <div className={styles.resultsHeader}>
          {!isLoading && (
            <span className={styles.resultsCount}>
              {events.length} {events.length === 1 ? 'event' : 'events'} found
            </span>
          )}
        </div>

        {isLoading ? (
          <div className={styles.loading}>Loading...</div>
        ) : events.length === 0 ? (
          <div className={styles.noEvents}>
            <h3>No events found</h3>
            <p>Try adjusting your filters.</p>
          </div>
        ) : (
          <div className={styles.eventsGrid}>
            {events.map(event => (
              <EventCard key={event.event_id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MoreEvents;
