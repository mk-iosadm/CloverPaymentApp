import express from 'express';
import { generatePaymentLink, checkPaymentStatus, handleCloverWebhook } from '../controllers/paymentController.js';
import { validateGeneratePayment } from '../validators/paymentValidator.js';
import { verifyCloverWebhook } from '../middleware/webhookVerification.js';

const router = express.Router();

// Apply validation middleware to generate payment route
router.post('/generate', validateGeneratePayment, generatePaymentLink);
router.get('/status/:orderId', checkPaymentStatus);
router.post('/webhook', verifyCloverWebhook, handleCloverWebhook);

export default router;
