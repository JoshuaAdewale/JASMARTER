/**
 * Notification helpers — writes to the Notification collection
 * and (optionally) sends an email via nodemailer.
 */
const nodemailer = require('nodemailer');
const Notification = require('../models/Notification');

let transporter;
function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST) return null;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  return transporter;
}

async function notify({ recipient, type, title, message, data, sendEmail = false }) {
  await Notification.create({ recipient, type, title, message, data });

  const t = getTransporter();
  if (sendEmail && t) {
    try {
      await t.sendMail({
        from: process.env.MAIL_FROM || 'JASMARTA <no-reply@jasmarta.app>',
        to: recipient.email,
        subject: title,
        text: message,
      });
    } catch (err) {
      console.warn('Email send failed:', err.message);
    }
  }
}

module.exports = { notify };
