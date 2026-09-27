const express = require('express');
const router = express.Router();
const db = require('../database/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const getSecret = (name, developmentFallback) => {
    const secret = process.env[name];
    if (secret) return secret;
    if (process.env.NODE_ENV === 'production') {
        throw new Error(`${name} is required in production`);
    }
    return developmentFallback;
};

const createTokens = (userId) => {
    const accessToken = jwt.sign({ userId }, getSecret('JWT_SECRET', 'local-development-access-secret'), { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId }, getSecret('JWT_REFRESH_SECRET', 'local-development-refresh-secret'), { expiresIn: '7d' });
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    
    return { accessToken, refreshToken, expiresAt };
};

const getUserData = (user) => {
    return {
        id: user.id,
        nickname: user.nickname,
        grade: user.grade,
        major: user.major,
        bio: user.bio,
        campus: user.campus,
        avatar: user.avatar,
        status: user.status
    };
};

router.post('/register', async (req, res) => {
    try {
        const { nickname, password, grade, major, bio, campus } = req.body;
        logger.info('收到注册请求', { nickname });
        
        if (!nickname || !password || !grade || !major) {
            return res.status(400).json({ success: false, message: '请填写完整信息' });
        }
        
        const existing = db.get('SELECT * FROM users WHERE nickname = ?', [nickname]);
        if (existing) {
            return res.status(400).json({ success: false, message: '该昵称已被使用' });
        }

        const hashedPassword = bcrypt.hashSync(password, 12);
        
        const result = db.run(
            'INSERT INTO users (nickname, password, grade, major, bio, campus, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nickname, hashedPassword, grade, major, bio || '', campus || '', 'online']
        );

        const user = db.get('SELECT * FROM users WHERE id = ?', [result.lastID]);
        
        const { accessToken, refreshToken, expiresAt } = createTokens(user.id);
        
        db.run('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)', [user.id, refreshToken, expiresAt]);

        logger.info('用户注册成功', { userId: user.id, nickname });
        
        res.status(201).json({
            success: true,
            message: '注册成功',
            accessToken,
            refreshToken,
            user: getUserData(user)
        });
    } catch (error) {
        logger.error('注册失败', { error: error.message, stack: error.stack });
        res.status(500).json({ success: false, message: process.env.NODE_ENV === 'production' ? '注册失败，请稍后重试' : '注册失败：' + error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { nickname, password } = req.body;
        logger.info('收到登录请求', { nickname });
        
        if (!nickname || !password) {
            return res.status(400).json({ success: false, message: '请填写完整信息' });
        }
        
        const user = db.get('SELECT * FROM users WHERE nickname = ?', [nickname]);
        
        if (!user) {
            return res.status(401).json({ success: false, message: '用户名或密码错误' });
        }

        const isPasswordValid = bcrypt.compareSync(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: '用户名或密码错误' });
        }

        db.run('UPDATE users SET status = ? WHERE id = ?', ['online', user.id]);

        const { accessToken, refreshToken, expiresAt } = createTokens(user.id);
        
        db.run('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)', [user.id, refreshToken, expiresAt]);

        logger.info('用户登录成功', { userId: user.id, nickname });
        
        res.json({
            success: true,
            message: '登录成功',
            accessToken,
            refreshToken,
            user: getUserData(user)
        });
    } catch (error) {
        logger.error('登录失败', { error: error.message, stack: error.stack });
        res.status(500).json({ success: false, message: process.env.NODE_ENV === 'production' ? '登录失败，请稍后重试' : '登录失败：' + error.message });
    }
});

router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(401).json({ success: false, message: '缺少refresh token' });
        }

        let decoded;
        try {
            decoded = jwt.verify(refreshToken, getSecret('JWT_REFRESH_SECRET', 'local-development-refresh-secret'));
        } catch (err) {
            return res.status(401).json({ success: false, message: '无效的refresh token' });
        }

        const tokenRecord = db.get('SELECT * FROM refresh_tokens WHERE user_id = ? AND token = ?', [decoded.userId, refreshToken]);
        
        if (!tokenRecord) {
            return res.status(401).json({ success: false, message: 'refresh token不存在' });
        }

        const user = db.get('SELECT * FROM users WHERE id = ?', [decoded.userId]);
        
        if (!user) {
            return res.status(401).json({ success: false, message: '用户不存在' });
        }

        const { accessToken, refreshToken: newRefreshToken, expiresAt } = createTokens(user.id);
        
        db.run('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);
        db.run('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)', [user.id, newRefreshToken, expiresAt]);

        res.json({
            success: true,
            accessToken,
            refreshToken: newRefreshToken
        });
    } catch (error) {
        logger.error('刷新token失败', { error: error.message });
        res.status(500).json({ success: false, message: '刷新token失败' });
    }
});

router.post('/logout', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.json({ success: true, message: '退出成功' });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, getSecret('JWT_SECRET', 'local-development-access-secret'));
        } catch (err) {
            return res.json({ success: true, message: '退出成功' });
        }

        db.run('UPDATE users SET status = ? WHERE id = ?', ['offline', decoded.userId]);
        db.run('DELETE FROM refresh_tokens WHERE user_id = ?', [decoded.userId]);

        logger.info('用户退出登录', { userId: decoded.userId });
        
        res.json({ success: true, message: '退出成功' });
    } catch (error) {
        logger.error('退出登录失败', { error: error.message });
        res.json({ success: true, message: '退出成功' });
    }
});

router.get('/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ success: false, message: '未登录' });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, getSecret('JWT_SECRET', 'local-development-access-secret'));
        } catch (err) {
            return res.status(401).json({ success: false, message: 'token已过期或无效' });
        }
        
        const user = db.get('SELECT * FROM users WHERE id = ?', [decoded.userId]);

        if (!user) {
            return res.status(401).json({ success: false, message: '用户不存在' });
        }

        res.json({
            success: true,
            user: getUserData(user)
        });
    } catch (error) {
        logger.error('获取用户信息失败', { error: error.message });
        res.status(500).json({ success: false, message: '获取用户信息失败' });
    }
});

module.exports = router;
