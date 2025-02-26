import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';
import paymentRoutes from '../routes/payment.js';
import cloverService from '../services/cloverService.js';
import { initializeDatabase } from '../config/database.js';

// Mock the database
jest.mock('../config/database.js', () => ({
  initializeDatabase: jest.fn().mockResolvedValue(),
  query: jest.fn().mockResolvedValue({ rows: [] }),
}));

// Mock the Clover service
jest.mock('../services/cloverService.js', () => ({
  createPaymentLink: jest.fn(),
  getPaymentStatus: jest.fn(),
  handleWebhook: jest.fn(),
}));

// Mock the email service
jest.mock('../services/emailService.js', () => ({
  sendPaymentLink: jest.fn().mockResolvedValue(),
}));

const app = express();
app.use(express.json());
app.use('/api/payment', paymentRoutes);

describe('Payment API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/payment/generate', () => {
    const validPayload = {
      orderId: 'ORD-123456',
      customer: {
        name: 'John Doe',
        email: 'john@example.com',
      },
      amount: 99.99,
    };

    it('should generate a payment link successfully', async () => {
      const mockCloverResponse = {
        paymentLink: 'https://sandbox.dev.clover.com/pay/1234',
        orderId: 'CLV-123',
      };

      cloverService.createPaymentLink.mockResolvedValue(mockCloverResponse);

      const response = await request(app)
        .post('/api/payment/generate')
        .send(validPayload)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('paymentLink');
      expect(response.body).toHaveProperty('status', 'PENDING');
    });

    it('should validate required fields', async () => {
      const invalidPayload = {
        // Missing required fields
        amount: 99.99,
      };

      const response = await request(app)
        .post('/api/payment/generate')
        .send(invalidPayload)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation error');
      expect(response.body).toHaveProperty('details');
    });
  });

  describe('GET /api/payment/status/:orderId', () => {
    it('should return payment status successfully', async () => {
      const mockPayment = {
        rows: [{
          order_id: 'ORD-123456',
          clover_order_id: 'CLV-123',
          status: 'PENDING',
        }],
      };

      const mockCloverStatus = {
        status: 'PAID',
        transactionId: 'TXN-123',
        amount: 99.99,
        currency: 'USD',
      };

      jest.spyOn(global, 'query').mockResolvedValue(mockPayment);
      cloverService.getPaymentStatus.mockResolvedValue(mockCloverStatus);

      const response = await request(app)
        .get('/api/payment/status/ORD-123456')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('paymentStatus', 'PAID');
      expect(response.body).toHaveProperty('transactionId');
    });

    it('should handle non-existent orders', async () => {
      jest.spyOn(global, 'query').mockResolvedValue({ rows: [] });

      const response = await request(app)
        .get('/api/payment/status/NON-EXISTENT')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Payment not found');
    });
  });

  describe('POST /api/payment/webhook', () => {
    const mockWebhookPayload = {
      type: 'PAYMENT_SUCCESS',
      orderId: 'CLV-123',
      paymentId: 'TXN-123',
    };

    const mockSignature = 'valid-signature';

    it('should process webhook successfully', async () => {
      cloverService.handleWebhook.mockResolvedValue({
        status: 'PAID',
        orderId: 'CLV-123',
        transactionId: 'TXN-123',
      });

      const response = await request(app)
        .post('/api/payment/webhook')
        .set('Clover-Signature', mockSignature)
        .send(mockWebhookPayload)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });
});
