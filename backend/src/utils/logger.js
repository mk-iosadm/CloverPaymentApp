const logLevels = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

const getTimestamp = () => new Date().toISOString();

const formatMessage = (level, message, meta = {}) => {
  return {
    timestamp: getTimestamp(),
    level,
    message,
    ...meta
  };
};

const logger = {
  error: (message, meta) => {
    console.error(JSON.stringify(formatMessage(logLevels.ERROR, message, meta)));
  },
  
  warn: (message, meta) => {
    console.warn(JSON.stringify(formatMessage(logLevels.WARN, message, meta)));
  },
  
  info: (message, meta) => {
    console.info(JSON.stringify(formatMessage(logLevels.INFO, message, meta)));
  },
  
  debug: (message, meta) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(JSON.stringify(formatMessage(logLevels.DEBUG, message, meta)));
    }
  },

  // Log API requests
  logApiRequest: (req, meta = {}) => {
    logger.info('API Request', {
      method: req.method,
      path: req.path,
      query: req.query,
      body: process.env.NODE_ENV === 'development' ? req.body : '[REDACTED]',
      ip: req.ip,
      ...meta
    });
  },

  // Log API responses
  logApiResponse: (req, res, meta = {}) => {
    logger.info('API Response', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime: meta.responseTime,
      ...meta
    });
  }
};

export default logger;
