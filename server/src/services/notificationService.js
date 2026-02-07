// notificationService.js
import { Server } from 'socket.io';
import realtimeService from './realtimeService.js';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASS,
  },
});

export function notifyUser(userId, event, payload) {
  realtimeService.notifyUser(userId, event, payload);
}

export async function sendHealthRecordEmail(to, subject, html, attachments = []) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
    attachments,
  });
}

export async function sendNotification(notificationData) {
  try {
    const { type, userId, claimId, claimNumber, insuranceProvider, totalAmount } = notificationData;
    
    // Send real-time notification
    notifyUser(userId, 'claim_update', {
      type,
      claimId,
      claimNumber,
      insuranceProvider,
      totalAmount,
      timestamp: new Date()
    });

    // Send email notification for claim submission
    if (type === 'claim_submitted') {
      await sendHealthRecordEmail(
        process.env.ADMIN_EMAIL || 'admin@healthsecure.com',
        `New Insurance Claim Submitted - ${claimNumber}`,
        `
          <h2>New Insurance Claim Submitted</h2>
          <p><strong>Claim Number:</strong> ${claimNumber}</p>
          <p><strong>Insurance Provider:</strong> ${insuranceProvider}</p>
          <p><strong>Total Amount:</strong> $${totalAmount}</p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        `
      );
    }

    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
} 