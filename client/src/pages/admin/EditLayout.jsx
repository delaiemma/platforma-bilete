/**
 * @file EditLayout.jsx
 * Admin page for editing existing seat layouts
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { layoutsAPI } from '../../api/layouts';
import { useAuthStore } from '../../store/authStore';
import SeatMapPreview from '../../components/admin/SeatMapPreview';
import styles from '../../styles/Layouts.module.css';

/**
 * Edit Layout admin page component for modifying existing seat layouts
 * @component
 * @returns {JSX.Element|null} Edit layout page or null if not authorized
 */
function EditLayout() {
  const { layoutId } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuthStore();
  const queryClient = useQueryClient();

  const [layoutName, setLayoutName] = useState('');
  const [description, setDescription] = useState('');
  const [zones, setZones] = useState([]);
  const [rows, setRows] = useState([]);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneColor, setNewZoneColor] = useState('#4CAF50');
  const [newRowLetter, setNewRowLetter] = useState('');
  const [newRowSeats, setNewRowSeats] = useState(10);
  const [newRowZoneId, setNewRowZoneId] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!user || !isAdmin()) {
    navigate('/');
    return null;
  }

  const { data: layoutData, isLoading } = useQuery({
    queryKey: ['layout', layoutId],
    queryFn: () => layoutsAPI.getById(layoutId)
  });

  useEffect(() => {
    if (layoutData?.layout) {
      const layout = layoutData.layout;
      setLayoutName(layout.name || '');
      setDescription(layout.description || '');
      setZones(layout.zones || []);
      setRows(layout.rows || []);
      if (layout.zones?.length > 0) {
        setNewRowZoneId(layout.zones[0].zone_id);
      }
    }
  }, [layoutData]);

  const updateMutation = useMutation({
    mutationFn: (data) => layoutsAPI.update(layoutId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['layout', layoutId]);
      queryClient.invalidateQueries(['layouts']);
    }
  });

  const handleMetadataUpdate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await updateMutation.mutateAsync({ name: layoutName, description });
      setSuccessMessage('Layout updated successfully');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddZone = async () => {
    if (!newZoneName.trim()) return;
    setError('');
    try {
      await layoutsAPI.addZone(layoutId, { name: newZoneName.trim(), color: newZoneColor });
      queryClient.invalidateQueries(['layout', layoutId]);
      setNewZoneName('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteZone = async (zoneId) => {
    if (!window.confirm('Delete this zone? Rows assigned to it must be reassigned first.')) return;
    setError('');
    try {
      await layoutsAPI.deleteZone(zoneId);
      queryClient.invalidateQueries(['layout', layoutId]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleZoneColorChange = async (zoneId, color) => {
    try {
      await layoutsAPI.updateZone(zoneId, { color });
      queryClient.invalidateQueries(['layout', layoutId]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddRow = async () => {
    if (!newRowLetter.trim() || !newRowZoneId) return;
    setError('');
    try {
      await layoutsAPI.addRow(layoutId, {
        row_letter: newRowLetter.trim().toUpperCase(),
        seats_in_row: newRowSeats,
        zone_id: newRowZoneId,
        row_order: rows.length
      });
      queryClient.invalidateQueries(['layout', layoutId]);
      setNewRowLetter('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteRow = async (rowId) => {
    if (!window.confirm('Delete this row?')) return;
    setError('');
    try {
      await layoutsAPI.deleteRow(rowId);
      queryClient.invalidateQueries(['layout', layoutId]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRowSeatsChange = async (rowId, seats) => {
    const num = parseInt(seats);
    if (num > 0 && num <= 100) {
      try {
        await layoutsAPI.updateRow(rowId, { seats_in_row: num });
        queryClient.invalidateQueries(['layout', layoutId]);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleRowZoneChange = async (rowId, zoneId, rowOrder) => {
    try {
      await layoutsAPI.updateRow(rowId, { zone_id: zoneId, row_order: rowOrder });
      queryClient.invalidateQueries(['layout', layoutId]);
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <p style={{ fontStyle: 'italic', color: '#888' }}>Loading layout...</p>
      </div>
    );
  }

  const previewLayout = {
    zones,
    rows: rows.map(r => ({
      row_letter: r.row_letter,
      seats_in_row: r.seats_in_row,
      zone_name: zones.find(z => z.zone_id === r.zone_id)?.name,
      zone_color: zones.find(z => z.zone_id === r.zone_id)?.color
    }))
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>Edit Layout</h1>
          <p className={styles.pageSubtitle}>{layoutName}</p>
        </div>
        <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => navigate('/admin/layouts')}>
          ← Back
        </button>
      </div>

      <div className={styles.formContainer}>
        {successMessage && <div className={styles.success}>{successMessage}</div>}
        {error && <div className={styles.error}>{error}</div>}

        {/* Name & Description */}
        <form onSubmit={handleMetadataUpdate}>
          <div className={styles.formGroup}>
            <label>Layout Name *</label>
            <input type="text" value={layoutName} onChange={e => setLayoutName(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} style={{ height: '60px', resize: 'vertical' }} />
          </div>
          <button type="submit" className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`}>
            Save Name & Description
          </button>
        </form>

        <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eee' }} />

        {/* Zones */}
        <div className={styles.formGroup}>
          <label>Zones</label>
          <table className={styles.table}>
            <thead>
              <tr><th>Zone</th><th>Color</th><th></th></tr>
            </thead>
            <tbody>
              {zones.map(zone => (
                <tr key={zone.zone_id}>
                  <td>{zone.name}</td>
                  <td>
                    <span className={styles.colorSwatch} style={{ backgroundColor: zone.color }} />
                    <input
                      type="color"
                      value={zone.color}
                      onChange={e => handleZoneColorChange(zone.zone_id, e.target.value)}
                      style={{ width: 36, height: 26, border: 'none', cursor: 'pointer', verticalAlign: 'middle' }}
                    />
                  </td>
                  <td>
                    <button type="button" className={`${styles.btn} ${styles.btnDanger} ${styles.btnSmall}`} onClick={() => handleDeleteZone(zone.zone_id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.addRowInline}>
            <div className={styles.formGroup}>
              <label>Zone name</label>
              <input type="text" value={newZoneName} onChange={e => setNewZoneName(e.target.value)} placeholder="e.g. Premium" />
            </div>
            <div className={styles.formGroup} style={{ flex: '0 0 auto', width: 60 }}>
              <label>Color</label>
              <input type="color" value={newZoneColor} onChange={e => setNewZoneColor(e.target.value)} style={{ width: '100%', height: 44, border: '1px solid black', cursor: 'pointer' }} />
            </div>
            <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleAddZone}>
              Add Zone
            </button>
          </div>
        </div>

        <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #eee' }} />

        {/* Rows */}
        <div className={styles.formGroup}>
          <label>Rows</label>
          <table className={styles.table}>
            <thead>
              <tr><th>Row</th><th>Seats</th><th>Zone</th><th></th></tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.row_id}>
                  <td><strong>{row.row_letter}</strong></td>
                  <td>
                    <input
                      type="number"
                      value={row.seats_in_row}
                      onChange={e => handleRowSeatsChange(row.row_id, e.target.value)}
                      min="1" max="100"
                      style={{ width: 60, padding: '6px 8px', border: '1px solid black', fontStyle: 'italic' }}
                    />
                  </td>
                  <td>
                    <select
                      value={row.zone_id}
                      onChange={e => handleRowZoneChange(row.row_id, parseInt(e.target.value), row.row_order)}
                      style={{ padding: '6px 8px', border: '1px solid black', fontStyle: 'italic' }}
                    >
                      {zones.map(z => <option key={z.zone_id} value={z.zone_id}>{z.name}</option>)}
                    </select>
                  </td>
                  <td>
                    <button type="button" className={`${styles.btn} ${styles.btnDanger} ${styles.btnSmall}`} onClick={() => handleDeleteRow(row.row_id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.addRowInline}>
            <div className={styles.formGroup}>
              <label>Row letter</label>
              <input type="text" value={newRowLetter} onChange={e => setNewRowLetter(e.target.value)} placeholder="F" maxLength={2} style={{ textTransform: 'uppercase' }} />
            </div>
            <div className={styles.formGroup}>
              <label>Seats</label>
              <input type="number" value={newRowSeats} onChange={e => setNewRowSeats(parseInt(e.target.value) || 1)} min="1" max="100" />
            </div>
            <div className={styles.formGroup}>
              <label>Zone</label>
              <select value={newRowZoneId} onChange={e => setNewRowZoneId(parseInt(e.target.value))}>
                {zones.map(z => <option key={z.zone_id} value={z.zone_id}>{z.name}</option>)}
              </select>
            </div>
            <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleAddRow}>
              Add Row
            </button>
          </div>
        </div>

        {/* Preview */}
        <SeatMapPreview layout={previewLayout} />
      </div>
    </div>
  );
}

export default EditLayout;
