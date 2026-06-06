const { Pool } = require('pg');

const testPool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'ticket_test', 
  password: '1q2w3e',
  port: 5432,
});

jest.setTimeout(10000);

beforeAll(async () => {
  console.log('🧪 Setting up test environment...');

  try {
    await testPool.query('SELECT NOW()');
    console.log('✅ Test database connected');
  } catch (error) {
    console.error('❌ Failed to connect to test database:', error.message);
    console.log('💡 Make sure to create test database: CREATE DATABASE ticket_test;');
    throw error;
  }
});

afterEach(async () => {
  try {
    await testPool.query('DELETE FROM ticket_seats');
    await testPool.query('DELETE FROM seat_reservations');
    await testPool.query('DELETE FROM purchases');
    await testPool.query('DELETE FROM cart_reservations');
    await testPool.query('DELETE FROM cart');
    await testPool.query('DELETE FROM favorites');
    await testPool.query('DELETE FROM event_zone_pricing');
    await testPool.query('DELETE FROM event_layouts');
    await testPool.query('DELETE FROM layout_rows');
    await testPool.query('DELETE FROM seat_zones');
    await testPool.query('DELETE FROM venue_layouts');
    await testPool.query('DELETE FROM event');
    await testPool.query('DELETE FROM "user"');
  } catch (error) {
  }
});

afterAll(async () => {
  console.log('🧹 Cleaning up test environment...');
  await testPool.end();
  console.log('✅ Test cleanup complete');
});

global.testPool = testPool;

module.exports = { testPool };
