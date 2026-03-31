const mongoose = require('mongoose');
const { Schema } = mongoose;

const AnnouncementSchema = new Schema({
  message: {
    type: String,
    required: true
  },
  postedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const QuestionSchema = new Schema({
    id: { type: String, required: true },
    text: { type: String, required: true },
    type: { type: String, enum: ['MCQ', 'subjective', 'true-false'], default: 'subjective' },
    options: [String], // Only for MCQ
    correctAnswer: String, // Correct index for MCQ or key string
    marks: { type: Number, default: 10 }
});

const AssessmentSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Quiz', 'Assignment', 'Exam', 'Internal', 'External', 'Practical'],
        default: 'Quiz'
    },
    date: {
        type: Date,
        default: Date.now
    },
    dueDate: {
        type: Date,
        default: Date.now
    },
    description: String,
    instructions: String,
    totalMarks: {
        type: Number,
        default: 100
    },
    questions: [QuestionSchema],
    status: {
        type: String,
        enum: ['draft', 'published', 'concluded'],
        default: 'published'
    }
});

const ClassroomSchema = new Schema({
  department: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  assignedTeacher: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  group: {
    type: Schema.Types.ObjectId,
    ref: 'Group'
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course'
  },
  assignedStudents: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  classes: [{
    class: {
      type: Schema.Types.ObjectId,
      ref: 'Class'
    },
    status: {
      type: String,
      enum: ['scheduled', 'in-progress', 'completed', 'cancelled', 'rescheduled'],
      default: 'scheduled'
    }, attendanceWindow: {
      isOpen: {
        type: Boolean,
        default: false
      },
      openedAt: {
        type: Date
      },
      closesAt: {
        type: Date
      },
      openedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    },
    notes: String
  }],
  sharedResources: [{
    type: Schema.Types.ObjectId,
    ref: 'Resource'
  }],
  announcements: [AnnouncementSchema],
  assessments: [AssessmentSchema],
}, {
  timestamps: true
});

// Check if attendance window is open for a specific class
ClassroomSchema.methods.isAttendanceWindowOpen = function(classId, classObj = null) {
  const classEntry = this.classes.find(c => c.class._id.toString() === classId.toString());
  
  if (!classEntry || !classEntry.attendanceWindow || !classEntry.attendanceWindow.isOpen) return false;

  const now = new Date();
  
  // 1. Check the manual window closure time
  const { openedAt, closesAt } = classEntry.attendanceWindow;
  if (closesAt && now > closesAt) return false;
  if (openedAt && now < openedAt) return false;

  // 2. [New Requirement] Check if the actual scheduled class period has ended
  if (classObj && classObj.schedule && classObj.schedule.endTime) {
    const [endHours, endMinutes] = classObj.schedule.endTime.split(':').map(Number);
    const scheduledEnd = new Date(now);
    scheduledEnd.setHours(endHours, endMinutes, 0, 0);

    // If it's currently past the scheduled end time (with a tiny 1-minute buffer for sync)
    if (now > new Date(scheduledEnd.getTime() + 60000)) {
        console.log(`[Strict Time Lock] Attendance rejected. Current: ${now.toLocaleTimeString()}, Scheduled End: ${scheduledEnd.toLocaleTimeString()}`);
        return false;
    }
  }

  return true;
};

// Open attendance window for a specific class
ClassroomSchema.methods.openAttendanceWindow = async function(classId, teacherId, duration) {
  // Find the class in the classroom's classes array
  const classIndex = this.classes.findIndex(c => c.class.toString() === classId.toString());
  
  if (classIndex === -1) {
    throw new Error('Class not found in this classroom');
  }
  
  // Set up window open/close times
  const now = new Date();
  const closesAt = duration ? new Date(now.getTime() + duration * 60000) : null; // duration in minutes
  
  // Update the attendance window
  this.classes[classIndex].attendanceWindow = {
    isOpen: true,
    openedAt: now,
    closesAt: closesAt,
    openedBy: teacherId
  };
  
  // Update class status to in-progress if it was scheduled
  if (this.classes[classIndex].status === 'scheduled') {
    this.classes[classIndex].status = 'in-progress';
  }
  
  // Save the changes
  await this.save();
  
  return {
    isOpen: true,
    openedAt: now,
    closesAt: closesAt
  };
};

// Close attendance window for a specific class
ClassroomSchema.methods.closeAttendanceWindow = async function(classId) {
  // Find the class in the classroom's classes array
  const classIndex = this.classes.findIndex(c => c.class.toString() === classId.toString());
  
  if (classIndex === -1) {
    throw new Error('Class not found in this classroom');
  }
  
  // Check if window is actually open
  if (!this.classes[classIndex].attendanceWindow || !this.classes[classIndex].attendanceWindow.isOpen) {
    throw new Error('Attendance window is not open for this class');
  }
  
  // Close the window
  this.classes[classIndex].attendanceWindow.isOpen = false;
  
  // Save the changes
  await this.save();
  
  return {
    isOpen: false,
    closedAt: new Date()
  };
};

module.exports = mongoose.model('Classroom', ClassroomSchema);
