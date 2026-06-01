const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  company:     { type: String, required: true },
  location:    { type: String, required: true },
  district:    { type: String },
  state:       { type: String, default: 'Rajasthan' },
  sector:      { type: String },           // IT, Agriculture, Construction, etc.
  jobType:     { type: String },           // Full-time, Part-time, Contract
  salary:      { type: String },           // e.g. "₹15,000 - ₹25,000/month"
  description: { type: String },
  requirements:[String],
  vacancies:   { type: Number, default: 1 },
  postedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive:    { type: Boolean, default: true },
  createdAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', jobSchema);
