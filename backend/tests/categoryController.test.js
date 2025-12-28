process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27017/dreamdwell_test_category';
process.env.JWT_SECRET = 'test-secret-key';

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const Category = require('../models/Category');
const User = require('../models/User');
let landlordToken, categoryId;

describe('Category API', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }
    await Category.deleteMany({ category_name: { $in: ['Test Category', 'Updated Test Category'] } });
    await User.deleteMany({ email: 'landlord@category.com' });
    // Create a landlord user and get token
    const landlord = await User.create({
      fullName: 'Landlord Category',
      email: 'landlord@category.com',
      phoneNumber: '9000000005',
      role: 'Landlord',
      password: 'password123',
    });
    const jwt = require('jsonwebtoken');
    landlordToken = jwt.sign({ _id: landlord._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await Category.deleteMany({ category_name: { $in: ['Test Category', 'Updated Test Category'] } });
    await User.deleteMany({ email: 'landlord@category.com' });
    await mongoose.connection.close();
  });

  test('should create a new category', async () => {
    const res = await request(app)
      .post('/api/category')
      .set('Authorization', `Bearer ${landlordToken}`)
      .send({ name: 'Test Category' });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');
    expect(res.body.data.category_name).toBe('Test Category');
    categoryId = res.body.data._id;
  });

  test('should not create duplicate category', async () => {
    const res = await request(app)
      .post('/api/category')
      .set('Authorization', `Bearer ${landlordToken}`)
      .send({ name: 'Test Category' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Category already exists');
  });

  test('should get all categories', async () => {
    const res = await request(app).get('/api/category');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('should get a category by id', async () => {
    const res = await request(app).get(`/api/category/${categoryId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id', categoryId);
    expect(res.body.data.category_name).toBe('Test Category');
  });

  test('should return 404 for non-existent category', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/category/${fakeId}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Category not found');
  });

  test('should update a category', async () => {
    const res = await request(app)
      .put(`/api/category/${categoryId}`)
      .set('Authorization', `Bearer ${landlordToken}`)
      .send({ name: 'Updated Test Category' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.category_name).toBe('Updated Test Category');
  });

  test('should return 404 when updating non-existent category', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/category/${fakeId}`)
      .set('Authorization', `Bearer ${landlordToken}`)
      .send({ name: 'Non-existent Category' });
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Category not found');
  });

  test('should delete a category', async () => {
    const res = await request(app)
      .delete(`/api/category/${categoryId}`)
      .set('Authorization', `Bearer ${landlordToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Category deleted');
  });

  test('should return 404 for deleted category', async () => {
    const res = await request(app).get(`/api/category/${categoryId}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Category not found');
  });

  test('should return 404 when deleting non-existent category', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .delete(`/api/category/${fakeId}`)
      .set('Authorization', `Bearer ${landlordToken}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Category not found');
  });
}); 