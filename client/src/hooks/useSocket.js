/**
 * @file useSocket.js
 * Custom hooks for WebSocket connection management
 */

import { useEffect, useState } from 'react';
import socketService from '../services/socket';

/**
 * Custom hook for establishing WebSocket connection
 * @hook
 * @returns {Object} Socket service instance
 * @description Connects to WebSocket server on mount
 */
export const useSocket = () => {
    useEffect(() => {
        socketService.connect();
        return () => {};
    }, []);

    return socketService;
};

/**
 * Custom hook for joining event-specific WebSocket room
 * @hook
 * @param {number} eventId - Event ID to join room for
 * @returns {Object} Socket service instance
 * @description Joins event room on mount, leaves on unmount
 */
export const useEventRoom = (eventId) => {
    useEffect(() => {
        console.log('🔌 useEventRoom effect running, eventId:', eventId);
        if (eventId) {
            console.log('🔌 Connecting to WebSocket...');
            const socket = socketService.connect();
            console.log('🔌 Socket instance:', socket ? 'exists' : 'null');
            socketService.joinEvent(eventId);

            return () => {
                console.log('🔌 Leaving event room:', eventId);
                socketService.leaveEvent(eventId);
            };
        }
    }, [eventId]);

    return socketService;
};

export default useSocket;
