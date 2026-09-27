jest.mock('../database/db', () => ({
  get: jest.fn(),
  query: jest.fn(),
  run: jest.fn()
}));

const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const userRoutes = require('./user');

const app = express();
app.use(express.json());
app.use('/api/user', userRoutes);

const token = jwt.sign({ userId: 7 }, 'test-secret');
const auth = { Authorization: `Bearer ${token}` };

describe('user routes', () => {
  beforeEach(() => jest.clearAllMocks());

  test('rejects missing credentials with 401', async () => {
    const response = await request(app).get('/api/user/posts');
    expect(response.status).toBe(401);
  });

  test('returns 401 for an expired or invalid token', async () => {
    const response = await request(app)
      .get('/api/user/favorites')
      .set('Authorization', 'Bearer invalid');
    expect(response.status).toBe(401);
  });

  test('validates profile fields before updating', async () => {
    const response = await request(app)
      .put('/api/user/profile')
      .set(auth)
      .send({ nickname: ' ', major: '' });
    expect(response.status).toBe(400);
    expect(db.run).not.toHaveBeenCalled();
  });

  test('validates favorite type and id', async () => {
    const response = await request(app)
      .post('/api/user/favorites')
      .set(auth)
      .send({ postType: 'unknown', postId: -1 });
    expect(response.status).toBe(400);
    expect(db.run).not.toHaveBeenCalled();
  });

  test('does not expose database errors in production', async () => {
    process.env.NODE_ENV = 'production';
    db.query.mockRejectedValueOnce(new Error('private database details'));
    const response = await request(app).get('/api/user/posts').set(auth);
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ success: false, message: '服务器内部错误' });
    delete process.env.NODE_ENV;
  });
});
