const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const c = require('../controllers/userController');

const router = express.Router();

router.get('/stats/overview', requireAuth, requireRole('admin'), c.stats);
router.get('/', requireAuth, requireRole('admin'), c.list);
router.get('/:id', requireAuth, c.getById);
router.put('/:id', requireAuth, c.update);
router.delete('/:id', requireAuth, requireRole('admin'), c.remove);

module.exports = router;
