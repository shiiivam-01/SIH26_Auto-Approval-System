const nodemailer = require('nodemailer');

/**
 * Configure the SMTP transport using environment variables.
 * For Gmail, use SMTP_HOST='smtp.gmail.com', SMTP_PORT=465, and an App Password.
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends a welcome/registration email to the user.
 * @param {object} user - The user object from the DB
 * @param {object} profile - The applicant profile from the DB (can be null)
 */
async function sendRegistrationEmail(user, profile) {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('[Email Service] SMTP credentials not configured. Skipping registration email.');
      return;
    }

    const userName = user.name || 'User';
    const email = user.email;
    const role = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    const regDate = new Date(user.createdAt).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    const businessName = profile?.business_name || 'Not provided';
    const businessType = profile?.business_type || 'Not provided';
    const sector = profile?.sector || 'Not provided';
    const city = profile?.city_town_village || 'Not provided';
    const state = profile?.state || 'Not provided';
    
    let locationStr = 'Not provided';
    if (city !== 'Not provided' || state !== 'Not provided') {
      locationStr = `${city !== 'Not provided' ? city : ''}${city !== 'Not provided' && state !== 'Not provided' ? ', ' : ''}${state !== 'Not provided' ? state : ''}`;
    }

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="background-color: #1e3a8a; padding: 25px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">UDAAN</h1>
          <p style="color: #bfdbfe; margin: 5px 0 0 0; font-size: 14px;">Single Window Clearance System</p>
        </div>
        
        <div style="padding: 30px;">
          <h2 style="color: #1e3a8a; font-size: 20px; margin-top: 0;">Hello ${userName},</h2>
          <p style="font-size: 16px;"><strong>Welcome to UDAAN!</strong></p>
          <p>Thank you for registering with UDAAN — your unified digital platform for industrial approvals, compliance, and government support services.</p>
          <p>Your account has been successfully created. You can now use UDAAN to manage your business profile, discover applicable approvals, submit required documents, track applications, and access relevant government support services.</p>
          
          <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 15px; margin: 25px 0;">
            <h3 style="color: #0f172a; margin-top: 0; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;">Account Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 4px 0; width: 40%; color: #64748b;">Name:</td><td style="padding: 4px 0; font-weight: 500;">${userName}</td></tr>
              <tr><td style="padding: 4px 0; color: #64748b;">Email:</td><td style="padding: 4px 0; font-weight: 500;">${email}</td></tr>
              <tr><td style="padding: 4px 0; color: #64748b;">Account Type:</td><td style="padding: 4px 0; font-weight: 500;">${role}</td></tr>
              <tr><td style="padding: 4px 0; color: #64748b;">Registration Date:</td><td style="padding: 4px 0; font-weight: 500;">${regDate}</td></tr>
            </table>
          </div>

          <div style="background-color: #f8fafc; border-left: 4px solid #10b981; padding: 15px; margin: 25px 0;">
            <h3 style="color: #0f172a; margin-top: 0; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;">Business Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 4px 0; width: 40%; color: #64748b;">Business Name:</td><td style="padding: 4px 0; font-weight: 500;">${businessName}</td></tr>
              <tr><td style="padding: 4px 0; color: #64748b;">Business Type:</td><td style="padding: 4px 0; font-weight: 500;">${businessType}</td></tr>
              <tr><td style="padding: 4px 0; color: #64748b;">Business Sector:</td><td style="padding: 4px 0; font-weight: 500;">${sector}</td></tr>
              <tr><td style="padding: 4px 0; color: #64748b;">Location:</td><td style="padding: 4px 0; font-weight: 500;">${locationStr}</td></tr>
            </table>
          </div>

          <p>You can log in to your UDAAN dashboard to complete or update your business profile and begin your approval journey.</p>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="https://vyapardigi.vercel.app/" style="background-color: #1e3a8a; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Login to UDAAN</a>
          </div>

          <p>Thank you for choosing UDAAN.</p>
          
          <p style="margin-bottom: 0;">Best regards,<br/><strong>UDAAN Team</strong><br/><span style="color: #64748b; font-size: 14px;">Unified Digital Platform for Industrial Approvals & Compliance</span></p>
        </div>
        <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #94a3b8;">
          This is an automated message. Please do not reply directly to this email.
        </div>
      </div>
    `;

    const mailOptions = {
      from: `UDAAN Portal <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: 'Welcome to UDAAN — Your Account Has Been Successfully Created',
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Registration email sent to ${email}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[Email Service] Failed to send registration email to ${user?.email}:`, error);
  }
}

/**
 * Sends an email notification when an application is auto-approved or decided.
 */
async function sendApplicationStatusEmail(toEmail, userName, approvalName, status) {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return;

    let subject = '';
    let body = '';

    if (status === 'auto_approved' || status === 'approved') {
      subject = `[APPROVED] Your UDAAN Application for ${approvalName}`;
      body = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Congratulations ${userName}! 🎉</h2>
          <p>Your application for <strong>${approvalName}</strong> has been successfully <strong>APPROVED</strong> via the UDAAN system.</p>
          <p>You can now download your digital certificate from your dashboard.</p>
          <p>Best Regards,<br/>The UDAAN Team</p>
        </div>
      `;
    } else if (status === 'rejected') {
      subject = `[UPDATE] Your UDAAN Application for ${approvalName}`;
      body = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Hello ${userName},</h2>
          <p>We have an update regarding your application for <strong>${approvalName}</strong>.</p>
          <p>Unfortunately, it has been marked as <strong>REJECTED</strong>. Please check your dashboard for the officer's remarks and required actions.</p>
          <p>Best Regards,<br/>The UDAAN Team</p>
        </div>
      `;
    } else {
      return; // Do not send email for other statuses yet
    }

    const mailOptions = {
      from: `UDAAN Portal <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: toEmail,
      subject: subject,
      html: body
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`[Email Service] Failed to send status email to ${toEmail}:`, error);
  }
}

module.exports = {
  sendRegistrationEmail,
  sendApplicationStatusEmail
};
