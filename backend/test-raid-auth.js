import axios from 'axios';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

async function testCloverApi() {
  const merchantId = '03SRX40QK8XK1';
  const raidKey = '5ENAYXGBDDDG0.B4Y7P0EYX5W1R';
  const apiBase = process.env.CLOVER_API_BASE || 'https://sandbox.dev.clover.com';

  console.log('Testing Clover API with RAID authentication:');
  console.log('- Merchant ID:', merchantId);
  console.log('- RAID Key:', raidKey);
  console.log('- API Base:', apiBase);

  try {
    // Try RAID authentication
    const headers = {
      'Authorization': `Bearer ${raidKey}`,
      'Content-Type': 'application/json'
    };

    // Test 1: Get merchant info
    console.log('\nGetting merchant info...');
    try {
      const merchantResponse = await axios({
        method: 'GET',
        url: `${apiBase}/v3/merchants/${merchantId}`,
        headers
      });
      console.log('Success! Merchant info:', merchantResponse.data);
    } catch (error) {
      console.error('Failed to get merchant info:', error.message);
      if (error.response?.data) {
        console.error('Response data:', error.response.data);
      }
      return;
    }

    // Test 2: Create an order
    console.log('\nCreating test order...');
    try {
      const orderResponse = await axios({
        method: 'POST',
        url: `${apiBase}/v3/merchants/${merchantId}/orders`,
        headers,
        data: {
          currency: 'USD',
          total: 1000,
          title: 'Test Order via RAID',
          state: 'open'
        }
      });
      console.log('Order created:', orderResponse.data);
    } catch (error) {
      console.error('Failed to create order:', error.message);
      if (error.response?.data) {
        console.error('Response data:', error.response.data);
      }
      return;
    }

    // If we got here, everything worked!
    console.log('\nSuccess! RAID authentication is working correctly!');
    
    // Update .env with RAID key
    const envPath = join(__dirname, '.env');
    const envContent = await import('fs').then(fs => fs.readFileSync(envPath, 'utf8'));
    let updatedContent = envContent;

    // Add RAID key if not present
    if (!envContent.includes('CLOVER_RAID_KEY=')) {
      updatedContent += `\nCLOVER_RAID_KEY=${raidKey}`;
    }

    await import('fs').then(fs => fs.writeFileSync(envPath, updatedContent));
    console.log('\nUpdated .env file with RAID key');

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
  }
}

testCloverApi().catch(console.error);
