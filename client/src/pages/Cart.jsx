/**
 * @file Cart.jsx
 * Shopping cart page component for ticket purchases
 */

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useSocket } from '../hooks/useSocket';
import socketService from '../services/socket';
import { eventsAPI } from '../api/events';
import { purchaseAPI } from '../api/purchase';
import { seatsAPI } from '../api/seats';
import ReservationTimer from '../components/cart/ReservationTimer';
import PurchaseModal from '../components/cart/PurchaseModal';
import styles from '../styles/CartNew.module.css';

/**
 * Shopping cart page with item management, discount codes, and checkout
 * @component
 * @returns {JSX.Element} Cart page component
 */
function Cart() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { items, removeItem, updateQuantity, removeSeats } = useCartStore();
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [modalState, setModalState] = useState(null);
  const [purchasedTickets, setPurchasedTickets] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [pendingPurchaseData, setPendingPurchaseData] = useState(null);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountError, setDiscountError] = useState('');

  const socket = useSocket();
  const cartItemIds = Object.keys(items).map(id => parseInt(id));

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['cart', 'events', cartItemIds],
    queryFn: async () => {
      if (cartItemIds.length === 0) return [];

      const eventPromises = cartItemIds.map(id =>
        eventsAPI.getById(id).catch(() => null)
      );

      const results = await Promise.all(eventPromises);
      return results.filter(event => event !== null);
    },
    enabled: cartItemIds.length > 0
  });

  useEffect(() => {
    if (events.length > 0) {
      setSelectedItems(new Set(events.map(e => e.event_id)));
    }
  }, [events]);

  useEffect(() => {
    if (!socket || cartItemIds.length === 0) return;

    const handleTicketsUpdated = (data) => {
      console.log('📡 [Cart] Received tickets-updated:', data);
      if (cartItemIds.includes(data.eventId)) {
        queryClient.invalidateQueries(['cart', 'events', cartItemIds]);
        queryClient.invalidateQueries(['events', data.eventId]);
      }
    };

    const handleSeatsReserved = (data) => {
      console.log('📡 [Cart] Received seats-reserved:', data);
      if (cartItemIds.includes(data.eventId)) {
        queryClient.invalidateQueries(['cart', 'events', cartItemIds]);
        queryClient.invalidateQueries(['events', data.eventId]);
      }
    };

    const handleSeatsReleased = (data) => {
      console.log('📡 [Cart] Received seats-released:', data);
      if (cartItemIds.includes(data.eventId)) {
        queryClient.invalidateQueries(['cart', 'events', cartItemIds]);
        queryClient.invalidateQueries(['events', data.eventId]);
      }
    };

    cartItemIds.forEach(eventId => {
      socketService.joinEvent(eventId);
    });

    socketService.socket.on('tickets-updated', handleTicketsUpdated);
    socketService.socket.on('seats-reserved', handleSeatsReserved);
    socketService.socket.on('seats-released', handleSeatsReleased);

    return () => {
      socketService.socket.off('tickets-updated', handleTicketsUpdated);
      socketService.socket.off('seats-reserved', handleSeatsReserved);
      socketService.socket.off('seats-released', handleSeatsReleased);

      cartItemIds.forEach(eventId => {
        socketService.leaveEvent(eventId);
      });
    };
  }, [socket, cartItemIds, queryClient]);

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

  const handleToggleSelect = (eventId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const calculateTotal = () => {
    return events
      .filter(event => selectedItems.has(event.event_id))
      .reduce((total, event) => {
        const cartItem = items[event.event_id];

        if (cartItem && typeof cartItem === 'object' && cartItem.seats) {
          const seatTotal = cartItem.seats.reduce((sum, seat) => sum + (seat.price || 0), 0);
          return total + seatTotal;
        }

        const quantity = cartItem || 0;
        return total + (parseFloat(event.price) * quantity);
      }, 0);
  };

  const calculateTotalQuantity = () => {
    return events
      .filter(event => selectedItems.has(event.event_id))
      .reduce((sum, event) => {
        const cartItem = items[event.event_id];

        if (cartItem && typeof cartItem === 'object' && cartItem.seats) {
          return sum + cartItem.seats.length;
        }

        return sum + (cartItem || 0);
      }, 0);
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError('Please enter a discount code');
      return;
    }

    setDiscountError('');

    try {
      const eventIds = Array.from(selectedItems);

      const response = await fetch('http://localhost:3000/api/discounts/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: discountCode,
          userId: user?.id,
          amount: calculateTotal(),
          eventIds: eventIds
        })
      });

      const data = await response.json();

      if (!data.success) {
        setDiscountError(data.message);
        setAppliedDiscount(null);
        return;
      }

      setAppliedDiscount(data.discount);
      setDiscountError('');
    } catch (error) {
      console.error('Error applying discount:', error);
      setDiscountError('Failed to apply discount code');
      setAppliedDiscount(null);
    }
  };

  const handleRemoveDiscount = () => {
    setDiscountCode('');
    setAppliedDiscount(null);
    setDiscountError('');
  };

  const getFinalTotal = () => {
    const subtotal = calculateTotal();
    if (appliedDiscount) {
      let discountAmount = 0;
      if (appliedDiscount.type === 'percentage') {
        discountAmount = (subtotal * appliedDiscount.value) / 100;
      } else if (appliedDiscount.type === 'fixed_amount') {
        discountAmount = appliedDiscount.value;
      }
      discountAmount = Math.min(discountAmount, subtotal);
      return Math.max(0, subtotal - discountAmount);
    }
    return subtotal;
  };

  const getDiscountAmount = () => {
    if (!appliedDiscount) return 0;
    const subtotal = calculateTotal();
    let discountAmount = 0;
    if (appliedDiscount.type === 'percentage') {
      discountAmount = (subtotal * appliedDiscount.value) / 100;
    } else if (appliedDiscount.type === 'fixed_amount') {
      discountAmount = appliedDiscount.value;
    }
    return Math.min(discountAmount, subtotal);
  };

  const handleQuantityChange = async (eventId, change) => {
    await updateQuantity(eventId, change);
  };

  const handleRemove = async (e, eventId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this item from your cart?')) {
      const cartItem = items[eventId];

      if (cartItem && typeof cartItem === 'object' && cartItem.seats) {
        try {
          await seatsAPI.unreserve(user.id, eventId, cartItem.seats.map(s => ({
            row_letter: s.row,
            seat_number: s.number,
            zone_id: s.zone_id
          })));

          removeSeats(eventId);
        } catch (error) {
          console.error('Error releasing seats:', error);
          alert('Failed to remove seats. Please try again.');
          return;
        }
      } else {
        await removeItem(eventId);
      }

      setSelectedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    }
  };

  const buildPurchaseData = () => ({
    userId: user.id,
    events: Array.from(selectedItems).map(eventId => {
      const cartItem = items[eventId];
      if (cartItem && typeof cartItem === 'object' && cartItem.seats) {
        return {
          eventId,
          seats: cartItem.seats.map(s => ({
            row_letter: s.row,
            seat_number: s.number,
            zone_id: s.zone_id,
            price: s.price
          }))
        };
      }
      return { eventId, quantity: cartItem };
    })
  });

  const handlePurchase = async () => {
    if (selectedItems.size === 0) {
      alert('Please select at least one item to purchase');
      return;
    }

    for (const event of events) {
      if (selectedItems.has(event.event_id)) {
        const cartItem = items[event.event_id];
        if (typeof cartItem === 'number') {
          if (event.available_tickets < cartItem) {
            alert(`Not enough tickets available for "${event.title}". Only ${event.available_tickets} tickets left.`);
            return;
          }
        }
      }
    }

    const subtotal = calculateTotal();
    const finalTotal = getFinalTotal();
    const purchaseData = buildPurchaseData();

    if (appliedDiscount) {
      purchaseData.discountCode = appliedDiscount.code;
    }

    if (finalTotal === 0) {
      setModalState('loading');
      try {
        const result = await purchaseAPI.process(purchaseData);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setPurchasedTickets(result.tickets);
        setModalState('success');
      } catch (error) {
        console.error('Purchase error:', error);
        setModalState(null);
        alert(error.message || 'Failed to complete purchase. Please try again.');
      }
      return;
    }

    try {
      console.log('📦 Building intent data...');
      console.log('📦 Selected items:', Array.from(selectedItems));
      console.log('📦 Cart items:', items);

      const intentData = {
        userId: user.id,
        events: Array.from(selectedItems).map(eventId => {
          const cartItem = items[eventId];
          console.log(`📦 Event ${eventId} - cartItem:`, cartItem, '| type:', typeof cartItem);

          if (cartItem && typeof cartItem === 'object' && cartItem.seats) {
            console.log(`📦 Event ${eventId} - SEAT-BASED`);
            return { eventId, seats: cartItem.seats.map(s => ({ row_letter: s.row, seat_number: s.number, price: s.price })) };
          }
          console.log(`📦 Event ${eventId} - QUANTITY-BASED, quantity:`, cartItem);
          return { eventId, quantity: cartItem };
        })
      };

      if (appliedDiscount) {
        intentData.discountCode = appliedDiscount.code;
        console.log('🎫 Applying discount code:', appliedDiscount.code);
      }

      console.log('📦 Final intent data:', JSON.stringify(intentData, null, 2));

      const intentResult = await purchaseAPI.createPaymentIntent(intentData);
      console.log('✅ Payment Intent created:', intentResult);
      console.log('✅ Client Secret:', intentResult.clientSecret);
      setClientSecret(intentResult.clientSecret);
      setPaymentAmount(intentResult.amount);
      setPendingPurchaseData(purchaseData);
      console.log('✅ Setting modal state to payment');
      setModalState('payment');
    } catch (error) {
      console.error('Payment intent error:', error);
      alert(error.message || 'Failed to initiate payment. Please try again.');
    }
  };

  const handlePaymentSuccess = async (paymentIntentId) => {
    setModalState('loading');
    try {
      await purchaseAPI.confirmPayment(paymentIntentId);

      const result = await purchaseAPI.process({ ...pendingPurchaseData, paymentIntentId });
      await new Promise(resolve => setTimeout(resolve, 1500));
      setPurchasedTickets(result.tickets);
      setModalState('success');
    } catch (error) {
      console.error('Purchase error:', error);
      setModalState(null);
      alert(error.message || 'Failed to complete purchase. Please try again.');
    }
  };

  const handleCloseModal = async () => {
    if (modalState === 'success' && purchasedTickets) {
      const purchasedEventIds = purchasedTickets.map(t => t.event_id);

      for (const eventId of purchasedEventIds) {
        const cartItem = items[eventId];

        if (cartItem && typeof cartItem === 'object' && cartItem.seats) {
          removeSeats(eventId);
        } else {
          await removeItem(eventId);
        }
      }

      queryClient.invalidateQueries(['events']);
      queryClient.invalidateQueries(['cart']);
      queryClient.invalidateQueries(['reservations']);
      queryClient.invalidateQueries(['seatAvailability']);
    }

    setModalState(null);
    setPurchasedTickets(null);
    setSelectedItems(new Set());
  };

  if (isLoading) {
    return (
      <main className={styles.cartMain}>
        <div className={styles.cartContentContainer}>
          <h1 className={styles.cartTitle}>Cart</h1>
          <div className={styles.loading}>Loading your cart...</div>
        </div>
      </main>
    );
  }

  if (events.length === 0) {
    return (
      <main className={styles.cartMain}>
        <div className={styles.cartContentContainer}>
          <h1 className={styles.cartTitle}>Cart</h1>
          <div className={styles.cartContent}>
            <div className={styles.emptyCart}>
              <h3>Your cart is empty</h3>
              <p>Start exploring events and add them to your cart!</p>
              <button className={styles.browseEventsBtn} onClick={() => navigate('/')}>
                Browse Events
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const total = calculateTotal();
  const totalQuantity = calculateTotalQuantity();

  return (
    <main className={styles.cartMain}>
      <div className={styles.cartContentContainer}>
        <h1 className={styles.cartTitle}>Cart</h1>

        <div className={styles.cartContent}>
          <ReservationTimer />

          <div className={styles.cartItems}>
            {events.map(event => {
              const imagePath = event.image_path ? `/images/${event.image_path}` : '/images/banner1.jpg';
              const cartItem = items[event.event_id];
              const isSelected = selectedItems.has(event.event_id);

              const isSeatBased = cartItem && typeof cartItem === 'object' && cartItem.seats;
              const seats = isSeatBased ? cartItem.seats : [];
              const quantity = isSeatBased ? seats.length : (cartItem || 0);

              let itemTotal = 0;
              if (isSeatBased) {
                itemTotal = seats.reduce((sum, seat) => sum + (seat.price || 0), 0);
              } else {
                const price = parseFloat(event.price);
                itemTotal = price * quantity;
              }

              return (
                <div key={event.event_id} className={styles.cartItem}>
                  <div className={styles.itemCheckbox}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(event.event_id)}
                    />
                  </div>

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

                    {isSeatBased ? (
                      <>
                        <div className={styles.itemSeats}>
                          <strong>Seats:</strong>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                            {seats.map((seat, idx) => (
                              <span
                                key={idx}
                                style={{
                                  padding: '4px 10px',
                                  background: '#f0f0f0',
                                  border: '1px solid #000',
                                  fontSize: 13,
                                  fontStyle: 'italic'
                                }}
                              >
                                {seat.row}{seat.number}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className={styles.itemTotal} style={{ marginTop: 8 }}>
                          Total: ${itemTotal.toFixed(2)}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className={styles.itemPrice}>
                          Price: {parseFloat(event.price) === 0 ? 'Free' : `$${event.price}`}
                        </div>
                        <div className={styles.itemQuantity}>
                          Quantity: {quantity}
                        </div>
                        <div className={`${styles.itemTotal} ${parseFloat(event.price) === 0 ? styles.free : ''}`}>
                          Total: {itemTotal === 0 ? 'Free' : `$${itemTotal.toFixed(2)}`}
                        </div>
                      </>
                    )}
                  </div>

                  <button
                    className={styles.removeItemBtn}
                    onClick={(e) => handleRemove(e, event.event_id)}
                    title="Remove from cart"
                  >
                    ×
                  </button>

                  {!isSeatBased && (
                    <div className={styles.quantityControls}>
                      <button
                        className={styles.quantityBtn}
                        onClick={() => handleQuantityChange(event.event_id, -1)}
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <span className={styles.quantityDisplay}>{quantity}</span>
                      <button
                        className={styles.quantityBtn}
                        onClick={() => handleQuantityChange(event.event_id, 1)}
                        disabled={quantity >= event.available_tickets}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {selectedItems.size > 0 && (
            <div className={styles.orderSummary}>
              <h3>Order Summary</h3>
              <div className={styles.summaryRow}>
                <span>Quantity:</span>
                <span>{totalQuantity}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Subtotal:</span>
                <span>${total.toFixed(2)}</span>
              </div>

              {/* Discount Code Section */}
              <div className={styles.discountSection}>
                <div className={styles.discountLabel}>Have a discount code?</div>
                {!appliedDiscount ? (
                  <div className={styles.discountInput}>
                    <input
                      type="text"
                      placeholder="Enter code"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                      onKeyPress={(e) => e.key === 'Enter' && handleApplyDiscount()}
                      className={styles.discountCodeInput}
                    />
                    <button
                      onClick={handleApplyDiscount}
                      className={styles.applyDiscountBtn}
                      disabled={!discountCode.trim()}
                    >
                      Apply
                    </button>
                  </div>
                ) : (
                  <div className={styles.appliedDiscountBox}>
                    <div className={styles.appliedDiscountInfo}>
                      <span className={styles.discountCodeApplied}>{appliedDiscount.code}</span>
                      <span className={styles.discountDescription}>{appliedDiscount.description}</span>
                    </div>
                    <button onClick={handleRemoveDiscount} className={styles.removeDiscountBtn}>×</button>
                  </div>
                )}
                {discountError && <div className={styles.discountError}>{discountError}</div>}
              </div>

              {appliedDiscount && (
                <div className={styles.summaryRow} style={{ color: '#10b981', fontWeight: 500 }}>
                  <span>Discount ({appliedDiscount.type === 'percentage' ? `${appliedDiscount.value}%` : `$${appliedDiscount.value}`}):</span>
                  <span>-${getDiscountAmount().toFixed(2)}</span>
                </div>
              )}

              <div className={`${styles.summaryRow} ${styles.total}`}>
                <span>Total Price:</span>
                <span>${getFinalTotal().toFixed(2)}</span>
              </div>
              <button
                className={styles.buyTicketsBtn}
                onClick={handlePurchase}
              >
                Buy Tickets
              </button>
            </div>
          )}
        </div>
      </div>

      <PurchaseModal
        isOpen={modalState !== null}
        state={modalState}
        tickets={purchasedTickets}
        onClose={handleCloseModal}
        clientSecret={clientSecret}
        paymentAmount={paymentAmount}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </main>
  );
}

export default Cart;
