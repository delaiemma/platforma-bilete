/**
 * @file MyTickets.jsx
 * User purchased tickets page component
 */

import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import client from '../api/client';
import styles from '../styles/MyTickets.module.css';

/**
 * My Tickets page component displaying user's purchased tickets with download and cancel options
 * @component
 * @returns {JSX.Element} My tickets page component
 */
function MyTickets() {
  const { user } = useAuthStore();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchTickets = async () => {
    if (!user) { setLoading(false); return; }
    try {
      setLoading(true);
      setError(null);
      const response = await client.get(`/purchase/user/${user.id}`);
      if (response.success) {
        setTickets(response.tickets);
      } else {
        setError('Failed to load tickets');
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('Failed to load tickets. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    if (timeString.includes(':') && !timeString.includes('T')) return timeString.substring(0, 5);
    return new Date(timeString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const handleDownloadTicket = async (purchase) => {
    if (downloadingId === purchase.purchase_id) return;
    setDownloadingId(purchase.purchase_id);
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');

      const imageUrl = purchase.image_path
        ? `http://localhost:3000/images/${purchase.image_path}`
        : null;

      const ticketsHtml = purchase.tickets.map((ticket, idx) => `
        <div style="display:flex;border:2px solid #e0e0e0;border-radius:8px;margin:0 0 20px 0;overflow:hidden;height:160px;">
          ${imageUrl
            ? `<img src="${imageUrl}" style="width:160px;height:160px;object-fit:cover;" crossorigin="anonymous" />`
            : `<div style="width:160px;height:160px;background:#1a1a1a;display:flex;align-items:center;justify-content:center;color:white;font-size:32px;">T</div>`
          }
          <div style="flex:1;padding:20px 24px;display:flex;flex-direction:column;justify-content:center;">
            <h2 style="font-size:17px;font-weight:600;color:#1a1a1a;margin:0 0 10px 0;">${purchase.event_title}</h2>
            <p style="margin:0 0 5px;font-size:12px;color:#555;">Locatie: ${purchase.location}, ${purchase.city}</p>
            <p style="margin:0 0 5px;font-size:12px;color:#555;">Data: ${formatDate(purchase.date)} &bull; ${formatTime(purchase.time)}</p>
            ${ticket.seat
              ? `<p style="margin:0 0 5px;font-size:12px;color:#555;">Loc: ${ticket.seat}</p>`
              : `<p style="margin:0 0 5px;font-size:12px;color:#555;">Bilet ${idx + 1} din ${purchase.quantity}</p>`
            }
            <p style="margin:6px 0 0;font-size:10px;color:#aaa;font-family:monospace;">${ticket.ticket_id}</p>
          </div>
          <div style="width:1px;border-left:2px dashed #ddd;margin:16px 0;flex-shrink:0;"></div>
          <div style="width:140px;flex-shrink:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;gap:8px;">
            <img src="${ticket.qr_code}" style="width:90px;height:90px;" />
            <p style="font-size:10px;color:#999;text-align:center;margin:0;">Scan at venue</p>
          </div>
        </div>`).join('');

      const container = document.createElement('div');
      container.style.cssText = 'position:fixed;left:-9999px;top:0;width:750px;background:white;';
      container.innerHTML = `
        <div style="padding:30px;background:white;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
          <div style="text-align:center;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid #eee;">
            <h1 style="font-size:20px;font-weight:300;font-style:italic;color:#333;margin:0 0 6px;">${purchase.event_title}</h1>
            <p style="font-size:11px;color:#999;margin:0;">Generat pe ${new Date().toLocaleDateString('en-US')}</p>
          </div>
          ${ticketsHtml}
          <div style="text-align:center;margin-top:16px;padding-top:16px;border-top:1px solid #eee;">
            <p style="font-size:11px;color:#bbb;margin:0;">Prezentati acest bilet la intrarea in sala pentru scanare</p>
          </div>
        </div>`;

      document.body.appendChild(container);

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff'
      });

      document.body.removeChild(container);

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgData = canvas.toDataURL('image/png');

      if (imgHeight <= 297) {
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      } else {
        let heightLeft = imgHeight;
        let position = 0;
        const pageHeight = 297;
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
      }

      pdf.save(`bilet-${purchase.event_title.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('PDF download failed:', err);
      alert('Download failed. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleCancelTicket = async (purchase) => {
    if (cancellingId === purchase.purchase_id) return;
    const confirmed = window.confirm(
      `Ești sigur că vrei să anulezi biletul pentru "${purchase.event_title}"?\nAceastă acțiune nu poate fi anulată.`
    );
    if (!confirmed) return;

    setCancellingId(purchase.purchase_id);
    try {
      await client.delete(`/purchase/${purchase.purchase_id}`);
      await fetchTickets();
    } catch (err) {
      alert(err.message || 'Error cancelling ticket. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  if (!user) return (
    <div className={styles.myTicketsContainer}>
      <div className={styles.emptyState}>
        <h2>Please log in to view your tickets</h2>
        <p>You need to be logged in to see your purchased tickets.</p>
      </div>
    </div>
  );

  if (loading) return (
    <div className={styles.myTicketsContainer}>
      <div className={styles.loadingState}>
        <div className={styles.spinner}></div>
        <p>Loading your tickets...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className={styles.myTicketsContainer}>
      <div className={styles.errorState}>
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    </div>
  );

  if (tickets.length === 0) return (
    <div className={styles.myTicketsContainer}>
      <div className={styles.emptyState}>
        <h2>No tickets yet</h2>
        <p>You haven't purchased any tickets yet.</p>
        <a href="/" className={styles.browseBtn}>Browse Events</a>
      </div>
    </div>
  );

  return (
    <div className={styles.myTicketsContainer}>
      <h1 className={styles.title}>My Tickets</h1>
      <p className={styles.subtitle}>You have {tickets.length} purchase(s)</p>

      <div className={styles.ticketsList}>
        {tickets.map((purchase) => {
          const firstTicket = purchase.tickets?.[0];
          const seats = purchase.tickets?.filter(t => t.seat).map(t => t.seat);
          const imageUrl = purchase.image_path
            ? `http://localhost:3000/images/${purchase.image_path}`
            : null;

          return (
            <div key={purchase.purchase_id} className={styles.ticketCard}>

              {/* Event image */}
              <div className={styles.eventImage}>
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={purchase.event_title}
                    onError={(e) => { e.target.parentNode.innerHTML = `<div class="${styles.imagePlaceholder}">T</div>`; }}
                  />
                ) : (
                  <div className={styles.imagePlaceholder}>T</div>
                )}
              </div>

              {/* Info section */}
              <div className={styles.ticketInfo}>
                <h3 className={styles.eventTitle}>{purchase.event_title}</h3>

                <div className={styles.infoRow}>
                  <span>📍</span>
                  <span>{purchase.location}, {purchase.city}</span>
                </div>
                <div className={styles.infoRow}>
                  <span>📅</span>
                  <span>{formatDate(purchase.date)}</span>
                </div>
                <div className={styles.infoRow}>
                  <span>🕐</span>
                  <span>{formatTime(purchase.time)}</span>
                </div>
                <div className={styles.infoRow}>
                  <span>🎟</span>
                  <span>{purchase.quantity} bilet{purchase.quantity > 1 ? 'e' : ''} &mdash; <strong>${parseFloat(purchase.total_price).toFixed(2)}</strong></span>
                </div>

                {seats && seats.length > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    {seats.map(seat => (
                      <span key={seat} className={styles.seatBadge}>{seat}</span>
                    ))}
                  </div>
                )}

                {firstTicket && (
                  <p className={styles.ticketIdText}>{firstTicket.ticket_id}</p>
                )}
              </div>

              {/* Dashed divider */}
              <div className={styles.divider} />

              {/* QR + download */}
              <div className={styles.ticketQr}>
                {purchase.tickets && purchase.tickets.length > 1 ? (
                  <div className={styles.multiQr}>
                    {purchase.tickets.map((t, idx) => (
                      <img key={idx} src={t.qr_code} alt={`QR ${idx + 1}`} />
                    ))}
                  </div>
                ) : firstTicket ? (
                  <img src={firstTicket.qr_code} alt="QR Code" />
                ) : null}

                <p className={styles.qrLabel}>Scan at venue</p>

                <button
                  className={styles.downloadBtn}
                  onClick={() => handleDownloadTicket(purchase)}
                  disabled={downloadingId === purchase.purchase_id}
                >
                  {downloadingId === purchase.purchase_id ? 'Se genereaza...' : 'Download PDF'}
                </button>

                {(() => {
                  try {
                    let eventDateTime;

                    if (purchase.date instanceof Date) {
                      eventDateTime = new Date(purchase.date);

                      if (purchase.time) {
                        const timeParts = purchase.time.split(':');
                        eventDateTime.setHours(
                          parseInt(timeParts[0] || 0),
                          parseInt(timeParts[1] || 0),
                          parseInt(timeParts[2] || 0)
                        );
                      }
                    } else {
                      if (typeof purchase.date === 'string' && purchase.date.includes('T')) {
                        eventDateTime = new Date(purchase.date);
                      } else {
                        const dateStr = purchase.date;
                        const timeStr = purchase.time || '00:00:00';
                        const isoString = `${dateStr}T${timeStr}`;
                        eventDateTime = new Date(isoString);
                      }
                    }

                    const now = new Date();

                    const hoursUntilEvent = (eventDateTime - now) / (1000 * 60 * 60);
                    const canCancel = hoursUntilEvent > 24;

                    return canCancel && (
                      <button
                        className={styles.cancelBtn}
                        onClick={() => handleCancelTicket(purchase)}
                        disabled={cancellingId === purchase.purchase_id}
                        title={`Anulează biletul (eveniment în ${Math.floor(hoursUntilEvent)} ore)`}
                      >
                        {cancellingId === purchase.purchase_id ? 'Cancelling...' : 'Cancel ticket'}
                      </button>
                    );
                  } catch (error) {
                    console.error('Error parsing event date:', error, purchase);
                    return null;
                  }
                })()}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MyTickets;
