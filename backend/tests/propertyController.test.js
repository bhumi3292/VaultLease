process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27017/dreamdwell_test_property';
process.env.JWT_SECRET = 'test-secret-key';

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/User');
const Property = require('../models/Property');
const Category = require('../models/Category');

let landlordToken, categoryId, propertyId;

describe('Property API', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }
    await User.deleteMany({ email: 'landlord@property.com' });
    await Property.deleteMany({ title: { $regex: /Test Property/ } });
    await Category.deleteMany({ category_name: { $regex: /Test Category/ } });
    const category = await Category.create({ category_name: 'Test Category for Property' });
    categoryId = category._id;
    const landlord = await User.create({
      fullName: 'Test Landlord',
      email: 'landlord@property.com',
      phoneNumber: '9000000009',
      role: 'Landlord',
      password: 'password123',
    });
    const jwt = require('jsonwebtoken');
    landlordToken = jwt.sign({ _id: landlord._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await User.deleteMany({ email: 'landlord@property.com' });
    await Property.deleteMany({ title: { $regex: /Test Property/ } });
    await Category.deleteMany({ category_name: { $regex: /Test Category/ } });
    await mongoose.connection.close();
  });

  test('should get all properties', async () => {
    const res = await request(app).get('/api/properties');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('should get properties with pagination', async () => {
    const res = await request(app).get('/api/properties?page=1&limit=10');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('should search properties', async () => {
    const res = await request(app).get('/api/properties?search=test');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('should filter properties by price', async () => {
    const res = await request(app).get('/api/properties?minPrice=1000&maxPrice=100000');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('should filter properties by category', async () => {
    const res = await request(app).get(`/api/properties?category=${categoryId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
}); 