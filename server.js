require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database/db');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV === 'production') {
  for (const name of ['JWT_SECRET', 'JWT_REFRESH_SECRET']) {
    if (!process.env[name] || process.env[name].length < 32) {
      throw new Error(`${name} must be configured with at least 32 characters in production`);
    }
  }
}

app.disable('x-powered-by');
app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json({ limit: '32kb' }));
app.use(express.static(__dirname));

const authRoutes = require('./routes/auth');
const competitionRoutes = require('./routes/competition');
const mealRoutes = require('./routes/meal');
const hobbyRoutes = require('./routes/hobby');
const userRoutes = require('./routes/user');

app.use('/api/auth', authRoutes);
app.use('/api/competition', competitionRoutes);
app.use('/api/meal', mealRoutes);
app.use('/api/hobby', hobbyRoutes);
app.use('/api/user', userRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok' });
});

app.use((err, req, res, next) => {
  logger.error('服务器错误', { error: err.message, stack: err.stack });
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: process.env.NODE_ENV === 'production' && status >= 500 ? '服务器内部错误' : err.message
  });
});

if (require.main === module) {
  try {
    db.init();
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`服务器运行在 http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    logger.error('数据库初始化失败:', err);
    process.exit(1);
  }
}

module.exports = app;
