const { asyncHandler } = require('../utils/asyncHandler');
const userService = require('../services/userService');
const deviceService = require('../services/deviceService');
const testService = require('../services/testService');
const resultService = require('../services/resultService');

const getStats = asyncHandler(async (req, res) => {
  const [users, devices, tests, results] = await Promise.all([
    userService.getAll(),
    deviceService.getAll(),
    testService.getAll(),
    resultService.getAll()
  ]);

  const avgPercentage = results.length
    ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)
    : 0;

  const totalsByUser = new Map();
  results.forEach((result) => {
    const current = totalsByUser.get(result.userId) || {
      userId: result.userId,
      attempts: 0,
      totalPercentage: 0
    };
    current.attempts += 1;
    current.totalPercentage += result.percentage;
    totalsByUser.set(result.userId, current);
  });

  const userMap = new Map(users.map((u) => [u.id, u.fullname]));
  const leaderboard = Array.from(totalsByUser.values())
    .map((item) => ({
      userId: item.userId,
      fullname: userMap.get(item.userId) || 'Unknown',
      attempts: item.attempts,
      avgPercentage: item.attempts
        ? Math.round(item.totalPercentage / item.attempts)
        : 0
    }))
    .sort((a, b) => b.avgPercentage - a.avgPercentage)
    .slice(0, 10);

  res.json({
    counts: {
      users: users.length,
      devices: devices.length,
      tests: tests.length,
      results: results.length
    },
    avgPercentage,
    leaderboard
  });
});

module.exports = { getStats };
