const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  specialization: String,
  incubatorName: String,
  contactNumber: String
});

module.exports = mongoose.model('Admin', adminSchema);
