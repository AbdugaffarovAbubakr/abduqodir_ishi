const { asyncHandler } = require('../utils/asyncHandler');
const userService = require('../services/userService');
const { paginate } = require('../utils/pagination');

const sanitizeUser = (user) => ({
  id: user.id,
  fullname: user.fullname,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAll();
  const data = users.map(sanitizeUser);

  if (req.query.page || req.query.limit) {
    const { data: paged, meta } = paginate(data, req.query.page, req.query.limit);
    return res.json({ data: paged, meta });
  }

  return res.json({ data, meta: { total: data.length } });
});

module.exports = { getAllUsers };
