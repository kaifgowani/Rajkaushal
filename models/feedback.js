// models/Feedback.js
const mongoose = require('mongoose');
const feedbackSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true }, // e.g., 'Portal', 'Counselling', 'Job Fair'
    rating: { type: Number, min: 1, max: 5, required: true },
    comments: { type: String, required: true }
}, { timestamps: true });
module.exports = mongoose.model('Feedback', feedbackSchema);
