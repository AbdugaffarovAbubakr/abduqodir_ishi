const { AppError } = require('../utils/AppError');

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError(403, 'Forbidden'));
  }
  return next();
};

module.exports = { requireRole };
