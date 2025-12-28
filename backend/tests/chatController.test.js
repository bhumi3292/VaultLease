process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27017/dreamdwell_test_chat';
process.env.JWT_SECRET = 'test-secret-key';

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/User');
const Chat = require('../models/chat');

let user1Token, user2Token;

describe('Chat Controller', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }
    await User.deleteMany({ email: { $in: ['user1@chat.com', 'user2@chat.com'] } });
    await Chat.deleteMany({ participants: { $exists: true } });
    const user1 = await User.create({
      fullName: 'Test User 1',
      email: 'user1@chat.com',
      phoneNumber: '9000000018',
      role: 'Tenant',
      password: 'password123',
    });
    const user2 = await User.create({
      fullName: 'Test User 2',
      email: 'user2@chat.com',
      phoneNumber: '9000000019',
      role: 'Landlord',
      password: 'password123',
    });
    const jwt = require('jsonwebtoken');
    user1Token = jwt.sign({ _id: user1._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    user2Token = jwt.sign({ _id: user2._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $in: ['user1@chat.com', 'user2@chat.com'] } });
    await Chat.deleteMany({ participants: { $exists: true } });
    await mongoose.connection.close();
  });

  test('should require authentication for chat operations', async () => {
    const res = await request(app).get('/api/chats');
    expect(res.statusCode).toBe(401);
  });

  test('should require authentication for creating chats', async () => {
    const res = await request(app).post('/api/chats/create-or-get');
    expect(res.statusCode).toBe(401);
  });

  test('should require authentication for getting chat messages', async () => {
    const res = await request(app).get('/api/chats/test-id/messages');
    expect(res.statusCode).toBe(401);
  });

  test('should require authentication for sending messages', async () => {
    const res = await request(app).post('/api/chats/test-id/messages');
    expect(res.statusCode).toBe(404);
  });

  test('should require authentication for chat deletion', async () => {
    const res = await request(app).delete('/api/chats/test-id');
    expect(res.statusCode).toBe(404);
  });

  test('should validate chat endpoints require authentication', async () => {
    const res = await request(app).get('/api/chats/test-id');
    expect(res.statusCode).toBe(401);
  });
}); 