// ============================================
// EMAIL SERVICE
// Handles sending emails using Gmail SMTP
// ============================================

const nodemailer = require("nodemailer");

// Create reusable transporter object using Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_PASS, // Your Gmail app password
    },
  });
};

// ============================================
// SEND VERIFICATION EMAIL
// ============================================
const sendVerificationEmail = async (email, username, verificationToken) => {
  const transporter = createTransporter();

  const verificationUrl = `${process.env.BASE_URL || "http://localhost:3000"}/verify-email/${verificationToken}`;

  const mailOptions = {
    from: `"Wanderlust" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your Email - Wanderlust",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Wanderlust!</h1>
            </div>
            <div class="content">
              <h2>Hi ${username},</h2>
              <p>Thank you for signing up! We're excited to have you join our community of travelers and hosts.</p>
              <p>To get started, please verify your email address by clicking the button below:</p>
              <center>
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </center>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
              <p><strong>This link will expire in 24 hours.</strong></p>
              <p>If you didn't create an account with Wanderlust, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Wanderlust. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
};

// ============================================
// SEND WELCOME EMAIL
// ============================================
const sendWelcomeEmail = async (email, username) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Wanderlust" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Welcome to Wanderlust!",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
            .features { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>You're All Set!</h1>
            </div>
            <div class="content">
              <h2>Welcome, ${username}!</h2>
              <p>Your email has been verified successfully. You can now enjoy all the features Wanderlust has to offer!</p>

              <div class="features">
                <h3>What you can do now:</h3>
                <ul>
                  <li>Browse thousands of unique listings worldwide</li>
                  <li>Save your favorite places to your wishlist</li>
                  <li>Book amazing stays and experiences</li>
                  <li>Leave reviews and connect with hosts</li>
                  <li>List your own property and become a host</li>
                </ul>
              </div>

              <center>
                <a href="${process.env.BASE_URL || "http://localhost:3000"}/listings" class="button">Start Exploring</a>
                <a href="${process.env.BASE_URL || "http://localhost:3000"}/profile" class="button">Complete Your Profile</a>
              </center>

              <p>If you have any questions, feel free to reach out to our support team.</p>
              <p>Happy traveling!</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Wanderlust. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error("Error sending welcome email:", error);
    // Don't throw error for welcome email - it's not critical
  }
};

// ============================================
// SEND PASSWORD RESET EMAIL
// ============================================
const sendPasswordResetEmail = async (email, username, resetToken) => {
  const transporter = createTransporter();

  const resetUrl = `${process.env.BASE_URL || "http://localhost:3000"}/reset-password/${resetToken}`;

  const mailOptions = {
    from: `"Wanderlust" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your Password - Wanderlust",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hi ${username},</h2>
              <p>We received a request to reset your password for your Wanderlust account.</p>
              <p>Click the button below to reset your password:</p>
              <center>
                <a href="${resetUrl}" class="button">Reset Password</a>
              </center>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>

              <div class="warning">
                <strong>Important:</strong> This link will expire in 1 hour for security reasons.
              </div>

              <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
              <p>For security reasons, we recommend that you:</p>
              <ul>
                <li>Use a strong, unique password</li>
                <li>Never share your password with anyone</li>
                <li>Enable two-factor authentication when available</li>
              </ul>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Wanderlust. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
};

// ============================================
// SEND SUPPORT REQUEST EMAIL
// ============================================
const sendSupportEmail = async (name, email, topic, message) => {
  const transporter = createTransporter();

  // Email to support team (you)
  const supportMailOptions = {
    from: `"Wanderlust" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER, // Your email to receive support requests
    replyTo: email, // User's email for easy reply
    subject: `Support Request: ${topic} - ${name}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
            .header { background: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 5px 5px; }
            .info-row { margin: 15px 0; padding: 10px; background: #f8f9fa; border-left: 3px solid #dc3545; }
            .label { font-weight: bold; color: #666; }
            .message-box { background: #f8f9fa; padding: 20px; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>📧 New Support Request</h2>
            </div>
            <div class="content">
              <div class="info-row">
                <span class="label">From:</span> ${name}
              </div>
              <div class="info-row">
                <span class="label">Email:</span> <a href="mailto:${email}">${email}</a>
              </div>
              <div class="info-row">
                <span class="label">Topic:</span> ${topic}
              </div>
              <div class="info-row">
                <span class="label">Date:</span> ${new Date().toLocaleString()}
              </div>

              <h3>Message:</h3>
              <div class="message-box">
                ${message.replace(/\n/g, "<br>")}
              </div>

              <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px;">
                <strong>Quick Actions:</strong><br>
                Reply directly to this email to respond to ${name} at ${email}
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  // Confirmation email to user
  const userMailOptions = {
    from: `"Wanderlust Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "We Received Your Support Request - Wanderlust",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .highlight { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Request Received</h1>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>Thank you for contacting Wanderlust support. We've received your message and our team will review it shortly.</p>

              <div class="highlight">
                <h3>Your Request Details:</h3>
                <p><strong>Topic:</strong> ${topic}</p>
                <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Reference:</strong> ${Date.now().toString(36).toUpperCase()}</p>
              </div>

              <p><strong>What happens next?</strong></p>
              <ul>
                <li>Our support team will review your message</li>
                <li>We aim to respond within 24 hours</li>
                <li>Check your inbox (and spam folder) for our response</li>
              </ul>

              <p>In the meantime, you might find answers in our <a href="${process.env.BASE_URL || "http://localhost:3000"}/help#faqs" style="color: #667eea;">FAQ section</a>.</p>

              <p>Thanks for your patience!</p>
              <p><strong>The Wanderlust Team</strong></p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Wanderlust. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    // Send both emails
    await transporter.sendMail(supportMailOptions);
    await transporter.sendMail(userMailOptions);
    console.log(`Support request sent from ${email} - Topic: ${topic}`);
  } catch (error) {
    console.error("Error sending support emails:", error);
    throw new Error("Failed to send support request");
  }
};

// ============================================
// SEND HOST MESSAGE EMAIL
// ============================================
const escapeHtml = value => {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const sendHostMessageEmail = async ({
  hostEmail,
  hostName,
  guestName,
  guestEmail,
  listingTitle,
  listingId,
  message,
}) => {
  const transporter = createTransporter();

  const safeHostName = escapeHtml(hostName || "Host");
  const safeGuestName = escapeHtml(guestName || "Guest");
  const safeGuestEmail = escapeHtml(guestEmail || "");
  const safeListingTitle = escapeHtml(listingTitle || "your listing");
  const safeMessage = escapeHtml(message || "").replace(/\n/g, "<br>");

  const listingUrl = `${process.env.BASE_URL || "http://localhost:3000"}/listings/${listingId}`;

  const mailOptions = {
    from: `"Wanderlust" <${process.env.EMAIL_USER}>`,
    to: hostEmail,
    replyTo: guestEmail,
    subject: `New message about: ${listingTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
            .header { background: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 6px 6px 0 0; }
            .content { background: white; padding: 24px; border-radius: 0 0 6px 6px; }
            .info { margin: 12px 0; padding: 10px; background: #f8f9fa; border-left: 3px solid #dc3545; }
            .label { font-weight: bold; color: #666; }
            .message-box { background: #f8f9fa; padding: 16px; border-radius: 6px; margin-top: 12px; }
            a { color: #0d6efd; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>📩 New Message from a Guest</h2>
            </div>
            <div class="content">
              <p>Hi ${safeHostName},</p>

              <div class="info">
                <span class="label">Listing:</span> ${safeListingTitle}<br>
                <span class="label">From:</span> ${safeGuestName}<br>
                <span class="label">Email:</span> <a href="mailto:${safeGuestEmail}">${safeGuestEmail}</a><br>
                <span class="label">Date:</span> ${new Date().toLocaleString()}
              </div>

              <h3>Message</h3>
              <div class="message-box">${safeMessage}</div>

              <p style="margin-top: 18px;">
                View listing: <a href="${listingUrl}">${listingUrl}</a>
              </p>

              <p style="margin-top: 18px; color: #666; font-size: 14px;">
                Reply to this email to respond directly to ${safeGuestName}.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Host message sent to ${hostEmail} for listing ${listingId}`);
  } catch (error) {
    console.error("Error sending host message email:", error);
    throw new Error("Failed to send message to host");
  }
};

// ============================================
// SEND BOOKING CONFIRMATION EMAIL
// ============================================
const sendBookingConfirmationEmail = async ({
  guestEmail,
  guestName,
  listingTitle,
  location,
  checkIn,
  checkOut,
  nights,
  totalPrice,
  bookingId,
}) => {
  const transporter = createTransporter();

  const safeGuestName = escapeHtml(guestName || "Guest");
  const safeListingTitle = escapeHtml(listingTitle || "your stay");
  const safeLocation = escapeHtml(location || "Location unavailable");

  const checkInLabel = new Date(checkIn).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const checkOutLabel = new Date(checkOut).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const bookingReference = `WL-${String(bookingId).slice(-8).toUpperCase()}`;
  const formattedPrice = Number(totalPrice || 0).toLocaleString("en-IN");
  const bookingsUrl = `${process.env.BASE_URL || "http://localhost:3000"}/bookings`;

  const mailOptions = {
    from: `"Wanderlust" <${process.env.EMAIL_USER}>`,
    to: guestEmail,
    subject: "Thank you for your booking - Wanderlust",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #e6c88a, #c6a96b); color: #1c1c1c; padding: 28px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 28px; border-radius: 0 0 10px 10px; }
            .summary { background: white; border-radius: 8px; padding: 18px; margin: 18px 0; }
            .row { margin: 8px 0; }
            .label { font-weight: bold; color: #666; }
            .button { display: inline-block; padding: 11px 24px; background: #1f2937; color: #fff; text-decoration: none; border-radius: 6px; margin-top: 16px; }
            .footer { text-align: center; margin-top: 18px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Booking Confirmed</h1>
            </div>
            <div class="content">
              <h2>Thank you, ${safeGuestName}!</h2>
              <p>Your booking has been confirmed. We’re excited to host your next stay.</p>

              <div class="summary">
                <div class="row"><span class="label">Listing:</span> ${safeListingTitle}</div>
                <div class="row"><span class="label">Location:</span> ${safeLocation}</div>
                <div class="row"><span class="label">Check-in:</span> ${checkInLabel}</div>
                <div class="row"><span class="label">Check-out:</span> ${checkOutLabel}</div>
                <div class="row"><span class="label">Nights:</span> ${nights}</div>
                <div class="row"><span class="label">Total paid:</span> ₹${formattedPrice}</div>
                <div class="row"><span class="label">Booking reference:</span> ${bookingReference}</div>
              </div>

              <a href="${bookingsUrl}" class="button">View My Bookings</a>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Wanderlust. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Booking confirmation email sent to ${guestEmail}`);
  } catch (error) {
    console.error("Error sending booking confirmation email:", error);
    throw new Error("Failed to send booking confirmation email");
  }
};

// ============================================
// SEND HOST BOOKING NOTIFICATION EMAIL
// ============================================
const sendHostBookingNotificationEmail = async ({
  hostEmail,
  hostName,
  guestName,
  guestEmail,
  listingTitle,
  location,
  checkIn,
  checkOut,
  nights,
  totalPrice,
  bookingId,
  listingId,
}) => {
  const transporter = createTransporter();

  const safeHostName = escapeHtml(hostName || "Host");
  const safeGuestName = escapeHtml(guestName || "Guest");
  const safeGuestEmail = escapeHtml(guestEmail || "");
  const safeListingTitle = escapeHtml(listingTitle || "your listing");
  const safeLocation = escapeHtml(location || "Location unavailable");

  const checkInLabel = new Date(checkIn).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const checkOutLabel = new Date(checkOut).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const bookingReference = `WL-${String(bookingId).slice(-8).toUpperCase()}`;
  const formattedPrice = Number(totalPrice || 0).toLocaleString("en-IN");
  const listingUrl = `${process.env.BASE_URL || "http://localhost:3000"}/listings/${listingId}`;
  const hostDashboardUrl = `${process.env.BASE_URL || "http://localhost:3000"}/listings/my`;

  const mailOptions = {
    from: `"Wanderlust" <${process.env.EMAIL_USER}>`,
    to: hostEmail,
    replyTo: guestEmail,
    subject: "New booking received - Wanderlust",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1f2937, #374151); color: #fff; padding: 28px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 28px; border-radius: 0 0 10px 10px; }
            .summary { background: white; border-radius: 8px; padding: 18px; margin: 18px 0; }
            .row { margin: 8px 0; }
            .label { font-weight: bold; color: #666; }
            .button { display: inline-block; padding: 11px 24px; background: #111827; color: #fff; text-decoration: none; border-radius: 6px; margin-top: 10px; margin-right: 8px; }
            .footer { text-align: center; margin-top: 18px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏡 New Booking Received</h1>
            </div>
            <div class="content">
              <h2>Hi ${safeHostName},</h2>
              <p>Great news — your listing has a new confirmed booking.</p>

              <div class="summary">
                <div class="row"><span class="label">Listing:</span> ${safeListingTitle}</div>
                <div class="row"><span class="label">Location:</span> ${safeLocation}</div>
                <div class="row"><span class="label">Guest:</span> ${safeGuestName}</div>
                <div class="row"><span class="label">Guest Email:</span> <a href="mailto:${safeGuestEmail}">${safeGuestEmail}</a></div>
                <div class="row"><span class="label">Check-in:</span> ${checkInLabel}</div>
                <div class="row"><span class="label">Check-out:</span> ${checkOutLabel}</div>
                <div class="row"><span class="label">Nights:</span> ${nights}</div>
                <div class="row"><span class="label">Total booking value:</span> ₹${formattedPrice}</div>
                <div class="row"><span class="label">Booking reference:</span> ${bookingReference}</div>
              </div>

              <a href="${listingUrl}" class="button">View Listing</a>
              <a href="${hostDashboardUrl}" class="button">Host Dashboard</a>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Wanderlust. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Host booking notification email sent to ${hostEmail}`);
  } catch (error) {
    console.error("Error sending host booking notification email:", error);
    throw new Error("Failed to send host booking notification email");
  }
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendSupportEmail,
  sendHostMessageEmail,
  sendBookingConfirmationEmail,
  sendHostBookingNotificationEmail,
};
