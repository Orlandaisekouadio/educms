const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');
const { requireAuth, requireRole } = require('../middleware/auth');
const c = require('../controllers/categoryController');

const router = express.Router();

router.get('/', c.listTags);
router.post('/', requireAuth, requireRole('admin', 'editor'),
  body('name').isLength({ min: 2, max: 50 }), validate, c.createTag);
router.delete('/:id', requireAuth, requireRole('admin'), c.deleteTag);

module.exports = router;
