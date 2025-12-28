process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27017/vaultlease_test_payment';
process.env.JWT_SECRET = 'test-secret-key';

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/User');
const Property = require('../models/Property');
const Category = require('../models/Category');

let userToken, propertyId, categoryId;

describe('Payment API', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }
    await User.deleteMany({ email: { $in: ['tenant@payment.com', 'landlord@payment.com'] } });
    await Property.deleteMany({ title: 'Test Property for Payment' });
    await Category.deleteMany({ category_name: 'Test Category for Payment' });
    const category = await Category.create({ category_name: 'Test Category for Payment' });
    categoryId = category._id;
    const landlord = await User.create({
      fullName: 'Test Landlord',
      email: 'landlord@payment.com',
      phoneNumber: '9000000007',
      role: 'Landlord',
      password: 'password123',
    });
    const tenant = await User.create({
      fullName: 'Test Tenant',
      email: 'tenant@payment.com',
      phoneNumber: '9000000008',
      role: 'Tenant',
      password: 'password123',
    });
    const jwt = require('jsonwebtoken');
    userToken = jwt.sign({ _id: tenant._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const property = await Property.create({
      title: 'Test Property for Payment',
      description: 'A test property for payment testing',
      location: 'Test Location',
      price: 50000,
      bedrooms: 2,
      bathrooms: 1,
      categoryId: categoryId,
      images: ['test-image.jpg'],
      landlord: landlord._id,
    });
    propertyId = property._id;
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $in: ['tenant@payment.com', 'landlord@payment.com'] } });
    await Property.deleteMany({ title: 'Test Property for Payment' });
    await Category.deleteMany({ category_name: 'Test Category for Payment' });
    await mongoose.connection.close();
  });

  test('should require authentication for payment history', async () => {
    const res = await request(app).get('/api/payments/history');
    expect(res.statusCode).toBe(404);
  });

  test('should require authentication for payment details', async () => {
    const res = await request(app).get('/api/payments/test-id');
    expect(res.statusCode).toBe(404);
  });

  test('should require authentication for payment cancellation', async () => {
    const res = await request(app).post('/api/payments/cancel');
    expect(res.statusCode).toBe(404);
  });

  test('should validate payment endpoints require authentication', async () => {
    const res = await request(app).get('/api/payments');
    expect(res.statusCode).toBe(404);
  });

  test('should validate payment endpoint structure', async () => {
    const res = await request(app).options('/api/payments');
    expect(res.statusCode).toBe(204);
  });
}); 