const express = require('express');
const { getStats } = require('../controllers/statsController');
const { authRequired } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

const router = express.Router();

router.get('/', authRequired, requireRole('admin'), getStats);

module.exports = router;
