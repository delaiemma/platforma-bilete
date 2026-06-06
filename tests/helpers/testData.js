const { testPool } = require('../setup');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

/**
 * Create a test user
 */
async function createTestUser(overrides = {}) {
  const randomId = Math.random().toString(36).substring(7);
  const userData = {
    name: 'Test User',
    email: `test${Date.now()}_${randomId}@example.com`,
    password: 'testpassword123',
    role: 'user',
    ...overrides
  };

  const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);

  const result = await testPool.query(
    `INSERT INTO "user" (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userData.name, userData.email, hashedPassword, userData.role]
  );

  return result.rows[0];
}

/**
 * Create a test event
 */
async function createTestEvent(userId, overrides = {}) {
  const eventData = {
    title: 'Test Event',
    description: 'Test event description',
    location: 'Test Venue',
    city: 'Test City',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    time: '19:00:00',
    price: 50.00,
    available_tickets: 100,
    type: 'Concert',
    image_path: 'test.jpg',
    tickets_sold: 0,
    has_seating: false,
    ...overrides
  };

  const result = await testPool.query(
    `INSERT INTO event (title, description, location, city, date, time, price,
                        available_tickets, type, image_path, user_id, tickets_sold, has_seating)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING *`,
    [
      eventData.title, eventData.description, eventData.location, eventData.city,
      eventData.date, eventData.time, eventData.price, eventData.available_tickets,
      eventData.type, eventData.image_path, userId, eventData.tickets_sold, eventData.has_seating
    ]
  );

  return result.rows[0];
}

/**
 * Create a test venue layout with seats
 */
async function createTestLayout(userId, options = {}) {
  const { totalSeats = 60, vipSeats = 18, regularSeats = 30, balconySeats = 12 } = options;

  const layoutResult = await testPool.query(
    `INSERT INTO venue_layouts (name, description, created_by)
     VALUES ($1, $2, $3)
     RETURNING *`,
    ['Test Layout', 'Test layout description', userId]
  );
  const layout = layoutResult.rows[0];

  const vipZone = await testPool.query(
    `INSERT INTO seat_zones (layout_id, name, color, display_order)
     VALUES ($1, 'VIP', '#FFD700', 1)
     RETURNING *`,
    [layout.layout_id]
  );

  const regularZone = await testPool.query(
    `INSERT INTO seat_zones (layout_id, name, color, display_order)
     VALUES ($1, 'Regular', '#4CAF50', 2)
     RETURNING *`,
    [layout.layout_id]
  );

  const balconyZone = await testPool.query(
    `INSERT INTO seat_zones (layout_id, name, color, display_order)
     VALUES ($1, 'Balcony', '#2196F3', 3)
     RETURNING *`,
    [layout.layout_id]
  );

  const rows = [];
  let rowLetter = 65;

  const vipRows = Math.ceil(vipSeats / 20);
  for (let i = 0; i < vipRows; i++) {
    const seatsInRow = i === vipRows - 1 ? vipSeats - i * 20 : 20;
    const row = await testPool.query(
      `INSERT INTO layout_rows (layout_id, zone_id, row_letter, seats_in_row, row_order)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [layout.layout_id, vipZone.rows[0].zone_id, String.fromCharCode(rowLetter++), seatsInRow, rows.length]
    );
    rows.push(row.rows[0]);
  }

  const regularRows = Math.ceil(regularSeats / 20);
  for (let i = 0; i < regularRows; i++) {
    const seatsInRow = i === regularRows - 1 ? regularSeats - i * 20 : 20;
    const row = await testPool.query(
      `INSERT INTO layout_rows (layout_id, zone_id, row_letter, seats_in_row, row_order)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [layout.layout_id, regularZone.rows[0].zone_id, String.fromCharCode(rowLetter++), seatsInRow, rows.length]
    );
    rows.push(row.rows[0]);
  }

  const balconyRows = Math.ceil(balconySeats / 20);
  for (let i = 0; i < balconyRows; i++) {
    const seatsInRow = i === balconyRows - 1 ? balconySeats - i * 20 : 20;
    const row = await testPool.query(
      `INSERT INTO layout_rows (layout_id, zone_id, row_letter, seats_in_row, row_order)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [layout.layout_id, balconyZone.rows[0].zone_id, String.fromCharCode(rowLetter++), seatsInRow, rows.length]
    );
    rows.push(row.rows[0]);
  }

  return {
    layout: layout,
    zones: [vipZone.rows[0], regularZone.rows[0], balconyZone.rows[0]],
    rows: rows
  };
}

/**
 * Assign layout to event
 */
async function assignLayoutToEvent(eventId, layoutId, zonePricing) {
  await testPool.query(
    `INSERT INTO event_layouts (event_id, layout_id)
     VALUES ($1, $2)`,
    [eventId, layoutId]
  );

  for (const { zone_id, price } of zonePricing) {
    await testPool.query(
      `INSERT INTO event_zone_pricing (event_id, zone_id, price)
       VALUES ($1, $2, $3)`,
      [eventId, zone_id, price]
    );
  }

  await testPool.query(
    `UPDATE event SET has_seating = true WHERE event_id = $1`,
    [eventId]
  );
}

/**
 * Create a test purchase
 */
async function createTestPurchase(userId, eventId, quantity, totalPrice) {
  const result = await testPool.query(
    `INSERT INTO purchases (user_id, event_id, quantity, total_price)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, eventId, quantity, totalPrice]
  );

  return result.rows[0];
}

/**
 * Create a seat reservation
 */
async function createSeatReservation(userId, eventId, rowLetter, seatNumber, zoneId, expiresAt = null) {
  const expiry = expiresAt || new Date(Date.now() + 15 * 60 * 1000);

  const result = await testPool.query(
    `INSERT INTO seat_reservations (user_id, event_id, row_letter, seat_number, zone_id, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [userId, eventId, rowLetter, seatNumber, zoneId, expiry]
  );

  return result.rows[0];
}

/**
 * Create a ticket seat (sold)
 */
async function createTicketSeat(purchaseId, eventId, rowLetter, seatNumber, zoneId, ticketId) {
  const result = await testPool.query(
    `INSERT INTO ticket_seats (purchase_id, event_id, row_letter, seat_number, zone_id, ticket_id, qr_code)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [purchaseId, eventId, rowLetter, seatNumber, zoneId, ticketId, 'test-qr-code']
  );

  return result.rows[0];
}

module.exports = {
  createTestUser,
  createTestEvent,
  createTestLayout,
  assignLayoutToEvent,
  createTestPurchase,
  createSeatReservation,
  createTicketSeat
};
