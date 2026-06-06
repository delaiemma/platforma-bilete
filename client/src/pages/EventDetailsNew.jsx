/**
 * @file EventDetailsNew.jsx
 * Enhanced event details page component with seat selection and reviews
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useFavorites } from '../hooks/useFavorites';
import { useEventRoom } from '../hooks/useSocket';
import { eventsAPI } from '../api/events';
import { seatsAPI } from '../api/seats';
import { reviewsAPI } from '../api/reviews';
import { waitlistAPI } from '../api/waitlist';
import SeatMapModal from '../components/seats/SeatMapModal';
import styles from '../styles/EventDetailsNew.module.css';

/**
 * Enhanced event details page with seat selection, reviews, and favorites
 * @component
 * @returns {JSX.Element} Event details page component
 */
function EventDetailsNew() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const { addItem, addSeats, items } = useCartStore();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [showSeatModal, setShowSeatModal] = useState(false);
  const [waitlistStatus, setWaitlistStatus] = useState(null);
  const [waitlistLoading, setWaitlistLoading] = useState(false);

  const socket = useEventRoom(eventId);

  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [userReview, setUserReview] = useState(null);
  const [canReview, setCanReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchWaitlistStatus = useCallback(async () => {
    if (!eventId || !isAuthenticated) return;
    try {
      const data = await waitlistAPI.getStatus(eventId);
      setWaitlistStatus(data);
    } catch (err) {
    }
  }, [eventId, isAuthenticated]);

  useEffect(() => {
    fetchWaitlistStatus();
  }, [fetchWaitlistStatus]);

  const handleJoinWaitlist = async () => {
    if (!isAuthenticated) {
      if (confirm('You need to be logged in to join the waitlist. Go to login?')) {
        navigate('/login');
      }
      return;
    }
    setWaitlistLoading(true);
    try {
      await waitlistAPI.join(eventId);
      await fetchWaitlistStatus();
    } catch (err) {
      alert(err.message || 'Failed to join waitlist.');
    } finally {
      setWaitlistLoading(false);
    }
  };

  const handleLeaveWaitlist = async () => {
    setWaitlistLoading(true);
    try {
      await waitlistAPI.leave(eventId);
      setWaitlistStatus(null);
    } catch (err) {
      alert(err.message || 'Failed to leave waitlist.');
    } finally {
      setWaitlistLoading(false);
    }
  };

  const fetchReviews = useCallback(async () => {
    if (!eventId) return;
    try {
      const data = await reviewsAPI.getEventReviews(eventId);
      if (data.success) {
        setReviews(data.reviews);
        setReviewStats(data.stats);
        setUserReview(data.userReview);
        setCanReview(data.canReview);
        if (data.userReview) {
          setReviewRating(data.userReview.rating);
          setReviewComment(data.userReview.comment || '');
        }
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  }, [eventId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    if (!eventId || !socket || !socket.socket) return;

    const handleTicketsUpdated = (data) => {
      console.log('📡 [EventDetails] Received tickets-updated:', data);
      if (data.eventId === parseInt(eventId)) {
        queryClient.invalidateQueries(['events', eventId]);
      }
    };

    socket.socket.on('tickets-updated', handleTicketsUpdated);

    return () => {
      socket.socket.off('tickets-updated', handleTicketsUpdated);
    };
  }, [eventId, socket, queryClient]);

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['events', eventId],
    queryFn: () => eventsAPI.getById(eventId),
    enabled: !!eventId
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

  const isEventExpired = (event) => {
    if (!event?.date) return false;

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

      return eventDateTime < new Date();
    } catch (error) {
      console.error('Error parsing event date/time:', event, error);
      return false;
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      if (confirm('You need to be logged in to add items to cart. Go to login?')) {
        navigate('/login');
      }
      return;
    }

    if (event.has_seating) {
      setShowSeatModal(true);
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

  const handleSeatsConfirmed = async (selectedSeats) => {
    try {
      await seatsAPI.reserve(user.id, event.event_id, selectedSeats.map(s => ({
        row_letter: s.row,
        seat_number: s.number,
        zone_id: s.zone_id
      })));

      addSeats(event.event_id, selectedSeats);
      alert(`${selectedSeats.length} seat(s) reserved! Check your cart to complete purchase.`);
    } catch (err) {
      alert(err.message || 'Failed to reserve seats. Try again.');
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

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewRating) return;
    setSubmittingReview(true);
    try {
      await reviewsAPI.createOrUpdate(eventId, { rating: reviewRating, comment: reviewComment });
      await fetchReviews();
    } catch (err) {
      alert(err.message || 'Error saving review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!userReview) return;
    if (!confirm('Delete your review?')) return;
    try {
      await reviewsAPI.deleteReview(userReview.review_id);
      setUserReview(null);
      setReviewRating(0);
      setReviewComment('');
      await fetchReviews();
    } catch (err) {
      alert(err.message || 'Error deleting review.');
    }
  };

  const handleModify = () => {
    navigate(`/edit-event/${eventId}`);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      await eventsAPI.delete(eventId);
      alert('Event deleted successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className={styles.eventMain}>
        <div className={styles.loading}>Loading event details...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className={styles.eventMain}>
        <div className={styles.error}>
          <h2>Event not found</h2>
          <p>The event you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => navigate('/')} className={styles.navBtn}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const imagePath = event.image_path ? `/images/${event.image_path}` : '/images/banner1.jpg';
  const isFree = parseFloat(event.price) === 0;
  const price = isFree ? 'Free' : event.has_seating ? `from $${event.price}` : `$${event.price}`;
  const soldOut = event.available_tickets <= 0;
  const hasExpired = isEventExpired(event);
  const canEdit = user?.role === 'admin' && user?.id === event.user_id;
  const inCart = !!items[event.event_id];
  const isFav = isFavorite(event.event_id);

  const mapQuery = encodeURIComponent(`${event.location}, ${event.city}`);
  const mapSrc = `https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir//${mapQuery}`;

  return (
    <main className={styles.eventMain}>
      <div className={styles.eventContent}>
        <div className={styles.topSection}>
          <div className={styles.eventImageContainer}>
            <img
              src={imagePath}
              alt={event.title}
              className={styles.eventImage}
              onError={(e) => { e.target.src = '/images/banner1.jpg'; }}
            />
          </div>

          <div className={styles.eventDetailsRight}>
            <div className={styles.eventTitle}>{event.title}</div>

            <div className={styles.eventInfo}>
              <div className={styles.infoItem}>
                <span className={styles.icon}>📍</span>
                <div>
                  <div className={styles.venue}>{event.location}</div>
                  <div className={styles.address}>{event.city}</div>
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.datetime}>
                  {formatDate(event.date)} • {formatTime(event.time)}
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.price}>Price: {price}</div>
              </div>
            </div>

            <div className={styles.buttonsContainer}>
              {hasExpired ? (
                <div className={styles.expiredBanner}>
                  ⏰ This event has ended
                </div>
              ) : soldOut && !event.has_seating ? (
                <div className={styles.actionButtons}>
                  <div className={styles.soldOutBanner}>
                    🎟️ SOLD OUT
                  </div>
                  {waitlistStatus?.inWaitlist ? (
                    <>
                      <button
                        className={styles.leaveWaitlistBtn}
                        onClick={handleLeaveWaitlist}
                        disabled={waitlistLoading}
                      >
                        {waitlistLoading ? 'Loading...' : 'Leave Waitlist'}
                      </button>
                      <p className={styles.waitlistPosition}>
                        {waitlistStatus.status === 'notified'
                          ? 'A ticket is available for you! Purchase soon.'
                          : `You are #${waitlistStatus.position} in the waitlist`}
                      </p>
                    </>
                  ) : (
                    <button
                      className={styles.joinWaitlistBtn}
                      onClick={handleJoinWaitlist}
                      disabled={waitlistLoading}
                    >
                      {waitlistLoading ? 'Loading...' : 'Join Waitlist'}
                    </button>
                  )}
                </div>
              ) : !event.has_seating ? (
                <div className={styles.actionButtons}>
                  <button
                    className={`${styles.addToCartBtn} ${inCart ? styles.isInCart : ''}`}
                    onClick={handleAddToCart}
                  >
                    {inCart ? 'In Cart' : 'Add to Cart'}
                  </button>
                  <button
                    className={styles.addToFavouritesBtn}
                    onClick={handleToggleFavorite}
                  >
                    {isFav ? 'Remove Favourite' : 'Add to Favourites'}
                  </button>
                </div>
              ) : event.has_seating ? (
                <div className={styles.actionButtons}>
                  <button
                    className={styles.addToCartBtn}
                    onClick={handleAddToCart}
                  >
                    Add to Cart
                  </button>
                  <button
                    className={styles.addToFavouritesBtn}
                    onClick={handleToggleFavorite}
                  >
                    {isFav ? 'Remove Favourite' : 'Add to Favourites'}
                  </button>
                </div>
              ) : null}

              {canEdit && (
                <div className={styles.adminControls}>
                  <button className={`${styles.adminBtn} ${styles.modifyBtn}`} onClick={handleModify}>
                    Modify
                  </button>
                  <button className={`${styles.adminBtn} ${styles.deleteBtn}`} onClick={handleDelete}>
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className={styles.mapContainer}>
            <h3 className={styles.mapTitle}>Location</h3>
            <iframe
              width="100%"
              height="550"
              frameBorder="0"
              style={{ border: 0 }}
              referrerPolicy="no-referrer-when-downgrade"
              src={mapSrc}
              allowFullScreen
              title="Event Location Map"
            />
            <a
              href={directionsUrl}
              className={styles.directionsLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Directions →
            </a>
          </div>
        </div>

        <div className={styles.bottomSection}>
          <div className={styles.organizerInfo}>
            By <span>{event.organizer}</span>
          </div>

          <div className={styles.eventDescription}>
            About this event
            <p>{event.description || 'Event description will be displayed here...'}</p>
          </div>
        </div>
      </div>

      {/* Reviews section */}
      <div className={styles.reviewsSection}>
        <div className={styles.reviewsHeader}>
          <h2 className={styles.reviewsTitle}>Reviews</h2>
          {reviewStats && parseInt(reviewStats.total) > 0 && (
            <div className={styles.reviewsSummary}>
              <span className={styles.avgRating}>{reviewStats.avg_rating}</span>
              <span className={styles.starsDisplay}>
                {[1,2,3,4,5].map(s => (
                  <span key={s} className={parseFloat(reviewStats.avg_rating) >= s ? styles.starFilled : styles.starEmpty}>★</span>
                ))}
              </span>
              <span className={styles.totalReviews}>({reviewStats.total} {reviewStats.total === '1' ? 'review' : 'reviews'})</span>
            </div>
          )}
        </div>

        {/* Review form — only for past events where user has a ticket */}
        {isAuthenticated && canReview && (
          <form className={styles.reviewForm} onSubmit={handleSubmitReview}>
            <div className={styles.starPicker}>
              {[1,2,3,4,5].map(s => (
                <span
                  key={s}
                  className={(reviewHover || reviewRating) >= s ? styles.starFilled : styles.starEmpty}
                  onMouseEnter={() => setReviewHover(s)}
                  onMouseLeave={() => setReviewHover(0)}
                  onClick={() => setReviewRating(s)}
                  style={{ cursor: 'pointer' }}
                >★</span>
              ))}
            </div>
            <textarea
              className={styles.reviewTextarea}
              placeholder="Comment (optional)"
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <div className={styles.reviewFormActions}>
              <button type="submit" className={styles.submitReviewBtn} disabled={!reviewRating || submittingReview}>
                {submittingReview ? 'Saving...' : userReview ? 'Update review' : 'Submit review'}
              </button>
              {userReview && (
                <button type="button" className={styles.deleteReviewBtn} onClick={handleDeleteReview}>
                  Delete review
                </button>
              )}
            </div>
          </form>
        )}

        {isAuthenticated && !canReview && !userReview && (
          <p className={styles.reviewNote}>Only ticket buyers can leave a review.</p>
        )}

        {/* List of reviews */}
        {reviews.length > 0 ? (
          <div className={styles.reviewsList}>
            {reviews.map(r => (
              <div key={r.review_id} className={styles.reviewCard}>
                <div className={styles.reviewTop}>
                  <span className={styles.reviewStars}>
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className={r.rating >= s ? styles.starFilled : styles.starEmpty}>★</span>
                    ))}
                  </span>
                  <span className={styles.reviewDate}>
                    {new Date(r.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                {r.comment && <p className={styles.reviewComment}>{r.comment}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.noReviews}>No reviews yet.</p>
        )}
      </div>

      {/* Seat selection modal */}
      <SeatMapModal
        eventId={event.event_id}
        isOpen={showSeatModal}
        onClose={() => setShowSeatModal(false)}
        onSeatsConfirmed={handleSeatsConfirmed}
      />
    </main>
  );
}

export default EventDetailsNew;
