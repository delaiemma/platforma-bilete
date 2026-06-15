/**
 * @fileoverview Main Express application server for the Ticket booking platform.
 * Handles API routing, WebSocket connections, rate limiting, CORS configuration,
 * and real-time seat reservation management with Socket.IO.
 * @module server
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { startReservationCleanup } = require('./services/reservationCleanup');
const { apiLimiter, authLimiter, purchaseLimiter } = require('./middleware/rateLimiter');

const eventRoutes = require('./routes/events');
const userRoutes = require('./routes/users');
const purchaseRoutes = require('./routes/purchases');
const favouriteRoutes = require('./routes/favourites');
const cartRoutes = require('./routes/cart');
const statisticsRoutes = require('./routes/statistics');
const recommendationRoutes = require('./routes/recommendations');
const contactRoutes = require('./routes/contact');
const layoutRoutes = require('./routes/layouts');
const seatRoutes = require('./routes/seats');
const paymentRoutes = require('./routes/payments');
const reviewRoutes = require('./routes/reviews');
const discountRoutes = require('./routes/discountRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const chatbotRoutes = require('./routes/chatbot');
const waitlistRoutes = require('./routes/waitlist');
const upgradeRoutes = require('./routes/upgrade');

/**
 * Express application instance.
 * @constant {express.Application}
 */
const app = express();

/**
 * HTTP server instance wrapping the Express app.
 * Required for Socket.IO integration.
 * @constant {http.Server}
 */
const server = http.createServer(app);

/**
 * Socket.IO server instance for real-time communication.
 * Configured with CORS to allow connections from the frontend client.
 * Used for live seat reservation updates and event room management.
 * @constant {SocketIO.Server}
 */
const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

/**
 * Server port number.
 * @constant {number}
 * @default 3000
 */
const PORT = 3000;

console.log('🚀 Starting Ticket API server...');

/**
 * Make Socket.IO instance accessible throughout the application.
 * This allows route handlers to emit real-time events to connected clients.
 */
app.set('io', io);

/**
 * Socket.IO Connection Handler
 * Manages WebSocket connections, event room subscriptions, and disconnections.
 * Clients can join specific event rooms to receive real-time seat updates.
 *
 * @event connection
 * @param {Socket} socket - The connected socket instance
 */
io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);

    socket.on('join-event', (eventId) => {
        socket.join(`event-${eventId}`);
        console.log(`📍 Client ${socket.id} joined event-${eventId}`);
    });

    socket.on('leave-event', (eventId) => {
        socket.leave(`event-${eventId}`);
        console.log(`📍 Client ${socket.id} left event-${eventId}`);
    });


    socket.on('disconnect', () => {
        console.log('🔌 Client disconnected:', socket.id);
    });
});

/**
 * Initialize the automated reservation cleanup service.
 * Periodically removes expired seat reservations and notifies connected clients.
 */
startReservationCleanup(io);

/**
 * CORS Middleware Configuration
 * Enables Cross-Origin Resource Sharing for the frontend application.
 * Allows credentials (cookies, authorization headers) to be included in requests.
 */
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

/**
 * Body Parser Middleware
 * Parses incoming request bodies as JSON and URL-encoded data.
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Static File Serving Middleware
 * Serves images and uploaded files from their respective directories.
 */
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/**
 * API Routes Configuration
 * Mounts route handlers with appropriate rate limiting middleware.
 * - apiLimiter: General API rate limiting for all endpoints
 * - authLimiter: Stricter rate limiting for authentication endpoints
 * - purchaseLimiter: Rate limiting for purchase transactions
 */
app.use('/api/', apiLimiter);
app.use('/api/events', eventRoutes);
app.use('/api/all-events', eventRoutes);
app.use('/api/user', userRoutes);
app.use('/api/login', authLimiter, userRoutes);
app.use('/api/signup', authLimiter, userRoutes);
app.use('/api/purchase', purchaseLimiter, purchaseRoutes);
app.use('/api/user/favourites', favouriteRoutes);
app.use('/api/user/cart', cartRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/layouts', layoutRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api', waitlistRoutes);
app.use('/api/upgrade', upgradeRoutes);

/**
 * Test Endpoint
 * Simple health check endpoint to verify the API server is running.
 *
 * @name GET /test
 * @function
 * @memberof module:server
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @returns {Object} JSON response with success message and timestamp
 */
app.get('/test', (req, res) => {
    console.log('🧪 Test endpoint called');
    res.json({
        message: 'API server working!',
        timestamp: new Date()
    });
});

/**
 * Server Initialization
 * Starts the HTTP server and logs startup information including:
 * - Server URL and port
 * - API endpoints
 * - Active security features (rate limiting, input validation)
 * - WebSocket server status
 */
server.listen(PORT, () => {
    console.log(`✅ API server running at http://localhost:${PORT}`);
    console.log(`📊 API available at: http://localhost:${PORT}/api/events`);
    console.log(`🧪 Test API at: http://localhost:${PORT}/test`);
    console.log(`🛡️  Rate limiting: Active`);
    console.log(`✅ Input validation: Active`);
    console.log(`🔌 WebSocket server: Active`);
});
