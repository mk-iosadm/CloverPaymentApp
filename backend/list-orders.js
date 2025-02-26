import axios from 'axios';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

async function listOrders() {
  try {
    console.log('Fetching orders...');
    console.log('Merchant ID:', process.env.CLOVER_MERCHANT_ID);
    
    const response = await axios({
      method: 'GET',
      url: `${process.env.CLOVER_API_BASE}/v3/merchants/${process.env.CLOVER_MERCHANT_ID}/orders`,
      headers: {
        'Authorization': `Bearer ${process.env.CLOVER_ACCESS_TOKEN}`
      }
    });

    if (response.data.elements && response.data.elements.length > 0) {
      console.log('\nRecent Orders:');
      response.data.elements.forEach(order => {
        console.log(`\nOrder ID: ${order.id}`);
        console.log(`Title: ${order.title}`);
        console.log(`State: ${order.state}`);
        console.log(`Total: ${(order.total || 0) / 100} ${order.currency || 'USD'}`);
        console.log(`Created: ${new Date(order.createdTime).toLocaleString()}`);
        console.log('----------------------------------------');
      });
    } else {
      console.log('No orders found');
    }

  } catch (error) {
    console.error('Error fetching orders:', error.message);
    if (error.response?.data) {
      console.error('API Response:', error.response.data);
    }
  }
}

listOrders();
