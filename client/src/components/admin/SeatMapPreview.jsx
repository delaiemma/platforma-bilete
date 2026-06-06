/**
 * @file SeatMapPreview.jsx
 * Visual preview component for seat layouts in admin management pages
 */

import styles from '../../styles/Layouts.module.css';

/**
 * Visual preview of a seat layout used in CreateLayout and EditLayout pages
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.layout - Seat layout configuration
 * @param {Array<Object>} props.layout.zones - Array of zone definitions
 * @param {string} props.layout.zones[].name - Zone name
 * @param {string} props.layout.zones[].color - Zone color hex code
 * @param {Array<Object>} props.layout.rows - Array of row configurations
 * @param {string} props.layout.rows[].row_letter - Row letter identifier
 * @param {number} props.layout.rows[].seats_in_row - Number of seats in row
 * @param {string} props.layout.rows[].zone_color - Zone color for the row
 * @param {string} props.layout.rows[].zone_name - Zone name for the row
 * @returns {JSX.Element|null} Seat map preview component or null if no layout
 */
function SeatMapPreview({ layout }) {
  if (!layout || !layout.rows || layout.rows.length === 0) return null;

  return (
    <div className={styles.previewSection}>
      <h3 className={styles.previewTitle}>Seat Map Preview</h3>

      <div className={styles.seatPreviewGrid}>
        {/* Stage indicator */}
        <div style={{
          border: '1px solid #999',
          padding: '4px 40px',
          marginBottom: 12,
          fontSize: 11,
          fontStyle: 'italic',
          color: '#666',
          letterSpacing: 2
        }}>
          STAGE
        </div>

        {layout.rows.map(row => (
          <div key={row.row_letter} className={styles.seatPreviewRow}>
            <span className={styles.seatPreviewRowLabel}>{row.row_letter}</span>
            {[...Array(row.seats_in_row)].map((_, idx) => (
              <div
                key={idx}
                className={styles.seatPreviewSeat}
                style={{ backgroundColor: row.zone_color || '#4CAF50' }}
                title={`${row.row_letter}${idx + 1} — ${row.zone_name || ''}`}
              >
                {idx + 1}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      {layout.zones && layout.zones.length > 0 && (
        <div className={styles.legendRow}>
          {layout.zones.map((zone, i) => (
            <div key={i} className={styles.legendItem}>
              <div className={styles.legendSwatch} style={{ backgroundColor: zone.color }} />
              {zone.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SeatMapPreview;
