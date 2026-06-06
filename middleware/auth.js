/**
 * Authentication middleware for JWT token verification
 * @module middleware/auth
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ticket-secret-key';

/**
 * Middleware to authenticate requests using JWT tokens
 * @function authenticate
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 * @description Verifies JWT token from Authorization header and attaches decoded user to req.user
 */
const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('🔐 Auth middleware - Full Header:', authHeader);
    console.log('🔐 Auth middleware - Token extracted:', token);
    console.log('🔐 Token length:', token ? token.length : 0);
    console.log('🔐 Token first 20 chars:', token ? token.substring(0, 20) : 'N/A');

    if (!token) {
        console.log('❌ No token provided');
        return res.status(401).json({ message: 'Token lipsă. Autentifică-te pentru a continua.' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log('❌ Token verification failed:', err.message);
            return res.status(403).json({ message: 'Token invalid sau expirat.' });
        }
        console.log('✅ Token verified for user:', decoded.email);
        req.user = decoded;
        next();
    });
};

module.exports = { authenticate, JWT_SECRET };
