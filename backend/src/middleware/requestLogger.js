import logger from '../utils/logger.js';

export const requestLogger = (req, res, next) => {
  // Log the incoming request
  logger.logApiRequest(req);

  // Get start time
  const start = Date.now();

  // Log response when it's sent
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.logApiResponse(req, res, { responseTime: `${duration}ms` });
  });

  next();
};
