const express = require('express');
const { create, getMyResults, getAllResults } = require('../controllers/resultController');
const { authRequired } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

const router = express.Router();

router.post('/', authRequired, create);
router.get('/me', authRequired, getMyResults);
router.get('/', authRequired, requireRole('admin'), getAllResults);

module.exports = router;
