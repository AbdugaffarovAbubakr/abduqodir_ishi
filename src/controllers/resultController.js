const { asyncHandler } = require('../utils/asyncHandler');
const { AppError } = require('../utils/AppError');
const { validateResultInput } = require('../utils/validation');
const resultService = require('../services/resultService');
const testService = require('../services/testService');
const deviceService = require('../services/deviceService');
const userService = require('../services/userService');
const { paginate } = require('../utils/pagination');

const create = asyncHandler(async (req, res) => {
  const errors = validateResultInput(req.body);
  if (errors.length) {
    throw new AppError(400, 'Validation error', errors);
  }
  const device = await deviceService.getById(req.body.deviceId);
  if (!device) {
    throw new AppError(404, 'Device not found');
  }
  const tests = await testService.getByDeviceId(req.body.deviceId);
  if (!tests.length) {
    throw new AppError(404, 'No tests found for this device');
  }

  const answersMap = new Map();
  req.body.answers.forEach((answer) => {
    if (answer && typeof answer.testId === 'string') {
      answersMap.set(answer.testId, answer.answerIndex);
    }
  });

  let score = 0;
  tests.forEach((test) => {
    const userAnswer = answersMap.get(test.id);
    if (Number.isInteger(userAnswer) && userAnswer === test.correctAnswer) {
      score += 1;
    }
  });

  const total = tests.length;
  const percentage = total ? Math.round((score / total) * 100) : 0;

  const result = await resultService.create({
    userId: req.user.id,
    deviceId: req.body.deviceId,
    score,
    total,
    percentage
  });

  res.status(201).json({ result });
});

const getMyResults = asyncHandler(async (req, res) => {
  const results = await resultService.getByUserId(req.user.id);
  const devices = await deviceService.getAll();
  const deviceMap = new Map(devices.map((d) => [d.id, d.name]));
  const data = results
    .map((result) => ({
      ...result,
      deviceName: deviceMap.get(result.deviceId) || null
    }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  res.json({ data });
});

const getAllResults = asyncHandler(async (req, res) => {
  const results = await resultService.getAll();
  const users = await userService.getAll();
  const devices = await deviceService.getAll();

  const userMap = new Map(users.map((u) => [u.id, u.fullname]));
  const deviceMap = new Map(devices.map((d) => [d.id, d.name]));

  const enriched = results.map((result) => ({
    ...result,
    userName: userMap.get(result.userId) || null,
    deviceName: deviceMap.get(result.deviceId) || null
  }));

  if (req.query.page || req.query.limit) {
    const { data, meta } = paginate(enriched, req.query.page, req.query.limit);
    return res.json({ data, meta });
  }

  return res.json({ data: enriched, meta: { total: enriched.length } });
});

module.exports = {
  create,
  getMyResults,
  getAllResults
};
