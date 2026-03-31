const mongoose = require('mongoose');
const { Schema } = mongoose;

const LogSchema = new Schema({
  type: {
    type: String,
    enum: ['fake_attempt', 'unknown_face', 'system_error', 'unauthorized_access'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User' // Might be null for unknown_face
  },
  class: {
    type: Schema.Types.ObjectId,
    ref: 'Class'
  },
  details: {
    message: String,
    antiSpoofScore: Number,
    verificationScore: Number,
    ipAddress: String
  },
  imageUrl: {
    type: String // URL to the captured face that triggered the alert
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Log', LogSchema);
