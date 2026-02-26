const express = require('express');
const { getAllUsers } = require('../controllers/userController');
const { authRequired } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

const router = express.Router();

router.get('/', authRequired, requireRole('admin'), getAllUsers);

module.exports = router;
