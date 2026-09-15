const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const c = require('../controllers/mediaController');

const router = express.Router();

router.get('/', requireAuth, c.list);
router.post('/', requireAuth, requireRole('admin', 'editor', 'author'), upload.single('file'), c.uploadFile);
router.delete('/:id', requireAuth, requireRole('admin', 'editor'), c.remove);

module.exports = router;
