const mongoose = require('mongoose');
const counsellingSchema = new mongoose.Schema({
    // Changed from studentId to workerId
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    counsellorName: { type: String, required: true },
    type: { type: String, enum: ['Career Guidance', 'Skill Development', 'Psychological'], required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' },
    notes: { type: String, default: '' }
}, { timestamps: true });
module.exports = mongoose.model('CounsellingSession', counsellingSchema);
