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
    let sql = 'SELECT c.*, u.nickname as author_nickname, u.grade as author_grade, u.major as author_major FROM competitions c LEFT JOIN users u ON c.user_id = u.id WHERE c.status = ?';
    let params = ['active'];
    
    if (type) {
        sql += ' AND c.type = ?';
        params.push(type);
    }
    
    if (keyword) {
        sql += ' AND (c.title LIKE ? OR c.competition_name LIKE ?)';
        params.push(`%${keyword}%`, `%${keyword}%`);
    }

    sql += ' ORDER BY c.urgent DESC, c.created_at DESC';

    const rows = await db.query(sql, params);

    const competitions = rows.map(row => ({
        id: row.id,
        type: row.type,
        title: row.title,
        competitionName: row.competition_name,
        maxMembers: row.max_members,
        currentMembers: row.current_members,
        skills: row.skills ? row.skills.split(',') : [],
        requirements: row.requirements,
        deadline: row.deadline,
        contact: row.contact,
        urgent: row.urgent === 1,
        createdAt: row.created_at,
        author: {
            nickname: row.author_nickname,
            grade: row.author_grade,
            major: row.author_major
        }
    }));

    res.json({ success: true, data: competitions });
}));

router.get('/:id', authenticateToken, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const row = await db.get(
        'SELECT c.*, u.nickname as author_nickname, u.grade as author_grade, u.major as author_major FROM competitions c LEFT JOIN users u ON c.user_id = u.id WHERE c.id = ? AND c.status = ?',
        [id, 'active']
    );

    if (!row) {
        throw new AppError('未找到该竞赛组队', 404);
    }

    const competition = {
        id: row.id,
        type: row.type,
        title: row.title,
        competitionName: row.competition_name,
        maxMembers: row.max_members,
        currentMembers: row.current_members,
        skills: row.skills ? row.skills.split(',') : [],
        requirements: row.requirements,
        deadline: row.deadline,
        contact: row.contact,
        urgent: row.urgent === 1,
        createdAt: row.created_at,
        author: {
            nickname: row.author_nickname,
            grade: row.author_grade,
            major: row.author_major
        }
    };

    res.json({ success: true, data: competition });
}));

router.post('/', authenticateToken, catchAsync(async (req, res, next) => {
    requireAuth(req, res, next);
    
    const { type, title, competitionName, maxMembers, currentMembers, skills, requirements, deadline, contact, urgent } = req.body;

    if (!title || !contact) {
        throw new AppError('请填写标题和联系方式', 400);
    }

    const result = await db.run(
        'INSERT INTO competitions (user_id, type, title, competition_name, max_members, current_members, skills, requirements, deadline, contact, urgent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [req.userId, type || 'other', title, competitionName, maxMembers || 5, currentMembers || 1, skills, requirements, deadline, contact, urgent ? 1 : 0]
    );

    logger.info('发布竞赛组队', { userId: req.userId, postId: result.lastID });
    
    res.status(201).json({ success: true, message: '发布成功', id: result.lastID });
}));

router.put('/:id', authenticateToken, catchAsync(async (req, res, next) => {
    requireAuth(req, res, next);
    
    const { id } = req.params;
    const { title, competitionName, maxMembers, currentMembers, skills, requirements, deadline, contact, urgent, status } = req.body;

    const existing = await db.get('SELECT * FROM competitions WHERE id = ?', [id]);
    if (!existing) {
        throw new AppError('未找到该竞赛组队', 404);
    }

    if (existing.user_id !== req.userId) {
        throw new AppError('无权限修改', 403);
    }

    await db.run(
        'UPDATE competitions SET title = ?, competition_name = ?, max_members = ?, current_members = ?, skills = ?, requirements = ?, deadline = ?, contact = ?, urgent = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [title, competitionName, maxMembers, currentMembers, skills, requirements, deadline, contact, urgent ? 1 : 0, status || 'active', id]
    );

    logger.info('更新竞赛组队', { userId: req.userId, postId: id });
    
    res.json({ success: true, message: '更新成功' });
}));

router.delete('/:id', authenticateToken, catchAsync(async (req, res, next) => {
    requireAuth(req, res, next);
    
    const { id } = req.params;

    const existing = await db.get('SELECT * FROM competitions WHERE id = ?', [id]);
    if (!existing) {
        throw new AppError('未找到该竞赛组队', 404);
    }

    if (existing.user_id !== req.userId) {
        throw new AppError('无权限删除', 403);
    }

    await db.run('DELETE FROM competitions WHERE id = ?', [id]);

    logger.info('删除竞赛组队', { userId: req.userId, postId: id });
    
    res.json({ success: true, message: '删除成功' });
}));

module.exports = router;