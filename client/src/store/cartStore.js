/**
 * @file cartStore.js
 * Zustand store for shopping cart state management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cartAPI } from '../api/cart';
import { useAuthStore } from './authStore';

/**
 * Query client instance for cache invalidation
 * @type {Object|null}
 */
let queryClientInstance = null;

/**
 * Set query client for cart store operations
 * @function
 * @param {Object} client - React Query client instance
 */
export const setCartQueryClient = (client) => {
  queryClientInstance = client;
};

/**
 * Shopping cart store managing cart items and operations
 * @typedef {Object} CartStore
 * @property {Object} items - Cart items keyed by event ID
 * @property {Function} addItem - Add item to cart
 * @property {Function} removeItem - Remove item from cart
 * @property {Function} updateQuantity - Update item quantity
 * @property {Function} addSeats - Add reserved seats to cart
 * @property {Function} removeSeats - Remove seats from cart
 * @property {Function} clearCart - Clear all cart items
 * @property {Function} getTotal - Get total number of items
 * @property {Function} loadFromServer - Load cart from server
 */

/**
 * Create shopping cart store with persistence
 * @function
 * @returns {CartStore} Shopping cart store hook
 */
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: {},

      /**
       * Add item to cart with specified quantity
       * @function
       * @param {number} eventId - Event ID to add
       * @param {number} quantity - Quantity to add
       * @returns {Promise<void>}
       * @throws {Error} If adding item fails
       */
      addItem: async (eventId, quantity) => {
        set((state) => ({
          items: {
            ...state.items,
            [eventId]: (state.items[eventId] || 0) + quantity
          }
        }));

        const { user } = useAuthStore.getState();
        if (user) {
          try {
            await cartAPI.add(user.id, eventId, quantity);
            if (queryClientInstance) {
              queryClientInstance.invalidateQueries(['reservations']);
            }
          } catch (error) {
            set((state) => {
              const newItems = { ...state.items };
              newItems[eventId] = (newItems[eventId] || quantity) - quantity;
              if (newItems[eventId] <= 0) delete newItems[eventId];
              return { items: newItems };
            });
            throw error;
          }
        }
      },

      /**
       * Remove item from cart
       * @function
       * @param {number} eventId - Event ID to remove
       * @returns {Promise<void>}
       * @throws {Error} If removal fails
       */
      removeItem: async (eventId) => {
        const oldQuantity = get().items[eventId];

        set((state) => {
          const { [eventId]: removed, ...rest } = state.items;
          return { items: rest };
        });

        const { user } = useAuthStore.getState();
        if (user) {
          try {
            await cartAPI.remove(user.id, eventId);
            if (queryClientInstance) {
              queryClientInstance.invalidateQueries(['reservations']);
            }
          } catch (error) {
            if (oldQuantity) {
              set((state) => ({
                items: { ...state.items, [eventId]: oldQuantity }
              }));
            }
            throw error;
          }
        }
      },

      /**
       * Update quantity of cart item
       * @function
       * @param {number} eventId - Event ID to update
       * @param {number} change - Quantity change (positive or negative)
       * @returns {Promise<void>}
       * @throws {Error} If update fails
       */
      updateQuantity: async (eventId, change) => {
        const current = get().items[eventId] || 0;
        const newQuantity = Math.max(0, current + change);

        if (newQuantity === 0) {
          return get().removeItem(eventId);
        }

        set((state) => ({
          items: { ...state.items, [eventId]: newQuantity }
        }));

        const { user } = useAuthStore.getState();
        if (user) {
          try {
            await cartAPI.update(user.id, eventId, newQuantity);
            if (queryClientInstance) {
              queryClientInstance.invalidateQueries(['reservations']);
            }
          } catch (error) {
            set((state) => ({
              items: { ...state.items, [eventId]: current }
            }));
            throw error;
          }
        }
      },

      /**
       * Add reserved seats to cart for event
       * @function
       * @param {number} eventId - Event ID
       * @param {Array<Object>} seats - Array of seat objects
       */
      addSeats: (eventId, seats) => {
        set((state) => ({
          items: {
            ...state.items,
            [eventId]: { seats }
          }
        }));
        if (queryClientInstance) {
          queryClientInstance.invalidateQueries(['seatAvailability', eventId]);
        }
      },

      /**
       * Remove seats from cart for event
       * @function
       * @param {number} eventId - Event ID
       */
      removeSeats: (eventId) => {
        set((state) => {
          const { [eventId]: removed, ...rest } = state.items;
          return { items: rest };
        });
        if (queryClientInstance) {
          queryClientInstance.invalidateQueries(['seatAvailability', eventId]);
        }
      },

      /**
       * Clear all items from cart
       * @function
       */
      clearCart: () => set({ items: {} }),

      /**
       * Get total number of items in cart
       * @function
       * @returns {number} Total item count
       */
      getTotal: () => {
        const items = get().items;
        return Object.values(items).reduce((sum, qty) => sum + qty, 0);
      },

      /**
       * Load cart data from server
       * @function
       * @returns {Promise<void>}
       */
      loadFromServer: async () => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        try {
          const response = await cartAPI.getCart(user.id);
          if (response.success && response.cart) {
            set({ items: response.cart });
          }
        } catch (error) {
          console.error('Failed to load cart from server:', error);
        }
      }
    }),
    {
      name: 'cartEvents',
      partialize: (state) => ({ items: state.items })
    }
  )
);
