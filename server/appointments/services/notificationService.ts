import nodemailer from 'nodemailer';
import twilio from 'twilio';

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'SendGrid',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

export async function sendEmail(to: string, subject: string, html: string) {
  await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
}

export async function sendSMS(to: string, body: string) {
  await twilioClient.messages.create({ body, from: process.env.TWILIO_FROM, to });
}

// For in-app, use WebSocket or DB-persisted notifications
export function sendInAppNotification(io: any, userId: string, message: string) {
  // Emit via WebSocket (io is the socket.io server instance)
  io.to(userId).emit('notification', { message });
} 