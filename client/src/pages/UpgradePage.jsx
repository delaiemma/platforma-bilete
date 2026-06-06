import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import styles from '../styles/UpgradePage.module.css';

function UpgradePage() {
  const { token } = useParams();
  const [offer, setOffer] = useState(null);
  const [state, setState] = useState('loading');
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    client.get(`/upgrade/${token}`)
      .then(data => {
        setOffer(data.offer);
        if (data.alreadyAccepted) setState('accepted');
        else if (data.expired) setState('expired');
        else setState('ready');
      })
      .catch(() => setState('error'));
  }, [token]);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await client.post(`/upgrade/${token}/accept`);
      setState('done');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Eroare la acceptarea upgrade-ului.';
      alert(msg);
    } finally {
      setAccepting(false);
    }
  };

  const formatExpiry = (dt) => {
    if (!dt) return '';
    return new Date(dt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={styles.page}>
      <div className={styles.brand}>Ticket</div>
      <div className={styles.brandLine} />

      <div className={styles.card}>
        {state === 'loading' && (
          <p className={styles.message}>Se încarcă oferta...</p>
        )}

        {state === 'error' && (
          <>
            <h1 className={styles.title}>Ofertă negăsită</h1>
            <p className={styles.sub}>Linkul este invalid sau a expirat.</p>
            <Link to="/" className={styles.homeLink}>Înapoi la pagina principală</Link>
          </>
        )}

        {state === 'expired' && (
          <>
            <h1 className={styles.title}>Oferta a expirat</h1>
            <p className={styles.sub}>Din păcate, cei 30 de minute s-au scurs. Vei păstra locul original.</p>
            <Link to="/" className={styles.homeLink}>Înapoi la pagina principală</Link>
          </>
        )}

        {state === 'accepted' && (
          <>
            <h1 className={styles.title}>Upgrade deja acceptat</h1>
            <p className={styles.sub}>Ai acceptat deja acest upgrade. Locul tău a fost actualizat.</p>
            <Link to="/my-tickets" className={styles.homeLink}>Vezi biletele mele</Link>
          </>
        )}

        {state === 'done' && (
          <>
            <h1 className={styles.title}>Upgrade confirmat!</h1>
            <p className={styles.sub}>
              Felicitări! Locul tău a fost mutat la <strong>{offer?.to_zone_name}</strong>,
              rândul {offer?.new_row}, locul {offer?.new_seat}.
            </p>
            <Link to="/my-tickets" className={styles.homeLink}>Vezi biletele mele</Link>
          </>
        )}

        {state === 'ready' && offer && (
          <>
            <h1 className={styles.title}>Upgrade gratuit disponibil!</h1>
            <p className={styles.sub}>
              Ai fost selectat pentru un upgrade gratuit la evenimentul tău.
            </p>

            <div className={styles.details}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Eveniment</span>
                <span className={styles.detailValue}>{offer.event_title}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Upgrade</span>
                <span className={styles.detailValue}>
                  {offer.from_zone_name} → <strong>{offer.to_zone_name}</strong>
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Noul loc</span>
                <span className={styles.detailValue}>Rândul {offer.new_row}, Locul {offer.new_seat}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Oferta expiră</span>
                <span className={`${styles.detailValue} ${styles.expiry}`}>ora {formatExpiry(offer.expires_at)}</span>
              </div>
            </div>

            <button
              className={styles.acceptBtn}
              onClick={handleAccept}
              disabled={accepting}
            >
              {accepting ? 'Se procesează...' : 'Acceptă upgrade-ul gratuit →'}
            </button>

            <p className={styles.note}>
              Upgrade-ul este complet gratuit. Dacă nu acționezi, vei păstra locul original.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default UpgradePage;
