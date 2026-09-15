const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');
const { requireAuth, requireRole } = require('../middleware/auth');
const c = require('../controllers/categoryController');

const router = express.Router();

router.get('/', c.listCategories);
router.post('/', requireAuth, requireRole('admin', 'editor'),
  body('name').isLength({ min: 2, max: 100 }), validate, c.createCategory);
router.put('/:id', requireAuth, requireRole('admin', 'editor'), c.updateCategory);
router.delete('/:id', requireAuth, requireRole('admin'), c.deleteCategory);

router.get('/tags/all', c.listTags);
router.post('/tags/all', requireAuth, requireRole('admin', 'editor'),
  body('name').isLength({ min: 2, max: 50 }), validate, c.createTag);
router.delete('/tags/:id', requireAuth, requireRole('admin'), c.deleteTag);

module.exports = router;
