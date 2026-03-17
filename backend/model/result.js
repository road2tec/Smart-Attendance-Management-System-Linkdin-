const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  assessmentName: {
    type: String,
    required: true,
    trim: true,
  },
  examType: {
    type: String,
    enum: ['quiz', 'assignment', 'internal', 'midterm', 'final', 'practical', 'other'],
    default: 'internal',
  },
  totalMarks: {
    type: Number,
    required: true,
    min: 1,
  },
  obtainedMarks: {
    type: Number,
    required: true,
    min: 0,
  },
  remarks: {
    type: String,
    trim: true,
    default: '',
  },
  publishedAt: {
    type: Date,
    default: Date.now,
  },
  classroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom',
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updateHistory: [
    {
      changedAt: {
        type: Date,
        default: Date.now,
      },
      changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      changes: {
        obtainedMarks: {
          from: Number,
          to: Number,
        },
        remarks: {
          from: String,
          to: String,
        },
        examType: {
          from: String,
          to: String,
        },
        totalMarks: {
          from: Number,
          to: Number,
        },
        publishedAt: {
          from: Date,
          to: Date,
        },
      },
    },
  ],
}, {
  timestamps: true,
});

resultSchema.index(
  { classroom: 1, student: 1, assessmentName: 1 },
  { unique: true }
);

module.exports = mongoose.model('Result', resultSchema);