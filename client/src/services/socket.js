import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

class SocketService {
    constructor() {
        this.socket = null;
        console.log('🔌 SocketService constructor called');
    }

    connect() {
        console.log('🔌 SocketService.connect() called');
        if (!this.socket) {
            console.log('🔌 Creating new socket connection to:', SOCKET_URL);
            this.socket = io(SOCKET_URL, {
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionAttempts: 5
            });

            this.socket.on('connect', () => {
                console.log('🔌 Connected to WebSocket server:', this.socket.id);
            });

            this.socket.on('disconnect', () => {
                console.log('🔌 Disconnected from WebSocket server');
            });

            this.socket.on('connect_error', (error) => {
                console.error('❌ Socket connection error:', error);
            });
        } else {
            console.log('🔌 Socket already exists, reusing:', this.socket.id);
        }

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    joinEvent(eventId) {
        if (this.socket) {
            this.socket.emit('join-event', eventId);
            console.log(`📍 Joined event room: event-${eventId}`);
        }
    }

    leaveEvent(eventId) {
        if (this.socket) {
            this.socket.emit('leave-event', eventId);
            console.log(`📍 Left event room: event-${eventId}`);
        }
    }

    on(event, callback) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    off(event, callback) {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    getSocket() {
        return this.socket;
    }
}

const socketService = new SocketService();
export default socketService;
