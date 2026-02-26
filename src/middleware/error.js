const { AppError } = require('../utils/AppError');

const notFoundHandler = (req, res, next) => {
  next(new AppError(404, `Route ${req.method} ${req.originalUrl} not found`));
};

const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    details: err.details || null
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
