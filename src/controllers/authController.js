const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { asyncHandler } = require('../utils/asyncHandler');
const { AppError } = require('../utils/AppError');
const { validateRegister, validateLogin } = require('../utils/validation');
const userService = require('../services/userService');
const { JWT_SECRET, TOKEN_EXPIRES_IN } = require('../utils/env');

const sanitizeUser = (user) => ({
  id: user.id,
  fullname: user.fullname,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt
});

const register = asyncHandler(async (req, res) => {
  const errors = validateRegister(req.body);
  if (errors.length) {
    throw new AppError(400, 'Validation error', errors);
  }
  const email = req.body.email.trim().toLowerCase();
  const users = await userService.getAll();
  const existing = users.find((u) => u.email === email);
  if (existing) {
    throw new AppError(409, 'Email already registered');
  }
  const role = users.length === 0 ? 'admin' : 'user';
  const passwordHash = await bcrypt.hash(req.body.password, 10);
  const newUser = await userService.create({
    fullname: req.body.fullname.trim(),
    email,
    passwordHash,
    role
  });
  res.status(201).json({ user: sanitizeUser(newUser) });
});

const login = asyncHandler(async (req, res) => {
  const errors = validateLogin(req.body);
  if (errors.length) {
    throw new AppError(400, 'Validation error', errors);
  }
  const email = req.body.email.trim().toLowerCase();
  const user = await userService.findByEmail(email);
  if (!user) {
    throw new AppError(401, 'Invalid credentials');
  }
  const ok = await bcrypt.compare(req.body.password, user.passwordHash);
  if (!ok) {
    throw new AppError(401, 'Invalid credentials');
  }
  const token = jwt.sign(
    { id: user.id, role: user.role, fullname: user.fullname },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRES_IN }
  );
  res.json({ token, user: sanitizeUser(user) });
});

module.exports = {
  register,
  login
};
