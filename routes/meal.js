const express = require('express');
const router = express.Router();
const db = require('../database/db');
const jwt = require('jsonwebtoken');
const { AppError, catchAsync } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

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

function requireAuth(req, res, next) {
    if (!req.userId) {
        throw new AppError('请先登录', 401);
    }
    next();
}

router.get('/', authenticateToken, catchAsync(async (req, res, next) => {
    const { type, keyword } = req.query;
    let sql = 'SELECT m.*, u.nickname as author_nickname, u.grade as author_grade, u.major as author_major FROM meals m LEFT JOIN users u ON m.user_id = u.id WHERE m.status = ?';
    let params = ['active'];
    
    if (type) {
        sql += ' AND m.type = ?';
        params.push(type);
    }
    
    if (keyword) {
        sql += ' AND (m.title LIKE ? OR m.location LIKE ?)';
        params.push(`%${keyword}%`, `%${keyword}%`);
    }

    sql += ' ORDER BY m.created_at DESC';

    const rows = db.query(sql, params);

    const meals = rows.map(row => ({
        id: row.id,
        type: row.type,
        title: row.title,
        time: row.time,
        location: row.location,
        preference: row.preference,
        note: row.note,
        contact: row.contact,
        createdAt: row.created_at,
        author: {
            nickname: row.author_nickname,
            grade: row.author_grade,
            major: row.author_major
        }
    }));

    res.json({ success: true, data: meals });
}));

router.get('/:id', authenticateToken, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const row = db.get(
        'SELECT m.*, u.nickname as author_nickname, u.grade as author_grade, u.major as author_major FROM meals m LEFT JOIN users u ON m.user_id = u.id WHERE m.id = ? AND m.status = ?',
        [id, 'active']
    );

    if (!row) {
        throw new AppError('未找到该吃饭搭子', 404);
    }

    const meal = {
        id: row.id,
        type: row.type,
        title: row.title,
        time: row.time,
        location: row.location,
        preference: row.preference,
        note: row.note,
        contact: row.contact,
        createdAt: row.created_at,
        author: {
            nickname: row.author_nickname,
            grade: row.author_grade,
            major: row.author_major
        }
    };

    res.json({ success: true, data: meal });
}));

router.post('/', authenticateToken, catchAsync(async (req, res, next) => {
    requireAuth(req, res, next);
    
    const { type, title, time, location, preference, note, contact } = req.body;

    if (!title || !contact) {
        throw new AppError('请填写标题和联系方式', 400);
    }

    const result = db.run(
        'INSERT INTO meals (user_id, type, title, time, location, preference, note, contact) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [req.userId, type || 'canteen', title, time, location, preference, note, contact]
    );

    logger.info('发布吃饭搭子', { userId: req.userId, postId: result.lastID });
    
    res.status(201).json({ success: true, message: '发布成功', id: result.lastID });
}));

router.put('/:id', authenticateToken, catchAsync(async (req, res, next) => {
    requireAuth(req, res, next);
    
    const { id } = req.params;
    const { title, time, location, preference, note, contact, status } = req.body;

    const existing = db.get('SELECT * FROM meals WHERE id = ?', [id]);
    if (!existing) {
        throw new AppError('未找到该吃饭搭子', 404);
    }

    if (existing.user_id !== req.userId) {
        throw new AppError('无权限修改', 403);
    }

    db.run(
        'UPDATE meals SET title = ?, time = ?, location = ?, preference = ?, note = ?, contact = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [title, time, location, preference, note, contact, status || 'active', id]
    );

    logger.info('更新吃饭搭子', { userId: req.userId, postId: id });
    
    res.json({ success: true, message: '更新成功' });
}));

router.delete('/:id', authenticateToken, catchAsync(async (req, res, next) => {
    requireAuth(req, res, next);
    
    const { id } = req.params;

    const existing = db.get('SELECT * FROM meals WHERE id = ?', [id]);
    if (!existing) {
        throw new AppError('未找到该吃饭搭子', 404);
    }

    if (existing.user_id !== req.userId) {
        throw new AppError('无权限删除', 403);
    }

    db.run('DELETE FROM meals WHERE id = ?', [id]);

    logger.info('删除吃饭搭子', { userId: req.userId, postId: id });
    
    res.json({ success: true, message: '删除成功' });
}));

module.exports = router;