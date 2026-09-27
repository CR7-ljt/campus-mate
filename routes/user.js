const express = require('express');
const router = express.Router();
const db = require('../database/db');
const jwt = require('jsonwebtoken');

function getUserId(req) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return null;
  return jwt.verify(token, process.env.JWT_SECRET).userId;
}

function handleError(res, error, message) {
  const isAuthError = error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError';
  if (isAuthError) {
    return res.status(401).json({ success: false, message: '登录状态已失效，请重新登录' });
  }
  const status = error.statusCode || 500;
  const safeMessage = process.env.NODE_ENV === 'production' && status >= 500 ? '服务器内部错误' : message;
  return res.status(status).json({ success: false, message: safeMessage });
}

router.put('/profile', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: '未登录' });
    const { nickname, grade, major, bio, campus } = req.body;
    if (!nickname?.trim() || !major?.trim()) {
      return res.status(400).json({ success: false, message: '请填写昵称和专业' });
    }

    await db.run(
      'UPDATE users SET nickname = ?, grade = ?, major = ?, bio = ?, campus = ? WHERE id = ?',
      [nickname.trim(), grade, major.trim(), bio || '', campus || '', userId]
    );

    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);

    res.json({
      success: true,
      message: '更新成功',
      user: {
        id: user.id,
        nickname: user.nickname,
        grade: user.grade,
        major: user.major,
        bio: user.bio,
        campus: user.campus,
        avatar: user.avatar,
        status: user.status
      }
    });
  } catch (error) {
    handleError(res, error, '更新失败');
  }
});

router.get('/posts', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: '未登录' });
    
    const competitions = await db.query('SELECT * FROM competitions WHERE user_id = ?', [userId]);
    const meals = await db.query('SELECT * FROM meals WHERE user_id = ?', [userId]);
    const hobbies = await db.query('SELECT * FROM hobbies WHERE user_id = ?', [userId]);

    const posts = [
      ...competitions.map(p => ({ ...p, postType: 'competition' })),
      ...meals.map(p => ({ ...p, postType: 'meal' })),
      ...hobbies.map(p => ({ ...p, postType: 'hobby' }))
    ];

    posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({ success: true, data: posts });
  } catch (error) {
    handleError(res, error, '获取发布失败');
  }
});

router.get('/favorites', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: '未登录' });
    const favorites = await db.query('SELECT * FROM favorites WHERE user_id = ?', [userId]);

    res.json({ success: true, data: favorites });
  } catch (error) {
    handleError(res, error, '获取收藏失败');
  }
});

router.post('/favorites', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: '未登录' });
    const { postType, postId } = req.body;
    if (!['competition', 'meal', 'hobby'].includes(postType) || !Number.isInteger(Number(postId)) || Number(postId) < 1) {
      return res.status(400).json({ success: false, message: '收藏信息无效' });
    }

    await db.run(
      'INSERT OR IGNORE INTO favorites (user_id, post_type, post_id) VALUES (?, ?, ?)',
      [userId, postType, Number(postId)]
    );

    res.json({ success: true, message: '收藏成功' });
  } catch (error) {
    handleError(res, error, '收藏失败');
  }
});

router.delete('/favorites/:id', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: '未登录' });
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ success: false, message: '收藏编号无效' });
    }

    await db.run('DELETE FROM favorites WHERE id = ? AND user_id = ?', [id, userId]);

    res.json({ success: true, message: '取消收藏成功' });
  } catch (error) {
    handleError(res, error, '取消收藏失败');
  }
});

module.exports = router;