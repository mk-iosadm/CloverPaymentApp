import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const APP_ID = '51HH5CNT0600A';
const APP_SECRET = 'd0a52650-9559-a7ce-e49a-851090f05ab3';

async function getCloverAccessToken() {
  try {
    const response = await axios.get(
      `https://sandbox.dev.clover.com/oauth/token?client_id=${APP_ID}&client_secret=${APP_SECRET}`
    );

    console.log('\nClover Access Token Details:');
    console.log('------------------------');
    console.log('Access Token:', response.data.access_token);
    console.log('Merchant ID:', response.data.merchant_id);
    console.log('\nAdd these to your .env file:');
    console.log('------------------------');
    console.log(`CLOVER_MERCHANT_ID=${response.data.merchant_id}`);
    console.log(`CLOVER_API_KEY=${APP_SECRET}`);
    console.log(`CLOVER_ACCESS_TOKEN=${response.data.access_token}`);
    console.log(`CLOVER_API_BASE=https://sandbox.dev.clover.com`);
    
    // Generate a webhook secret
    const webhookSecret = Math.random().toString(36).substring(2) + 
                         Math.random().toString(36).substring(2);
    console.log(`CLOVER_WEBHOOK_SECRET=${webhookSecret}`);
    
  } catch (error) {
    console.error('Error getting access token:', error.response?.data || error.message);
  }
}

getCloverAccessToken();
