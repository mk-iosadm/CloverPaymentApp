import { query } from '../config/database.js';
import cloverService from '../services/cloverService.js';
import { sendPaymentLink } from '../services/emailService.js';
import logger from '../utils/logger.js';

export const generatePaymentLink = async (req, res) => {
  try {
    const { orderId, customer, amount, currency = 'USD' } = req.body;

    // Validate request
    if (!orderId || !customer || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create payment link using Clover service
    const cloverResponse = await cloverService.createPaymentLink(orderId, amount, customer);

    // Save payment details to database
    await query(
      'INSERT INTO payments (order_id, amount, currency, status, payment_link, customer_name, customer_email, clover_order_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [
        orderId,
        amount,
        currency,
        'PENDING',
        cloverResponse.paymentLink,
        customer.name,
        customer.email,
        cloverResponse.orderId
      ]
    );

    // Send payment link via email (non-blocking)
    sendPaymentLink(customer.email, cloverResponse.paymentLink)
      .catch(error => logger.error('Failed to send payment link email:', error));

    res.json({
      paymentLink: cloverResponse.paymentLink,
      status: 'PENDING'
    });
  } catch (error) {
    logger.error('Error generating payment link:', error);
    res.status(500).json({ 
      error: 'Failed to generate payment link',
      details: error.response?.data?.message || error.message 
    });
  }
};

export const checkPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Get payment details from database
    const payment = await query(
      'SELECT * FROM payments WHERE order_id = $1',
      [orderId]
    );

    if (!payment.rows[0]) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Check payment status in Clover
    const status = await cloverService.getPaymentStatus(payment.rows[0].clover_order_id);

    // Update payment status in database if it has changed
    if (status.status !== payment.rows[0].status) {
      await query(
        'UPDATE payments SET status = $1, transaction_id = $2, updated_at = CURRENT_TIMESTAMP WHERE order_id = $3',
        [status.status, status.transactionId, orderId]
      );
    }

    res.json(status);
  } catch (error) {
    logger.error('Error checking payment status:', error);
    res.status(500).json({ error: 'Failed to check payment status' });
  }
};

export const handleCloverWebhook = async (req, res) => {
  try {
    const webhookData = await cloverService.handleWebhook(req.body);

    // Update payment status in database
    await query(
      'UPDATE payments SET status = $1, transaction_id = $2, updated_at = CURRENT_TIMESTAMP WHERE clover_order_id = $3',
      [webhookData.status, webhookData.transactionId, webhookData.orderId]
    );

    res.json({ success: true });
  } catch (error) {
    logger.error('Error handling webhook:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
};
