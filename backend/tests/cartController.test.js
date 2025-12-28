process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27017/dreamdwell_test_cart';
process.env.JWT_SECRET = 'test-secret-key';

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/User');
const Property = require('../models/Property');
const Category = require('../models/Category');
const Cart = require('../models/cart');

let userToken, propertyId, categoryId;

describe('Cart API', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }
    await User.deleteMany({ email: 'user@cart.com' });
    await Property.deleteMany({ title: 'Test Property for Cart' });
    await Category.deleteMany({ category_name: 'Test Category for Cart' });
    await Cart.deleteMany({ userId: { $exists: true } });
    const category = await Category.create({ category_name: 'Test Category for Cart' });
    categoryId = category._id;
    const user = await User.create({
      fullName: 'Test User',
      email: 'user@cart.com',
      phoneNumber: '9000000016',
      role: 'Tenant',
      password: 'password123',
    });
    const jwt = require('jsonwebtoken');
    userToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const property = await Property.create({
      title: 'Test Property for Cart',
      description: 'A test property for cart testing',
      location: 'Test Location',
      price: 50000,
      bedrooms: 2,
      bathrooms: 1,
      categoryId: categoryId,
      images: ['test-image.jpg'],
      landlord: user._id,
    });
    propertyId = property._id;
  });

  afterAll(async () => {
    await User.deleteMany({ email: 'user@cart.com' });
    await Property.deleteMany({ title: 'Test Property for Cart' });
    await Category.deleteMany({ category_name: 'Test Category for Cart' });
    await Cart.deleteMany({ userId: { $exists: true } });
    await mongoose.connection.close();
  });

  test('should require authentication for cart operations', async () => {
    const res = await request(app).get('/api/cart');
    expect(res.statusCode).toBe(401);
  });

  test('should require authentication for adding to cart', async () => {
    const res = await request(app).post('/api/cart/add');
    expect(res.statusCode).toBe(401);
  });

  test('should require authentication for cart total', async () => {
    const res = await request(app).get('/api/cart/total');
    expect(res.statusCode).toBe(401);
  });

  test('should require authentication for clearing cart', async () => {
    const res = await request(app).delete('/api/cart/clear');
    expect(res.statusCode).toBe(401);
  });

  test('should validate cart operations require authentication', async () => {
    const res = await request(app).put('/api/cart/test-id');
    expect(res.statusCode).toBe(401);
  });
}); 