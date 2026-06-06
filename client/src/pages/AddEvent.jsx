/**
 * @file AddEvent.jsx
 * Admin page for creating new events
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { layoutsAPI } from '../api/layouts';
import { eventLayoutAPI } from '../api/seats';
import styles from '../styles/AddEvent.module.css';

/**
 * Add Event page component for creating new events with seat layout options
 * @component
 * @returns {JSX.Element|null} Add event page or null if not authorized
 */
function AddEvent() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuthStore();
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    city: '',
    date: '',
    time: '',
    price: '',
    available_tickets: '100',
    type: '',
    organizer: '',
    description: '',
    image: null
  });

  const [hasSeating, setHasSeating] = useState(true);
  const [seatingOption, setSeatingOption] = useState('random');
  const [predefinedVenues, setPredefinedVenues] = useState([]);
  const [loadingVenues, setLoadingVenues] = useState(true);
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

  useEffect(() => {
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
  }, [seatingOption]);

  if (!user || !isAdmin()) {
    setTimeout(() => {
      alert('Only admins can add events');
      navigate('/');
    }, 0);
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (name === 'available_tickets') {
      const numValue = parseInt(value);
      if (numValue < 1) {
        setErrors(prev => ({ ...prev, available_tickets: 'Must have at least 1 ticket available' }));
      } else if (numValue > 10000) {
        setErrors(prev => ({ ...prev, available_tickets: 'Maximum 10,000 tickets allowed' }));
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
      setFormData(prev => ({ ...prev, image: null }));
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
        const totalSeats = parseInt(formData.available_tickets) || 100;

        const vipSeats = Math.floor(totalSeats * 0.3);
        const regularSeats = Math.floor(totalSeats * 0.5);
        const balconySeats = totalSeats - vipSeats - regularSeats;

        const vipPrice    = parseFloat(zonePrices['vip'])     || basePrice * 3;
        const regularPrice= parseFloat(zonePrices['regular']) || basePrice * 2;
        const balconyPrice= parseFloat(zonePrices['balcony']) || basePrice;

        const defaultZones = [
          { name: 'VIP',     seats: vipSeats,     price: vipPrice,     color: '#66BB6A' },
          { name: 'Regular', seats: regularSeats, price: regularPrice, color: '#4BC0C0' },
          { name: 'Balcony', seats: balconySeats, price: balconyPrice, color: '#36A2EB' }
        ];

        const rows = generateRows(defaultZones);

        const layoutResponse = await layoutsAPI.create({
          name: `${formData.title} - Seats`,
          zones: defaultZones.map(z => ({ name: z.name, color: z.color })),
          rows,
          created_by: user.id
        });

        const createdLayout = layoutResponse.layout;

        const zonePricing = defaultZones.map(z => {
          const createdZone = createdLayout.zones.find(cz => cz.name === z.name);
          return { zone_id: createdZone.zone_id, price: z.price };
        });

        await eventLayoutAPI.assign(eventId, createdLayout.layout_id, zonePricing);
        console.log(`✅ Created random layout for event ${eventId}`);
      }
    } catch (error) {
      console.error('Error setting up seating:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
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
      submitData.append('user_id', user.id);

      if (formData.image) {
        submitData.append('image', formData.image);
      }

      console.log('🚀 Creating event with available tickets:', formData.available_tickets);

      const response = await fetch('/api/events', {
        method: 'POST',
        body: submitData
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (seatingOption !== 'none') {
          try {
            await setupSeating(result.event.event_id);
          } catch (error) {
            console.error('Error creating seating layout:', error);
            alert('Event created but failed to setup seating. You can add it later from Edit page.');
          }
        }

        setSuccessMessage(`✅ Event created successfully!`);

        setTimeout(() => {
          navigate(`/event/${result.event.event_id}`);
        }, 2000);
      } else {
        if (result.errors) {
          setErrors(result.errors);
        } else {
          alert('Error creating event: ' + (result.message || 'Unknown error'));
        }
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Error creating event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.addContainer}>
      <header className={styles.addHeader}>
        <div className={styles.logo}>Ticket</div>
      </header>

      <main className={styles.addMain}>
        <div className={styles.addFormContainer}>
          <h1 className={styles.addTitle}>Add New Event</h1>

          {successMessage && (
            <div className={styles.success}>{successMessage}</div>
          )}

          <form onSubmit={handleSubmit} className={styles.addForm}>
            <div className={styles.formGroup}>
              <label htmlFor="eventTitle">Event Title *</label>
              <input
                type="text"
                id="eventTitle"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Enter event title..."
              />
              {errors.title && <div className={styles.error}>{errors.title}</div>}
            </div>

            <div className={styles.formRow}>
              <div className={`${styles.formGroup} ${styles.half}`}>
                <label htmlFor="eventLocation">Location *</label>
                <input
                  type="text"
                  id="eventLocation"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter venue name..."
                />
                {errors.location && <div className={styles.error}>{errors.location}</div>}
              </div>
              <div className={`${styles.formGroup} ${styles.half}`}>
                <label htmlFor="eventCity">City *</label>
                <input
                  type="text"
                  id="eventCity"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter city..."
                />
                {errors.city && <div className={styles.error}>{errors.city}</div>}
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={`${styles.formGroup} ${styles.half}`}>
                <label htmlFor="eventDate">Date *</label>
                <input
                  type="date"
                  id="eventDate"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
                {errors.date && <div className={styles.error}>{errors.date}</div>}
              </div>
              <div className={`${styles.formGroup} ${styles.half}`}>
                <label htmlFor="eventTime">Time *</label>
                <input
                  type="time"
                  id="eventTime"
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
                <label htmlFor="eventPrice">Price ($) *</label>
                <input
                  type="number"
                  id="eventPrice"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                  placeholder="0.00"
                />
                {errors.price && <div className={styles.error}>{errors.price}</div>}
              </div>
              <div className={`${styles.formGroup} ${styles.half}`}>
                <label htmlFor="availableTickets">
                  Available Tickets *
                  {seatingOption !== 'none' && seatingOption !== 'random' && (
                    <span style={{ fontSize: '0.85em', color: '#888', marginLeft: '8px' }}>
                      (Fixed by venue)
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  id="availableTickets"
                  name="available_tickets"
                  value={formData.available_tickets}
                  onChange={handleInputChange}
                  min="1"
                  max="10000"
                  required
                  placeholder="100"
                  disabled={seatingOption !== 'none' && seatingOption !== 'random'}
                  style={seatingOption !== 'none' && seatingOption !== 'random' ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                />
                {errors.available_tickets && <div className={styles.error}>{errors.available_tickets}</div>}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="eventType">Event Type *</label>
              <select
                id="eventType"
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
              <label htmlFor="eventOrganizer">Organized by</label>
              <input
                type="text"
                id="eventOrganizer"
                name="organizer"
                value={formData.organizer}
                onChange={handleInputChange}
                placeholder="Enter organizer name..."
              />
              {errors.organizer && <div className={styles.error}>{errors.organizer}</div>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="eventDescription">Description</label>
              <textarea
                id="eventDescription"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your event..."
              />
              {errors.description && <div className={styles.error}>{errors.description}</div>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="eventImage">Event Image</label>
              <input
                type="file"
                id="eventImage"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
              />
              {errors.image && <div className={styles.error}>{errors.image}</div>}
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className={styles.imagePreview}
                />
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
              {seatingOption !== 'none' && seatingOption !== 'random' && (
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
                            ${parseFloat(zone.default_price || 0).toFixed(2)}
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
              {seatingOption === 'random' && (
                <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
                  Will create custom layout based on "Available Tickets" field
                </small>
              )}
            </div>

            <div className={styles.buttonGroup}>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Event'}
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() => navigate('/')}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnCancel}`}
                onClick={() => navigate('/')}
              >
                Back to Events
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default AddEvent;
