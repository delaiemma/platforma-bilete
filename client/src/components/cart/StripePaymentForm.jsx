/**
 * @file StripePaymentForm.jsx
 * Stripe payment form component for processing credit card payments
 */

import { useState } from 'react';
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import styles from '../../styles/PurchaseModal.module.css';

/**
 * Stripe element styling configuration
 * @constant
 */
const ELEMENT_STYLE = {
  style: {
    base: {
      fontSize: '15px',
      color: '#333',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      '::placeholder': { color: '#aab7c4' },
    },
    invalid: { color: '#c0392b' },
  },
};

/**
 * Stripe payment form component for secure credit card payment processing
 * @component
 * @param {Object} props - Component props
 * @param {number} props.amount - Payment amount in dollars
 * @param {string} props.clientSecret - Stripe payment intent client secret
 * @param {Function} props.onSuccess - Callback function when payment succeeds
 * @param {Function} props.onCancel - Callback function when payment is cancelled
 * @returns {JSX.Element} Stripe payment form component
 */
function StripePaymentForm({ amount, clientSecret, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage('');

    const cardNumber = elements.getElement(CardNumberElement);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardNumber },
    });

    if (error) {
      setErrorMessage(error.message || 'Plata a esuat. Incearca din nou.');
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess(paymentIntent.id);
    } else {
      setErrorMessage('Plata nu a fost finalizata. Incearca din nou.');
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.paymentContent}>
      <h2>Complete Payment</h2>
      <p className={styles.paymentAmount}>Total: ${amount.toFixed(2)}</p>

      <form onSubmit={handleSubmit}>
        <div className={styles.cardField}>
          <label className={styles.cardLabel}>Numar card</label>
          <div className={styles.paymentElementWrapper}>
            <CardNumberElement options={ELEMENT_STYLE} />
          </div>
        </div>

        <div className={styles.cardField}>
          <label className={styles.cardLabel}>Data expirarii</label>
          <div className={styles.paymentElementWrapper}>
            <CardExpiryElement options={ELEMENT_STYLE} />
          </div>
        </div>

        <div className={styles.cardField}>
          <label className={styles.cardLabel}>CVC</label>
          <div className={styles.paymentElementWrapper}>
            <CardCvcElement options={ELEMENT_STYLE} />
          </div>
        </div>

        {errorMessage && (
          <p className={styles.paymentError}>{errorMessage}</p>
        )}

        <div className={styles.actionButtons}>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onCancel}
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.payBtn}
            disabled={!stripe || isProcessing}
          >
            {isProcessing ? 'Se proceseaza...' : `Plateste $${amount.toFixed(2)}`}
          </button>
        </div>
      </form>
    </div>
  );
}

export default StripePaymentForm;
