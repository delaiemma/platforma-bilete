/**
 * @file DebugAuth.jsx
 * Debug page for authentication state
 */

import { useAuthStore } from '../store/authStore';

/**
 * Debug page component displaying authentication state information
 * @component
 * @returns {JSX.Element} Debug authentication page
 */
function DebugAuth() {
  const { user, isAuthenticated, isAdmin } = useAuthStore();

  return (
    <div style={{ padding: '40px', background: 'white', minHeight: '100vh' }}>
      <h1>Debug Authentication</h1>

      <div style={{ marginTop: '20px', padding: '20px', background: '#f0f0f0', borderRadius: '8px' }}>
        <h2>Auth State:</h2>
        <p><strong>isAuthenticated:</strong> {isAuthenticated ? '✅ YES' : '❌ NO'}</p>
        <p><strong>isAdmin():</strong> {isAdmin() ? '✅ YES' : '❌ NO'}</p>

        <h3 style={{ marginTop: '20px' }}>User Object:</h3>
        <pre style={{ background: '#fff', padding: '10px', overflow: 'auto' }}>
          {JSON.stringify(user, null, 2)}
        </pre>

        <h3 style={{ marginTop: '20px' }}>LocalStorage userSession:</h3>
        <pre style={{ background: '#fff', padding: '10px', overflow: 'auto' }}>
          {localStorage.getItem('userSession') || 'NULL'}
        </pre>
      </div>

      <div style={{ marginTop: '20px' }}>
        <p><strong>Expected for admin:</strong></p>
        <ul>
          <li>isAuthenticated should be true</li>
          <li>isAdmin() should be true</li>
          <li>user.role should be "admin"</li>
        </ul>
      </div>
    </div>
  );
}

export default DebugAuth;
