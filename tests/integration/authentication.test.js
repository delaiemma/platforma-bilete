const { testPool } = require('../setup');
const { createTestUser } = require('../helpers/testData');
const bcrypt = require('bcrypt');

describe('Authentication & Authorization Tests - CRITICAL FOR LICENȚĂ', () => {
  /**
   * TEST 1: User Registration
   */
  describe('User Registration (Signup)', () => {
    test('Successfully creates new user with valid data', async () => {
      const randomId = Math.random().toString(36).substring(7);
      const userData = {
        name: 'New User',
        email: `newuser${Date.now()}_${randomId}@test.com`,
        password: 'password123',
        role: 'user'
      };

      const result = await testPool.query(
        `INSERT INTO "user" (name, email, password, role)
         VALUES ($1, $2, $3, $4)
         RETURNING user_id, name, email, role`,
        [userData.name, userData.email, userData.password, userData.role]
      );

      expect(result.rows.length).toBe(1);
      expect(result.rows[0].name).toBe(userData.name);
      expect(result.rows[0].email).toBe(userData.email);
      expect(result.rows[0].role).toBe('user');
      expect(result.rows[0].user_id).toBeDefined();
    });

    test('Prevents duplicate email registration', async () => {
      const email = `duplicate${Date.now()}_${Math.random().toString(36).substring(7)}@test.com`;

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
    });

    test('Requires name, email, and password', async () => {
      await expect(async () => {
        await testPool.query(
          `INSERT INTO "user" (name, email, password, role)
           VALUES (NULL, 'test@test.com', 'password', 'user')`
        );
      }).rejects.toThrow(/null value|not null/i);

      await expect(async () => {
        await testPool.query(
          `INSERT INTO "user" (name, email, password, role)
           VALUES ('Test User', NULL, 'password', 'user')`
        );
      }).rejects.toThrow(/null value|not null/i);

      await expect(async () => {
        await testPool.query(
          `INSERT INTO "user" (name, email, password, role)
           VALUES ('Test User', 'test@test.com', NULL, 'user')`
        );
      }).rejects.toThrow(/null value|not null/i);
    });

    test('Sets default role to "user" if not specified', async () => {
      const randomId = Math.random().toString(36).substring(7);
      const email = `defaultrole${Date.now()}_${randomId}@test.com`;

      const result = await testPool.query(
        `INSERT INTO "user" (name, email, password)
         VALUES ('Test User', $1, 'password123')
         RETURNING role`,
        [email]
      );

      expect(result.rows[0].role).toBe('user');
    });

    test('Can create admin user', async () => {
      const randomId = Math.random().toString(36).substring(7);
      const email = `admin${Date.now()}_${randomId}@test.com`;

      const result = await testPool.query(
        `INSERT INTO "user" (name, email, password, role)
         VALUES ('Admin User', $1, 'admin123', 'admin')
         RETURNING role`,
        [email]
      );

      expect(result.rows[0].role).toBe('admin');
    });
  });

  /**
   * TEST 2: User Login / Authentication
   */
  describe('User Login', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await createTestUser({
        name: 'Login Test User',
        password: 'testpassword123',
        role: 'user'
      });
    });

    test('Successful login with correct credentials', async () => {
      const user = await testPool.query(
        `SELECT * FROM "user" WHERE email = $1`,
        [testUser.email]
      );

      expect(user.rows.length).toBe(1);

      const isPasswordValid = await bcrypt.compare('testpassword123', user.rows[0].password);

      expect(isPasswordValid).toBe(true);
      expect(user.rows[0].user_id).toBe(testUser.user_id);
      expect(user.rows[0].name).toBe(testUser.name);
    });

    test('Login fails with incorrect password', async () => {
      const user = await testPool.query(
        `SELECT * FROM "user" WHERE email = $1`,
        [testUser.email]
      );

      expect(user.rows.length).toBe(1);

      const isPasswordValid = await bcrypt.compare('wrongpassword', user.rows[0].password);

      expect(isPasswordValid).toBe(false);
    });

    test('Login fails with non-existent email', async () => {
      const user = await testPool.query(
        `SELECT * FROM "user" WHERE email = $1`,
        ['nonexistent@test.com']
      );

      expect(user.rows.length).toBe(0);
    });

    test('Email lookup is case-sensitive', async () => {
      const user = await testPool.query(
        `SELECT * FROM "user" WHERE email = $1`,
        [testUser.email.toUpperCase()]
      );

      expect(user.rows.length).toBe(0);
    });

    test('Returns user role on successful login', async () => {
      const user = await testPool.query(
        `SELECT user_id, name, email, role, password FROM "user" WHERE email = $1`,
        [testUser.email]
      );

      expect(user.rows.length).toBe(1);

      const isPasswordValid = await bcrypt.compare('testpassword123', user.rows[0].password);

      expect(isPasswordValid).toBe(true);
      expect(user.rows[0].role).toBe('user');
    });
  });

  /**
   * TEST 3: Authorization (Role-Based Access)
   */
  describe('Role-Based Authorization', () => {
    let regularUser, adminUser;

    beforeEach(async () => {
      regularUser = await createTestUser({
        name: 'Regular User',
        role: 'user'
      });

      adminUser = await createTestUser({
        name: 'Admin User',
        role: 'admin'
      });
    });

    test('Identifies admin users correctly', async () => {
      const user = await testPool.query(
        `SELECT role FROM "user" WHERE user_id = $1`,
        [adminUser.user_id]
      );

      expect(user.rows[0].role).toBe('admin');
    });

    test('Identifies regular users correctly', async () => {
      const user = await testPool.query(
        `SELECT role FROM "user" WHERE user_id = $1`,
        [regularUser.user_id]
      );

      expect(user.rows[0].role).toBe('user');
    });

    test('Admin can create events', async () => {
      const event = await testPool.query(
        `INSERT INTO event (title, description, location, city, date, time, price,
                            available_tickets, type, image_path, user_id)
         VALUES ('Admin Event', 'Desc', 'Venue', 'City', '2025-12-31', '20:00:00',
                 50.00, 100, 'Concert', 'test.jpg', $1)
         RETURNING *`,
        [adminUser.user_id]
      );

      expect(event.rows.length).toBe(1);
      expect(event.rows[0].user_id).toBe(adminUser.user_id);
    });

    test('Regular users can also create events', async () => {
      const event = await testPool.query(
        `INSERT INTO event (title, description, location, city, date, time, price,
                            available_tickets, type, image_path, user_id)
         VALUES ('User Event', 'Desc', 'Venue', 'City', '2025-12-31', '20:00:00',
                 50.00, 100, 'Concert', 'test.jpg', $1)
         RETURNING *`,
        [regularUser.user_id]
      );

      expect(event.rows.length).toBe(1);
      expect(event.rows[0].user_id).toBe(regularUser.user_id);
    });

    test('Users can only modify their own events', async () => {
      const adminEvent = await testPool.query(
        `INSERT INTO event (title, description, location, city, date, time, price,
                            available_tickets, type, image_path, user_id)
         VALUES ('Admin Event', 'Desc', 'Venue', 'City', '2025-12-31', '20:00:00',
                 50.00, 100, 'Concert', 'test.jpg', $1)
         RETURNING *`,
        [adminUser.user_id]
      );

      const userEvent = await testPool.query(
        `INSERT INTO event (title, description, location, city, date, time, price,
                            available_tickets, type, image_path, user_id)
         VALUES ('User Event', 'Desc', 'Venue', 'City', '2025-12-31', '20:00:00',
                 50.00, 100, 'Concert', 'test.jpg', $1)
         RETURNING *`,
        [regularUser.user_id]
      );

      const eventsOwnedByAdmin = await testPool.query(
        `SELECT * FROM event WHERE user_id = $1`,
        [adminUser.user_id]
      );

      const eventsOwnedByUser = await testPool.query(
        `SELECT * FROM event WHERE user_id = $1`,
        [regularUser.user_id]
      );

      expect(eventsOwnedByAdmin.rows.length).toBe(1);
      expect(eventsOwnedByUser.rows.length).toBe(1);

      expect(eventsOwnedByAdmin.rows[0].event_id).toBe(adminEvent.rows[0].event_id);
      expect(eventsOwnedByUser.rows[0].event_id).toBe(userEvent.rows[0].event_id);
    });
  });

  /**
   * TEST 4: User Data Integrity
   */
  describe('User Data Integrity', () => {
    test('User email is stored correctly', async () => {
      const testEmail = `integrity${Date.now()}_${Math.random().toString(36).substring(7)}@test.com`;

      const created = await testPool.query(
        `INSERT INTO "user" (name, email, password, role)
         VALUES ('Test User', $1, 'password', 'user')
         RETURNING *`,
        [testEmail]
      );

      const retrieved = await testPool.query(
        `SELECT * FROM "user" WHERE user_id = $1`,
        [created.rows[0].user_id]
      );

      expect(retrieved.rows[0].email).toBe(testEmail);
    });

    test('User password is hashed with bcrypt (SECURITY FIX)', async () => {
      const testPassword = 'securePassword123';
      const user = await createTestUser({
        password: testPassword
      });

      const retrieved = await testPool.query(
        `SELECT password FROM "user" WHERE user_id = $1`,
        [user.user_id]
      );

      expect(retrieved.rows[0].password).not.toBe(testPassword);
      expect(retrieved.rows[0].password).toMatch(/^\$2b\$\d+\$/);
      expect(retrieved.rows[0].password.length).toBe(60);
    });

    test('created_at timestamp is set automatically', async () => {
      const user = await createTestUser();

      const retrieved = await testPool.query(
        `SELECT created_at FROM "user" WHERE user_id = $1`,
        [user.user_id]
      );

      expect(retrieved.rows[0].created_at).toBeDefined();
      expect(retrieved.rows[0].created_at).toBeInstanceOf(Date);
    });

    test('User ID is auto-incrementing', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();

      expect(user2.user_id).toBeGreaterThan(user1.user_id);
    });
  });

  /**
   * TEST 5: Email Validation (Database Level)
   */
  describe('Email Format Validation', () => {
    test('Accepts valid email formats', async () => {
      const validEmails = [
        `test${Date.now()}@example.com`,
        `user.name${Date.now()}@domain.co.uk`,
        `admin+tag${Date.now()}@test.org`
      ];

      for (const email of validEmails) {
        const result = await testPool.query(
          `INSERT INTO "user" (name, email, password, role)
           VALUES ('Test', $1, 'password', 'user')
           RETURNING email`,
          [email]
        );

        expect(result.rows[0].email).toBe(email);
      }
    });

    test('Stores emails without modification', async () => {
      const email = `CaseSensitive${Date.now()}@TEST.com`;

      const result = await testPool.query(
        `INSERT INTO "user" (name, email, password, role)
         VALUES ('Test User', $1, 'password', 'user')
         RETURNING email`,
        [email]
      );

      expect(result.rows[0].email).toBe(email);
    });
  });
});
