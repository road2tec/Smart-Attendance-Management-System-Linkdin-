const Attendance = require('../model/attendance');
const User = require('../model/user');
const Class = require('../model/class');

class AnalyticsService {
    async getDefaulters(courseId, threshold = 75) {
        try {
            // 1. Get all students assigned to the course
            const users = await User.find({ role: 'student' });
            const defaulters = [];

            for (const student of users) {
                const percentage = await Attendance.getStudentAttendancePercentage(student._id, courseId);
                if (percentage < threshold) {
                    defaulters.push({
                        student: {
                            _id: student._id,
                            name: `${student.firstName} ${student.lastName}`,
                            rollNumber: student.rollNumber,
                            email: student.email
                        },
                        percentage: percentage.toFixed(2)
                    });
                }
            }
            return defaulters;
        } catch (error) {
            console.error('Analytics Error:', error);
            throw error;
        }
    }

    async getMonthlyTrends(studentId, courseId) {
        // Logic for daily/weekly/monthly trends
        // This will aggregate attendance data over time buckets
        try {
            const now = new Date();
            const last6Months = new Date(now.setMonth(now.getMonth() - 6));

            const stats = await Attendance.aggregate([
                { $match: { student: studentId, createdAt: { $gte: last6Months } } },
                {
                    $group: {
                        _id: { $month: "$createdAt" },
                        presentCount: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
                        totalCount: { $sum: 1 }
                    }
                },
                { $sort: { "_id": 1 } }
            ]);
            return stats;
        } catch (error) {
            console.error('Trend Error:', error);
            throw error;
        }
    }
}

module.exports = new AnalyticsService();
