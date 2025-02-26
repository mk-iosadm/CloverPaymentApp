import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const port = 3003;

// Clover OAuth configuration
const cloverConfig = {
  clientId: process.env.CLOVER_API_KEY,
  clientSecret: process.env.CLOVER_APP_SECRET,
  apiBase: process.env.CLOVER_API_BASE || 'https://sandbox.dev.clover.com'
};

console.log('Starting server with config:', {
  clientId: cloverConfig.clientId,
  apiBase: cloverConfig.apiBase,
  hasSecret: !!cloverConfig.clientSecret
});

// Home page
app.get('/', (req, res) => {
  res.send(`
    <h1>Clover OAuth Test Server</h1>
    <p>Available endpoints:</p>
    <ul>
      <li><a href="/auth">Start OAuth Flow</a></li>
      <li><a href="/test">Test API Connection</a></li>
    </ul>
  `);
});

// Generate OAuth URL
app.get('/auth', (req, res) => {
  const authUrl = `${cloverConfig.apiBase}/oauth/authorize?client_id=${cloverConfig.clientId}&response_type=code`;
  console.log('Redirecting to Auth URL:', authUrl);
  res.redirect(authUrl);
});

// OAuth callback handler
app.get('/callback', async (req, res) => {
  const { code, merchant_id } = req.query;
  
  console.log('Received callback with:', {
    code: code ? 'present' : 'missing',
    merchant_id,
    client_id: cloverConfig.clientId
  });

  if (!code) {
    return res.status(400).send('No authorization code received');
  }

  try {
    // Exchange code for token
    console.log('Exchanging code for token...');
    const tokenResponse = await axios({
      method: 'GET',
      url: `${cloverConfig.apiBase}/oauth/token`,
      params: {
        client_id: cloverConfig.clientId,
        client_secret: cloverConfig.clientSecret,
        code: code
      }
    });

    const accessToken = tokenResponse.data.access_token;
    console.log('Received access token');

    // Update .env file
    const envPath = join(__dirname, '.env');
    const envContent = await import('fs').then(fs => fs.readFileSync(envPath, 'utf8'));
    let updatedContent = envContent;

    // Update access token
    if (updatedContent.includes('CLOVER_ACCESS_TOKEN=')) {
      updatedContent = updatedContent.replace(
        /CLOVER_ACCESS_TOKEN=.*/,
        `CLOVER_ACCESS_TOKEN=${accessToken}`
      );
    } else {
      updatedContent += `\nCLOVER_ACCESS_TOKEN=${accessToken}`;
    }

    // Update merchant ID if provided
    if (merchant_id) {
      if (updatedContent.includes('CLOVER_MERCHANT_ID=')) {
        updatedContent = updatedContent.replace(
          /CLOVER_MERCHANT_ID=.*/,
          `CLOVER_MERCHANT_ID=${merchant_id}`
        );
      } else {
        updatedContent += `\nCLOVER_MERCHANT_ID=${merchant_id}`;
      }
    }

    await writeFile(envPath, updatedContent);
    console.log('Updated .env file with new credentials');

    res.send(`
      <h1>Authorization Successful!</h1>
      <p>The access token has been saved.</p>
      <p>Merchant ID: ${merchant_id}</p>
      <p><a href="/test">Test the API connection</a></p>
    `);

  } catch (error) {
    console.error('Authorization failed:', error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
    res.status(400).send(`
      <h1>Authorization Failed</h1>
      <p>Error: ${error.message}</p>
      <pre>${JSON.stringify(error.response?.data || {}, null, 2)}</pre>
    `);
  }
});

// Test endpoint
app.get('/test', async (req, res) => {
  try {
    const accessToken = process.env.CLOVER_ACCESS_TOKEN;
    const merchantId = process.env.CLOVER_MERCHANT_ID;
    
    console.log('Testing API with:', {
      hasToken: !!accessToken,
      merchantId
    });

    if (!accessToken || !merchantId) {
      throw new Error('Missing access token or merchant ID');
    }

    const response = await axios({
      method: 'GET',
      url: `${cloverConfig.apiBase}/v3/merchants/${merchantId}`,
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    res.send(`
      <h1>API Test Successful!</h1>
      <pre>${JSON.stringify(response.data, null, 2)}</pre>
    `);

  } catch (error) {
    console.error('API test failed:', error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
    res.status(401).send(`
      <h1>API Test Failed</h1>
      <p>Error: ${error.message}</p>
      <pre>${JSON.stringify(error.response?.data || {}, null, 2)}</pre>
    `);
  }
});

app.listen(port, () => {
  console.log(`OAuth server running at http://localhost:${port}`);
});
