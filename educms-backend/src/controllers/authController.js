const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { successResponse } = require('../utils/helpers');
const { signAccessToken, signRefreshToken } = require('../middleware/auth');
const { sendMail } = require('../services/emailService');
const logger = require('../utils/logger');

const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;

const register = async (req, res, next) => {
  try {
    const { username, email, password, first_name, last_name } = req.body;
    if (await User.findByEmail(email)) return res.status(409).json({ success: false, message: 'Email already registered' });
    if (await User.findByUsername(username)) return res.status(409).json({ success: false, message: 'Username already taken' });
    const password_hash = await bcrypt.hash(password, rounds);
    const user = await User.create({ username, email, password_hash, first_name, last_name });
    await User.touchLogin(user.user_id);
    res.status(201).json(successResponse({
      user,
      accessToken: signAccessToken(user),
      refreshToken: signRefreshToken(user),
    }, 'Registered successfully'));
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user || !user.is_active) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    await User.touchLogin(user.user_id);
    const { password_hash, ...safe } = user;
    res.json(successResponse({
      user: safe,
      accessToken: signAccessToken(user),
      refreshToken: signRefreshToken(user),
    }, 'Logged in successfully'));
  } catch (err) { next(err); }
};

const me = async (req, res) => res.json(successResponse({ user: req.user }));

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token required' });
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(payload.sub);
    if (!user || !user.is_active) return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    res.json(successResponse({ accessToken: signAccessToken(user) }));
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findByEmail(email);
    if (user) {
      const token = jwt.sign({ sub: user.user_id, purpose: 'reset' }, process.env.JWT_SECRET, { expiresIn: '1h' });
      await User.update(user.user_id, { verification_token: token });
      try {
        await sendMail({ to: email, subject: 'EduCMS password reset', text: `Your reset token: ${token}` });
      } catch (e) { logger.error(`Reset email failed: ${e.message}`); }
    }
    res.json(successResponse(null, 'If the email exists, a reset link was sent'));
  } catch (err) { next(err); }
};

module.exports = { register, login, me, refresh, forgotPassword };
