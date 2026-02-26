const express = require('express');
const {
  getAll,
  getById,
  create,
  update,
  remove
} = require('../controllers/deviceController');
const { authRequired } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

const router = express.Router();

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', authRequired, requireRole('admin'), create);
router.put('/:id', authRequired, requireRole('admin'), update);
router.delete('/:id', authRequired, requireRole('admin'), remove);

module.exports = router;
