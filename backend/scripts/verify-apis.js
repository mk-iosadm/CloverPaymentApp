import axios from 'axios';
import dotenv from 'dotenv';
import logger from '../src/utils/logger.js';

dotenv.config();

const API_BASE = process.env.BACKEND_URL || 'http://localhost:3001/api';

async function verifyEndpoints() {
  const testOrder = {
    orderId: `TEST-${Date.now()}`,
    customer: {
      name: 'Test User',
      email: 'test@example.com'
    },
    amount: 10.99
  };

  try {
    logger.info('Starting API verification');

    // 1. Test health endpoint
    logger.info('Testing health endpoint');
    const healthResponse = await axios.get(`${API_BASE.replace('/api', '')}/health`);
    if (healthResponse.data.status !== 'ok') {
      throw new Error('Health check failed');
    }
    logger.info('Health endpoint OK');

    // 2. Test generate payment link
    logger.info('Testing payment link generation');
    const generateResponse = await axios.post(
      `${API_BASE}/payment/generate`,
      testOrder
    );
    
    if (!generateResponse.data.paymentLink) {
      throw new Error('Payment link generation failed');
    }
    logger.info('Payment link generation OK', {
      orderId: testOrder.orderId
    });

    // 3. Test payment status
    logger.info('Testing payment status check');
    const statusResponse = await axios.get(
      `${API_BASE}/payment/status/${testOrder.orderId}`
    );
    
    if (!statusResponse.data.orderId) {
      throw new Error('Payment status check failed');
    }
    logger.info('Payment status check OK');

    // 4. Test webhook (with mock data)
    logger.info('Testing webhook endpoint');
    const webhookResponse = await axios.post(
      `${API_BASE}/payment/webhook`,
      {
        type: 'PAYMENT_SUCCESS',
        orderId: testOrder.orderId,
        paymentId: 'TEST-TXN-123'
      },
      {
        headers: {
          'Clover-Signature': 'test-signature'
        }
      }
    );
    
    if (!webhookResponse.data.success) {
      throw new Error('Webhook test failed');
    }
    logger.info('Webhook endpoint OK');

    logger.info('All API endpoints verified successfully');
    return true;
  } catch (error) {
    logger.error('API verification failed', {
      error: error.message,
      details: error.response?.data
    });
    return false;
  }
}

// Run verification if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  verifyEndpoints().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export default verifyEndpoints;
