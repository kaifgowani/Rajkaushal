const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic info from signup form
  fullName:    { type: String, required: true },
  email:       { type: String, required: true, unique: true, lowercase: true },
  password:    { type: String, required: true },
  mobile:      { type: String },
  dob:         { type: String },
  gender:      { type: String },
  category:    { type: String },   // General / OBC / SC / ST
  aadhar:      { type: String },

  // Address
  state:       { type: String },
  district:    { type: String },
  address:     { type: String },

  // Education & Skills
  qualification: { type: String },
  skills:        [String],
  experience:    { type: String },

  // Job preferences
  jobType:     { type: String },   // Full-time / Part-time / Contract
  sector:      { type: String },

  // Inside your User schema
role: { 
    type: String, 
    enum: ['worker', 'employer', 'admin'], 
    default: 'worker' 
},

  createdAt:   { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
