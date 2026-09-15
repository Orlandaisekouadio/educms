const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');
const { requireAuth } = require('../middleware/auth');
const c = require('../controllers/authController');

const router = express.Router();

router.post('/register',
  body('username').isLength({ min: 3, max: 50 }).trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  validate, c.register);

router.post('/login',
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validate, c.login);

router.get('/me', requireAuth, c.me);
router.post('/refresh', c.refresh);
router.post('/forgot-password', body('email').isEmail(), validate, c.forgotPassword);

module.exports = router;
