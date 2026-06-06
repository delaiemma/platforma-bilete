/**
 * @file authStore.js
 * Zustand store for authentication state management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../api/auth';
import { useCartStore } from './cartStore';
import { useFavoritesStore } from './favoritesStore';

/**
 * Authentication store managing user session and authentication state
 * @typedef {Object} AuthStore
 * @property {Object|null} user - Current user object
 * @property {boolean} isAuthenticated - Whether user is authenticated
 * @property {string|null} token - Authentication token
 * @property {Function} login - Login user with credentials
 * @property {Function} signup - Register new user account
 * @property {Function} updateUser - Update user data in store
 * @property {Function} logout - Logout user and clear session
 * @property {Function} isAdmin - Check if current user is admin
 */

/**
 * Create authentication store with persistence
 * @function
 * @returns {AuthStore} Authentication store hook
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      token: null,

      /**
       * Login user with email and password
       * @function
       * @param {Object} credentials - Login credentials
       * @param {string} credentials.email - User email
       * @param {string} credentials.password - User password
       * @returns {Promise<Object>} User object
       * @throws {Error} If login fails
       */
      login: async (credentials) => {
        try {
          const response = await authAPI.login(credentials);

          if (response.success && response.user) {
            set({
              user: response.user,
              isAuthenticated: true,
              token: response.token || null
            });

            try {
              await useFavoritesStore.getState().loadFromServer();
              await useCartStore.getState().loadFromServer();
              console.log('✅ Loaded favorites and cart from server');
            } catch (err) {
              console.error('Failed to load user data from server:', err);
            }

            return response.user;
          } else {
            throw new Error(response.message || 'Login failed');
          }
        } catch (error) {
          console.error('Login error:', error);
          throw error;
        }
      },

      /**
       * Register new user account
       * @function
       * @param {Object} userData - User registration data
       * @param {string} userData.email - User email
       * @param {string} userData.password - User password
       * @param {string} userData.name - User full name
       * @returns {Promise<Object>} Created user object
       * @throws {Error} If signup fails
       */
      signup: async (userData) => {
        try {
          const response = await authAPI.signup(userData);

          if (response.success && response.user) {
            set({
              user: response.user,
              isAuthenticated: true,
              token: response.token || null
            });

            try {
              await useFavoritesStore.getState().loadFromServer();
              await useCartStore.getState().loadFromServer();
              console.log('✅ Loaded favorites and cart from server');
            } catch (err) {
              console.error('Failed to load user data from server:', err);
            }

            return response.user;
          } else {
            throw new Error(response.message || 'Signup failed');
          }
        } catch (error) {
          console.error('Signup error:', error);
          throw error;
        }
      },

      /**
       * Update user data in store
       * @function
       * @param {Object} updatedUserData - Updated user fields
       */
      updateUser: (updatedUserData) => {
        set((state) => ({
          user: { ...state.user, ...updatedUserData }
        }));
      },

      /**
       * Logout user and clear authentication state
       * @function
       */
      logout: () => {
        set({ user: null, isAuthenticated: false, token: null });
        localStorage.removeItem('cartEvents');
        localStorage.removeItem('favouriteEvents');
      },

      /**
       * Check if current user has admin role
       * @function
       * @returns {boolean} True if user is admin
       */
      isAdmin: () => {
        const { user } = get();
        return user?.role === 'admin';
      }
    }),
    {
      name: 'userSession',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        token: state.token
      })
    }
  )
);
