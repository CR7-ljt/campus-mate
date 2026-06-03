const express = require('express');
const router = express.Router();
const db = require('../database/db');
const jwt = require('jsonwebtoken');

router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { nickname, grade, major, bio, campus } = req.body;

    await db.run(
      'UPDATE users SET nickname = ?, grade = ?, major = ?, bio = ?, campus = ? WHERE id = ?',
      [nickname, grade, major, bio, campus, decoded.userId]
    );

    const user = await db.get('SELECT * FROM users WHERE id = ?', [decoded.userId]);

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
    res.status(500).json({ success: false, message: '更新失败', error: error.message });
  }
});

router.get('/posts', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const competitions = await db.query('SELECT * FROM competitions WHERE user_id = ?', [decoded.userId]);
    const meals = await db.query('SELECT * FROM meals WHERE user_id = ?', [decoded.userId]);
    const hobbies = await db.query('SELECT * FROM hobbies WHERE user_id = ?', [decoded.userId]);

    const posts = [
      ...competitions.map(p => ({ ...p, postType: 'competition' })),
      ...meals.map(p => ({ ...p, postType: 'meal' })),
      ...hobbies.map(p => ({ ...p, postType: 'hobby' }))
    ];

    posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取发布失败', error: error.message });
  }
});

router.get('/favorites', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const favorites = await db.query('SELECT * FROM favorites WHERE user_id = ?', [decoded.userId]);

    res.json({ success: true, data: favorites });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取收藏失败', error: error.message });
  }
});

router.post('/favorites', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { postType, postId } = req.body;

    await db.run(
      'INSERT OR IGNORE INTO favorites (user_id, post_type, post_id) VALUES (?, ?, ?)',
      [decoded.userId, postType, postId]
    );

    res.json({ success: true, message: '收藏成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '收藏失败', error: error.message });
  }
});

router.delete('/favorites/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id } = req.params;

    await db.run('DELETE FROM favorites WHERE id = ? AND user_id = ?', [id, decoded.userId]);

    res.json({ success: true, message: '取消收藏成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '取消收藏失败', error: error.message });
  }
});

module.exports = router;