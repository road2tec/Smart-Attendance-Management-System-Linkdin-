const mongoose = require('mongoose');
const { Schema } = mongoose;

const AlertNotificationSchema = new Schema(
  {
    alertType: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    channel: {
      type: String,
      enum: ['email'],
      default: 'email',
      index: true,
    },
    recipients: [
      {
        type: String,
        trim: true,
      },
    ],
    triggeredCount: {
      type: Number,
      default: 0,
    },
    threshold: {
      type: Number,
      default: 0,
    },
    windowMinutes: {
      type: Number,
      default: 0,
    },
    sentAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

AlertNotificationSchema.index({ alertType: 1, channel: 1, sentAt: -1 });

module.exports = mongoose.model('AlertNotification', AlertNotificationSchema);
