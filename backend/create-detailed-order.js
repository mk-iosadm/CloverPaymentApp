import axios from 'axios';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

async function createDetailedOrder() {
  try {
    console.log('Creating detailed order...');
    
    // First create the order
    const orderData = {
      title: "Test Order with Items",
      total: 5000, // $50.00
      state: "open",
      currency: "USD",
      note: "Test order with multiple items"
    };

    console.log('Creating order with data:', orderData);

    const orderResponse = await axios({
      method: 'POST',
      url: `${process.env.CLOVER_API_BASE}/v3/merchants/${process.env.CLOVER_MERCHANT_ID}/orders`,
      headers: {
        'Authorization': `Bearer ${process.env.CLOVER_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      data: orderData
    });

    const orderId = orderResponse.data.id;
    console.log('\nOrder created successfully:', orderResponse.data);

    // Now add line items
    console.log('\nAdding line items...');
    
    const items = [
      {
        name: "Premium Widget",
        price: 1500,
        quantity: 2,
        note: "Color: Blue"
      },
      {
        name: "Deluxe Gadget",
        price: 2000,
        quantity: 1,
        note: "Size: Large"
      }
    ];

    for (const item of items) {
      console.log(`Adding item: ${item.name}`);
      const lineItemResponse = await axios({
        method: 'POST',
        url: `${process.env.CLOVER_API_BASE}/v3/merchants/${process.env.CLOVER_MERCHANT_ID}/orders/${orderId}/line_items`,
        headers: {
          'Authorization': `Bearer ${process.env.CLOVER_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        data: item
      });
      
      console.log('Line item added:', lineItemResponse.data);
    }

    // Get the final order with line items
    const finalOrder = await axios({
      method: 'GET',
      url: `${process.env.CLOVER_API_BASE}/v3/merchants/${process.env.CLOVER_MERCHANT_ID}/orders/${orderId}`,
      headers: {
        'Authorization': `Bearer ${process.env.CLOVER_ACCESS_TOKEN}`
      }
    });

    console.log('\nFinal order details:', finalOrder.data);
    console.log('\nOrder can be viewed at:');
    console.log(`${process.env.CLOVER_API_BASE}/dashboard/orders/${orderId}`);

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response?.data) {
      console.error('API Response:', error.response.data);
    }
  }
}

createDetailedOrder();
