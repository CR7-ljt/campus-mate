const express = require('express');
const router = express.Router();
const db = require('../database/db');
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    req.userId = null;
    return next();
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    req.userId = null;
    next();
  }
}

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { type } = req.query;
    let sql = 'SELECT h.*, u.nickname as author_nickname, u.grade as author_grade, u.major as author_major FROM hobbies h LEFT JOIN users u ON h.user_id = u.id';
    let params = [];
    
    if (type) {
      sql += ' WHERE h.type = ?';
      params.push(type);
    }

    const rows = await db.query(sql, params);

    const hobbies = rows.map(row => ({
      id: row.id,
      category: row.category,
      type: row.type,
      title: row.title,
      time: row.time,
      location: row.location,
      duration: row.duration,
      description: row.description,
      contact: row.contact,
      createdAt: row.created_at,
      author: {
        nickname: row.author_nickname,
        grade: row.author_grade,
        major: row.author_major
      }
    }));

    res.json({ success: true, data: hobbies });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取兴趣搭子数据失败', error: error.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const row = await db.get(
      'SELECT h.*, u.nickname as author_nickname, u.grade as author_grade, u.major as author_major FROM hobbies h LEFT JOIN users u ON h.user_id = u.id WHERE h.id = ?',
      [id]
    );

    if (!row) {
      return res.status(404).json({ success: false, message: '未找到该兴趣搭子' });
    }

    const hobby = {
      id: row.id,
      category: row.category,
      type: row.type,
      title: row.title,
      time: row.time,
      location: row.location,
      duration: row.duration,
      description: row.description,
      contact: row.contact,
      createdAt: row.created_at,
      author: {
        nickname: row.author_nickname,
        grade: row.author_grade,
        major: row.author_major
      }
    };

    res.json({ success: true, data: hobby });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取兴趣搭子详情失败', error: error.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: '请先登录' });
    }

    const { category, type, title, time, location, duration, description, contact } = req.body;

    if (!title || !contact) {
      return res.status(400).json({ success: false, message: '请填写标题和联系方式' });
    }

    const result = await db.run(
      'INSERT INTO hobbies (user_id, category, type, title, time, location, duration, description, contact) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.userId, category || 'other', type || 'other', title, time, location, duration || '短期', description, contact]
    );

    res.json({ success: true, message: '发布成功', id: result.lastID });
  } catch (error) {
    res.status(500).json({ success: false, message: '发布失败', error: error.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: '请先登录' });
    }

    const { id } = req.params;
    const { category, type, title, time, location, duration, description, contact } = req.body;

    const existing = await db.get('SELECT * FROM hobbies WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: '未找到该兴趣搭子' });
    }

    if (existing.user_id !== req.userId) {
      return res.status(403).json({ success: false, message: '无权限修改' });
    }

    await db.run(
      'UPDATE hobbies SET category = ?, type = ?, title = ?, time = ?, location = ?, duration = ?, description = ?, contact = ? WHERE id = ?',
      [category, type, title, time, location, duration, description, contact, id]
    );

    res.json({ success: true, message: '更新成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '更新失败', error: error.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: '请先登录' });
    }

    const { id } = req.params;

    const existing = await db.get('SELECT * FROM hobbies WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: '未找到该兴趣搭子' });
    }

    if (existing.user_id !== req.userId) {
      return res.status(403).json({ success: false, message: '无权限删除' });
    }

    await db.run('DELETE FROM hobbies WHERE id = ?', [id]);

    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: '删除失败', error: error.message });
  }
});

module.exports = router;