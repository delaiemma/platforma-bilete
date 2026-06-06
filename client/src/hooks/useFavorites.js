/**
 * @file useFavorites.js
 * Custom hook for managing favorite events with query cache invalidation
 */

import { useQueryClient } from '@tanstack/react-query';
import { useFavoritesStore } from '../store/favoritesStore';

/**
 * Custom hook for managing favorite events with automatic query invalidation
 * @hook
 * @returns {Object} Favorites management object
 * @returns {Function} return.addFavorite - Add event to favorites
 * @returns {Function} return.removeFavorite - Remove event from favorites
 * @returns {Function} return.toggleFavorite - Toggle favorite status
 * @returns {Function} return.isFavorite - Check if event is favorited
 * @returns {Array<string>} return.items - Array of favorite event IDs
 */
export const useFavorites = () => {
  const queryClient = useQueryClient();
  const store = useFavoritesStore();

  const addFavorite = async (eventId) => {
    await store.addFavorite(eventId);
    queryClient.invalidateQueries(['recommendations']);
  };

  const removeFavorite = async (eventId) => {
    console.log('useFavorites hook: removing', eventId);
    await store.removeFavorite(eventId);
    queryClient.invalidateQueries(['recommendations']);
    queryClient.invalidateQueries(['favorites']);
    console.log('useFavorites hook: queries invalidated');
  };

  const toggleFavorite = async (eventId) => {
    const result = await store.toggleFavorite(eventId);
    queryClient.invalidateQueries(['recommendations']);
    return result;
  };

  return {
    ...store,
    addFavorite,
    removeFavorite,
    toggleFavorite
  };
};
