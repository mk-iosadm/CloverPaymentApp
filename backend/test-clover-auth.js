import axios from 'axios';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '.env');
dotenv.config({ path: envPath });

async function testCloverAuth() {
  const merchantId = process.env.CLOVER_MERCHANT_ID;
  const accessToken = process.env.CLOVER_ACCESS_TOKEN;
  const apiBase = process.env.CLOVER_API_BASE || 'https://sandbox.dev.clover.com';

  console.log('Testing Clover API credentials:');
  console.log('- Merchant ID:', merchantId);
  console.log('- API Base:', apiBase);
  console.log('- Has Access Token:', !!accessToken);

  if (!accessToken) {
    console.log('\nNo access token found!');
    console.log('Please run the OAuth server and get a token first:');
    console.log('1. Run: node clover-oauth-server.js');
    console.log('2. Visit: http://localhost:3001/auth');
    console.log('3. Complete the OAuth flow');
    return;
  }

  try {
    console.log('\nTesting API access with OAuth token...');
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    };

    // Try to get merchant info
    console.log('\nGetting merchant info...');
    const merchantResponse = await axios({
      method: 'GET',
      url: `${apiBase}/v3/merchants/${merchantId}`,
      headers
    });

    console.log('Merchant info:', merchantResponse.data);

    // Try to create an order
    console.log('\nCreating test order...');
    const orderResponse = await axios({
      method: 'POST',
      url: `${apiBase}/v3/merchants/${merchantId}/orders`,
      headers,
      data: {
        currency: 'USD',
        total: 1000,
        title: 'Test Order',
        state: 'open'
      }
    });

    console.log('Order created:', orderResponse.data);

    // Try to create a payment link
    console.log('\nCreating payment link...');
    const paymentLinkResponse = await axios({
      method: 'POST',
      url: `${apiBase}/v3/merchants/${merchantId}/ecomm/payment_links`,
      headers,
      data: {
        order_id: orderResponse.data.id,
        amount: 1000,
        currency: 'USD',
        name: 'Test Payment',
        expiration: {
          duration: 24,
          timeUnit: 'HOURS'
        }
      }
    });

    console.log('Payment link created:', paymentLinkResponse.data);

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
    if (error.response?.status) {
      console.error('Status code:', error.response.status);
    }
    console.log('\nTroubleshooting steps:');
    console.log('1. Make sure your OAuth token is valid');
    console.log('2. Try getting a new token through the OAuth server');
    console.log('3. Check that your app has the required permissions:');
    console.log('   - Orders: Read & Write');
    console.log('   - Payments: Process');
    console.log('   - Merchant: Read');
  }
}

testCloverAuth().catch(console.error);
