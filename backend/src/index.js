import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import paymentRoutes from './routes/payment.js';
import erpRoutes from './routes/erp.js';
import { initializeDatabase } from './config/database.js';
import { requestLogger } from './middleware/requestLogger.js';
import logger from './utils/logger.js';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(dirname(__dirname), '.env');
console.log('Loading .env file from:', envPath);
dotenv.config({ path: envPath });

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet()); 
app.use(morgan('combined')); 
app.use(requestLogger); 
app.use(compression()); 

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Clover-Signature'],
  credentials: true,
  maxAge: 86400 
};
app.use(cors(corsOptions));

// Body parsing middleware with size limits
app.use(express.json({ 
  limit: '10kb',
  verify: (req, res, buf) => {
    // Store raw body for webhook verification
    req.rawBody = buf;
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version
  });
});

// API routes
app.use('/api/payment', paymentRoutes);
app.use('/api/erp', erpRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { 
    error: err.message,
    stack: err.stack
  });

  // Don't expose internal error details in production
  res.status(err.statusCode || 500).json({ 
    error: err.message || 'Internal server error',
    requestId: req.id // For tracking in logs
  });
});

// Handle unhandled routes
app.use((req, res) => {
  logger.warn('Route not found', { 
    path: req.path,
    method: req.method,
    ip: req.ip
  });
  res.status(404).json({ error: 'Route not found' });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { 
    error: error.message,
    stack: error.stack
  });
  // Give the logger time to write before exiting
  setTimeout(() => process.exit(1), 1000);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled rejection', { 
    error: error.message,
    stack: error.stack
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  app.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();
    const server = app.listen(PORT, () => {
      logger.info('Server started', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        pid: process.pid
      });
    });

    // Configure server timeouts
    server.keepAliveTimeout = 65000; // Slightly higher than ALB's idle timeout
    server.headersTimeout = 66000; // Slightly higher than keepAliveTimeout
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
