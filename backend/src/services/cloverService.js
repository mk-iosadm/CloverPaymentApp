import axios from 'axios';
import logger from '../utils/logger.js';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(dirname(dirname(__dirname)), '.env');
dotenv.config({ path: envPath });

class CloverApiError extends Error {
  constructor(message, statusCode, responseData) {
    super(message);
    this.name = 'CloverApiError';
    this.statusCode = statusCode;
    this.responseData = responseData;
  }
}

class CloverService {
  constructor() {
    this.apiBase = process.env.CLOVER_API_BASE || 'https://sandbox.dev.clover.com';
    this.merchantId = process.env.CLOVER_MERCHANT_ID;
    this.clientId = process.env.CLOVER_API_KEY;
    this.clientSecret = process.env.CLOVER_APP_SECRET;
    this.accessToken = process.env.CLOVER_ACCESS_TOKEN;

    // Log configuration for debugging
    logger.info('Clover Service Configuration:', {
      apiBase: this.apiBase,
      merchantId: this.merchantId,
      hasClientId: !!this.clientId,
      hasClientSecret: !!this.clientSecret,
      hasAccessToken: !!this.accessToken
    });

    // Validate required configuration
    this.validateConfig();
  }

  validateConfig() {
    const requiredEnvVars = [
      'CLOVER_MERCHANT_ID',
      'CLOVER_API_KEY',
      'CLOVER_APP_SECRET',
      'CLOVER_ACCESS_TOKEN'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
  }

  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    };
  }

  async refreshAccessToken(code) {
    try {
      const response = await axios({
        method: 'GET',
        url: `${this.apiBase}/oauth/token`,
        params: {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code: code
        }
      });

      this.accessToken = response.data.access_token;
      return this.accessToken;
    } catch (error) {
      throw new CloverApiError(
        'Failed to refresh access token',
        error.response?.status,
        error.response?.data
      );
    }
  }

  async createOrder(orderData) {
    try {
      const response = await axios({
        method: 'POST',
        url: `${this.apiBase}/v3/merchants/${this.merchantId}/orders`,
        headers: this.getAuthHeaders(),
        data: {
          ...orderData,
          state: orderData.state || 'open'
        }
      });

      logger.info('Order created successfully:', response.data);
      return response.data;
    } catch (error) {
      throw new CloverApiError(
        'Failed to create order',
        error.response?.status,
        error.response?.data
      );
    }
  }

  async getOrder(orderId) {
    try {
      const response = await axios({
        method: 'GET',
        url: `${this.apiBase}/v3/merchants/${this.merchantId}/orders/${orderId}`,
        headers: this.getAuthHeaders()
      });

      return response.data;
    } catch (error) {
      throw new CloverApiError(
        'Failed to get order',
        error.response?.status,
        error.response?.data
      );
    }
  }

  async createPayment(orderId, paymentData) {
    try {
      const response = await axios({
        method: 'POST',
        url: `${this.apiBase}/v3/merchants/${this.merchantId}/orders/${orderId}/payments`,
        headers: this.getAuthHeaders(),
        data: paymentData
      });

      logger.info('Payment created successfully:', response.data);
      return response.data;
    } catch (error) {
      throw new CloverApiError(
        'Failed to create payment',
        error.response?.status,
        error.response?.data
      );
    }
  }

  async getPayment(paymentId) {
    try {
      const response = await axios({
        method: 'GET',
        url: `${this.apiBase}/v3/merchants/${this.merchantId}/payments/${paymentId}`,
        headers: this.getAuthHeaders()
      });

      return response.data;
    } catch (error) {
      throw new CloverApiError(
        'Failed to get payment',
        error.response?.status,
        error.response?.data
      );
    }
  }

  async getMerchantInfo() {
    try {
      const response = await axios({
        method: 'GET',
        url: `${this.apiBase}/v3/merchants/${this.merchantId}`,
        headers: this.getAuthHeaders()
      });

      return response.data;
    } catch (error) {
      throw new CloverApiError(
        'Failed to get merchant info',
        error.response?.status,
        error.response?.data
      );
    }
  }
}

// Create and export a singleton instance
const cloverService = new CloverService();
export default cloverService;
