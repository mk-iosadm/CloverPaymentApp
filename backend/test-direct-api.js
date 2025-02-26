import axios from 'axios';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

async function testCloverApi() {
  const merchantId = process.env.CLOVER_MERCHANT_ID;
  const accessToken = process.env.CLOVER_ACCESS_TOKEN;
  const apiBase = process.env.CLOVER_API_BASE || 'https://sandbox.dev.clover.com';

  console.log('Testing Clover API with:');
  console.log('- Merchant ID:', merchantId);
  console.log('- Has Access Token:', !!accessToken);
  console.log('- API Base:', apiBase);

  try {
    // Test merchant info endpoint
    console.log('\nGetting merchant info...');
    const merchantResponse = await axios({
      method: 'GET',
      url: `${apiBase}/v3/merchants/${merchantId}`,
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    console.log('Success! Merchant info:', merchantResponse.data);

    // Test creating an order
    console.log('\nCreating test order...');
    const orderResponse = await axios({
      method: 'POST',
      url: `${apiBase}/v3/merchants/${merchantId}/orders`,
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      data: {
        currency: 'USD',
        total: 1000,
        title: 'Test Order',
        state: 'open'
      }
    });

    console.log('Order created:', orderResponse.data);
    console.log('\nAPI tests successful!');

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
  }
}

testCloverApi().catch(console.error);
