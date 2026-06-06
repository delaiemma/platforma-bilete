/**
 * @file favoritesStore.js
 * Zustand store for managing favorite events
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { favoritesAPI } from '../api/favorites';
import { useAuthStore } from './authStore';

/**
 * Favorites store managing user's favorite events
 * @typedef {Object} FavoritesStore
 * @property {Array<string>} items - Array of favorite event IDs
 * @property {Function} addFavorite - Add event to favorites
 * @property {Function} removeFavorite - Remove event from favorites
 * @property {Function} isFavorite - Check if event is favorited
 * @property {Function} toggleFavorite - Toggle favorite status
 * @property {Function} loadFromServer - Load favorites from server
 */

/**
 * Create favorites store with persistence
 * @function
 * @returns {FavoritesStore} Favorites store hook
 */
export const useFavoritesStore = create(
  persist(
    (set, get) => ({
      items: [],

      /**
       * Add event to favorites
       * @function
       * @param {number} eventId - Event ID to add
       * @returns {Promise<void>}
       * @throws {Error} If adding favorite fails
       */
      addFavorite: async (eventId) => {
        const eventIdStr = String(eventId);
        console.log('Store addFavorite called with:', eventId, 'normalized to:', eventIdStr);

        set((state) => ({
          items: [...state.items, eventIdStr]
        }));
        console.log('Optimistically added to local state');

        const { user } = useAuthStore.getState();
        if (user) {
          console.log('User found, calling API with userId:', user.id, 'eventId:', eventId);
          try {
            const response = await favoritesAPI.add(user.id, eventId);
            console.log('API response:', response);
            console.log('✅ Successfully added to server');
          } catch (error) {
            console.error('❌ Failed to add to server:', error.message);
            console.error('Rolling back local state');
            set((state) => ({
              items: state.items.filter((id) => id !== eventIdStr)
            }));
            throw error;
          }
        } else {
          console.warn('No user found, only saving locally');
        }
      },

      /**
       * Remove event from favorites
       * @function
       * @param {number} eventId - Event ID to remove
       * @returns {Promise<void>}
       * @throws {Error} If removal fails
       */
      removeFavorite: async (eventId) => {
        const eventIdStr = String(eventId);

        console.log('Store removeFavorite called with:', eventId, 'normalized to:', eventIdStr);
        console.log('Current items before removal:', get().items);

        set((state) => {
          const newItems = state.items.filter((id) => id !== eventIdStr);
          console.log('New items after filter:', newItems);
          return { items: newItems };
        });

        const { user } = useAuthStore.getState();
        if (user) {
          try {
            await favoritesAPI.remove(user.id, eventId);
          } catch (error) {
            set((state) => ({
              items: [...state.items, eventIdStr]
            }));
            throw error;
          }
        }
      },

      /**
       * Check if event is in favorites
       * @function
       * @param {number} eventId - Event ID to check
       * @returns {boolean} True if event is favorited
       */
      isFavorite: (eventId) => {
        return get().items.includes(String(eventId));
      },

      /**
       * Toggle favorite status for event
       * @function
       * @param {number} eventId - Event ID to toggle
       * @returns {Promise<boolean>} New favorite status
       */
      toggleFavorite: async (eventId) => {
        const { isFavorite, addFavorite, removeFavorite } = get();
        const eventIdStr = String(eventId);

        if (isFavorite(eventIdStr)) {
          await removeFavorite(eventIdStr);
          return false;
        } else {
          await addFavorite(eventIdStr);
          return true;
        }
      },

      /**
       * Load favorites from server
       * @function
       * @returns {Promise<void>}
       */
      loadFromServer: async () => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        try {
          const response = await favoritesAPI.get(user.id);
          if (response.success && response.favourites) {
            const normalizedItems = response.favourites.map(id => String(id));
            set({ items: normalizedItems });
          }
        } catch (error) {
          console.error('Failed to load favorites from server:', error);
        }
      }
    }),
    {
      name: 'favouriteEvents',
      partialize: (state) => ({ items: state.items })
    }
  )
);
