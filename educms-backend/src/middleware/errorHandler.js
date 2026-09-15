const logger = require('../utils/logger');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || err.status || 500;
  logger.error({ message: err.message, status, url: req.originalUrl, method: req.method });
  if (err.code === '23505') {
    return res.status(409).json({ success: false, message: 'Resource already exists' });
  }
  res.status(status).json({
    success: false,
    message: status >= 500 ? 'Internal server error' : err.message,
  });
};

const notFound = (req, res) =>
  res.status(404).json({ success: false, message: 'Not found' });

module.exports = { errorHandler, notFound };
