const express = require('express');
const {
  getAdminList,
  getByDevice,
  create,
  update,
  remove
} = require('../controllers/testController');
const { authRequired } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

const router = express.Router();

router.get('/admin', authRequired, requireRole('admin'), getAdminList);
router.get('/:deviceId', getByDevice);
router.post('/', authRequired, requireRole('admin'), create);
router.put('/:id', authRequired, requireRole('admin'), update);
router.delete('/:id', authRequired, requireRole('admin'), remove);

module.exports = router;
