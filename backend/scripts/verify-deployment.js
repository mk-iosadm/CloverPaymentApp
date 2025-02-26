import axios from 'axios';
import dotenv from 'dotenv';
import logger from '../src/utils/logger.js';

dotenv.config();

const REQUIRED_ENV_VARS = [
  'PORT',
  'NODE_ENV',
  'CLOVER_API_BASE',
  'CLOVER_MERCHANT_ID',
  'CLOVER_API_KEY',
  'CLOVER_ACCESS_TOKEN',
  'CLOVER_WEBHOOK_SECRET',
  'FRONTEND_URL',
  'DATABASE_URL'
];

async function verifyDeployment() {
  const issues = [];
  
  // 1. Check environment variables
  logger.info('Checking environment variables...');
  const missingVars = REQUIRED_ENV_VARS.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    issues.push(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  // 2. Check database connection
  logger.info('Checking database connection...');
  try {
    const { initializeDatabase } = await import('../src/config/database.js');
    await initializeDatabase();
    logger.info('Database connection successful');
  } catch (error) {
    issues.push(`Database connection failed: ${error.message}`);
  }

  // 3. Check Clover API connection
  logger.info('Checking Clover API connection...');
  try {
    const cloverService = await import('../src/services/cloverService.js');
    await cloverService.default.validateConfig();
    logger.info('Clover API configuration valid');
  } catch (error) {
    issues.push(`Clover API configuration invalid: ${error.message}`);
  }

  // 4. Check server startup
  logger.info('Checking server startup...');
  try {
    const app = (await import('../src/index.js')).default;
    const port = process.env.PORT || 3001;
    const server = app.listen(port);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for server to start
    server.close();
    logger.info('Server startup successful');
  } catch (error) {
    issues.push(`Server startup failed: ${error.message}`);
  }

  // 5. Check API endpoints
  logger.info('Checking API endpoints...');
  try {
    const verifyEndpoints = (await import('./verify-apis.js')).default;
    const success = await verifyEndpoints();
    if (!success) {
      issues.push('API endpoint verification failed');
    }
  } catch (error) {
    issues.push(`API verification failed: ${error.message}`);
  }

  // 6. Check security headers
  logger.info('Checking security headers...');
  try {
    const response = await axios.get(`http://localhost:${process.env.PORT || 3001}/health`);
    const headers = response.headers;
    
    const requiredHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection'
    ];

    const missingHeaders = requiredHeaders.filter(header => !headers[header]);
    if (missingHeaders.length > 0) {
      issues.push(`Missing security headers: ${missingHeaders.join(', ')}`);
    }
  } catch (error) {
    issues.push(`Security headers check failed: ${error.message}`);
  }

  // Report results
  if (issues.length > 0) {
    logger.error('Deployment verification failed', { issues });
    console.error('\n❌ Deployment verification failed:');
    issues.forEach(issue => console.error(`- ${issue}`));
    return false;
  } else {
    logger.info('Deployment verification successful');
    console.log('\n✅ Deployment verification successful!');
    return true;
  }
}

// Run verification if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  verifyDeployment().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export default verifyDeployment;
