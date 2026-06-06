/**
 * @file DashboardMinimal.jsx
 * Minimal test dashboard component
 */

/**
 * Minimal dashboard test component for debugging
 * @component
 * @returns {JSX.Element} Minimal dashboard test page
 */
function DashboardMinimal() {
  console.log('DashboardMinimal is rendering!');

  return (
    <div style={{
      background: 'red',
      color: 'white',
      padding: '50px',
      fontSize: '24px',
      minHeight: '500px'
    }}>
      <h1>DASHBOARD TEST - RED BACKGROUND</h1>
      <p>If you see this RED background, React is rendering correctly!</p>
      <p>If it's still white, there's a deeper issue.</p>
    </div>
  );
}

export default DashboardMinimal;
