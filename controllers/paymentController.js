/**
 * @file Payment Controller
 * @description Handles payment processing using Stripe including creating payment intents,
 * confirming payments, and managing payment status.
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Event = require('../models/Event');
const DiscountCode = require('../models/DiscountCode');

/**
 * Creates a Stripe payment intent for purchasing event tickets.
 *
 * @param {express.Request} req - Express request object containing userId, events array, and optional discountCode in body
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {400} If required fields are missing, event not found, or discount code is invalid
 * @throws {404} If event is not found
 * @throws {500} If payment intent creation fails
 *
 * Side effects:
 * - Calculates total amount based on events and quantities/seats
 * - Validates and applies discount code if provided
 * - Creates Stripe payment intent
 * - Stores payment record in database with pending status
 * - Minimum payment amount is 0.50 RON
 */
exports.createPaymentIntent = async (req, res) => {
  try {
    const { userId, events, discountCode } = req.body;

    if (!userId || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User ID and events array are required'
      });
    }

    console.log(`💳 Creating payment intent for user ${userId}`);

    let totalAmount = 0;
    const eventDetails = [];

    for (const item of events) {
      const { eventId, quantity, seats } = item;

      const event = await Event.getById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: `Event ${eventId} not found`
        });
      }

      let itemPrice = 0;
      if (seats && seats.length > 0) {

        itemPrice = seats.reduce((sum, seat) => sum + parseFloat(seat.price || 0), 0);
      } else {

        itemPrice = parseFloat(event.price) * parseInt(quantity);
      }

      totalAmount += itemPrice;
      eventDetails.push({
        eventId,
        title: event.title,
        quantity: seats ? seats.length : quantity,
        price: itemPrice
      });

      console.log(`  📊 ${event.title}: ${itemPrice} RON`);
    }

    console.log(`💰 Total amount: ${totalAmount} RON`);

    let discountAmount = 0;
    let finalAmount = totalAmount;
    let discountInfo = null;

    if (discountCode) {
      console.log(`🎫 Validating discount code: ${discountCode}`);
      const validation = await DiscountCode.validateCode(discountCode, userId);

      if (validation.valid) {
        const calculation = DiscountCode.calculateDiscount(totalAmount, validation);
        discountAmount = calculation.discountAmount;
        finalAmount = calculation.finalAmount;
        discountInfo = validation;
        console.log(`💸 Discount applied: -${discountAmount} RON (${validation.code})`);
        console.log(`💰 Final amount: ${finalAmount} RON`);
      } else {
        console.log(`❌ Invalid discount code: ${validation.error}`);
        return res.status(400).json({
          success: false,
          message: validation.error
        });
      }
    }

    if (finalAmount > 0 && finalAmount < 0.5) {
      return res.status(400).json({
        success: false,
        message: 'Total amount must be at least 0.50 RON'
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(finalAmount * 100),
      currency: 'ron',
      metadata: {
        userId: userId.toString(),
        eventIds: events.map(e => e.eventId).join(','),
        eventCount: events.length.toString(),
        discountCode: discountCode || '',
        discountAmount: discountAmount.toString()
      },
      description: `Ticket purchase for ${events.length} event(s)`,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    await Payment.create({
      purchaseId: null,
      userId: userId,
      stripePaymentIntentId: paymentIntent.id,
      stripeClientSecret: paymentIntent.client_secret,
      amount: finalAmount,
      currency: 'ron',
      status: 'pending'
    });

    console.log(`✅ Payment Intent created: ${paymentIntent.id}`);

    const response = {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: finalAmount,
      eventDetails: eventDetails
    };

    if (discountInfo) {
      response.discount = {
        code: discountInfo.code,
        type: discountInfo.discountType,
        value: discountInfo.discountValue,
        discountAmount: discountAmount,
        originalAmount: totalAmount
      };
    }

    res.json(response);

  } catch (error) {
    console.error('❌ Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment intent'
    });
  }
};

/**
 * Confirms a payment by verifying the Stripe payment intent status.
 *
 * @param {express.Request} req - Express request object containing paymentIntentId in body
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {400} If paymentIntentId is missing or payment status is not succeeded
 * @throws {500} If verification fails
 *
 * Side effects:
 * - Retrieves payment intent from Stripe
 * - Updates payment status in database
 * - Stores error message if payment failed
 */
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment Intent ID is required'
      });
    }

    console.log(`🔍 Verifying payment: ${paymentIntentId}`);

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {

      await Payment.updateStatus(
        paymentIntentId,
        paymentIntent.status,
        paymentIntent.last_payment_error?.message
      );

      return res.status(400).json({
        success: false,
        message: 'Payment not confirmed',
        status: paymentIntent.status
      });
    }

    await Payment.updateStatus(paymentIntentId, 'succeeded');

    console.log(`✅ Payment confirmed: ${paymentIntentId}`);

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      paymentIntentId: paymentIntentId
    });

  } catch (error) {
    console.error('❌ Error confirming payment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to confirm payment'
    });
  }
};

/**
 * Retrieves the status of a specific payment.
 *
 * @param {express.Request} req - Express request object containing paymentIntentId in params
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {404} If payment is not found
 * @throws {500} If database query fails
 *
 * Side effects:
 * - Queries payment details from database
 */
exports.getPaymentStatus = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    const payment = await Payment.getByStripeIntentId(paymentIntentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      payment: {
        paymentId: payment.payment_id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        createdAt: payment.created_at,
        completedAt: payment.completed_at
      }
    });

  } catch (error) {
    console.error('❌ Error getting payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Retrieves all payments for a specific user.
 *
 * @param {express.Request} req - Express request object containing userId in params
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @throws {500} If database query fails
 *
 * Side effects:
 * - Queries all payment records for the user from database
 */
exports.getUserPayments = async (req, res) => {
  try {
    const { userId } = req.params;

    const payments = await Payment.getByUserId(userId);

    res.json({
      success: true,
      payments: payments
    });

  } catch (error) {
    console.error('❌ Error getting user payments:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
