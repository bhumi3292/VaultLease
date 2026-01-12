const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  department_name: { type: String, required: true, unique: true },
  description: { type: String, required: false },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  image: { type: String, required: false }
}, { timestamps: true });

const Department = mongoose.model('Department', departmentSchema);
module.exports = Department;
// (Duplicate schema block removed — original, fuller schema above is used.)
