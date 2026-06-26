/**
 * Rohit Vishwakarma — @studio.4ever
 * Node.js email sender for the portfolio contact form.
 *
 * Setup:
 *   1) cd backend && npm install
 *   2) Create a .env file in this folder with:
 *        PORT=3000
 *        SMTP_HOST=smtp.gmail.com
 *        SMTP_PORT=587
 *        SMTP_USER=your@email.com
 *        SMTP_PASS=your_app_password
 *        MAIL_TO=studio4everhere@gmail.com
 *   3) npm start  →  serves the site + receives the contact form
 */

require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
const MAIL_TO = process.env.MAIL_TO || process.env.SMTP_USER;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the frontend (index.html, css, js, videos) directly from this server.
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Reusable SMTP transport built from environment variables.
function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// Contact form endpoint — matches the fields in frontend/index.html.
app.post('/api/contact', async (req, res) => {
  const {
    name = '',
    phone = '',
    email = '',
    projectType = '',
    eventDate = '',
    message = '',
  } = req.body || {};

  if (!name.trim() || !email.trim() || !message.trim()) {
    return res.status(400).json({
      ok: false,
      error: 'Name, email and message are required.',
    });
  }

  const subject = `New enquiry from ${name}` + (projectType ? ` — ${projectType}` : '');
  const text = [
    `Name:        ${name}`,
    `Phone:       ${phone}`,
    `Email:       ${email}`,
    `Project:     ${projectType}`,
    `Event Date:  ${eventDate}`,
    '',
    'Message:',
    message,
  ].join('\n');

  const html = `
    <h2 style="font-family:Georgia,serif;color:#c9a96e;">New Portfolio Enquiry</h2>
    <table style="font-family:Arial,sans-serif;font-size:14px;color:#222;border-collapse:collapse;">
      <tr><td style="padding:4px 12px;"><b>Name</b></td><td style="padding:4px 12px;">${name}</td></tr>
      <tr><td style="padding:4px 12px;"><b>Phone</b></td><td style="padding:4px 12px;">${phone}</td></tr>
      <tr><td style="padding:4px 12px;"><b>Email</b></td><td style="padding:4px 12px;">${email}</td></tr>
      <tr><td style="padding:4px 12px;"><b>Project</b></td><td style="padding:4px 12px;">${projectType}</td></tr>
      <tr><td style="padding:4px 12px;"><b>Event Date</b></td><td style="padding:4px 12px;">${eventDate}</td></tr>
    </table>
    <p style="font-family:Arial,sans-serif;font-size:14px;color:#222;white-space:pre-line;"><b>Message:</b><br>${message}</p>
  `;

  try {
    const transporter = createTransport();
    await transporter.sendMail({
      from: `"${name}" <${process.env.SMTP_USER}>`,
      to: MAIL_TO,
      replyTo: email,
      subject,
      text,
      html,
    });
    res.json({ ok: true, message: 'Message sent successfully.' });
  } catch (err) {
    console.error('Email send failed:', err.message);
    res.status(500).json({ ok: false, error: 'Failed to send message. Please try again later.' });
  }
});

// Simple health check.
app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`@studio.4ever portfolio running → http://localhost:${PORT}`);
})

