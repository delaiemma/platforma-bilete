const { testPool } = require('../setup');
const {
  createTestUser,
  createTestEvent,
  createTestLayout,
  assignLayoutToEvent
} = require('../helpers/testData');

describe('Database Constraint Tests - CRITICAL FOR LICENȚĂ', () => {
  let testUser, testEvent;

  beforeEach(async () => {
    testUser = await createTestUser();
    testEvent = await createTestEvent(testUser.user_id);
  });

  /**
   * TEST 1: UNIQUE Constraints
   */
  describe('UNIQUE Constraint Enforcement', () => {
    test('Prevents duplicate user emails', async () => {
      const email = `duplicate${Date.now()}@test.com`;

      await testPool.query(
        `INSERT INTO "user" (name, email, password, role)
         VALUES ('User 1', $1, 'password123', 'user')`,
        [email]
      );

      await expect(async () => {
        await testPool.query(
          `INSERT INTO "user" (name, email, password, role)
           VALUES ('User 2', $1, 'password456', 'user')`,
          [email]
        );
      }).rejects.toThrow(/duplicate key|unique constraint/i);

      const users = await testPool.query(
        'SELECT * FROM "user" WHERE email = $1',
        [email]
      );

      expect(users.rows.length).toBe(1);
      expect(users.rows[0].name).toBe('User 1');
    });

    test('Prevents duplicate cart entries (user_id, event_id)', async () => {
      await testPool.query(
        `INSERT INTO cart (user_id, event_id, quantity)
         VALUES ($1, $2, 3)`,
        [testUser.user_id, testEvent.event_id]
      );

      await expect(async () => {
        await testPool.query(
          `INSERT INTO cart (user_id, event_id, quantity)
           VALUES ($1, $2, 5)`,
          [testUser.user_id, testEvent.event_id]
        );
      }).rejects.toThrow(/duplicate key|unique constraint/i);

      const cartItems = await testPool.query(
        'SELECT * FROM cart WHERE user_id = $1 AND event_id = $2',
        [testUser.user_id, testEvent.event_id]
      );

      expect(cartItems.rows.length).toBe(1);
      expect(cartItems.rows[0].quantity).toBe(3);
    });

    test('Prevents duplicate favorites (user_id, event_id)', async () => {
      await testPool.query(
        `INSERT INTO favorites (user_id, event_id)
         VALUES ($1, $2)`,
        [testUser.user_id, testEvent.event_id]
      );

      await expect(async () => {
        await testPool.query(
          `INSERT INTO favorites (user_id, event_id)
           VALUES ($1, $2)`,
          [testUser.user_id, testEvent.event_id]
        );
      }).rejects.toThrow(/duplicate key|unique constraint/i);

      const favorites = await testPool.query(
        'SELECT * FROM favorites WHERE user_id = $1 AND event_id = $2',
        [testUser.user_id, testEvent.event_id]
      );

      expect(favorites.rows.length).toBe(1);
    });

    test('Prevents duplicate ticket IDs', async () => {
      const purchase = await testPool.query(
        `INSERT INTO purchases (user_id, event_id, quantity, total_price)
         VALUES ($1, $2, 2, 100.00)
         RETURNING *`,
        [testUser.user_id, testEvent.event_id]
      );

      const ticketId = 'TKT-UNIQUE-TEST-001';

      const layout = await createTestLayout(testUser.user_id);
      await assignLayoutToEvent(testEvent.event_id, layout.layout.layout_id, [
        { zone_id: layout.zones[0].zone_id, price: 50 }
      ]);

      const zoneId = layout.zones[0].zone_id;

      await testPool.query(
        `INSERT INTO ticket_seats (purchase_id, event_id, row_letter, seat_number, zone_id, ticket_id, qr_code)
         VALUES ($1, $2, 'A', 1, $3, $4, 'qr1')`,
        [purchase.rows[0].purchase_id, testEvent.event_id, zoneId, ticketId]
      );

      await expect(async () => {
        await testPool.query(
          `INSERT INTO ticket_seats (purchase_id, event_id, row_letter, seat_number, zone_id, ticket_id, qr_code)
           VALUES ($1, $2, 'A', 2, $3, $4, 'qr2')`,
          [purchase.rows[0].purchase_id, testEvent.event_id, zoneId, ticketId]
        );
      }).rejects.toThrow(/duplicate key|unique constraint/i);

      const tickets = await testPool.query(
        'SELECT * FROM ticket_seats WHERE ticket_id = $1',
        [ticketId]
      );

      expect(tickets.rows.length).toBe(1);
    });
  });

  /**
   * TEST 2: CHECK Constraints
   */
  describe('CHECK Constraint Enforcement', () => {
    test.skip('Prevents negative ticket prices (NOTE: Not implemented in current schema)', async () => {
      await expect(async () => {
        await testPool.query(
          `INSERT INTO event (title, description, location, city, date, time, price,
                              available_tickets, type, image_path, user_id)
           VALUES ('Test Event', 'Desc', 'Venue', 'City', '2025-12-31', '20:00:00',
                   -50.00, 100, 'Concert', 'test.jpg', $1)`,
          [testUser.user_id]
        );
      }).rejects.toThrow(/check constraint|constraint/i);
    });

    test('Prevents zero or negative seats_in_row', async () => {
      const layout = await testPool.query(
        `INSERT INTO venue_layouts (name, description, created_by)
         VALUES ('Test Layout', 'Desc', $1)
         RETURNING *`,
        [testUser.user_id]
      );

      const zone = await testPool.query(
        `INSERT INTO seat_zones (layout_id, name, color, display_order)
         VALUES ($1, 'Test Zone', '#FFFFFF', 1)
         RETURNING *`,
        [layout.rows[0].layout_id]
      );

      await expect(async () => {
        await testPool.query(
          `INSERT INTO layout_rows (layout_id, zone_id, row_letter, seats_in_row, row_order)
           VALUES ($1, $2, 'A', 0, 1)`,
          [layout.rows[0].layout_id, zone.rows[0].zone_id]
        );
      }).rejects.toThrow(/check constraint|violates check/i);

      await expect(async () => {
        await testPool.query(
          `INSERT INTO layout_rows (layout_id, zone_id, row_letter, seats_in_row, row_order)
           VALUES ($1, $2, 'B', -5, 1)`,
          [layout.rows[0].layout_id, zone.rows[0].zone_id]
        );
      }).rejects.toThrow(/check constraint|violates check/i);

      const validRow = await testPool.query(
        `INSERT INTO layout_rows (layout_id, zone_id, row_letter, seats_in_row, row_order)
         VALUES ($1, $2, 'C', 20, 1)
         RETURNING *`,
        [layout.rows[0].layout_id, zone.rows[0].zone_id]
      );

      expect(validRow.rows[0].seats_in_row).toBe(20);
    });

    test('Prevents negative zone pricing', async () => {
      const layout = await createTestLayout(testUser.user_id);
      await assignLayoutToEvent(testEvent.event_id, layout.layout.layout_id, [
        { zone_id: layout.zones[0].zone_id, price: 50 }
      ]);

      await expect(async () => {
        await testPool.query(
          `UPDATE event_zone_pricing
           SET price = -100.00
           WHERE event_id = $1 AND zone_id = $2`,
          [testEvent.event_id, layout.zones[0].zone_id]
        );
      }).rejects.toThrow(/check constraint|violates check/i);

      const pricing = await testPool.query(
        `SELECT price FROM event_zone_pricing
         WHERE event_id = $1 AND zone_id = $2`,
        [testEvent.event_id, layout.zones[0].zone_id]
      );

      expect(parseFloat(pricing.rows[0].price)).toBe(50);
    });
  });

  /**
   * TEST 3: Foreign Key Constraints (CASCADE and RESTRICT)
   */
  describe('Foreign Key Constraint Behavior', () => {
    test('Foreign key prevents deleting user who owns events', async () => {
      await expect(async () => {
        await testPool.query(
          'DELETE FROM "user" WHERE user_id = $1',
          [testUser.user_id]
        );
      }).rejects.toThrow(/foreign key constraint|violates foreign key/i);

      const user = await testPool.query(
        'SELECT * FROM "user" WHERE user_id = $1',
        [testUser.user_id]
      );

      expect(user.rows.length).toBe(1);
    });

    test('Deleting user cascades to purchases, cart, and favorites', async () => {
      const user2 = await createTestUser();

      const purchase = await testPool.query(
        `INSERT INTO purchases (user_id, event_id, quantity, total_price)
         VALUES ($1, $2, 5, 250.00)
         RETURNING *`,
        [user2.user_id, testEvent.event_id]
      );

      await testPool.query(
        `INSERT INTO cart (user_id, event_id, quantity)
         VALUES ($1, $2, 3)`,
        [user2.user_id, testEvent.event_id]
      );

      await testPool.query(
        `INSERT INTO favorites (user_id, event_id)
         VALUES ($1, $2)`,
        [user2.user_id, testEvent.event_id]
      );

      expect(purchase.rows.length).toBe(1);

      await testPool.query(
        'DELETE FROM "user" WHERE user_id = $1',
        [user2.user_id]
      );

      const purchases = await testPool.query(
        'SELECT * FROM purchases WHERE user_id = $1',
        [user2.user_id]
      );
      const cart = await testPool.query(
        'SELECT * FROM cart WHERE user_id = $1',
        [user2.user_id]
      );
      const favorites = await testPool.query(
        'SELECT * FROM favorites WHERE user_id = $1',
        [user2.user_id]
      );

      expect(purchases.rows.length).toBe(0);
      expect(cart.rows.length).toBe(0);
      expect(favorites.rows.length).toBe(0);
    });

    test('Foreign key prevents deleting event with ticket_seats', async () => {
      const purchase = await testPool.query(
        `INSERT INTO purchases (user_id, event_id, quantity, total_price)
         VALUES ($1, $2, 2, 100.00)
         RETURNING *`,
        [testUser.user_id, testEvent.event_id]
      );

      const layout = await createTestLayout(testUser.user_id);
      await assignLayoutToEvent(testEvent.event_id, layout.layout.layout_id, [
        { zone_id: layout.zones[0].zone_id, price: 50 }
      ]);

      await testPool.query(
        `INSERT INTO ticket_seats (purchase_id, event_id, row_letter, seat_number, zone_id, ticket_id, qr_code)
         VALUES ($1, $2, 'A', 1, $3, 'TKT-CASCADE-001', 'qr')`,
        [purchase.rows[0].purchase_id, testEvent.event_id, layout.zones[0].zone_id]
      );

      await expect(async () => {
        await testPool.query(
          'DELETE FROM event WHERE event_id = $1',
          [testEvent.event_id]
        );
      }).rejects.toThrow(/foreign key constraint|violates foreign key/i);

      const event = await testPool.query(
        'SELECT * FROM event WHERE event_id = $1',
        [testEvent.event_id]
      );

      expect(event.rows.length).toBe(1);
    });

    test('Deleting purchase cascades to ticket_seats', async () => {
      const purchase = await testPool.query(
        `INSERT INTO purchases (user_id, event_id, quantity, total_price)
         VALUES ($1, $2, 2, 100.00)
         RETURNING *`,
        [testUser.user_id, testEvent.event_id]
      );

      const layout = await createTestLayout(testUser.user_id);
      await assignLayoutToEvent(testEvent.event_id, layout.layout.layout_id, [
        { zone_id: layout.zones[0].zone_id, price: 50 }
      ]);

      await testPool.query(
        `INSERT INTO ticket_seats (purchase_id, event_id, row_letter, seat_number, zone_id, ticket_id, qr_code)
         VALUES ($1, $2, 'A', 1, $3, 'TKT-CASCADE-002', 'qr')`,
        [purchase.rows[0].purchase_id, testEvent.event_id, layout.zones[0].zone_id]
      );

      const ticketsBefore = await testPool.query(
        'SELECT * FROM ticket_seats WHERE purchase_id = $1',
        [purchase.rows[0].purchase_id]
      );

      expect(ticketsBefore.rows.length).toBe(1);

      await testPool.query(
        'DELETE FROM purchases WHERE purchase_id = $1',
        [purchase.rows[0].purchase_id]
      );

      const ticketsAfter = await testPool.query(
        'SELECT * FROM ticket_seats WHERE purchase_id = $1',
        [purchase.rows[0].purchase_id]
      );

      expect(ticketsAfter.rows.length).toBe(0);
    });

    test('Deleting layout cascades to zones and rows', async () => {
      const layout = await createTestLayout(testUser.user_id);

      const zonesBefore = await testPool.query(
        'SELECT * FROM seat_zones WHERE layout_id = $1',
        [layout.layout.layout_id]
      );
      const rowsBefore = await testPool.query(
        'SELECT * FROM layout_rows WHERE layout_id = $1',
        [layout.layout.layout_id]
      );

      expect(zonesBefore.rows.length).toBe(3);
      expect(rowsBefore.rows.length).toBeGreaterThan(0);

      await testPool.query(
        'DELETE FROM venue_layouts WHERE layout_id = $1',
        [layout.layout.layout_id]
      );

      const zonesAfter = await testPool.query(
        'SELECT * FROM seat_zones WHERE layout_id = $1',
        [layout.layout.layout_id]
      );
      const rowsAfter = await testPool.query(
        'SELECT * FROM layout_rows WHERE layout_id = $1',
        [layout.layout.layout_id]
      );

      expect(zonesAfter.rows.length).toBe(0);
      expect(rowsAfter.rows.length).toBe(0);
    });
  });
});
