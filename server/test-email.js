import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testEmailService() {
  console.log('Testing email service...');
  console.log('Email configuration:');
  console.log('Host:', process.env.EMAIL_HOST);
  console.log('Port:', process.env.EMAIL_PORT);
  console.log('User:', process.env.EMAIL_USER);
  console.log('Pass:', process.env.EMAIL_PASS ? '***configured***' : 'NOT SET');
  console.log('Frontend URL:', process.env.FRONTEND_URL);

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Verify connection
    console.log('\nVerifying email connection...');
    await transporter.verify();
    console.log('✅ Email connection verified successfully!');

    // Send test email
    console.log('\nSending test email...');
    const testEmail = process.env.EMAIL_USER; // Send to the same email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: testEmail,
      subject: 'Test Email - HealthSecure Email Service',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Email Service Test</h2>
          <p>This is a test email to verify that the HealthSecure email service is working correctly.</p>
          <p><strong>Test Details:</strong></p>
          <ul>
            <li>Host: ${process.env.EMAIL_HOST}</li>
            <li>Port: ${process.env.EMAIL_PORT}</li>
            <li>User: ${process.env.EMAIL_USER}</li>
            <li>Timestamp: ${new Date().toISOString()}</li>
          </ul>
          <p>If you receive this email, the email service is working properly!</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #7f8c8d; font-size: 12px;">
            This is a test message from HealthSecure. Please do not reply to this email.
          </p>
        </div>
      `
    });

    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));

  } catch (error) {
    console.error('❌ Email service test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testEmailService(); 