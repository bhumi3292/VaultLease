const connectDB = require('../config/db');
const Department = require('../models/Department');
const Space = require('../models/Space');
const mongoose = require('mongoose');
require('dotenv').config();

async function seed() {
  try {
    await connectDB();
    console.log('Connected to DB for seeding.');

    // Clear existing
    // Drop legacy 'name' unique index if it exists (prevents duplicate-null index errors)
    try {
      const existingIndexes = await Department.collection.indexes();
      const nameIndex = existingIndexes.find(idx => idx.key && idx.key.name === 1);
      if (nameIndex) {
        await Department.collection.dropIndex('name_1');
        console.log("Dropped legacy index 'name_1' on departments collection.");
      }
    } catch (dropErr) {
      console.warn('Could not drop legacy index (it may not exist):', dropErr.message);
    }

    await Department.deleteMany({});
    await Space.deleteMany({});

    const departments = [
      { department_name: 'Physics Department', description: 'Physics labs and lecture halls' },
      { department_name: 'Computer Science Department', description: 'Labs for CS and AI projects' },
      { department_name: 'Chemistry Department', description: 'Chemistry labs and prep rooms' },
    ];

    const created = await Department.insertMany(departments);
    console.log('Created departments:', created.map(d => d.department_name));

    const spaces = [
      { roomName: 'Physics Lab A', roomDescription: 'Undergraduate physics lab with 30 workstations', departmentId: created[0]._id, capacity: 30 },
      { roomName: 'CS Lab 101', roomDescription: 'Computer lab with Linux workstations and GPUs', departmentId: created[1]._id, capacity: 40 },
      { roomName: 'Chemistry Lab B', roomDescription: 'Chemistry wet lab with fume hoods', departmentId: created[2]._id, capacity: 20 },
    ];

    const createdSpaces = await Space.insertMany(spaces);
    console.log('Created spaces:', createdSpaces.map(s => s.roomName));

    console.log('Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
