import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const clientId = process.env.CLOVER_API_KEY;
const domain = 'sandbox.dev.clover.com';

// Create installation URL
const installUrl = `https://${domain}/oauth/authorize?client_id=${clientId}&response_type=code`;

console.log('Please visit this URL to install the app for your merchant:');
console.log(installUrl);
console.log('\nAfter installation, you will be redirected to your callback URL with an authorization code.');
console.log('The callback URL should be: http://localhost:3003/callback');
