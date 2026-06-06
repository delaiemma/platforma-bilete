/**
 * @file CreateLayout.jsx
 * Admin page for creating new seat layouts
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { layoutsAPI } from '../../api/layouts';
import { useAuthStore } from '../../store/authStore';
import SeatMapPreview from '../../components/admin/SeatMapPreview';
import styles from '../../styles/Layouts.module.css';

/**
 * Default color palette for seat zones
 * @constant
 */
const DEFAULT_COLORS = ['#FFD700', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336'];

/**
 * Create Layout admin page component for designing new seat layouts
 * @component
 * @returns {JSX.Element|null} Create layout page or null if not authorized
 */
function CreateLayout() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuthStore();
  const [layoutName, setLayoutName] = useState('');
  const [description, setDescription] = useState('');
  const [zones, setZones] = useState([
    { name: 'VIP', color: '#FFD700' },
    { name: 'Regular', color: '#4CAF50' },
    { name: 'Balcony', color: '#2196F3' }
  ]);
  const [rows, setRows] = useState([
    { row_letter: 'A', seats_in_row: 12, zone_index: 0, row_order: 0 },
    { row_letter: 'B', seats_in_row: 12, zone_index: 0, row_order: 1 },
    { row_letter: 'C', seats_in_row: 15, zone_index: 1, row_order: 2 },
    { row_letter: 'D', seats_in_row: 15, zone_index: 1, row_order: 3 },
    { row_letter: 'E', seats_in_row: 18, zone_index: 2, row_order: 4 }
  ]);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneColor, setNewZoneColor] = useState('#4CAF50');
  const [newRowLetter, setNewRowLetter] = useState('');
  const [newRowSeats, setNewRowSeats] = useState(10);
  const [newRowZoneIndex, setNewRowZoneIndex] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  if (!user || !isAdmin()) {
    navigate('/');
    return null;
  }

  const addZone = () => {
    if (!newZoneName.trim()) return;
    if (zones.find(z => z.name.toLowerCase() === newZoneName.trim().toLowerCase())) {
      setError('Zone name already exists');
      return;
    }
    setZones(prev => [...prev, { name: newZoneName.trim(), color: newZoneColor }]);
    setNewZoneName('');
    setError('');
  };

  const removeZone = (index) => {
    if (rows.some(r => r.zone_index === index)) {
      setError('Cannot remove zone: rows are assigned to it. Reassign rows first.');
      return;
    }
    setZones(prev => prev.filter((_, i) => i !== index));
    setRows(prev => prev.map(r => ({
      ...r,
      zone_index: r.zone_index > index ? r.zone_index - 1 : r.zone_index
    })));
    setError('');
  };

  const updateZoneColor = (index, color) => {
    setZones(prev => prev.map((z, i) => i === index ? { ...z, color } : z));
  };

  const addRow = () => {
    if (!newRowLetter.trim()) return;
    const letter = newRowLetter.trim().toUpperCase();
    if (rows.find(r => r.row_letter === letter)) {
      setError(`Row ${letter} already exists`);
      return;
    }
    setRows(prev => [...prev, {
      row_letter: letter,
      seats_in_row: newRowSeats,
      zone_index: newRowZoneIndex,
      row_order: prev.length
    }]);
    setNewRowLetter('');
    setError('');
  };

  const removeRow = (index) => {
    setRows(prev => prev.filter((_, i) => i !== index).map((r, i) => ({ ...r, row_order: i })));
  };

  const updateRowSeats = (index, seats) => {
    const num = parseInt(seats);
    if (num > 0 && num <= 100) {
      setRows(prev => prev.map((r, i) => i === index ? { ...r, seats_in_row: num } : r));
    }
  };

  const updateRowZone = (index, zoneIndex) => {
    setRows(prev => prev.map((r, i) => i === index ? { ...r, zone_index: parseInt(zoneIndex) } : r));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!layoutName.trim()) { setError('Layout name is required'); return; }
    if (zones.length === 0) { setError('At least one zone is required'); return; }
    if (rows.length === 0) { setError('At least one row is required'); return; }

    setIsSubmitting(true);

    try {
      const payload = {
        name: layoutName.trim(),
        description: description.trim() || null,
        zones: zones.map(z => ({ name: z.name, color: z.color })),
        rows: rows.map(r => ({
          row_letter: r.row_letter,
          seats_in_row: r.seats_in_row,
          zone_name: zones[r.zone_index].name,
          row_order: r.row_order
        }))
      };

      await layoutsAPI.create(payload);
      setSuccessMessage('Layout created successfully!');

      setTimeout(() => navigate('/admin/layouts'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewLayout = {
    zones,
    rows: rows.map(r => ({
      ...r,
      zone_name: zones[r.zone_index]?.name,
      zone_color: zones[r.zone_index]?.color
    }))
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>Create Venue Layout</h1>
          <p className={styles.pageSubtitle}>Define zones, rows, and seat counts</p>
        </div>
        <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => navigate('/admin/layouts')}>
          ← Back
        </button>
      </div>

      <div className={styles.formContainer}>
        {successMessage && <div className={styles.success}>{successMessage}</div>}
        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Name & Description */}
          <div className={styles.formGroup}>
            <label>Layout Name *</label>
            <input
              type="text"
              value={layoutName}
              onChange={e => setLayoutName(e.target.value)}
              placeholder="e.g. Theater Main Hall"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optional description of this layout..."
              style={{ height: '70px', resize: 'vertical' }}
            />
          </div>

          {/* Zones */}
          <div className={styles.formGroup}>
            <label>Zones (price tiers)</label>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Zone</th>
                  <th>Color</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {zones.map((zone, i) => (
                  <tr key={i}>
                    <td>{zone.name}</td>
                    <td>
                      <span className={styles.colorSwatch} style={{ backgroundColor: zone.color }} />
                      <input
                        type="color"
                        value={zone.color}
                        onChange={e => updateZoneColor(i, e.target.value)}
                        style={{ width: 36, height: 26, border: 'none', cursor: 'pointer', verticalAlign: 'middle' }}
                      />
                    </td>
                    <td>
                      <button type="button" className={`${styles.btn} ${styles.btnDanger} ${styles.btnSmall}`} onClick={() => removeZone(i)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Add zone inline */}
            <div className={styles.addRowInline}>
              <div className={styles.formGroup}>
                <label>Zone name</label>
                <input
                  type="text"
                  value={newZoneName}
                  onChange={e => setNewZoneName(e.target.value)}
                  placeholder="e.g. Premium"
                />
              </div>
              <div className={styles.formGroup} style={{ flex: '0 0 auto', width: 60 }}>
                <label>Color</label>
                <input
                  type="color"
                  value={newZoneColor}
                  onChange={e => setNewZoneColor(e.target.value)}
                  style={{ width: '100%', height: 44, border: '1px solid black', cursor: 'pointer' }}
                />
              </div>
              <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={addZone}>
                Add Zone
              </button>
            </div>
          </div>

          {/* Rows */}
          <div className={styles.formGroup}>
            <label>Rows</label>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Row</th>
                  <th>Seats</th>
                  <th>Zone</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.row_letter}>
                    <td><strong>{row.row_letter}</strong></td>
                    <td>
                      <input
                        type="number"
                        value={row.seats_in_row}
                        onChange={e => updateRowSeats(i, e.target.value)}
                        min="1"
                        max="100"
                        style={{ width: 60, padding: '6px 8px', border: '1px solid black', fontStyle: 'italic' }}
                      />
                    </td>
                    <td>
                      <select
                        value={row.zone_index}
                        onChange={e => updateRowZone(i, e.target.value)}
                        style={{ padding: '6px 8px', border: '1px solid black', fontStyle: 'italic' }}
                      >
                        {zones.map((z, zi) => (
                          <option key={zi} value={zi}>{z.name}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button type="button" className={`${styles.btn} ${styles.btnDanger} ${styles.btnSmall}`} onClick={() => removeRow(i)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Add row inline */}
            <div className={styles.addRowInline}>
              <div className={styles.formGroup}>
                <label>Row letter</label>
                <input
                  type="text"
                  value={newRowLetter}
                  onChange={e => setNewRowLetter(e.target.value)}
                  placeholder="F"
                  maxLength={2}
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Seats</label>
                <input
                  type="number"
                  value={newRowSeats}
                  onChange={e => setNewRowSeats(parseInt(e.target.value) || 1)}
                  min="1"
                  max="100"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Zone</label>
                <select value={newRowZoneIndex} onChange={e => setNewRowZoneIndex(parseInt(e.target.value))}>
                  {zones.map((z, i) => <option key={i} value={i}>{z.name}</option>)}
                </select>
              </div>
              <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={addRow}>
                Add Row
              </button>
            </div>
          </div>

          {/* Preview */}
          <SeatMapPreview layout={previewLayout} />

          {/* Submit */}
          <div className={styles.buttonGroup}>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Layout'}
            </button>
            <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => navigate('/admin/layouts')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateLayout;
