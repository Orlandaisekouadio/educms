const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const { errorHandler, notFound } = require('./middleware/errorHandler');
const db = require('./config/database');

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const categoryRoutes = require('./routes/categories');
const tagRoutes = require('./routes/tags');
const commentRoutes = require('./routes/comments');
const mediaRoutes = require('./routes/media');
const userRoutes = require('./routes/users');

const app = express();

app.use(helmet());
app.use(compression());
app.use(cors({ origin: (process.env.FRONTEND_URL || 'http://localhost:3000').split(','), credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW) || 15) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

app.use('/uploads', express.static(path.join(process.cwd(), process.env.UPLOAD_DIR || './uploads')));

app.get('/api/health', async (req, res) => {
  let pg = 'down';
  try {
    await db.query('SELECT 1');
    pg = 'up';
  } catch (e) { pg = `down: ${e.message}`; }
  res.json({ status: 'ok', postgres: pg, version: process.env.API_VERSION || 'v1' });
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/users', userRoutes);

app.use('/api', notFound);
app.use(errorHandler);

module.exports = app;
