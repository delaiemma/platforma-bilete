/**
 * @file PurchaseModal.jsx
 * Purchase modal component for ticket payment and confirmation
 */

import { useEffect, useRef, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripePaymentForm from './StripePaymentForm';
import styles from '../../styles/PurchaseModal.module.css';

/**
 * Stripe promise for payment processing
 * @constant
 */
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

/**
 * Purchase modal component handling payment, loading, and success states
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {string} props.state - Modal state: 'payment', 'loading', or 'success'
 * @param {Array<Object>} props.tickets - Array of purchased ticket objects
 * @param {Function} props.onClose - Callback to close modal
 * @param {string} props.clientSecret - Stripe payment intent client secret
 * @param {number} props.paymentAmount - Payment amount in dollars
 * @param {Function} props.onPaymentSuccess - Callback when payment succeeds
 * @returns {JSX.Element|null} Purchase modal component or null if closed
 */
function PurchaseModal({ isOpen, state, tickets, onClose, clientSecret, paymentAmount, onPaymentSuccess }) {
  const progressRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (state === 'loading' && progressRef.current) {
      setTimeout(() => {
        if (progressRef.current) {
          progressRef.current.style.width = '100%';
        }
      }, 100);
    }
  }, [state]);

  if (!isOpen) {
    return null;
  }

  const generateTicketId = () => {
    return 'TKT-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
  };

  const generateQRCodeURL = (data) => {
    const encodedData = encodeURIComponent(data);
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodedData}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    if (timeString.includes(':') && !timeString.includes('T')) {
      return timeString.substring(0, 5);
    }
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');

      const ticketsHtml = tickets.map((ticket, idx) => {
        const ticketId = ticket.ticket_id || generateTicketId();
        const seatInfo = ticket.seat ? `\nSeat: ${ticket.seat}` : '';
        const qrData = `Event: ${ticket.event_title}\nLocation: ${ticket.location}, ${ticket.city}\nDate: ${formatDate(ticket.date)} • ${formatTime(ticket.time)}${seatInfo}\nTicket ID: ${ticketId}`;
        const qrCodeURL = ticket.qr_code || generateQRCodeURL(qrData);

        return `
          <div style="display:flex;border:2px solid #e0e0e0;border-radius:8px;margin:0 0 20px 0;overflow:hidden;min-height:140px;">
            <div style="flex:1;padding:20px 24px;display:flex;flex-direction:column;justify-content:center;">
              <h2 style="font-size:17px;font-weight:600;color:#1a1a1a;margin:0 0 10px 0;">${ticket.event_title}</h2>
              <p style="margin:0 0 5px;font-size:12px;color:#555;">Locatie: ${ticket.location}, ${ticket.city}</p>
              <p style="margin:0 0 5px;font-size:12px;color:#555;">Data: ${formatDate(ticket.date)} &bull; ${formatTime(ticket.time)}</p>
              ${ticket.seat
                ? `<p style="margin:0 0 5px;font-size:12px;color:#555;">Loc: ${ticket.seat}</p>`
                : `<p style="margin:0 0 5px;font-size:12px;color:#555;">Bilet ${idx + 1}</p>`
              }
              <p style="margin:0 0 5px;font-size:12px;color:#555;">Pret: $${parseFloat(ticket.price).toFixed(2)}</p>
              <p style="margin:6px 0 0;font-size:10px;color:#aaa;font-family:monospace;">${ticketId}</p>
            </div>
            <div style="width:1px;border-left:2px dashed #ddd;margin:16px 0;flex-shrink:0;"></div>
            <div style="width:140px;flex-shrink:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;gap:8px;">
              <img src="${qrCodeURL}" style="width:90px;height:90px;" />
              <p style="font-size:10px;color:#999;text-align:center;margin:0;">Scan at venue</p>
            </div>
          </div>`;
      }).join('');

      const eventTitle = tickets[0]?.event_title || 'Bilete';
      const container = document.createElement('div');
      container.style.cssText = 'position:fixed;left:-9999px;top:0;width:750px;background:white;';
      container.innerHTML = `
        <div style="padding:30px;background:white;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
          <div style="text-align:center;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid #eee;">
            <h1 style="font-size:20px;font-weight:300;font-style:italic;color:#333;margin:0 0 6px;">${eventTitle}</h1>
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

      pdf.save(`bilete-${eventTitle.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('PDF download failed:', error);
      alert('Download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const renderContent = () => {
    if (state === 'payment' && clientSecret) {
      return (
        <Elements stripe={stripePromise}>
          <StripePaymentForm
            amount={paymentAmount}
            clientSecret={clientSecret}
            onSuccess={onPaymentSuccess}
            onCancel={onClose}
          />
        </Elements>
      );
    }

    if (state === 'loading') {
      return (
        <div className={styles.loadingContent}>
          <div className={styles.loadingSpinner}></div>
          <h2>Processing Your Purchase...</h2>
          <p>Please wait while we process your tickets.</p>
          <div className={styles.loadingBar}>
            <div ref={progressRef} className={styles.loadingProgress}></div>
          </div>
        </div>
      );
    }

    if (state === 'success' && tickets) {
      const totalTickets = tickets.length;

      return (
        <div className={styles.successContent}>
          <div className={styles.successHeader}>
            <h2>Purchase Successful!</h2>
            <p>Thank you for your purchase. You have successfully bought {totalTickets} ticket(s).</p>
          </div>

          <div className={styles.ticketsContainer}>
            <h3>Your Digital Tickets</h3>
            {tickets.map((ticket, index) => {
              const ticketId = ticket.ticket_id || generateTicketId();
              const seatInfo = ticket.seat ? `\nSeat: ${ticket.seat}` : '';
              const qrData = `Event: ${ticket.event_title}\nLocation: ${ticket.location}, ${ticket.city}\nDate: ${formatDate(ticket.date)} • ${formatTime(ticket.time)}${seatInfo}\nPrice: $${parseFloat(ticket.price).toFixed(2)}\nTicket ID: ${ticketId}`;
              const qrCodeURL = ticket.qr_code || generateQRCodeURL(qrData);

              return (
                <div key={ticketId || index} className={styles.ticketSection}>
                  <h4>{ticket.event_title}</h4>
                  <div className={styles.ticketDetails}>
                    <div className={styles.ticketInfo}>
                      <p><strong>Location:</strong> {ticket.location}, {ticket.city}</p>
                      <p><strong>Date:</strong> {formatDate(ticket.date)} • {formatTime(ticket.time)}</p>
                      {ticket.seat && (
                        <p><strong>Seat:</strong> {ticket.seat}</p>
                      )}
                      <p><strong>Price:</strong> ${parseFloat(ticket.price).toFixed(2)}</p>
                      <p><strong>Ticket ID:</strong> {ticketId}</p>
                    </div>
                    <div className={styles.qrCode}>
                      <img src={qrCodeURL} alt={`QR Code for ${ticket.event_title}`} />
                      <p>Scan at venue</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.actionButtons}>
            <button className={styles.downloadBtn} onClick={handleDownload} disabled={isDownloading}>
              {isDownloading ? 'Se genereaza...' : 'Download PDF'}
            </button>
            <button className={styles.closeBtn} onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={styles.purchaseModal} onClick={(e) => {
      if (state !== 'loading' && state !== 'success') {
        onClose();
      }
    }}>
      <div className={styles.modalContent} onClick={(e) => {
        e.stopPropagation();
      }}>
        {renderContent()}
      </div>
    </div>
  );
}

export default PurchaseModal;
