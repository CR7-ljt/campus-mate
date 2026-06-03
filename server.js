require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database/db');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
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

app.get('/api/test', (req, res) => {
  logger.info('收到测试请求');
  res.json({ success: true, message: 'API正常工作' });
});

app.use((err, req, res, next) => {
  logger.error('服务器错误', { error: err.message, stack: err.stack });
  res.status(500).json({ success: false, message: '服务器错误', error: err.message });
});

try {
  db.init();
  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`服务器运行在 http://0.0.0.0:${PORT}`);
    logger.info(`本地访问地址: http://localhost:${PORT}`);
  });
} catch (err) {
  logger.error('数据库初始化失败:', err);
  process.exit(1);
}
