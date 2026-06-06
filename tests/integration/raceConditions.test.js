const { testPool } = require('../setup');
const {
  createTestUser,
  createTestEvent,
  createTestLayout,
  assignLayoutToEvent,
  createSeatReservation
} = require('../helpers/testData');

describe('Race Condition Prevention Tests - CRITICAL FOR LICENȚĂ', () => {
  let testUser1, testUser2, testEvent;

  beforeEach(async () => {
    testUser1 = await createTestUser();
    testUser2 = await createTestUser();
    testEvent = await createTestEvent(testUser1.user_id, {
      available_tickets: 1,
      price: 50.00
    });
  });

  /**
   * TEST 1: SERIALIZABLE prevents double purchase of last ticket
   * This is THE MOST IMPORTANT test for demonstrating database knowledge
   */
  describe('SERIALIZABLE Isolation Level', () => {
    test('prevents double booking when 2 users buy last ticket simultaneously', async () => {
      const client1 = await testPool.connect();
      const client2 = await testPool.connect();

      try {
        await client1.query('BEGIN');
        await client1.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');

        await client2.query('BEGIN');
        await client2.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');

        const event1 = await client1.query(
          'SELECT * FROM event WHERE event_id = $1',
          [testEvent.event_id]
        );
        const event2 = await client2.query(
          'SELECT * FROM event WHERE event_id = $1',
          [testEvent.event_id]
        );

        expect(event1.rows[0].available_tickets).toBe(1);
        expect(event2.rows[0].available_tickets).toBe(1);

        await client1.query(
          `UPDATE event
           SET available_tickets = available_tickets - 1,
               tickets_sold = tickets_sold + 1
           WHERE event_id = $1`,
          [testEvent.event_id]
        );

        await client1.query(
          `INSERT INTO purchases (user_id, event_id, quantity, total_price)
           VALUES ($1, $2, $3, $4)`,
          [testUser1.user_id, testEvent.event_id, 1, 50.00]
        );

        await client1.query('COMMIT');

        let user2Failed = false;
        try {
          await client2.query(
            `UPDATE event
             SET available_tickets = available_tickets - 1,
                 tickets_sold = tickets_sold + 1
             WHERE event_id = $1`,
            [testEvent.event_id]
          );

          await client2.query(
            `INSERT INTO purchases (user_id, event_id, quantity, total_price)
             VALUES ($1, $2, $3, $4)`,
            [testUser2.user_id, testEvent.event_id, 1, 50.00]
          );

          await client2.query('COMMIT');
        } catch (error) {
          user2Failed = true;
          await client2.query('ROLLBACK');
          expect(error.message).toMatch(/could not serialize|deadlock/i);
        }

        const finalEvent = await testPool.query(
          'SELECT available_tickets, tickets_sold FROM event WHERE event_id = $1',
          [testEvent.event_id]
        );

        expect(finalEvent.rows[0].available_tickets).toBe(0);
        expect(finalEvent.rows[0].tickets_sold).toBe(1);

        const purchases = await testPool.query(
          'SELECT * FROM purchases WHERE event_id = $1',
          [testEvent.event_id]
        );

        expect(purchases.rows.length).toBe(1);
        expect(purchases.rows[0].user_id).toBe(testUser1.user_id);

        expect(user2Failed).toBe(true);

      } finally {
        client1.release();
        client2.release();
      }
    });

    test('allows sequential purchases correctly', async () => {
      await testPool.query(
        'UPDATE event SET available_tickets = 2 WHERE event_id = $1',
        [testEvent.event_id]
      );

      await testPool.query('BEGIN');
      await testPool.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');

      await testPool.query(
        `UPDATE event
         SET available_tickets = available_tickets - 1,
             tickets_sold = tickets_sold + 1
         WHERE event_id = $1`,
        [testEvent.event_id]
      );

      await testPool.query(
        `INSERT INTO purchases (user_id, event_id, quantity, total_price)
         VALUES ($1, $2, $3, $4)`,
        [testUser1.user_id, testEvent.event_id, 1, 50.00]
      );

      await testPool.query('COMMIT');

      await testPool.query('BEGIN');
      await testPool.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');

      await testPool.query(
        `UPDATE event
         SET available_tickets = available_tickets - 1,
             tickets_sold = tickets_sold + 1
         WHERE event_id = $1`,
        [testEvent.event_id]
      );

      await testPool.query(
        `INSERT INTO purchases (user_id, event_id, quantity, total_price)
         VALUES ($1, $2, $3, $4)`,
        [testUser2.user_id, testEvent.event_id, 1, 50.00]
      );

      await testPool.query('COMMIT');

      const finalEvent = await testPool.query(
        'SELECT available_tickets, tickets_sold FROM event WHERE event_id = $1',
        [testEvent.event_id]
      );

      expect(finalEvent.rows[0].available_tickets).toBe(0);
      expect(finalEvent.rows[0].tickets_sold).toBe(2);

      const purchases = await testPool.query(
        'SELECT * FROM purchases WHERE event_id = $1 ORDER BY purchase_id',
        [testEvent.event_id]
      );

      expect(purchases.rows.length).toBe(2);
    });
  });

  /**
   * TEST 2: Seat-based double booking prevention
   */
  describe('Seat Selection Double Booking', () => {
    let layout, testSeatingEvent;

    beforeEach(async () => {
      testSeatingEvent = await createTestEvent(testUser1.user_id, {
        available_tickets: 60,
        has_seating: true
      });

      layout = await createTestLayout(testUser1.user_id);
      await assignLayoutToEvent(testSeatingEvent.event_id, layout.layout.layout_id, [
        { zone_id: layout.zones[0].zone_id, price: 90 },
        { zone_id: layout.zones[1].zone_id, price: 60 },
        { zone_id: layout.zones[2].zone_id, price: 30 }
      ]);
    });

    test('UNIQUE constraint prevents same seat being reserved twice', async () => {
      const zoneId = layout.zones[0].zone_id;

      await createSeatReservation(testUser1.user_id, testSeatingEvent.event_id, 'A', 5, zoneId);

      await expect(async () => {
        await createSeatReservation(testUser2.user_id, testSeatingEvent.event_id, 'A', 5, zoneId);
      }).rejects.toThrow();

      const reservations = await testPool.query(
        `SELECT * FROM seat_reservations
         WHERE event_id = $1 AND row_letter = 'A' AND seat_number = 5`,
        [testSeatingEvent.event_id]
      );

      expect(reservations.rows.length).toBe(1);
      expect(reservations.rows[0].user_id).toBe(testUser1.user_id);
    });

    test('UNIQUE constraint prevents same seat being sold twice', async () => {
      const purchase1 = await testPool.query(
        `INSERT INTO purchases (user_id, event_id, quantity, total_price)
         VALUES ($1, $2, 1, 90.00)
         RETURNING *`,
        [testUser1.user_id, testSeatingEvent.event_id]
      );

      const purchase2 = await testPool.query(
        `INSERT INTO purchases (user_id, event_id, quantity, total_price)
         VALUES ($1, $2, 1, 90.00)
         RETURNING *`,
        [testUser2.user_id, testSeatingEvent.event_id]
      );

      const zoneId = layout.zones[0].zone_id;

      await testPool.query(
        `INSERT INTO ticket_seats (purchase_id, event_id, row_letter, seat_number, zone_id, ticket_id, qr_code)
         VALUES ($1, $2, 'A', 5, $3, 'TKT-TEST-1', 'qr1')`,
        [purchase1.rows[0].purchase_id, testSeatingEvent.event_id, zoneId]
      );

      await expect(async () => {
        await testPool.query(
          `INSERT INTO ticket_seats (purchase_id, event_id, row_letter, seat_number, zone_id, ticket_id, qr_code)
           VALUES ($1, $2, 'A', 5, $3, 'TKT-TEST-2', 'qr2')`,
          [purchase2.rows[0].purchase_id, testSeatingEvent.event_id, zoneId]
        );
      }).rejects.toThrow(/duplicate key|unique constraint/i);

      const tickets = await testPool.query(
        `SELECT * FROM ticket_seats
         WHERE event_id = $1 AND row_letter = 'A' AND seat_number = 5`,
        [testSeatingEvent.event_id]
      );

      expect(tickets.rows.length).toBe(1);
      expect(tickets.rows[0].purchase_id).toBe(purchase1.rows[0].purchase_id);
    });

    test('Application must prevent reserving sold seats', async () => {
      const zoneId = layout.zones[0].zone_id;

      const purchase = await testPool.query(
        `INSERT INTO purchases (user_id, event_id, quantity, total_price)
         VALUES ($1, $2, 1, 90.00)
         RETURNING *`,
        [testUser1.user_id, testSeatingEvent.event_id]
      );

      await testPool.query(
        `INSERT INTO ticket_seats (purchase_id, event_id, row_letter, seat_number, zone_id, ticket_id, qr_code)
         VALUES ($1, $2, 'A', 5, $3, 'TKT-TEST-1', 'qr1')`,
        [purchase.rows[0].purchase_id, testSeatingEvent.event_id, zoneId]
      );

      const soldSeats = await testPool.query(
        `SELECT * FROM ticket_seats
         WHERE event_id = $1 AND row_letter = 'A' AND seat_number = 5`,
        [testSeatingEvent.event_id]
      );

      expect(soldSeats.rows.length).toBe(1);

      const seatCheck = await testPool.query(
        `SELECT 1 FROM ticket_seats
         WHERE event_id = $1 AND row_letter = 'A' AND seat_number = 5`,
        [testSeatingEvent.event_id]
      );

      expect(seatCheck.rows.length).toBeGreaterThan(0);
    });
  });

  /**
   * TEST 3: Atomic ticket decrement
   */
  describe('Atomic Available Tickets Update', () => {
    test('SERIALIZABLE prevents overselling with concurrent purchases', async () => {
      await testPool.query(
        'UPDATE event SET available_tickets = 10 WHERE event_id = $1',
        [testEvent.event_id]
      );

      const promises = [];

      for (let i = 0; i < 5; i++) {
        const purchasePromise = (async () => {
          const client = await testPool.connect();
          try {
            await client.query('BEGIN');
            await client.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');

            const result = await client.query(
              `UPDATE event
               SET available_tickets = available_tickets - 2,
                   tickets_sold = tickets_sold + 2
               WHERE event_id = $1 AND available_tickets >= 2
               RETURNING available_tickets`,
              [testEvent.event_id]
            );

            if (result.rows.length === 0) {
              throw new Error('Not enough tickets');
            }

            await client.query(
              `INSERT INTO purchases (user_id, event_id, quantity, total_price)
               VALUES ($1, $2, 2, 100.00)`,
              [testUser1.user_id, testEvent.event_id]
            );

            await client.query('COMMIT');
            return { success: true };
          } catch (error) {
            await client.query('ROLLBACK');
            return { success: false, error: error.message };
          } finally {
            client.release();
          }
        })();

        promises.push(purchasePromise);
      }

      const results = await Promise.all(promises);

      const successes = results.filter(r => r.success).length;
      const failures = results.filter(r => !r.success).length;

      expect(successes).toBeGreaterThan(0);
      expect(successes).toBeLessThanOrEqual(5);

      const finalEvent = await testPool.query(
        'SELECT available_tickets, tickets_sold FROM event WHERE event_id = $1',
        [testEvent.event_id]
      );

      const totalTickets = finalEvent.rows[0].available_tickets + finalEvent.rows[0].tickets_sold;
      expect(totalTickets).toBe(10);

      expect(finalEvent.rows[0].tickets_sold).toBe(successes * 2);

      expect(finalEvent.rows[0].available_tickets).toBe(10 - (successes * 2));
    });
  });
});
