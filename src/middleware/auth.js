const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../utils/env');
const { AppError } = require('../utils/AppError');

const authRequired = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) {
    return next(new AppError(401, 'Missing Authorization header'));
  }
  const [type, token] = header.split(' ');
  if (type !== 'Bearer' || !token) {
    return next(new AppError(401, 'Invalid authorization format'));
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch {
    return next(new AppError(401, 'Invalid or expired token'));
  }
};

module.exports = { authRequired };
