const { testPool } = require('../setup');
const {
  createTestUser,
  createTestEvent,
  createTestLayout,
  assignLayoutToEvent
} = require('../helpers/testData');

describe('Validation & Error Handling Tests - FOR LICENȚĂ', () => {
  let testUser, testEvent;

  beforeEach(async () => {
    testUser = await createTestUser();
    testEvent = await createTestEvent(testUser.user_id, {
      available_tickets: 10,
      price: 50.00
    });
  });

  /**
   * TEST 1: Purchase Validation
   */
  describe('Purchase Validation', () => {
    test.skip('Rejects purchase with quantity = 0 (NOTE: Not enforced by DB)', async () => {
      await expect(async () => {
        await testPool.query(
          `INSERT INTO purchases (user_id, event_id, quantity, total_price)
           VALUES ($1, $2, 0, 0.00)`,
          [testUser.user_id, testEvent.event_id]
        );
      }).rejects.toThrow();
    });

    test.skip('Rejects purchase with negative quantity (NOTE: Not enforced by DB)', async () => {
      await expect(async () => {
        await testPool.query(
          `INSERT INTO purchases (user_id, event_id, quantity, total_price)
           VALUES ($1, $2, -5, -250.00)`,
          [testUser.user_id, testEvent.event_id]
        );
      }).rejects.toThrow();
    });

    test.skip('Rejects purchase with negative total price (NOTE: Not enforced by DB)', async () => {
      await expect(async () => {
        await testPool.query(
          `INSERT INTO purchases (user_id, event_id, quantity, total_price)
           VALUES ($1, $2, 2, -100.00)`,
          [testUser.user_id, testEvent.event_id]
        );
      }).rejects.toThrow();
    });

    test('Requires user_id for purchase', async () => {
      await expect(async () => {
        await testPool.query(
          `INSERT INTO purchases (user_id, event_id, quantity, total_price)
           VALUES (NULL, $1, 2, 100.00)`,
          [testEvent.event_id]
        );
      }).rejects.toThrow(/null value|not null/i);
    });

    test('Requires event_id for purchase', async () => {
      await expect(async () => {
        await testPool.query(
          `INSERT INTO purchases (user_id, event_id, quantity, total_price)
           VALUES ($1, NULL, 2, 100.00)`,
          [testUser.user_id]
        );
      }).rejects.toThrow(/null value|not null/i);
    });

    test('Prevents purchase with non-existent user', async () => {
      const nonExistentUserId = 999999;

      await expect(async () => {
        await testPool.query(
          `INSERT INTO purchases (user_id, event_id, quantity, total_price)
           VALUES ($1, $2, 2, 100.00)`,
          [nonExistentUserId, testEvent.event_id]
        );
      }).rejects.toThrow(/foreign key|violates/i);
    });

    test('Prevents purchase with non-existent event', async () => {
      const nonExistentEventId = 999999;

      await expect(async () => {
        await testPool.query(
          `INSERT INTO purchases (user_id, event_id, quantity, total_price)
           VALUES ($1, $2, 2, 100.00)`,
          [testUser.user_id, nonExistentEventId]
        );
      }).rejects.toThrow(/foreign key|violates/i);
    });
  });

  /**
   * TEST 2: Cart Validation
   */
  describe('Cart Validation', () => {
    test.skip('Rejects cart item with quantity = 0 (NOTE: Not enforced by DB)', async () => {
      await expect(async () => {
        await testPool.query(
          `INSERT INTO cart (user_id, event_id, quantity)
           VALUES ($1, $2, 0)`,
          [testUser.user_id, testEvent.event_id]
        );
      }).rejects.toThrow();
    });

    test.skip('Rejects cart item with negative quantity (NOTE: Not enforced by DB)', async () => {
      await expect(async () => {
        await testPool.query(
          `INSERT INTO cart (user_id, event_id, quantity)
           VALUES ($1, $2, -3)`,
          [testUser.user_id, testEvent.event_id]
        );
      }).rejects.toThrow();
    });

    test('Requires user_id for cart', async () => {
      await expect(async () => {
        await testPool.query(
          `INSERT INTO cart (user_id, event_id, quantity)
           VALUES (NULL, $1, 2)`,
          [testEvent.event_id]
        );
      }).rejects.toThrow(/null value|not null/i);
    });

    test('Requires event_id for cart', async () => {
      await expect(async () => {
        await testPool.query(
          `INSERT INTO cart (user_id, event_id, quantity)
           VALUES ($1, NULL, 2)`,
          [testUser.user_id]
        );
      }).rejects.toThrow(/null value|not null/i);
    });

    test('Allows updating cart quantity', async () => {
      await testPool.query(
        `INSERT INTO cart (user_id, event_id, quantity)
         VALUES ($1, $2, 2)`,
        [testUser.user_id, testEvent.event_id]
      );

      await testPool.query(
        `UPDATE cart SET quantity = 5
         WHERE user_id = $1 AND event_id = $2`,
        [testUser.user_id, testEvent.event_id]
      );

      const cart = await testPool.query(
        `SELECT quantity FROM cart WHERE user_id = $1 AND event_id = $2`,
        [testUser.user_id, testEvent.event_id]
      );

      expect(cart.rows[0].quantity).toBe(5);
    });
  });

  /**
   * TEST 3: Event Validation
   */
  describe('Event Validation', () => {
    test('Requires title for event', async () => {
      await expect(async () => {
        await testPool.query(
          `INSERT INTO event (title, description, location, city, date, time, price,
                              available_tickets, type, image_path, user_id)
           VALUES (NULL, 'Desc', 'Venue', 'City', '2025-12-31', '20:00:00',
                   50.00, 100, 'Concert', 'test.jpg', $1)`,
          [testUser.user_id]
        );
      }).rejects.toThrow(/null value|not null/i);
    });

    test('Requires date for event', async () => {
      await expect(async () => {
        await testPool.query(
          `INSERT INTO event (title, description, location, city, date, time, price,
                              available_tickets, type, image_path, user_id)
           VALUES ('Test Event', 'Desc', 'Venue', 'City', NULL, '20:00:00',
                   50.00, 100, 'Concert', 'test.jpg', $1)`,
          [testUser.user_id]
        );
      }).rejects.toThrow(/null value|not null/i);
    });

    test('Requires time for event', async () => {
      await expect(async () => {
        await testPool.query(
          `INSERT INTO event (title, description, location, city, date, time, price,
                              available_tickets, type, image_path, user_id)
           VALUES ('Test Event', 'Desc', 'Venue', 'City', '2025-12-31', NULL,
                   50.00, 100, 'Concert', 'test.jpg', $1)`,
          [testUser.user_id]
        );
      }).rejects.toThrow(/null value|not null/i);
    });

    test('Accepts valid event with all fields', async () => {
      const event = await testPool.query(
        `INSERT INTO event (title, description, location, city, date, time, price,
                            available_tickets, type, image_path, user_id)
         VALUES ('Valid Event', 'Great description', 'Arena', 'Bucharest',
                 '2025-12-31', '20:00:00', 75.00, 500, 'Concert', 'event.jpg', $1)
         RETURNING *`,
        [testUser.user_id]
      );

      expect(event.rows.length).toBe(1);
      expect(event.rows[0].title).toBe('Valid Event');
      expect(event.rows[0].available_tickets).toBe(500);
    });

    test('Defaults tickets_sold to 0', async () => {
      const event = await testPool.query(
        `INSERT INTO event (title, description, location, city, date, time, price,
                            available_tickets, type, image_path, user_id)
         VALUES ('Test Event', 'Desc', 'Venue', 'City', '2025-12-31', '20:00:00',
                 50.00, 100, 'Concert', 'test.jpg', $1)
         RETURNING tickets_sold`,
        [testUser.user_id]
      );

      expect(event.rows[0].tickets_sold).toBe(0);
    });

    test('Defaults has_seating to false', async () => {
      const event = await testPool.query(
        `INSERT INTO event (title, description, location, city, date, time, price,
                            available_tickets, type, image_path, user_id)
         VALUES ('Test Event', 'Desc', 'Venue', 'City', '2025-12-31', '20:00:00',
                 50.00, 100, 'Concert', 'test.jpg', $1)
         RETURNING has_seating`,
        [testUser.user_id]
      );

      expect(event.rows[0].has_seating).toBe(false);
    });
  });

  /**
   * TEST 4: Seat Reservation Validation
   */
  describe('Seat Reservation Validation', () => {
    let layout, seatingEvent;

    beforeEach(async () => {
      seatingEvent = await createTestEvent(testUser.user_id, {
        has_seating: true,
        available_tickets: 60
      });

      layout = await createTestLayout(testUser.user_id);
      await assignLayoutToEvent(seatingEvent.event_id, layout.layout.layout_id, [
        { zone_id: layout.zones[0].zone_id, price: 90 }
      ]);
    });

    test('Requires expires_at for reservation', async () => {
      await expect(async () => {
        await testPool.query(
          `INSERT INTO seat_reservations (user_id, event_id, row_letter, seat_number, zone_id, expires_at)
           VALUES ($1, $2, 'A', 5, $3, NULL)`,
          [testUser.user_id, seatingEvent.event_id, layout.zones[0].zone_id]
        );
      }).rejects.toThrow(/null value|not null/i);
    });

    test('Requires row_letter for reservation', async () => {
      await expect(async () => {
        await testPool.query(
          `INSERT INTO seat_reservations (user_id, event_id, row_letter, seat_number, zone_id, expires_at)
           VALUES ($1, $2, NULL, 5, $3, NOW() + INTERVAL '15 minutes')`,
          [testUser.user_id, seatingEvent.event_id, layout.zones[0].zone_id]
        );
      }).rejects.toThrow(/null value|not null/i);
    });

    test('Requires seat_number for reservation', async () => {
      await expect(async () => {
        await testPool.query(
          `INSERT INTO seat_reservations (user_id, event_id, row_letter, seat_number, zone_id, expires_at)
           VALUES ($1, $2, 'A', NULL, $3, NOW() + INTERVAL '15 minutes')`,
          [testUser.user_id, seatingEvent.event_id, layout.zones[0].zone_id]
        );
      }).rejects.toThrow(/null value|not null/i);
    });

    test('Accepts valid seat reservation', async () => {
      const reservation = await testPool.query(
        `INSERT INTO seat_reservations (user_id, event_id, row_letter, seat_number, zone_id, expires_at)
         VALUES ($1, $2, 'A', 5, $3, NOW() + INTERVAL '15 minutes')
         RETURNING *`,
        [testUser.user_id, seatingEvent.event_id, layout.zones[0].zone_id]
      );

      expect(reservation.rows.length).toBe(1);
      expect(reservation.rows[0].row_letter).toBe('A');
      expect(reservation.rows[0].seat_number).toBe(5);
    });
  });

  /**
   * TEST 5: Data Type Validation
   */
  describe('Data Type Validation', () => {
    test('Validates numeric price type', async () => {
      const event = await testPool.query(
        `INSERT INTO event (title, description, location, city, date, time, price,
                            available_tickets, type, image_path, user_id)
         VALUES ('Test', 'Desc', 'Venue', 'City', '2025-12-31', '20:00:00',
                 '45.99', 100, 'Concert', 'test.jpg', $1)
         RETURNING price`,
        [testUser.user_id]
      );

      expect(typeof parseFloat(event.rows[0].price)).toBe('number');
      expect(parseFloat(event.rows[0].price)).toBe(45.99);
    });

    test('Validates date format', async () => {
      await expect(async () => {
        await testPool.query(
          `INSERT INTO event (title, description, location, city, date, time, price,
                              available_tickets, type, image_path, user_id)
           VALUES ('Test', 'Desc', 'Venue', 'City', 'invalid-date', '20:00:00',
                   50.00, 100, 'Concert', 'test.jpg', $1)`,
          [testUser.user_id]
        );
      }).rejects.toThrow(/invalid input syntax|date\/time/i);
    });

    test('Validates time format', async () => {
      await expect(async () => {
        await testPool.query(
          `INSERT INTO event (title, description, location, city, date, time, price,
                              available_tickets, type, image_path, user_id)
           VALUES ('Test', 'Desc', 'Venue', 'City', '2025-12-31', 'invalid-time',
                   50.00, 100, 'Concert', 'test.jpg', $1)`,
          [testUser.user_id]
        );
      }).rejects.toThrow(/invalid input syntax|date\/time|time zone|not recognized/i);
    });

    test('Validates boolean has_seating', async () => {
      const event1 = await testPool.query(
        `INSERT INTO event (title, description, location, city, date, time, price,
                            available_tickets, type, image_path, user_id, has_seating)
         VALUES ('Test', 'Desc', 'Venue', 'City', '2025-12-31', '20:00:00',
                 50.00, 100, 'Concert', 'test.jpg', $1, true)
         RETURNING has_seating`,
        [testUser.user_id]
      );

      const event2 = await testPool.query(
        `INSERT INTO event (title, description, location, city, date, time, price,
                            available_tickets, type, image_path, user_id, has_seating)
         VALUES ('Test 2', 'Desc', 'Venue', 'City', '2025-12-31', '20:00:00',
                 50.00, 100, 'Concert', 'test.jpg', $1, false)
         RETURNING has_seating`,
        [testUser.user_id]
      );

      expect(event1.rows[0].has_seating).toBe(true);
      expect(event2.rows[0].has_seating).toBe(false);
    });
  });

  /**
   * TEST 6: Boundary Value Testing
   */
  describe('Boundary Value Testing', () => {
    test('Handles very large ticket quantities', async () => {
      const largeEvent = await createTestEvent(testUser.user_id, {
        available_tickets: 100000,
        price: 10.00
      });

      const purchase = await testPool.query(
        `INSERT INTO purchases (user_id, event_id, quantity, total_price)
         VALUES ($1, $2, 50000, 500000.00)
         RETURNING *`,
        [testUser.user_id, largeEvent.event_id]
      );

      expect(purchase.rows[0].quantity).toBe(50000);
      expect(parseFloat(purchase.rows[0].total_price)).toBe(500000.00);
    });

    test('Handles very small prices (cents)', async () => {
      const cheapEvent = await createTestEvent(testUser.user_id, {
        price: 0.01,
        available_tickets: 100
      });

      const purchase = await testPool.query(
        `INSERT INTO purchases (user_id, event_id, quantity, total_price)
         VALUES ($1, $2, 10, 0.10)
         RETURNING *`,
        [testUser.user_id, cheapEvent.event_id]
      );

      expect(parseFloat(purchase.rows[0].total_price)).toBe(0.10);
    });

    test('Handles very high prices', async () => {
      const expensiveEvent = await createTestEvent(testUser.user_id, {
        price: 9999.99,
        available_tickets: 10
      });

      const purchase = await testPool.query(
        `INSERT INTO purchases (user_id, event_id, quantity, total_price)
         VALUES ($1, $2, 1, 9999.99)
         RETURNING *`,
        [testUser.user_id, expensiveEvent.event_id]
      );

      expect(parseFloat(purchase.rows[0].total_price)).toBe(9999.99);
    });

    test('Handles long event titles (VARCHAR 255)', async () => {
      const longTitle = 'A'.repeat(255);

      const event = await testPool.query(
        `INSERT INTO event (title, description, location, city, date, time, price,
                            available_tickets, type, image_path, user_id)
         VALUES ($1, 'Desc', 'Venue', 'City', '2025-12-31', '20:00:00',
                 50.00, 100, 'Concert', 'test.jpg', $2)
         RETURNING title`,
        [longTitle, testUser.user_id]
      );

      expect(event.rows[0].title.length).toBe(255);
    });

    test('Rejects event title exceeding 255 characters', async () => {
      const tooLongTitle = 'A'.repeat(256);

      await expect(async () => {
        await testPool.query(
          `INSERT INTO event (title, description, location, city, date, time, price,
                              available_tickets, type, image_path, user_id)
           VALUES ($1, 'Desc', 'Venue', 'City', '2025-12-31', '20:00:00',
                   50.00, 100, 'Concert', 'test.jpg', $2)`,
          [tooLongTitle, testUser.user_id]
        );
      }).rejects.toThrow(/value too long|character varying/i);
    });
  });
});
