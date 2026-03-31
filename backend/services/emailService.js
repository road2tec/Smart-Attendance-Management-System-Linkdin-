const nodemailer = require('nodemailer');
const fs = require('fs');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    async sendAttendanceReport(email, userName, reportData, attachmentPath = null) {
        try {
            const mailOptions = {
                from: `"SmartAttend System" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: `📊 Attendance Report - ${userName}`,
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #4F46E5;">SmartAttend Analytics Report</h2>
                        <p>Hello, <strong>${userName}</strong>,</p>
                        <p>Your 6-month cumulative attendance report is ready. Below is your current status:</p>
                        <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p><strong>Total Sessions:</strong> ${reportData.totalSessions}</p>
                            <p><strong>Attendance Percentage:</strong> ${reportData.attendancePercentage.toFixed(2)}%</p>
                            <p><strong>Status:</strong> ${reportData.attendancePercentage < 75 ? '<span style="color:red;">DEFAULTER</span>' : '<span style="color:green;">GOOD</span>'}</p>
                        </div>
                        <p>Please find the detailed log attached if applicable.</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                        <p style="font-size: 12px; color: #777;">This is an automated report from SmartAttend Monitoring System.</p>
                    </div>
                `
            };

            if (attachmentPath && fs.existsSync(attachmentPath)) {
                mailOptions.attachments = [
                    {
                        filename: 'detailed_attendance_report.pdf',
                        path: attachmentPath
                    }
                ];
            }

            await this.transporter.sendMail(mailOptions);
            return { success: true, message: 'Report sent successfully' };
        } catch (error) {
            console.error('Email Error:', error);
            throw error;
        }
    }

    async sendSecurityAlert(adminEmail, alertDetails) {
        try {
            const mailOptions = {
                from: `"SmartAttend Security" <${process.env.EMAIL_USER}>`,
                to: adminEmail,
                subject: `⚠️ SECURITY ALERT: ${alertDetails.type}`,
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #EF4444;">Security Incident Detected</h2>
                        <p>An unauthorized or fraudulent attempt was detected in <strong>${alertDetails.className}</strong>.</p>
                        <div style="border-left: 4px solid #EF4444; padding: 15px; margin: 20px 0; background: #FEF2F2;">
                            <p><strong>Type:</strong> ${alertDetails.type}</p>
                            <p><strong>User:</strong> ${alertDetails.userName || 'Unknown'}</p>
                            <p><strong>Confidence Score:</strong> ${alertDetails.score}</p>
                            <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
                        </div>
                        <p>Action is required immediately to investigate this incident.</p>
                    </div>
                `
            };

            await this.transporter.sendMail(mailOptions);
            return { success: true, message: 'Alert sent successfully' };
        } catch (error) {
            console.error('Security Alert Email Error:', error);
        }
    }
}

module.exports = new EmailService();
