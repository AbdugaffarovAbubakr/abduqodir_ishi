const { asyncHandler } = require('../utils/asyncHandler');
const { AppError } = require('../utils/AppError');
const { validateTest, validateTestUpdate } = require('../utils/validation');
const deviceService = require('../services/deviceService');
const testService = require('../services/testService');

const getAdminList = asyncHandler(async (req, res) => {
  const tests = await testService.getAll();
  const devices = await deviceService.getAll();
  const deviceMap = new Map(devices.map((device) => [device.id, device.name]));
  const data = tests.map((test) => ({
    ...test,
    deviceName: deviceMap.get(test.deviceId) || null
  }));
  res.json({ data });
});

const getByDevice = asyncHandler(async (req, res) => {
  const deviceId = req.params.deviceId;
  const tests = await testService.getByDeviceId(deviceId);
  const data = tests.map(({ id, deviceId: dId, question, options }) => ({
    id,
    deviceId: dId,
    question,
    options
  }));
  res.json({ data });
});

const create = asyncHandler(async (req, res) => {
  const errors = validateTest(req.body);
  if (errors.length) {
    throw new AppError(400, 'Validation error', errors);
  }
  const device = await deviceService.getById(req.body.deviceId);
  if (!device) {
    throw new AppError(404, 'Device not found');
  }
  const test = await testService.create({
    deviceId: req.body.deviceId,
    question: req.body.question.trim(),
    options: req.body.options.map((opt) => opt.trim()),
    correctAnswer: req.body.correctAnswer
  });
  res.status(201).json({ test });
});

const update = asyncHandler(async (req, res) => {
  const errors = validateTestUpdate(req.body);
  if (errors.length) {
    throw new AppError(400, 'Validation error', errors);
  }

  const existing = await testService.getById(req.params.id);
  if (!existing) {
    throw new AppError(404, 'Test not found');
  }

  if (req.body.deviceId !== undefined) {
    const device = await deviceService.getById(req.body.deviceId);
    if (!device) {
      throw new AppError(404, 'Device not found');
    }
  }

  const patch = {};
  if (req.body.deviceId !== undefined) patch.deviceId = req.body.deviceId;
  if (req.body.question !== undefined) patch.question = req.body.question.trim();
  if (req.body.options !== undefined) {
    patch.options = req.body.options.map((opt) => opt.trim());
  }

  const optionsForCheck = patch.options || existing.options;
  if (!Array.isArray(optionsForCheck) || optionsForCheck.length < 2) {
    throw new AppError(400, 'options must be an array of at least 2 items');
  }

  if (req.body.correctAnswer !== undefined) {
    const answer = req.body.correctAnswer;
    if (answer < 0 || answer >= optionsForCheck.length) {
      throw new AppError(400, 'correctAnswer is out of range');
    }
    patch.correctAnswer = answer;
  } else if (patch.options) {
    if (existing.correctAnswer >= optionsForCheck.length) {
      throw new AppError(400, 'correctAnswer is out of range');
    }
  }

  const updated = await testService.update(req.params.id, patch);
  res.json({ test: updated });
});

const remove = asyncHandler(async (req, res) => {
  const removed = await testService.remove(req.params.id);
  if (!removed) {
    throw new AppError(404, 'Test not found');
  }
  res.json({ test: removed });
});

module.exports = {
  getAdminList,
  getByDevice,
  create,
  update,
  remove
};
