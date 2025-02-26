import crypto from 'crypto';

export const verifyCloverWebhook = (req, res, next) => {
  const signature = req.headers['clover-signature'];
  const webhookSecret = process.env.CLOVER_WEBHOOK_SECRET;

  if (!signature) {
    return res.status(401).json({ error: 'Missing Clover signature' });
  }

  try {
    // Get the raw body
    const rawBody = JSON.stringify(req.body);
    
    // Create HMAC
    const hmac = crypto.createHmac('sha256', webhookSecret);
    hmac.update(rawBody);
    const calculatedSignature = hmac.digest('hex');

    // Compare signatures
    if (signature !== calculatedSignature) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    next();
  } catch (error) {
    console.error('Webhook verification error:', error);
    return res.status(500).json({ error: 'Webhook verification failed' });
  }
};
