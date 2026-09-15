const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');
const { requireAuth, requireRole } = require('../middleware/auth');
const c = require('../controllers/commentController');

const router = express.Router();

router.get('/post/:postId', c.getForPost);
router.post('/post/:postId', body('content').isLength({ min: 1, max: 5000 }), validate, c.create);
router.get('/', requireAuth, requireRole('admin', 'editor'), c.listAll);
router.patch('/:id', requireAuth, requireRole('admin', 'editor'),
  body('status').isIn(['pending', 'approved', 'spam', 'trash']), validate, c.moderate);
router.delete('/:id', requireAuth, requireRole('admin', 'editor'), c.remove);

module.exports = router;
