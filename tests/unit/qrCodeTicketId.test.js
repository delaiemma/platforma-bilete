const { testPool } = require('../setup');
const {
  createTestUser,
  createTestEvent,
  createTestLayout,
  assignLayoutToEvent
} = require('../helpers/testData');

describe('QR Code & Ticket ID Tests', () => {
  let testUser, testEvent, layout;

  beforeEach(async () => {
    testUser = await createTestUser();
    testEvent = await createTestEvent(testUser.user_id, {
      has_seating: true,
      available_tickets: 60
    });

    layout = await createTestLayout(testUser.user_id);
    await assignLayoutToEvent(testEvent.event_id, layout.layout.layout_id, [
      { zone_id: layout.zones[0].zone_id, price: 90 }
    ]);
  });

  /**
   * TEST 1: Ticket ID Format
   */
  describe('Ticket ID Format', () => {
    test('Ticket ID follows expected format', async () => {
      const purchase = await testPool.query(
        `INSERT INTO purchases (user_id, event_id, quantity, total_price)
         VALUES ($1, $2, 1, 90.00)
         RETURNING *`,
        [testUser.user_id, testEvent.event_id]
      );

      const ticketId = `TKT-${purchase.rows[0].purchase_id.toString().padStart(4, '0')}-${testEvent.event_id.toString().padStart(4, '0')}-A1`;

      const ticket = await testPool.query(
        `INSERT INTO ticket_seats (purchase_id, event_id, row_letter, seat_number, zone_id, ticket_id, qr_code)
         VALUES ($1, $2, 'A', 1, $3, $4, 'qr-code-data')
         RETURNING *`,
        [purchase.rows[0].purchase_id, testEvent.event_id, layout.zones[0].zone_id, ticketId]
      );

      expect(ticket.rows[0].ticket_id).toMatch(/^TKT-\d{4}-\d{4}-[A-Z]\d+$/);
    });

    test('Ticket ID includes purchase ID', async () => {
      const purchase = await testPool.query(
        `INSERT INTO purchases (user_id, event_id, quantity, total_price)
         VALUES ($1, $2, 1, 90.00)
         RETURNING *`,
        [testUser.user_id, testEvent.event_id]
      );

      const purchaseIdPadded = purchase.rows[0].purchase_id.toString().padStart(4, '0');
      const ticketId = `TKT-${purchaseIdPadded}-${testEvent.event_id.toString().padStart(4, '0')}-A1`;

      const ticket = await testPool.query(
        `INSERT INTO ticket_seats (purchase_id, event_id, row_letter, seat_number, zone_id, ticket_id, qr_code)
         VALUES ($1, $2, 'A', 1, $3, $4, 'qr-code-data')
         RETURNING *`,
        [purchase.rows[0].purchase_id, testEvent.event_id, layout.zones[0].zone_id, ticketId]
      );

      expect(ticket.rows[0].ticket_id).toContain(purchaseIdPadded);
    });

    test('Ticket ID includes event ID', async () => {
      const purchase = await testPool.query(
        `INSERT INTO purchases (user_id, event_id, quantity, total_price)
         VALUES ($1, $2, 1, 90.00)
         RETURNING *`,
        [testUser.user_id, testEvent.event_id]
      );

      const eventIdPadded = testEvent.event_id.toString().padStart(4, '0');
      const ticketId = `TKT-${purchase.rows[0].purchase_id.toString().padStart(4, '0')}-${eventIdPadded}-A1`;

      const ticket = await testPool.query(
        `INSERT INTO ticket_seats (purchase_id, event_id, row_letter, seat_number, zone_id, ticket_id, qr_code)
         VALUES ($1, $2, 'A', 1, $3, $4, 'qr-code-data')
         RETURNING *`,
        [purchase.rows[0].purchase_id, testEvent.event_id, layout.zones[0].zone_id, ticketId]
      );

      expect(ticket.rows[0].ticket_id).toContain(eventIdPadded);
    });

    test('Ticket ID includes seat information', async () => {
      const purchase = await testPool.query(
        `INSERT INTO purchases (user_id, event_id, quantity, total_price)
         VALUES ($1, $2, 1, 90.00)
         RETURNING *`,
        [testUser.user_id, testEvent.event_id]
      );

      const ticketId = `TKT-${purchase.rows[0].purchase_id.toString().padStart(4, '0')}-${testEvent.event_id.toString().padStart(4, '0')}-B5`;

      const ticket = await testPool.query(
        `INSERT INTO ticket_seats (purchase_id, event_id, row_letter, seat_number, zone_id, ticket_id, qr_code)
         VALUES ($1, $2, 'B', 5, $3, $4, 'qr-code-data')
         RETURNING *`,
        [purchase.rows[0].purchase_id, testEvent.event_id, layout.zones[0].zone_id, ticketId]
      );

      expect(ticket.rows[0].ticket_id).toContain('B5');
    });
  });

  /**
   * TEST 2: Ticket ID Uniqueness
   */
  describe('Ticket ID Uniqueness', () => {
    test('UNIQUE constraint enforced on ticket_id', async () => {
      const purchase = await testPool.query(
        `INSERT INTO purchases (user_id, event_id, quantity, total_price)
         VALUES ($1, $2, 2, 180.00)
         RETURNING *`,
        [testUser.user_id, testEvent.event_id]
      );

      const ticketId = 'TKT-DUPLICATE-TEST';

      await testPool.query(
        `INSERT INTO ticket_seats (purchase_id, event_id, row_letter, seat_number, zone_id, ticket_id, qr_code)
         VALUES ($1, $2, 'A', 1, $3, $4, 'qr1')`,
        [purchase.rows[0].purchase_id, testEvent.event_id, layout.zones[0].zone_id, ticketId]
      );

      await expect(async () => {
        await testPool.query(
          `INSERT INTO ticket_seats (purchase_id, event_id, row_letter, seat_number, zone_id, ticket_id, qr_code)
           VALUES ($1, $2, 'A', 2, $3, $4, 'qr2')`,
          [purchase.rows[0].purchase_id, testEvent.event_id, layout.zones[0].zone_id, ticketId]
        );
      }).rejects.toThrow(/duplicate key|unique constraint/i);
    });

    test('Each ticket gets unique ID even in same purchase', async () => {
      const purchase = await testPool.query(
        `INSERT INTO purchases (user_id, event_id, quantity, total_price)
         VALUES ($1, $2, 3, 270.00)
         RETURNING *`,
        [testUser.user_id, testEvent.event_id]
      );

      const ticketIds = [
        `TKT-${purchase.rows[0].purchase_id.toString().padStart(4, '0')}-${testEvent.event_id.toString().padStart(4, '0')}-A1`,
        `TKT-${purchase.rows[0].purchase_id.toString().padStart(4, '0')}-${testEvent.event_id.toString().padStart(4, '0')}-A2`,
        `TKT-${purchase.rows[0].purchase_id.toString().padStart(4, '0')}-${testEvent.event_id.toString().padStart(4, '0')}-A3`
      ];

      for (let i = 0; i < 3; i++) {
        await testPool.query(
          `INSERT INTO ticket_seats (purchase_id, event_id, row_letter, seat_number, zone_id, ticket_id, qr_code)
           VALUES ($1, $2, 'A', $3, $4, $5, $6)`,
          [purchase.rows[0].purchase_id, testEvent.event_id, i + 1, layout.zones[0].zone_id, ticketIds[i], `qr${i + 1}`]
        );
      }

      const tickets = await testPool.query(
        `SELECT ticket_id FROM ticket_seats WHERE purchase_id = $1 ORDER BY seat_number`,
        [purchase.rows[0].purchase_id]
      );

      expect(tickets.rows.length).toBe(3);
      expect(tickets.rows[0].ticket_id).toBe(ticketIds[0]);
      expect(tickets.rows[1].ticket_id).toBe(ticketIds[1]);
      expect(tickets.rows[2].ticket_id).toBe(ticketIds[2]);

      const uniqueIds = new Set(tickets.rows.map(t => t.ticket_id));
      expect(uniqueIds.size).toBe(3);
    });
  });

  /**
   * TEST 3: QR Code Storage
   */
  describe('QR Code Storage', () => {
    test('QR code data stored correctly', async () => {
      const purchase = await testPool.query(
        `INSERT INTO purchases (user_id, event_id, quantity, total_price)
         VALUES ($1, $2, 1, 90.00)
         RETURNING *`,
        [testUser.user_id, testEvent.event_id]
      );

      const qrCodeData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...';
      const ticketId = `TKT-${purchase.rows[0].purchase_id.toString().padStart(4, '0')}-${testEvent.event_id.toString().padStart(4, '0')}-A1`;

      const ticket = await testPool.query(
        `INSERT INTO ticket_seats (purchase_id, event_id, row_letter, seat_number, zone_id, ticket_id, qr_code)
         VALUES ($1, $2, 'A', 1, $3, $4, $5)
         RETURNING *`,
        [purchase.rows[0].purchase_id, testEvent.event_id, layout.zones[0].zone_id, ticketId, qrCodeData]
      );

      expect(ticket.rows[0].qr_code).toBe(qrCodeData);
    });

    test('QR code can store large base64 strings', async () => {
      const purchase = await testPool.query(
        `INSERT INTO purchases (user_id, event_id, quantity, total_price)
         VALUES ($1, $2, 1, 90.00)
         RETURNING *`,
        [testUser.user_id, testEvent.event_id]
      );

      const largeQrCode = 'data:image/png;base64,' + 'A'.repeat(3000);
      const ticketId = `TKT-${purchase.rows[0].purchase_id.toString().padStart(4, '0')}-${testEvent.event_id.toString().padStart(4, '0')}-A1`;

      const ticket = await testPool.query(
        `INSERT INTO ticket_seats (purchase_id, event_id, row_letter, seat_number, zone_id, ticket_id, qr_code)
         VALUES ($1, $2, 'A', 1, $3, $4, $5)
         RETURNING *`,
        [purchase.rows[0].purchase_id, testEvent.event_id, layout.zones[0].zone_id, ticketId, largeQrCode]
      );

      expect(ticket.rows[0].qr_code.length).toBeGreaterThan(3000);
    });

    test('Each ticket has own QR code', async () => {
      const purchase = await testPool.query(
        `INSERT INTO purchases (user_id, event_id, quantity, total_price)
         VALUES ($1, $2, 2, 180.00)
         RETURNING *`,
        [testUser.user_id, testEvent.event_id]
      );

      const qrCodes = ['QR-CODE-1-DATA', 'QR-CODE-2-DATA'];
      const ticketIds = [
        `TKT-${purchase.rows[0].purchase_id.toString().padStart(4, '0')}-${testEvent.event_id.toString().padStart(4, '0')}-A1`,
        `TKT-${purchase.rows[0].purchase_id.toString().padStart(4, '0')}-${testEvent.event_id.toString().padStart(4, '0')}-A2`
      ];

      for (let i = 0; i < 2; i++) {
        await testPool.query(
          `INSERT INTO ticket_seats (purchase_id, event_id, row_letter, seat_number, zone_id, ticket_id, qr_code)
           VALUES ($1, $2, 'A', $3, $4, $5, $6)`,
          [purchase.rows[0].purchase_id, testEvent.event_id, i + 1, layout.zones[0].zone_id, ticketIds[i], qrCodes[i]]
        );
      }

      const tickets = await testPool.query(
        `SELECT qr_code FROM ticket_seats WHERE purchase_id = $1 ORDER BY seat_number`,
        [purchase.rows[0].purchase_id]
      );

      expect(tickets.rows[0].qr_code).toBe('QR-CODE-1-DATA');
      expect(tickets.rows[1].qr_code).toBe('QR-CODE-2-DATA');
      expect(tickets.rows[0].qr_code).not.toBe(tickets.rows[1].qr_code);
    });
  });

  /**
   * TEST 4: Ticket Retrieval
   */
  describe('Ticket Retrieval by ID', () => {
    test('Can retrieve ticket by ticket_id', async () => {
      const purchase = await testPool.query(
        `INSERT INTO purchases (user_id, event_id, quantity, total_price)
         VALUES ($1, $2, 1, 90.00)
         RETURNING *`,
        [testUser.user_id, testEvent.event_id]
      );

      const ticketId = `TKT-${purchase.rows[0].purchase_id.toString().padStart(4, '0')}-${testEvent.event_id.toString().padStart(4, '0')}-A1`;

      await testPool.query(
        `INSERT INTO ticket_seats (purchase_id, event_id, row_letter, seat_number, zone_id, ticket_id, qr_code)
         VALUES ($1, $2, 'A', 1, $3, $4, 'qr-data')`,
        [purchase.rows[0].purchase_id, testEvent.event_id, layout.zones[0].zone_id, ticketId]
      );

      const ticket = await testPool.query(
        `SELECT * FROM ticket_seats WHERE ticket_id = $1`,
        [ticketId]
      );

      expect(ticket.rows.length).toBe(1);
      expect(ticket.rows[0].ticket_id).toBe(ticketId);
      expect(ticket.rows[0].row_letter).toBe('A');
      expect(ticket.rows[0].seat_number).toBe(1);
    });

    test('Ticket ID lookup is case-sensitive', async () => {
      const purchase = await testPool.query(
        `INSERT INTO purchases (user_id, event_id, quantity, total_price)
         VALUES ($1, $2, 1, 90.00)
         RETURNING *`,
        [testUser.user_id, testEvent.event_id]
      );

      const ticketId = 'TKT-TEST-CASE';

      await testPool.query(
        `INSERT INTO ticket_seats (purchase_id, event_id, row_letter, seat_number, zone_id, ticket_id, qr_code)
         VALUES ($1, $2, 'A', 1, $3, $4, 'qr-data')`,
        [purchase.rows[0].purchase_id, testEvent.event_id, layout.zones[0].zone_id, ticketId]
      );

      const ticket = await testPool.query(
        `SELECT * FROM ticket_seats WHERE ticket_id = $1`,
        ['tkt-test-case']
      );

      expect(ticket.rows.length).toBe(0);
    });

    test('Can retrieve all tickets for a purchase', async () => {
      const purchase = await testPool.query(
        `INSERT INTO purchases (user_id, event_id, quantity, total_price)
         VALUES ($1, $2, 3, 270.00)
         RETURNING *`,
        [testUser.user_id, testEvent.event_id]
      );

      for (let i = 1; i <= 3; i++) {
        const ticketId = `TKT-${purchase.rows[0].purchase_id.toString().padStart(4, '0')}-${testEvent.event_id.toString().padStart(4, '0')}-A${i}`;
        await testPool.query(
          `INSERT INTO ticket_seats (purchase_id, event_id, row_letter, seat_number, zone_id, ticket_id, qr_code)
           VALUES ($1, $2, 'A', $3, $4, $5, $6)`,
          [purchase.rows[0].purchase_id, testEvent.event_id, i, layout.zones[0].zone_id, ticketId, `qr${i}`]
        );
      }

      const tickets = await testPool.query(
        `SELECT * FROM ticket_seats WHERE purchase_id = $1 ORDER BY seat_number`,
        [purchase.rows[0].purchase_id]
      );

      expect(tickets.rows.length).toBe(3);
      expect(tickets.rows[0].seat_number).toBe(1);
      expect(tickets.rows[1].seat_number).toBe(2);
      expect(tickets.rows[2].seat_number).toBe(3);
    });
  });

  /**
   * TEST 5: Ticket-Purchase Relationship
   */
  describe('Ticket-Purchase Relationship', () => {
    test('Ticket belongs to correct purchase', async () => {
      const purchase = await testPool.query(
        `INSERT INTO purchases (user_id, event_id, quantity, total_price)
         VALUES ($1, $2, 1, 90.00)
         RETURNING *`,
        [testUser.user_id, testEvent.event_id]
      );

      const ticketId = `TKT-${purchase.rows[0].purchase_id.toString().padStart(4, '0')}-${testEvent.event_id.toString().padStart(4, '0')}-A1`;

      const ticket = await testPool.query(
        `INSERT INTO ticket_seats (purchase_id, event_id, row_letter, seat_number, zone_id, ticket_id, qr_code)
         VALUES ($1, $2, 'A', 1, $3, $4, 'qr-data')
         RETURNING *`,
        [purchase.rows[0].purchase_id, testEvent.event_id, layout.zones[0].zone_id, ticketId]
      );

      expect(ticket.rows[0].purchase_id).toBe(purchase.rows[0].purchase_id);
    });

    test('Ticket belongs to correct event', async () => {
      const purchase = await testPool.query(
        `INSERT INTO purchases (user_id, event_id, quantity, total_price)
         VALUES ($1, $2, 1, 90.00)
         RETURNING *`,
        [testUser.user_id, testEvent.event_id]
      );

      const ticketId = `TKT-${purchase.rows[0].purchase_id.toString().padStart(4, '0')}-${testEvent.event_id.toString().padStart(4, '0')}-A1`;

      const ticket = await testPool.query(
        `INSERT INTO ticket_seats (purchase_id, event_id, row_letter, seat_number, zone_id, ticket_id, qr_code)
         VALUES ($1, $2, 'A', 1, $3, $4, 'qr-data')
         RETURNING *`,
        [purchase.rows[0].purchase_id, testEvent.event_id, layout.zones[0].zone_id, ticketId]
      );

      expect(ticket.rows[0].event_id).toBe(testEvent.event_id);
    });

    test('Ticket quantity matches purchase quantity', async () => {
      const quantity = 5;
      const purchase = await testPool.query(
        `INSERT INTO purchases (user_id, event_id, quantity, total_price)
         VALUES ($1, $2, $3, 450.00)
         RETURNING *`,
        [testUser.user_id, testEvent.event_id, quantity]
      );

      for (let i = 1; i <= quantity; i++) {
        const ticketId = `TKT-${purchase.rows[0].purchase_id.toString().padStart(4, '0')}-${testEvent.event_id.toString().padStart(4, '0')}-A${i}`;
        await testPool.query(
          `INSERT INTO ticket_seats (purchase_id, event_id, row_letter, seat_number, zone_id, ticket_id, qr_code)
           VALUES ($1, $2, 'A', $3, $4, $5, $6)`,
          [purchase.rows[0].purchase_id, testEvent.event_id, i, layout.zones[0].zone_id, ticketId, `qr${i}`]
        );
      }

      const tickets = await testPool.query(
        `SELECT COUNT(*) as count FROM ticket_seats WHERE purchase_id = $1`,
        [purchase.rows[0].purchase_id]
      );

      expect(parseInt(tickets.rows[0].count)).toBe(quantity);
    });
  });
});
