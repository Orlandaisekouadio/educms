const express = require('express');
const { body, query } = require('express-validator');
const { validate } = require('../middleware/validation');
const { requireAuth, requireRole } = require('../middleware/auth');
const c = require('../controllers/postController');

const router = express.Router();

router.get('/',
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validate, c.list);

router.get('/stats/overview', requireAuth, requireRole('admin', 'editor'), c.stats);
router.get('/:slug', c.getBySlug);

router.post('/',
  requireAuth, requireRole('admin', 'editor', 'author'),
  body('title').isLength({ min: 3, max: 255 }),
  body('content').isLength({ min: 10 }),
  body('status').optional().isIn(['draft', 'published', 'archived']),
  validate, c.create);

router.put('/:id',
  requireAuth,
  body('title').optional().isLength({ min: 3, max: 255 }),
  body('content').optional().isLength({ min: 10 }),
  body('status').optional().isIn(['draft', 'published', 'archived']),
  validate, c.update);

router.delete('/:id', requireAuth, c.remove);
router.post('/:id/like', c.like);

module.exports = router;
