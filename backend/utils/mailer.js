const nodemailer = require('nodemailer');

const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

const isMailerConfigured = () => Boolean(smtpUser && smtpPass);

const transporter = isMailerConfigured()
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })
  : null;

const sendMail = async ({ to, subject, html, text }) => {
  if (!isMailerConfigured() || !transporter) {
    throw new Error('SMTP is not configured. Please set SMTP_USER and SMTP_PASS.');
  }

  return transporter.sendMail({
    from: smtpUser,
    to,
    subject,
    text,
    html,
  });
};

module.exports = {
  sendMail,
  isMailerConfigured,
};