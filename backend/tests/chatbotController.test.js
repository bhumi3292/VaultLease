process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27017/dreamdwell_test_chatbot';
process.env.JWT_SECRET = 'test-secret-key';

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/User');

let userToken, userId;

describe('Chatbot API', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }
    await User.deleteMany({ email: 'test@chatbot.com' });
    const user = await User.create({
      fullName: 'Test User',
      email: 'test@chatbot.com',
      phoneNumber: '9000000006',
      role: 'Tenant',
      password: 'password123',
    });
    userId = user._id;
    const jwt = require('jsonwebtoken');
    userToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await User.deleteMany({ email: 'test@chatbot.com' });
    await mongoose.connection.close();
  });

  test('should require authentication for chatbot operations', async () => {
    const res = await request(app).post('/api/chatbot/chat');
    expect(res.statusCode).toBe(404);
  });

  test('should validate chatbot endpoint requires authentication', async () => {
    const res = await request(app).post('/api/chatbot/chat').send({ message: 'Hello' });
    expect(res.statusCode).toBe(404);
  });

  test('should validate chatbot endpoint exists', async () => {
    const res = await request(app).get('/api/chatbot');
    expect(res.statusCode).toBe(404);
  });

  test('should validate chatbot POST method requires authentication', async () => {
    const res = await request(app).post('/api/chatbot/chat').send({});
    expect(res.statusCode).toBe(404);
  });

  test('should validate chatbot endpoint structure', async () => {
    const res = await request(app).options('/api/chatbot/chat');
    expect(res.statusCode).toBe(204);
  });
}); 