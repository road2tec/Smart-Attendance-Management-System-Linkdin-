const mongoose = require('mongoose');
const { Schema } = mongoose;

const RecognitionAttemptSchema = new Schema(
  {
    endpoint: {
      type: String,
      default: 'find-closest-match',
    },
    source: {
      type: String,
      default: 'web-client',
    },
    resultType: {
      type: String,
      enum: ['matched', 'unknown', 'error'],
      required: true,
    },
    similarity: {
      type: Number,
      min: 0,
      max: 1,
      default: null,
    },
    threshold: {
      type: Number,
      min: 0,
      max: 1,
      default: null,
    },
    matchedUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    classroom: {
      type: Schema.Types.ObjectId,
      ref: 'Classroom',
      default: null,
    },
    class: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      default: null,
    },
    embeddingLength: {
      type: Number,
      default: 0,
    },
    note: {
      type: String,
      default: '',
      trim: true,
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

RecognitionAttemptSchema.index({ createdAt: -1 });
RecognitionAttemptSchema.index({ resultType: 1, createdAt: -1 });

module.exports = mongoose.model('RecognitionAttempt', RecognitionAttemptSchema);
