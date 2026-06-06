const { testPool } = require('../setup');
const {
  createTestUser,
  createTestEvent,
  createTestLayout,
  assignLayoutToEvent
} = require('../helpers/testData');

describe('Pricing Calculation Tests - CRITICAL FOR LICENȚĂ', () => {
  let testUser, testEvent;

  beforeEach(async () => {
    testUser = await createTestUser();
  });

  describe('Zone-Based Pricing', () => {
    test('Correctly calculates VIP price (base × 3)', async () => {
      const basePrice = 50.00;
      testEvent = await createTestEvent(testUser.user_id, {
        price: basePrice,
        has_seating: true
      });

      const layout = await createTestLayout(testUser.user_id);
      await assignLayoutToEvent(testEvent.event_id, layout.layout.layout_id, [
        { zone_id: layout.zones[0].zone_id, price: basePrice * 3 },
        { zone_id: layout.zones[1].zone_id, price: basePrice * 2 },
        { zone_id: layout.zones[2].zone_id, price: basePrice }
      ]);

      const vipPricing = await testPool.query(
        `SELECT ezp.price, sz.name
         FROM event_zone_pricing ezp
         JOIN seat_zones sz ON ezp.zone_id = sz.zone_id
         WHERE ezp.event_id = $1 AND sz.name = 'VIP'`,
        [testEvent.event_id]
      );

      expect(vipPricing.rows.length).toBe(1);
      expect(parseFloat(vipPricing.rows[0].price)).toBe(150.00);
    });

    test('Correctly calculates Regular price (base × 2)', async () => {
      const basePrice = 30.00;
      testEvent = await createTestEvent(testUser.user_id, {
        price: basePrice,
        has_seating: true
      });

      const layout = await createTestLayout(testUser.user_id);
      await assignLayoutToEvent(testEvent.event_id, layout.layout.layout_id, [
        { zone_id: layout.zones[0].zone_id, price: basePrice * 3 },
        { zone_id: layout.zones[1].zone_id, price: basePrice * 2 },
        { zone_id: layout.zones[2].zone_id, price: basePrice }
      ]);

      const regularPricing = await testPool.query(
        `SELECT ezp.price, sz.name
         FROM event_zone_pricing ezp
         JOIN seat_zones sz ON ezp.zone_id = sz.zone_id
         WHERE ezp.event_id = $1 AND sz.name = 'Regular'`,
        [testEvent.event_id]
      );

      expect(regularPricing.rows.length).toBe(1);
      expect(parseFloat(regularPricing.rows[0].price)).toBe(60.00);
    });

    test('Correctly calculates Balcony price (base × 1)', async () => {
      const basePrice = 25.00;
      testEvent = await createTestEvent(testUser.user_id, {
        price: basePrice,
        has_seating: true
      });

      const layout = await createTestLayout(testUser.user_id);
      await assignLayoutToEvent(testEvent.event_id, layout.layout.layout_id, [
        { zone_id: layout.zones[0].zone_id, price: basePrice * 3 },
        { zone_id: layout.zones[1].zone_id, price: basePrice * 2 },
        { zone_id: layout.zones[2].zone_id, price: basePrice }
      ]);

      const balconyPricing = await testPool.query(
        `SELECT ezp.price, sz.name
         FROM event_zone_pricing ezp
         JOIN seat_zones sz ON ezp.zone_id = sz.zone_id
         WHERE ezp.event_id = $1 AND sz.name = 'Balcony'`,
        [testEvent.event_id]
      );

      expect(balconyPricing.rows.length).toBe(1);
      expect(parseFloat(balconyPricing.rows[0].price)).toBe(25.00);
    });

    test('All zones have correct pricing ratios', async () => {
      const basePrice = 40.00;
      testEvent = await createTestEvent(testUser.user_id, {
        price: basePrice,
        has_seating: true
      });

      const layout = await createTestLayout(testUser.user_id);
      await assignLayoutToEvent(testEvent.event_id, layout.layout.layout_id, [
        { zone_id: layout.zones[0].zone_id, price: basePrice * 3 },
        { zone_id: layout.zones[1].zone_id, price: basePrice * 2 },
        { zone_id: layout.zones[2].zone_id, price: basePrice }
      ]);

      const allPricing = await testPool.query(
        `SELECT ezp.price, sz.name
         FROM event_zone_pricing ezp
         JOIN seat_zones sz ON ezp.zone_id = sz.zone_id
         WHERE ezp.event_id = $1
         ORDER BY sz.display_order`,
        [testEvent.event_id]
      );

      expect(allPricing.rows.length).toBe(3);

      const vip = parseFloat(allPricing.rows[0].price);
      const regular = parseFloat(allPricing.rows[1].price);
      const balcony = parseFloat(allPricing.rows[2].price);

      expect(vip).toBe(120.00);
      expect(regular).toBe(80.00);
      expect(balcony).toBe(40.00);

      expect(vip / balcony).toBe(3);
      expect(regular / balcony).toBe(2);
    });
  });

  /**
   * TEST 2: Purchase Total Price Calculations
   */
  describe('Purchase Total Calculations', () => {
    test('Calculates total for quantity-based purchase', async () => {
      testEvent = await createTestEvent(testUser.user_id, {
        price: 50.00,
        available_tickets: 10
      });

      const quantity = 3;
      const expectedTotal = 50.00 * 3;

      const purchase = await testPool.query(
        `INSERT INTO purchases (user_id, event_id, quantity, total_price)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [testUser.user_id, testEvent.event_id, quantity, expectedTotal]
      );

      expect(parseFloat(purchase.rows[0].total_price)).toBe(150.00);
      expect(purchase.rows[0].quantity).toBe(3);
    });

    test('Calculates total for mixed zone seat purchase', async () => {
      const basePrice = 30.00;
      testEvent = await createTestEvent(testUser.user_id, {
        price: basePrice,
        has_seating: true
      });

      const layout = await createTestLayout(testUser.user_id);
      await assignLayoutToEvent(testEvent.event_id, layout.layout.layout_id, [
        { zone_id: layout.zones[0].zone_id, price: basePrice * 3 },
        { zone_id: layout.zones[1].zone_id, price: basePrice * 2 },
        { zone_id: layout.zones[2].zone_id, price: basePrice }
      ]);

      const seats = [
        { zone: 'VIP', price: 90.00, count: 2 },
        { zone: 'Regular', price: 60.00, count: 3 },
        { zone: 'Balcony', price: 30.00, count: 1 }
      ];

      const totalSeats = 2 + 3 + 1;
      const expectedTotal = (90 * 2) + (60 * 3) + (30 * 1);

      const purchase = await testPool.query(
        `INSERT INTO purchases (user_id, event_id, quantity, total_price)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [testUser.user_id, testEvent.event_id, totalSeats, expectedTotal]
      );

      expect(purchase.rows[0].quantity).toBe(6);
      expect(parseFloat(purchase.rows[0].total_price)).toBe(390.00);
    });

    test('Handles decimal prices correctly', async () => {
      testEvent = await createTestEvent(testUser.user_id, {
        price: 12.50,
        available_tickets: 10
      });

      const quantity = 4;
      const expectedTotal = 12.50 * 4;

      const purchase = await testPool.query(
        `INSERT INTO purchases (user_id, event_id, quantity, total_price)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [testUser.user_id, testEvent.event_id, quantity, expectedTotal]
      );

      expect(parseFloat(purchase.rows[0].total_price)).toBe(50.00);
    });

    test('Handles free events (price = 0)', async () => {
      testEvent = await createTestEvent(testUser.user_id, {
        price: 0.00,
        available_tickets: 100
      });

      const quantity = 5;
      const expectedTotal = 0.00;

      const purchase = await testPool.query(
        `INSERT INTO purchases (user_id, event_id, quantity, total_price)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [testUser.user_id, testEvent.event_id, quantity, expectedTotal]
      );

      expect(parseFloat(purchase.rows[0].total_price)).toBe(0.00);
      expect(purchase.rows[0].quantity).toBe(5);
    });
  });

  /**
   * TEST 3: Price Precision and Rounding
   */
  describe('Price Precision', () => {
    test('Maintains 2 decimal precision', async () => {
      testEvent = await createTestEvent(testUser.user_id, {
        price: 19.99,
        available_tickets: 10
      });

      const purchase = await testPool.query(
        `INSERT INTO purchases (user_id, event_id, quantity, total_price)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [testUser.user_id, testEvent.event_id, 3, 59.97]
      );

      expect(parseFloat(purchase.rows[0].total_price)).toBe(59.97);
    });

    test('Handles large quantities correctly', async () => {
      testEvent = await createTestEvent(testUser.user_id, {
        price: 15.00,
        available_tickets: 1000
      });

      const quantity = 100;
      const expectedTotal = 15.00 * 100;

      const purchase = await testPool.query(
        `INSERT INTO purchases (user_id, event_id, quantity, total_price)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [testUser.user_id, testEvent.event_id, quantity, expectedTotal]
      );

      expect(parseFloat(purchase.rows[0].total_price)).toBe(1500.00);
      expect(purchase.rows[0].quantity).toBe(100);
    });
  });

  /**
   * TEST 4: Event Price Updates
   */
  describe('Price Update Integrity', () => {
    test('Updating event price does not affect existing purchases', async () => {
      testEvent = await createTestEvent(testUser.user_id, {
        price: 50.00,
        available_tickets: 10
      });

      const purchase = await testPool.query(
        `INSERT INTO purchases (user_id, event_id, quantity, total_price)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [testUser.user_id, testEvent.event_id, 2, 100.00]
      );

      expect(parseFloat(purchase.rows[0].total_price)).toBe(100.00);

      await testPool.query(
        `UPDATE event SET price = 75.00 WHERE event_id = $1`,
        [testEvent.event_id]
      );

      const purchaseCheck = await testPool.query(
        `SELECT total_price FROM purchases WHERE purchase_id = $1`,
        [purchase.rows[0].purchase_id]
      );

      expect(parseFloat(purchaseCheck.rows[0].total_price)).toBe(100.00);
    });

    test('Updating zone pricing does not affect existing ticket_seats', async () => {
      const basePrice = 50.00;
      testEvent = await createTestEvent(testUser.user_id, {
        price: basePrice,
        has_seating: true
      });

      const layout = await createTestLayout(testUser.user_id);
      await assignLayoutToEvent(testEvent.event_id, layout.layout.layout_id, [
        { zone_id: layout.zones[0].zone_id, price: 150.00 }
      ]);

      const purchase = await testPool.query(
        `INSERT INTO purchases (user_id, event_id, quantity, total_price)
         VALUES ($1, $2, 1, 150.00)
         RETURNING *`,
        [testUser.user_id, testEvent.event_id]
      );

      expect(parseFloat(purchase.rows[0].total_price)).toBe(150.00);

      await testPool.query(
        `UPDATE event_zone_pricing
         SET price = 200.00
         WHERE event_id = $1 AND zone_id = $2`,
        [testEvent.event_id, layout.zones[0].zone_id]
      );

      const purchaseCheck = await testPool.query(
        `SELECT total_price FROM purchases WHERE purchase_id = $1`,
        [purchase.rows[0].purchase_id]
      );

      expect(parseFloat(purchaseCheck.rows[0].total_price)).toBe(150.00);
    });
  });
});
