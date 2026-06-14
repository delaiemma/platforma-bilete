/**
 * @file EditEvent.jsx
 * Admin page for editing existing events
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useEventRoom } from '../hooks/useSocket';
import { eventsAPI } from '../api/events';
import { layoutsAPI } from '../api/layouts';
import { eventLayoutAPI } from '../api/seats';
import styles from '../styles/EditEvent.module.css';

/**
 * Edit Event page component for modifying existing events
 * @component
 * @returns {JSX.Element|null} Edit event page or null if not authorized
 */
function EditEvent() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAdmin } = useAuthStore();
  const socket = useEventRoom(eventId);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    city: '',
    date: '',
    time: '',
    price: '',
    available_tickets: '',
    type: '',
    organizer: '',
    description: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketError, setTicketError] = useState('');
  const [ticketWarning, setTicketWarning] = useState('');
  const [ticketInfo, setTicketInfo] = useState('');

  const [seatingOption, setSeatingOption] = useState('none');
  const [predefinedVenues, setPredefinedVenues] = useState([]);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [venueZones, setVenueZones] = useState([]);
  const [zonePrices, setZonePrices] = useState({});

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await layoutsAPI.getAll();
        if (response.success) {
          setPredefinedVenues(response.layouts || []);
        }
      } catch (error) {
        console.error('Error loading venues:', error);
      } finally {
        setLoadingVenues(false);
      }
    };
    fetchVenues();
  }, []);

  const { data: event, isLoading } = useQuery({
    queryKey: ['events', eventId],
    queryFn: () => eventsAPI.getById(eventId),
    enabled: !!eventId
  });

  const soldTickets = event?.tickets_sold || 0;
  const reservedTickets = event?.reserved_tickets || 0;
  const originalAvailableTickets = event?.available_tickets || 0;
  const minimumRequired = reservedTickets;

  useEffect(() => {
    if (!user || !isAdmin()) {
      alert('Only admins can edit events');
      navigate('/');
      return;
    }

    if (event && user.id !== event.user_id) {
      alert('You can only edit your own events');
      navigate('/');
      return;
    }

    if (event) {
      setFormData({
        title: event.title || '',
        location: event.location || '',
        city: event.city || '',
        date: event.date ? event.date.split('T')[0] : '',
        time: event.time || '',
        price: event.price || '',
        available_tickets: event.available_tickets !== undefined && event.available_tickets !== null ? event.available_tickets : '',
        type: event.type || 'General',
        organizer: event.organizer || '',
        description: event.description || '',
        image: null
      });

      if (event.has_seating && event.layout_id) {
        setSeatingOption(event.layout_id.toString());
      } else if (event.has_seating) {
        setSeatingOption('random');
      } else {
        setSeatingOption('none');
      }
      setIsInitialLoad(false);
    }
  }, [event, user, isAdmin, navigate]);

  useEffect(() => {
    if (!event || !event.has_seating) return;
    const loadExistingLayout = async () => {
      if (event.layout_id) {
        try {
          const res = await eventLayoutAPI.getLayout(eventId);
          if (res.success && res.layout) {
            setVenueZones(res.layout.zones || []);
            const prices = {};
            (res.layout.zones || []).forEach(zone => {
              prices[zone.zone_id] = String(parseFloat(zone.price).toFixed(2));
            });
            setZonePrices(prices);
          }
        } catch { /* intentionally empty */ }
      } else {
        const basePrice = parseFloat(event.price) || 50;
        setVenueZones([
          { zone_id: 'vip',     name: 'VIP',     color: '#66BB6A' },
          { zone_id: 'regular', name: 'Regular',  color: '#4BC0C0' },
          { zone_id: 'balcony', name: 'Balcony',  color: '#36A2EB' },
        ]);
        setZonePrices({
          vip:     String((basePrice * 3).toFixed(2)),
          regular: String((basePrice * 2).toFixed(2)),
          balcony: String(basePrice.toFixed(2)),
        });
      }
    };
    loadExistingLayout();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.event_id]);

  useEffect(() => {
    if (isInitialLoad) return;

    const updateForVenue = async () => {
      if (seatingOption !== 'none' && seatingOption !== 'random') {
        const layoutId = parseInt(seatingOption);
        if (layoutId) {
          try {
            const response = await layoutsAPI.getById(layoutId);
            if (response.success && response.layout) {
              const totalSeats = response.layout.rows.reduce((sum, row) => sum + row.seats_in_row, 0);
              setFormData(prev => ({ ...prev, available_tickets: totalSeats.toString() }));
              setVenueZones(response.layout.zones || []);
              const basePrice = parseFloat(formData.price) || 50;
              const defaults = {};
              (response.layout.zones || []).forEach((zone, index) => {
                const multiplier = index === 0 ? 3 : index === 1 ? 2 : 1;
                defaults[zone.zone_id] = String(
                  zone.default_price ? parseFloat(zone.default_price).toFixed(2) : (basePrice * multiplier).toFixed(2)
                );
              });
              setZonePrices(defaults);
            }
          } catch (error) {
            console.error('Error fetching layout details:', error);
          }
        }
      } else if (seatingOption === 'random') {
        const basePrice = parseFloat(formData.price) || 50;
        setVenueZones([
          { zone_id: 'vip',     name: 'VIP',     color: '#66BB6A' },
          { zone_id: 'regular', name: 'Regular',  color: '#4BC0C0' },
          { zone_id: 'balcony', name: 'Balcony',  color: '#36A2EB' },
        ]);
        setZonePrices({
          vip:     String((basePrice * 3).toFixed(2)),
          regular: String((basePrice * 2).toFixed(2)),
          balcony: String(basePrice.toFixed(2)),
        });
      } else {
        setVenueZones([]);
        setZonePrices({});
      }
    };
    updateForVenue();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seatingOption, isInitialLoad]);

  useEffect(() => {
    if (!eventId) return;

    const realSocket = socket?.socket || socket?.getSocket?.();
    if (!realSocket) {
      console.warn('⚠️ [EditEvent] Socket not ready yet');
      return;
    }

    const handleTicketsUpdated = (data) => {
      console.log('📡 [EditEvent] Received tickets-updated:', data);
      if (data.eventId === parseInt(eventId)) {
        console.log('✅ [EditEvent] Invalidating queries for event', eventId);
        queryClient.invalidateQueries(['events', eventId]);
      }
    };

    console.log('🎯 [EditEvent] Attaching tickets-updated listener for event', eventId);
    realSocket.on('tickets-updated', handleTicketsUpdated);

    return () => {
      console.log('🔌 [EditEvent] Removing tickets-updated listener');
      realSocket.off('tickets-updated', handleTicketsUpdated);
    };
  }, [eventId, socket, queryClient]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }

    if (name === 'available_tickets') {
      const newValue = parseInt(value) || 0;
      setTicketError('');
      setTicketWarning('');
      setTicketInfo('');

      if (newValue < minimumRequired) {
        setTicketError(`Cannot reduce below ${minimumRequired} tickets (${reservedTickets} reserved in carts)`);
      } else if (newValue > 10000) {
        setTicketError('Maximum 10,000 tickets allowed');
      } else if (newValue > originalAvailableTickets) {
        const increase = newValue - originalAvailableTickets;
        setTicketInfo(`Adding ${increase} more ticket(s)`);
      } else if (newValue < originalAvailableTickets && newValue >= minimumRequired) {
        const decrease = originalAvailableTickets - newValue;
        setTicketWarning(`Removing ${decrease} available ticket(s)`);
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateRows = (zones) => {
    const MAX_PER_ROW = 20;
    const rows = [];
    let letterCode = 65;

    for (const zone of zones) {
      const numRows = Math.ceil(zone.seats / MAX_PER_ROW);
      for (let i = 0; i < numRows; i++) {
        const seatsInRow = i === numRows - 1
          ? zone.seats - i * MAX_PER_ROW
          : MAX_PER_ROW;
        rows.push({
          row_letter: String.fromCharCode(letterCode++),
          seats_in_row: seatsInRow,
          zone_name: zone.name,
          row_order: rows.length
        });
      }
    }
    return rows;
  };

  const setupSeating = async (eventId) => {
    const basePrice = parseFloat(formData.price) || 10;

    try {
      if (seatingOption !== 'random' && seatingOption !== 'none') {
        const layoutId = parseInt(seatingOption);

        const layoutResponse = await layoutsAPI.getById(layoutId);
        if (!layoutResponse.success) {
          throw new Error('Failed to load selected venue layout');
        }

        const layout = layoutResponse.layout;

        const zonePricing = layout.zones.map((zone, index) => {
          const multiplier = index === 0 ? 3 : index === 1 ? 2 : 1;
          return {
            zone_id: zone.zone_id,
            price: zone.default_price ? parseFloat(zone.default_price) : basePrice * multiplier
          };
        });

        await eventLayoutAPI.assign(eventId, layoutId, zonePricing);
        console.log(`✅ Assigned predefined venue (layout ${layoutId}) to event ${eventId}`);

      } else if (seatingOption === 'random') {
        const totalSeats = (event.available_tickets || 0) + (event.tickets_sold || 0);

        if (totalSeats === 0) {
          throw new Error('No tickets available to create seating layout');
        }

        const vipSeats = Math.floor(totalSeats * 0.3);
        const regularSeats = Math.floor(totalSeats * 0.5);
        const balconySeats = totalSeats - vipSeats - regularSeats;

        const defaultZones = [
          { name: 'VIP', seats: vipSeats, price: basePrice * 3, color: '#66BB6A' },
          { name: 'Regular', seats: regularSeats, price: basePrice * 2, color: '#4BC0C0' },
          { name: 'Balcony', seats: balconySeats, price: basePrice, color: '#36A2EB' }
        ];

        const rows = generateRows(defaultZones);

        console.log('Creating layout with zones:', defaultZones);
        console.log('Total rows:', rows.length);

        const layoutResponse = await layoutsAPI.create({
          name: `${formData.title} - Seats`,
          zones: defaultZones.map(z => ({ name: z.name, color: z.color })),
          rows,
          created_by: user.id
        });

        console.log('Layout created:', layoutResponse);

        const createdLayout = layoutResponse.layout;

        const zonePricing = defaultZones.map(z => {
          const createdZone = createdLayout.zones.find(cz => cz.name === z.name);
          return { zone_id: createdZone.zone_id, price: z.price };
        });

        console.log('Assigning layout to event with pricing:', zonePricing);

        await eventLayoutAPI.assign(eventId, createdLayout.layout_id, zonePricing);

        console.log(`✅ Created random layout for event ${eventId}`);
      }
    } catch (error) {
      console.error('Error setting up seating:', error);
      console.error('Error details:', error.response || error.message);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');

    const ticketsChanged = parseInt(formData.available_tickets) !== originalAvailableTickets;

    if (ticketsChanged) {
      if (parseInt(formData.available_tickets) < minimumRequired) {
        setErrors({ available_tickets: `Cannot reduce below ${minimumRequired} tickets (${reservedTickets} reserved in carts)` });
        return;
      }

      if (parseInt(formData.available_tickets) > 10000) {
        setErrors({ available_tickets: 'Maximum 10,000 tickets allowed' });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('location', formData.location);
      submitData.append('city', formData.city);
      submitData.append('date', formData.date);
      submitData.append('time', formData.time);
      submitData.append('price', formData.price);
      submitData.append('available_tickets', formData.available_tickets);
      submitData.append('type', formData.type);
      submitData.append('description', formData.description);
      submitData.append('organizer', formData.organizer);
      submitData.append('has_seating', seatingOption !== 'none');

      if (formData.image) {
        submitData.append('image', formData.image);
        console.log('📸 Image file selected:', formData.image.name);
      }

      const storedSession = localStorage.getItem('userSession');
      const token = storedSession ? JSON.parse(storedSession).state.token : null;
      console.log('📤 Sending update request with token:', token ? 'Present' : 'Missing');

      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      const result = await response.json();
      console.log('📥 Server response:', result);

      if (response.ok && result.success) {
        const hadSeating = event.has_seating;
        const wantsSeating = seatingOption !== 'none';

        let originalSeatingOption = 'none';
        if (event.has_seating && event.layout_id) {
          originalSeatingOption = event.layout_id.toString();
        } else if (event.has_seating) {
          originalSeatingOption = 'random';
        }

        const seatingChanged = seatingOption !== originalSeatingOption;
        const hasTicketsSold = soldTickets > 0;
        const hasSeatsAllocated = reservedTickets > 0;

        const changingToNoSeating = !wantsSeating && hadSeating;
        const canChangeToNoSeating = changingToNoSeating && !hasSeatsAllocated;

        if (hasTicketsSold && hadSeating && seatingChanged && !canChangeToNoSeating) {
          alert('⚠️ Cannot change seating configuration because tickets with allocated seats have already been sold for this event. The seating layout must remain as is.');
          setIsSubmitting(false);
          return;
        }

        if (wantsSeating && !hadSeating) {
          try {
            await setupSeating(eventId);
          } catch (error) {
            console.error('Error creating seating layout:', error);
            alert('Event updated but failed to setup seating. Please try again.');
            setIsSubmitting(false);
            return;
          }
        } else if (!wantsSeating && hadSeating) {
          try {
            await eventLayoutAPI.remove(eventId);
          } catch (error) {
            console.error('Error removing layout:', error);
          }
        } else if (wantsSeating && hadSeating && seatingChanged) {
          try {
            console.log(`🔄 Changing layout from ${originalSeatingOption} to ${seatingOption}`);
            await setupSeating(eventId);
            console.log('✅ Layout changed successfully');
          } catch (error) {
            console.error('Error changing layout:', error);
            alert('Event updated but failed to change seating layout. Please try again.');
            setIsSubmitting(false);
            return;
          }
        } else if (wantsSeating && hadSeating && !seatingChanged && seatingOption === 'random' && venueZones.length > 0) {
          try {
            const basePrice = parseFloat(formData.price) || 50;
            const zonePricing = venueZones.map((zone, index) => {
              const multiplier = index === 0 ? 3 : index === 1 ? 2 : 1;
              const customPrice = parseFloat(zonePrices[zone.zone_id]);
              return {
                zone_id: zone.zone_id,
                price: !isNaN(customPrice) && customPrice > 0 ? customPrice : basePrice * multiplier
              };
            });
            await eventLayoutAPI.updatePricing(eventId, zonePricing);
            console.log('✅ Zone prices updated');
          } catch (error) {
            console.error('Error updating prices:', error);
          }
        }

        setSuccessMessage('✅ Event updated successfully!');
        setTimeout(() => {
          navigate(`/event/${eventId}`);
        }, 2000);
      } else {
        if (result.errors) {
          setErrors(result.errors);
        } else {
          alert('Error updating event: ' + (result.message || 'Unknown error'));
        }
      }
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Error updating event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManageCookies = (e) => {
    e.preventDefault();
    window.dispatchEvent(new Event('showCookieBanner'));
  };

  if (isLoading) {
    return (
      <div className={styles.editContainer}>
        <header className={styles.editHeader}>
          <Link to="/" className={styles.logo}>
            Ticket
          </Link>
        </header>
        <main className={styles.editMain}>
          <div className={styles.editFormContainer}>
            <div className={styles.loading}>Loading event details...</div>
          </div>
        </main>
      </div>
    );
  }

  if (!event) {
    return (
      <div className={styles.editContainer}>
        <header className={styles.editHeader}>
          <Link to="/" className={styles.logo}>
            Ticket
          </Link>
        </header>
        <main className={styles.editMain}>
          <div className={styles.editFormContainer}>
            <p>Event not found</p>
            <Link to="/" className={styles.btn}>Back to Home</Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.editContainer}>
      <header className={styles.editHeader}>
        <Link to="/" className={styles.logo}>
          Ticket
        </Link>
      </header>

      <main className={styles.editMain}>
        <div className={styles.editFormContainer}>
          <h1 className={styles.editTitle}>Edit Event</h1>

          {successMessage && (
            <div className={styles.success}>{successMessage}</div>
          )}

          <form className={styles.editForm} onSubmit={handleSubmit}>
            <div className={styles.ticketInfo}>
              <h4>Ticket Status</h4>
              <p>Available tickets (remaining): {originalAvailableTickets}</p>
              <p>Tickets sold (total): {soldTickets}</p>
              <p>Reserved in carts: {reservedTickets}</p>
              {reservedTickets > 0 && (
                <p className={styles.reservedWarning}>
                  ⚠️ Cannot reduce below {reservedTickets} tickets (currently in carts)
                </p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="title">Event Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
              {errors.title && <div className={styles.error}>{errors.title}</div>}
            </div>

            <div className={styles.formRow}>
              <div className={`${styles.formGroup} ${styles.half}`}>
                <label htmlFor="location">Location *</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
                {errors.location && <div className={styles.error}>{errors.location}</div>}
              </div>
              <div className={`${styles.formGroup} ${styles.half}`}>
                <label htmlFor="city">City *</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
                {errors.city && <div className={styles.error}>{errors.city}</div>}
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={`${styles.formGroup} ${styles.half}`}>
                <label htmlFor="date">Date *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
                {errors.date && <div className={styles.error}>{errors.date}</div>}
              </div>
              <div className={`${styles.formGroup} ${styles.half}`}>
                <label htmlFor="time">Time *</label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                />
                {errors.time && <div className={styles.error}>{errors.time}</div>}
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={`${styles.formGroup} ${styles.half}`}>
                <label htmlFor="price">Price ($) *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
                {errors.price && <div className={styles.error}>{errors.price}</div>}
              </div>
              <div className={`${styles.formGroup} ${styles.half}`}>
                <label htmlFor="available_tickets">
                  Available Tickets *
                  {seatingOption !== 'none' && seatingOption !== 'random' && (
                    <span style={{ fontSize: '0.85em', color: '#888', marginLeft: '8px' }}>
                      (Fixed by venue)
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  id="available_tickets"
                  name="available_tickets"
                  min="0"
                  max="10000"
                  value={formData.available_tickets}
                  onChange={handleInputChange}
                  required
                  disabled={seatingOption !== 'none' && seatingOption !== 'random'}
                  style={seatingOption !== 'none' && seatingOption !== 'random' ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                />
                {ticketError && <div className={styles.error}>{ticketError}</div>}
                {ticketWarning && <div className={styles.warning}>{ticketWarning}</div>}
                {ticketInfo && <div className={styles.info}>{ticketInfo}</div>}
                {errors.available_tickets && <div className={styles.error}>{errors.available_tickets}</div>}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="type">Event Type *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                <option value="">Select event type...</option>
                <option value="Concert">Concert</option>
                <option value="Festival">Festival</option>
                <option value="Theater">Theater</option>
                <option value="Cinema">Cinema</option>
                <option value="Exhibition">Exhibition</option>
                <option value="Party">Party</option>
                <option value="Seminar">Seminar</option>
                <option value="Sports">Sports</option>
                <option value="General">General</option>
              </select>
              {errors.type && <div className={styles.error}>{errors.type}</div>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="organizer">Organized by</label>
              <input
                type="text"
                id="organizer"
                name="organizer"
                value={formData.organizer}
                onChange={handleInputChange}
                placeholder="Enter organizer name..."
              />
              {errors.organizer && <div className={styles.error}>{errors.organizer}</div>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your event..."
              />
              {errors.description && <div className={styles.error}>{errors.description}</div>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="image">Event Image</label>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
              />
              {errors.image && <div className={styles.error}>{errors.image}</div>}
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
              )}
              {event.image_path && !imagePreview && (
                <div className={styles.currentImage}>
                  <p>Current image:</p>
                  <img src={`/images/${event.image_path}`} alt="Current" className={styles.imagePreview} />
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="seatingOption">
                Seating Configuration
                <span style={{ fontSize: '0.85em', color: '#666', marginLeft: '8px' }}>
                  {loadingVenues ? '(Loading venues...)' : `(${predefinedVenues.length} venues available)`}
                </span>
              </label>
              <select
                id="seatingOption"
                value={seatingOption}
                onChange={e => setSeatingOption(e.target.value)}
                className={styles.input}
                disabled={reservedTickets > 0 && event.has_seating}
                title={reservedTickets > 0 && event.has_seating ? 'Cannot change seating - seats already allocated' : ''}
              >
                <option value="none">No seating (general admission)</option>
                <option value="random">Random layout (auto-generate VIP, Regular, Balcony)</option>
                <optgroup label="Predefined Venues">
                  {predefinedVenues.map(venue => (
                    <option key={venue.layout_id} value={venue.layout_id}>
                      {venue.name} {venue.description ? `- ${venue.description.split('-')[0].trim()}` : ''}
                    </option>
                  ))}
                </optgroup>
              </select>
              {reservedTickets > 0 && event.has_seating && (
                <small style={{ color: '#ff6b6b', fontWeight: 'bold', marginTop: '4px', display: 'block' }}>
                  ⚠️ Seating configuration locked - {reservedTickets} seat{reservedTickets > 1 ? 's' : ''} already allocated
                </small>
              )}
              {soldTickets > 0 && reservedTickets === 0 && event.has_seating && (
                <small style={{ color: '#ffa500', fontWeight: 'bold', marginTop: '4px', display: 'block' }}>
                  ℹ️ {soldTickets} general admission ticket{soldTickets > 1 ? 's' : ''} sold - can change to "No seating"
                </small>
              )}
              {event.has_seating && !(soldTickets > 0) && (
                <small style={{ color: '#888', fontStyle: 'italic', marginTop: '4px', display: 'block' }}>
                  Current: {event.layout_id ? 'Using predefined venue' : 'Random layout'} - Changing will update the configuration
                </small>
              )}
              {seatingOption !== 'none' && seatingOption !== 'random' && !(soldTickets > 0 && event.has_seating) && (
                <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
                  Using predefined venue layout - seat count and zones are fixed
                </small>
              )}
              {seatingOption !== 'none' && venueZones.length > 0 && (
                <div style={{ marginTop: '10px', padding: '12px', border: '1px solid #e0e0e0', borderRadius: '4px', background: '#fafafa' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#444' }}>Prețuri per zonă</div>
                  {venueZones.map(zone => {
                    const isPredefined = seatingOption !== 'random';
                    return (
                      <div key={zone.zone_id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '120px' }}>
                          <div style={{ width: 12, height: 12, borderRadius: 2, background: zone.color, flexShrink: 0 }} />
                          <span style={{ fontSize: '13px' }}>{zone.name}</span>
                        </div>
                        {isPredefined ? (
                          <span style={{ fontSize: '13px', color: '#333', fontWeight: '500' }}>
                            ${parseFloat(zone.default_price || zonePrices[zone.zone_id] || 0).toFixed(2)}
                            <span style={{ fontSize: '11px', color: '#999', marginLeft: '6px' }}>fix</span>
                          </span>
                        ) : (
                          <>
                            <span style={{ fontSize: '13px', color: '#666' }}>$</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={zonePrices[zone.zone_id] || ''}
                              onChange={e => setZonePrices(prev => ({ ...prev, [zone.zone_id]: e.target.value }))}
                              style={{ width: '90px', padding: '4px 8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px' }}
                            />
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {seatingOption === 'random' && !(soldTickets > 0 && event.has_seating) && (
                <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
                  Will create custom layout based on "Available Tickets" field
                </small>
              )}
            </div>

            <div className={styles.buttonGroup}>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isSubmitting || !!ticketError}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={() => navigate(`/event/${eventId}`)} className={`${styles.btn} ${styles.btnSecondary}`}>
                Cancel
              </button>
              <Link to="/" className={`${styles.btn} ${styles.btnCancel}`}>
                Back to Events
              </Link>
            </div>
          </form>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerLogo}>Ticket</div>
        <div className={styles.footerText}>© 2025 Ticket Created by De Lai Emma</div>
        <div className={styles.footerLinks}>
          <Link to="/terms">Terms</Link>
          <span>•</span>
          <Link to="/privacy">Privacy</Link>
          <span>•</span>
          <Link to="/accessibility">Accessibility</Link>
          <span>•</span>
          <Link to="/cookie-policy">Cookies</Link>
          <span>•</span>
          <a href="#" onClick={handleManageCookies}>Manage Cookies Preferences</a>
          <span>•</span>
          <Link to="/privacy#data-rights">Do Not Sell or Share My Personal Information</Link>
        </div>
      </footer>
    </div>
  );
}

export default EditEvent;
