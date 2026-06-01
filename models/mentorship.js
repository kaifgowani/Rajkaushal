const mongoose = require('mongoose');
const mentorshipSchema = new mongoose.Schema({
    // Changed from studentId to workerId
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mentorName: { type: String, required: true },
    domain: { type: String, required: true },
    status: { type: String, enum: ['Requested', 'Active', 'Completed'], default: 'Requested' },
    progress: { type: Number, default: 0 },
    feedback: { type: String, default: '' }
}, { timestamps: true });
module.exports = mongoose.model('Mentorship', mentorshipSchema);