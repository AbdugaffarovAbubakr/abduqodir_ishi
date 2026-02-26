const { asyncHandler } = require('../utils/asyncHandler');
const { AppError } = require('../utils/AppError');
const { validateDevice, validateDeviceUpdate } = require('../utils/validation');
const deviceService = require('../services/deviceService');
const { paginate } = require('../utils/pagination');

const getAll = asyncHandler(async (req, res) => {
  const devices = await deviceService.getAll();
  let filtered = devices;
  const q = req.query.q ? String(req.query.q).toLowerCase() : '';
  const category = req.query.category ? String(req.query.category).toLowerCase() : '';

  if (q) {
    filtered = filtered.filter((device) => {
      const hay = `${device.name} ${device.description}`.toLowerCase();
      return hay.includes(q);
    });
  }

  if (category) {
    filtered = filtered.filter((device) => device.category === category);
  }

  if (req.query.page || req.query.limit) {
    const { data, meta } = paginate(filtered, req.query.page, req.query.limit);
    return res.json({ data, meta });
  }

  return res.json({ data: filtered, meta: { total: filtered.length } });
});

const getById = asyncHandler(async (req, res) => {
  const device = await deviceService.getById(req.params.id);
  if (!device) {
    throw new AppError(404, 'Device not found');
  }
  res.json({ device });
});

const create = asyncHandler(async (req, res) => {
  const errors = validateDevice(req.body);
  if (errors.length) {
    throw new AppError(400, 'Validation error', errors);
  }
  const payload = {
    name: req.body.name.trim(),
    category: req.body.category,
    description: req.body.description.trim(),
    image: req.body.image ? req.body.image.trim() : null,
    specs: req.body.specs || {}
  };
  const device = await deviceService.create(payload);
  res.status(201).json({ device });
});

const update = asyncHandler(async (req, res) => {
  const errors = validateDeviceUpdate(req.body);
  if (errors.length) {
    throw new AppError(400, 'Validation error', errors);
  }
  const patch = {};
  if (req.body.name !== undefined) patch.name = req.body.name.trim();
  if (req.body.category !== undefined) patch.category = req.body.category;
  if (req.body.description !== undefined) patch.description = req.body.description.trim();
  if (req.body.image !== undefined) patch.image = req.body.image ? req.body.image.trim() : null;
  if (req.body.specs !== undefined) patch.specs = req.body.specs;

  const device = await deviceService.update(req.params.id, patch);
  if (!device) {
    throw new AppError(404, 'Device not found');
  }
  res.json({ device });
});

const remove = asyncHandler(async (req, res) => {
  const removed = await deviceService.remove(req.params.id);
  if (!removed) {
    throw new AppError(404, 'Device not found');
  }
  res.json({ device: removed });
});

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
