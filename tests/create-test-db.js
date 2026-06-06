const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function createTestDatabase() {
  const adminClient = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '1q2w3e',
    database: 'postgres' 
  });

  try {
    await adminClient.connect();
    console.log('✅ Connected to PostgreSQL');

    const checkDB = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = 'ticket_test'`
    );

    if (checkDB.rows.length > 0) {
      console.log('📊 Test database already exists');
    } else {
      console.log('🔨 Creating test database...');
      await adminClient.query('CREATE DATABASE ticket_test');
      console.log('✅ Test database created');
    }

    await adminClient.end();

    const testClient = new Client({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: '1q2w3e',
      database: 'ticket_test'
    });

    await testClient.connect();
    console.log('✅ Connected to test database');

    const schemaPath = path.join(__dirname, '..', 'config', 'schema.sql');

    if (fs.existsSync(schemaPath)) {
      console.log('📝 Applying schema from schema.sql...');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      await testClient.query(schema);
      console.log('✅ Schema applied');
    } else {
      console.log('⚠️  No schema.sql found, creating minimal schema...');

      const minimalSchema = `
        -- User table
        CREATE TABLE IF NOT EXISTS "user" (
          user_id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Event table
        CREATE TABLE IF NOT EXISTS event (
          event_id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          location VARCHAR(255),
          city VARCHAR(255),
          date DATE NOT NULL,
          time TIME NOT NULL,
          price NUMERIC(10,2),
          available_tickets INTEGER,
          tickets_sold INTEGER DEFAULT 0,
          type VARCHAR(100),
          image_path VARCHAR(255),
          user_id INTEGER REFERENCES "user"(user_id),
          has_seating BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Purchases table
        CREATE TABLE IF NOT EXISTS purchases (
          purchase_id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
          event_id INTEGER NOT NULL REFERENCES event(event_id) ON DELETE CASCADE,
          quantity INTEGER NOT NULL,
          total_price NUMERIC(10,2) NOT NULL,
          purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Cart table
        CREATE TABLE IF NOT EXISTS cart (
          cart_id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
          event_id INTEGER NOT NULL REFERENCES event(event_id) ON DELETE CASCADE,
          quantity INTEGER NOT NULL,
          added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, event_id)
        );

        -- Cart reservations
        CREATE TABLE IF NOT EXISTS cart_reservations (
          reservation_id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
          event_id INTEGER NOT NULL REFERENCES event(event_id) ON DELETE CASCADE,
          quantity INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP NOT NULL,
          UNIQUE(user_id, event_id)
        );

        -- Favorites table
        CREATE TABLE IF NOT EXISTS favorites (
          favorite_id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
          event_id INTEGER NOT NULL REFERENCES event(event_id) ON DELETE CASCADE,
          added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, event_id)
        );

        -- Venue layouts
        CREATE TABLE IF NOT EXISTS venue_layouts (
          layout_id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          created_by INTEGER REFERENCES "user"(user_id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Seat zones
        CREATE TABLE IF NOT EXISTS seat_zones (
          zone_id SERIAL PRIMARY KEY,
          layout_id INTEGER NOT NULL REFERENCES venue_layouts(layout_id) ON DELETE CASCADE,
          name VARCHAR(100) NOT NULL,
          color VARCHAR(7) DEFAULT '#4CAF50',
          display_order INTEGER DEFAULT 0,
          UNIQUE(layout_id, name)
        );

        -- Layout rows
        CREATE TABLE IF NOT EXISTS layout_rows (
          row_id SERIAL PRIMARY KEY,
          layout_id INTEGER NOT NULL REFERENCES venue_layouts(layout_id) ON DELETE CASCADE,
          zone_id INTEGER NOT NULL REFERENCES seat_zones(zone_id),
          row_letter VARCHAR(2) NOT NULL,
          seats_in_row INTEGER NOT NULL CHECK (seats_in_row > 0),
          row_order INTEGER NOT NULL,
          UNIQUE(layout_id, row_letter)
        );

        -- Event layouts
        CREATE TABLE IF NOT EXISTS event_layouts (
          event_layout_id SERIAL PRIMARY KEY,
          event_id INTEGER NOT NULL REFERENCES event(event_id) ON DELETE CASCADE,
          layout_id INTEGER NOT NULL REFERENCES venue_layouts(layout_id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(event_id)
        );

        -- Event zone pricing
        CREATE TABLE IF NOT EXISTS event_zone_pricing (
          pricing_id SERIAL PRIMARY KEY,
          event_id INTEGER NOT NULL REFERENCES event(event_id) ON DELETE CASCADE,
          zone_id INTEGER NOT NULL REFERENCES seat_zones(zone_id),
          price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(event_id, zone_id)
        );

        -- Seat reservations
        CREATE TABLE IF NOT EXISTS seat_reservations (
          reservation_id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
          event_id INTEGER NOT NULL REFERENCES event(event_id) ON DELETE CASCADE,
          row_letter VARCHAR(2) NOT NULL,
          seat_number INTEGER NOT NULL,
          zone_id INTEGER NOT NULL REFERENCES seat_zones(zone_id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP NOT NULL,
          UNIQUE(event_id, row_letter, seat_number)
        );

        -- Ticket seats
        CREATE TABLE IF NOT EXISTS ticket_seats (
          ticket_seat_id SERIAL PRIMARY KEY,
          purchase_id INTEGER NOT NULL REFERENCES purchases(purchase_id) ON DELETE CASCADE,
          event_id INTEGER NOT NULL REFERENCES event(event_id),
          row_letter VARCHAR(2) NOT NULL,
          seat_number INTEGER NOT NULL,
          zone_id INTEGER NOT NULL REFERENCES seat_zones(zone_id),
          ticket_id VARCHAR(50) UNIQUE,
          qr_code TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(event_id, row_letter, seat_number)
        );

        -- Indexes
        CREATE INDEX IF NOT EXISTS idx_seat_reservations_event ON seat_reservations(event_id);
        CREATE INDEX IF NOT EXISTS idx_seat_reservations_expires ON seat_reservations(expires_at);
        CREATE INDEX IF NOT EXISTS idx_ticket_seats_event ON ticket_seats(event_id);
        CREATE INDEX IF NOT EXISTS idx_ticket_seats_purchase ON ticket_seats(purchase_id);
      `;

      await testClient.query(minimalSchema);
      console.log('✅ Minimal schema created');
    }

    await testClient.end();
    console.log('\n✅ Test database setup complete!');
    console.log('📝 You can now run: npm test');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTestDatabase();
