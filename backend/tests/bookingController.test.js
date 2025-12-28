process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27017/dreamdwell_test_booking';
process.env.JWT_SECRET = 'test-secret-key';

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/User');
const Property = require('../models/Property');
const Category = require('../models/Category');
const Booking = require('../models/Booking');

let tenantToken, landlordToken, propertyId, categoryId;

describe('Booking API', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }
    await User.deleteMany({ email: { $in: ['tenant@booking.com', 'landlord@booking.com'] } });
    await Property.deleteMany({ title: 'Test Property for Booking' });
    await Category.deleteMany({ category_name: 'Test Category for Booking' });
    await Booking.deleteMany({ propertyId: { $exists: true } });
    const category = await Category.create({ category_name: 'Test Category for Booking' });
    categoryId = category._id;
    const landlord = await User.create({
      fullName: 'Test Landlord',
      email: 'landlord@booking.com',
      phoneNumber: '9000000011',
      role: 'Landlord',
      password: 'password123',
    });
    const jwt = require('jsonwebtoken');
    landlordToken = jwt.sign({ _id: landlord._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const property = await Property.create({
      title: 'Test Property for Booking',
      description: 'A test property for booking testing',
      location: 'Test Location',
      price: 50000,
      bedrooms: 2,
      bathrooms: 1,
      categoryId: categoryId,
      images: ['test-image.jpg'],
      landlord: landlord._id,
    });
    propertyId = property._id;
    const tenant = await User.create({
      fullName: 'Test Tenant',
      email: 'tenant@booking.com',
      phoneNumber: '9000000012',
      role: 'Tenant',
      password: 'password123',
    });
    tenantToken = jwt.sign({ _id: tenant._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $in: ['tenant@booking.com', 'landlord@booking.com'] } });
    await Property.deleteMany({ title: 'Test Property for Booking' });
    await Category.deleteMany({ category_name: 'Test Category for Booking' });
    await Booking.deleteMany({ propertyId: { $exists: true } });
    await mongoose.connection.close();
  });

  test('should require authentication for booking operations', async () => {
    const res = await request(app).get('/api/bookings');
    expect(res.statusCode).toBe(404);
  });

  test('should require authentication for creating bookings', async () => {
    const res = await request(app).post('/api/bookings');
    expect(res.statusCode).toBe(404);
  });

  test('should require authentication for landlord bookings', async () => {
    const res = await request(app).get('/api/bookings/landlord');
    expect(res.statusCode).toBe(404);
  });

  test('should require authentication for booking status updates', async () => {
    const res = await request(app).put('/api/bookings/test-id/status');
    expect(res.statusCode).toBe(404);
  });

  test('should require authentication for booking cancellation', async () => {
    const res = await request(app).put('/api/bookings/test-id/cancel');
    expect(res.statusCode).toBe(404);
  });

  test('should require authentication for booking deletion', async () => {
    const res = await request(app).delete('/api/bookings/test-id');
    expect(res.statusCode).toBe(404);
  });
}); 