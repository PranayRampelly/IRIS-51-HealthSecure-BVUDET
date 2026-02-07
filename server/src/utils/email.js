import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Email templates
const emailTemplates = {
  'proof-request-notification': {
    subject: 'New Proof Request: {{requestTitle}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Proof Request</h2>
        <p>Hello {{providerName}},</p>
        <p>You have received a new proof request from {{requesterName}}.</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Request Details</h3>
          <p><strong>Title:</strong> {{requestTitle}}</p>
          <p><strong>Due Date:</strong> {{dueDate}}</p>
        </div>
        
        <p>Please review and respond to this request as soon as possible.</p>
        
        <a href="{{requestUrl}}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View Request
        </a>
        
        <p style="margin-top: 30px; font-size: 14px; color: #64748b;">
          This is an automated notification from HealthSecure.
        </p>
      </div>
    `
  },
  
  'proof-request-fulfilled': {
    subject: 'Proof Request Fulfilled: {{requestTitle}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Proof Request Fulfilled</h2>
        <p>Hello {{requesterName}},</p>
        <p>Your proof request has been fulfilled by {{fulfilledBy}}.</p>
        
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
          <h3 style="margin-top: 0; color: #059669;">Request Details</h3>
          <p><strong>Title:</strong> {{requestTitle}}</p>
          <p><strong>Fulfilled By:</strong> {{fulfilledBy}}</p>
          <p><strong>Notes:</strong> {{fulfillmentNotes}}</p>
        </div>
        
        <p>You can now proceed with your insurance claim or other related processes.</p>
        
        <p style="margin-top: 30px; font-size: 14px; color: #64748b;">
          This is an automated notification from HealthSecure.
        </p>
      </div>
    `
  },
  
  'proof-request-rejected': {
    subject: 'Proof Request Rejected: {{requestTitle}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Proof Request Rejected</h2>
        <p>Hello {{requesterName}},</p>
        <p>Your proof request has been rejected by {{rejectedBy}}.</p>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3 style="margin-top: 0; color: #dc2626;">Request Details</h3>
          <p><strong>Title:</strong> {{requestTitle}}</p>
          <p><strong>Rejected By:</strong> {{rejectedBy}}</p>
          <p><strong>Reason:</strong> {{rejectionReason}}</p>
        </div>
        
        <p>Please review the rejection reason and submit a new request if needed.</p>
        
        <p style="margin-top: 30px; font-size: 14px; color: #64748b;">
          This is an automated notification from HealthSecure.
        </p>
      </div>
    `
  },
  
  'proof-request-reminder': {
    subject: 'Reminder: Proof Request Due Soon - {{requestTitle}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d97706;">Proof Request Reminder</h2>
        <p>Hello {{providerName}},</p>
        <p>This is a reminder that you have a pending proof request that is due soon.</p>
        
        <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d97706;">
          <h3 style="margin-top: 0; color: #d97706;">Request Details</h3>
          <p><strong>Title:</strong> {{requestTitle}}</p>
          <p><strong>Due Date:</strong> {{dueDate}}</p>
          <p><strong>Days Remaining:</strong> {{daysRemaining}}</p>
        </div>
        
        <p>Please complete this request before the due date to avoid delays.</p>
        
        <a href="{{requestUrl}}" style="background-color: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View Request
        </a>
        
        <p style="margin-top: 30px; font-size: 14px; color: #64748b;">
          This is an automated reminder from HealthSecure.
        </p>
      </div>
    `
  },
  
  'proof-request-overdue': {
    subject: 'URGENT: Proof Request Overdue - {{requestTitle}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Proof Request Overdue</h2>
        <p>Hello {{providerName}},</p>
        <p>You have an overdue proof request that requires immediate attention.</p>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3 style="margin-top: 0; color: #dc2626;">Request Details</h3>
          <p><strong>Title:</strong> {{requestTitle}}</p>
          <p><strong>Due Date:</strong> {{dueDate}}</p>
          <p><strong>Days Overdue:</strong> {{daysOverdue}}</p>
        </div>
        
        <p>Please complete this request immediately to avoid any negative impact on patient care.</p>
        
        <a href="{{requestUrl}}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View Request
        </a>
        
        <p style="margin-top: 30px; font-size: 14px; color: #64748b;">
          This is an automated urgent notification from HealthSecure.
        </p>
      </div>
    `
  }
};

/**
 * Send email using template
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject (will be overridden by template)
 * @param {string} options.template - Template name
 * @param {Object} options.context - Template context variables
 * @param {string} options.from - Sender email (optional)
 * @returns {Promise<Object>} Email send result
 */
export const sendEmail = async (options) => {
  try {
    const { to, template, context, from } = options;

    if (!to || !template) {
      throw new Error('Recipient email and template are required');
    }

    // Get template
    const emailTemplate = emailTemplates[template];
    if (!emailTemplate) {
      throw new Error(`Email template '${template}' not found`);
    }

    // Replace template variables
    let subject = emailTemplate.subject;
    let html = emailTemplate.html;

    if (context) {
      Object.keys(context).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        subject = subject.replace(regex, context[key] || '');
        html = html.replace(regex, context[key] || '');
      });
    }

    // Create transporter
    const transporter = createTransporter();

    // Send email
    const mailOptions = {
      from: from || process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html
    };

    const result = await transporter.sendMail(mailOptions);

    console.log('Email sent successfully:', {
      to,
      template,
      messageId: result.messageId
    });

    return {
      success: true,
      messageId: result.messageId,
      to,
      template
    };

  } catch (error) {
    console.error('Email send error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send custom email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @param {string} options.text - Email text content (optional)
 * @param {string} options.from - Sender email (optional)
 * @returns {Promise<Object>} Email send result
 */
export const sendCustomEmail = async (options) => {
  try {
    const { to, subject, html, text, from } = options;

    if (!to || !subject || !html) {
      throw new Error('Recipient email, subject, and HTML content are required');
    }

    // Create transporter
    const transporter = createTransporter();

    // Send email
    const mailOptions = {
      from: from || process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
      text
    };

    const result = await transporter.sendMail(mailOptions);

    console.log('Custom email sent successfully:', {
      to,
      subject,
      messageId: result.messageId
    });

    return {
      success: true,
      messageId: result.messageId,
      to,
      subject
    };

  } catch (error) {
    console.error('Custom email send error:', error);
    throw new Error(`Failed to send custom email: ${error.message}`);
  }
};

/**
 * Send bulk emails
 * @param {Array} emails - Array of email options
 * @returns {Promise<Array>} Array of email results
 */
export const sendBulkEmails = async (emails) => {
  try {
    if (!Array.isArray(emails) || emails.length === 0) {
      throw new Error('Emails array is required and must not be empty');
    }

    const results = [];
    const transporter = createTransporter();

    for (const emailOptions of emails) {
      try {
        const { to, template, context, subject, html, from } = emailOptions;

        if (!to) {
          results.push({
            success: false,
            error: 'Recipient email is required',
            to: 'unknown'
          });
          continue;
        }

        let finalSubject, finalHtml;

        if (template) {
          // Use template
          const emailTemplate = emailTemplates[template];
          if (!emailTemplate) {
            results.push({
              success: false,
              error: `Template '${template}' not found`,
              to
            });
            continue;
          }

          finalSubject = emailTemplate.subject;
          finalHtml = emailTemplate.html;

          if (context) {
            Object.keys(context).forEach(key => {
              const regex = new RegExp(`{{${key}}}`, 'g');
              finalSubject = finalSubject.replace(regex, context[key] || '');
              finalHtml = finalHtml.replace(regex, context[key] || '');
            });
          }
        } else {
          // Use custom content
          if (!subject || !html) {
            results.push({
              success: false,
              error: 'Subject and HTML content are required for custom emails',
              to
            });
            continue;
          }
          finalSubject = subject;
          finalHtml = html;
        }

        const mailOptions = {
          from: from || process.env.SMTP_FROM || process.env.SMTP_USER,
          to,
          subject: finalSubject,
          html: finalHtml
        };

        const result = await transporter.sendMail(mailOptions);

        results.push({
          success: true,
          messageId: result.messageId,
          to,
          template: template || 'custom'
        });

      } catch (error) {
        results.push({
          success: false,
          error: error.message,
          to: emailOptions.to || 'unknown'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    console.log(`Bulk email completed: ${successCount} successful, ${failureCount} failed`);

    return results;

  } catch (error) {
    console.error('Bulk email send error:', error);
    throw new Error(`Failed to send bulk emails: ${error.message}`);
  }
};

/**
 * Validate email configuration
 * @returns {boolean} True if configuration is valid
 */
export const validateEmailConfig = () => {
  const requiredEnvVars = [
    'SMTP_USER',
    'SMTP_PASS'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('Missing email environment variables:', missingVars);
    return false;
  }

  return true;
};

/**
 * Test email configuration
 * @param {string} testEmail - Email address to send test to
 * @returns {Promise<Object>} Test result
 */
export const testEmailConfig = async (testEmail) => {
  try {
    if (!validateEmailConfig()) {
      throw new Error('Email configuration is invalid');
    }

    const result = await sendCustomEmail({
      to: testEmail,
      subject: 'HealthSecure Email Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Email Configuration Test</h2>
          <p>This is a test email to verify that your email configuration is working correctly.</p>
          <p>If you received this email, your email setup is working properly.</p>
          <p style="margin-top: 30px; font-size: 14px; color: #64748b;">
            Sent at: ${new Date().toLocaleString()}
          </p>
        </div>
      `
    });

    return {
      success: true,
      message: 'Email configuration test successful',
      result
    };

  } catch (error) {
    return {
      success: false,
      message: 'Email configuration test failed',
      error: error.message
    };
  }
};

export default {
  sendEmail,
  sendCustomEmail,
  sendBulkEmails,
  validateEmailConfig,
  testEmailConfig,
  emailTemplates
}; 