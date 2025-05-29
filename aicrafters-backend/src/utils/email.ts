import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { readFileSync } from 'fs';
import { join } from 'path';

const logo = readFileSync(join(__dirname, '../assets/logo/logo.svg'), 'utf-8');

dotenv.config();

console.log('Email service module loading...');

// --- Environment Variable Checks ---
if (!process.env.BREVO_SMTP_HOST) {
  console.error('FATAL ERROR: BREVO_SMTP_HOST environment variable is not defined.');
  throw new Error('BREVO_SMTP_HOST environment variable is not defined');
}
if (!process.env.BREVO_SMTP_PORT) {
  console.error('FATAL ERROR: BREVO_SMTP_PORT environment variable is not defined.');
  throw new Error('BREVO_SMTP_PORT environment variable is not defined');
}
if (!process.env.BREVO_SMTP_USER) {
  console.error('FATAL ERROR: BREVO_SMTP_USER environment variable is not defined.');
  throw new Error('BREVO_SMTP_USER environment variable is not defined');
}
if (!process.env.BREVO_SMTP_PASS) {
  console.error('FATAL ERROR: BREVO_SMTP_PASS environment variable is not defined.');
  throw new Error('BREVO_SMTP_PASS environment variable is not defined');
}
if (!process.env.FRONTEND_URL) {
  console.error('FATAL ERROR: FRONTEND_URL environment variable is not defined.');
  throw new Error('FRONTEND_URL environment variable is not defined');
}
const FRONTEND_URL = process.env.FRONTEND_URL;

if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET environment variable is not defined.');
  throw new Error('JWT_SECRET environment variable is not defined');
}
const JWT_SECRET = process.env.JWT_SECRET;

console.log('Environment variables checked successfully.');

// --- Nodemailer Transporter ---
const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST,
  port: parseInt(process.env.BREVO_SMTP_PORT || '587', 10),
  secure: process.env.BREVO_SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

console.log('Nodemailer transporter created.');
transporter.verify((error, success) => {
  if (error) {
    console.error('Transporter verification failed:', error);
  } else {
    console.log('Transporter is ready to send emails.');
  }
});


// --- Rebranding & Theme Configuration ---
const ADWIN_SERVICE_NAME = "Adwin";
const AICRAFTERS_SIGNATURE_NAME = "The Adwin Team"; // As per requirement
const ADWIN_LOGO = 'https://adwin.global/wp-content/uploads/2025/04/logo-adwin-normal-.png'; // Using the SVG logo from the frontend
const FROM_EMAIL_ADDRESS = `Adwin <no-reply@aicrafters.com>`; // Rebranded name, existing domain
const REPLY_TO_EMAIL_ADDRESS = 'hello@aicrafters.com'; // Existing reply-to

// Material-UI Theme Inspired Colors
const theme = {
  palette: {
    primary: {
      main: '#6D4794', // Purple
      light: '#835EAB',
      dark: '#522F76',
    },
    secondary: {
      main: '#D710C1', // Magenta
      light: '#9C89FF',
      dark: '#b0009c',
    },
    common: {
      white: '#FFFFFF',
      black: '#000000',
    },
    text: {
      primary: '#333333', // Dark Gray for main text
      secondary: '#555555', // Lighter Gray for secondary text
      disabled: '#9E9E9E',
      hint: '#BDBDBD',
      white: '#FFFFFF',
    },
    background: {
      default: '#F4F6F8', // Light Gray for email body background
      paper: '#FFFFFF',    // White for content area
    },
    success: {
      main: '#4CAF50', // Green for success messages/elements
    },
    error: {
      main: '#F44336', // Red for error messages/elements
    },
    info: {
      main: '#2196F3', // Blue for informational messages
    },
    warning: {
      main: '#FF9800', // Orange for warnings
    }
  },
  typography: {
    fontFamily: 'Lato, Arial, sans-serif',
    h1Size: '28px',
    h2Size: '24px',
    h3Size: '20px',
    bodySize: '16px',
    smallSize: '14px',
    fontWeightBold: '700',
    fontWeightNormal: '400',
  },
  shape: {
    borderRadius: '8px', // Rounded corners for buttons and cards
  },
};

console.log('Theme configuration set.');

// --- HTML Template System ---

/**
 * Creates a styled button HTML string.
 * @param text Button text
 * @param url Button link URL
 * @param type 'primary' or 'secondary'
 * @returns HTML string for the button
 */
const createStyledButton = (text: string, url: string, type: 'primary' | 'secondary' = 'primary'): string => {
  const buttonColor = type === 'primary' ? theme.palette.primary.main : theme.palette.secondary.main;
  return `
    <a href="${url}" target="_blank" style="
      background-color: ${buttonColor};
      color: ${theme.palette.common.white};
      padding: 12px 25px;
      text-decoration: none;
      border-radius: ${theme.shape.borderRadius};
      display: inline-block;
      font-family: ${theme.typography.fontFamily};
      font-weight: ${theme.typography.fontWeightBold};
      font-size: ${theme.typography.bodySize};
      border: none;
      cursor: pointer;
      text-align: center;
      mso-hide:all; /* Hide from Outlook 2007-2016 which doesn't support rounded corners well */
    ">
      ${text}
    </a>
    <!--[if mso]>
    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${url}" style="height:40px;v-text-anchor:middle;width:200px;" arcsize="10%" strokecolor="${buttonColor}" fillcolor="${buttonColor}">
      <w:anchorlock/>
      <center style="color:${theme.palette.common.white};font-family:${theme.typography.fontFamily};font-size:${theme.typography.bodySize};font-weight:bold;">
        ${text}
      </center>
    </v:roundrect>
    <![endif]-->
  `;
};

/**
 * Creates a styled card HTML string.
 * @param contentHtml HTML content for the card
 * @param backgroundColor Optional background color for the card
 * @returns HTML string for the card
 */
const createStyledCard = (contentHtml: string, backgroundColor: string = theme.palette.background.paper): string => {
  return `
    <div style="
      background-color: ${backgroundColor};
      padding: 20px;
      border-radius: ${theme.shape.borderRadius};
      border: 1px solid #DDDDDD;
      margin: 20px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    ">
      ${contentHtml}
    </div>
  `;
};

/**
 * Creates a styled list (ul) HTML string.
 * @param items Array of list item strings (can be HTML)
 * @returns HTML string for the list
 */
const createStyledList = (items: string[]): string => {
  if (!items || items.length === 0) return '';
  return `
    <ul style="
      margin: 15px 0;
      padding-left: 25px;
      list-style-type: disc;
      color: ${theme.palette.text.primary};
    ">
      ${items.map(item => `<li style="margin-bottom: 8px; line-height: 1.6;">${item}</li>`).join('')}
    </ul>
  `;
};

/**
 * Generates the base HTML structure for emails.
 * @param headline The main headline of the email.
 * @param contentHtml The main content HTML of the email.
 * @param preheaderText Optional preheader text for email clients.
 * @returns Full HTML string for the email.
 */
const createBaseEmailHtml = (headline: string, contentHtml: string, preheaderText: string = ''): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>${headline} - ${ADWIN_SERVICE_NAME}</title>
      <style type="text/css">
        @import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap');
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: ${theme.palette.background.default}; font-family: ${theme.typography.fontFamily}; }
        a[x-apple-data-detectors] {
          color: inherit !important;
          text-decoration: none !important;
          font-size: inherit !important;
          font-family: inherit !important;
          font-weight: inherit !important;
          line-height: inherit !important;
        }
        /* Responsive Styles */
        @media screen and (max-width: 600px) {
          .container { width: 100% !important; max-width: 100% !important; padding: 0 10px !important; }
          .content { padding: 20px !important; }
          .logo { max-width: 150px !important; }
          h1 { font-size: 22px !important; }
        }
      </style>
    </head>
    <body style="background-color: ${theme.palette.background.default}; margin: 0 !important; padding: 0 !important;">
      <!-- Preheader Text -->
      <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: ${theme.typography.fontFamily}; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
        ${preheaderText || headline}
      </div>

      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="background-color: ${theme.palette.background.default}; padding: 20px 0;">
            <!--[if (gte mso 9)|(IE)]>
            <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
            <tr>
            <td align="center" valign="top" width="600">
            <![endif]-->
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;" class="container">
              <!-- Logo Header -->
              <tr>
                <td align="center" style="padding: 20px 0;">
                  <a href="${FRONTEND_URL}" target="_blank">
                    <img src="${ADWIN_LOGO}" alt="${ADWIN_SERVICE_NAME} Logo" width="180" style="display: block; width: 180px; max-width: 180px; min-width: 100px;" class="logo">
                  </a>
                </td>
              </tr>
              <!-- Main Content -->
              <tr>
                <td align="center" style="padding: 0;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${theme.palette.background.paper}; border-radius: ${theme.shape.borderRadius}; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    <tr>
                      <td style="padding: 30px 25px;" class="content">
                        <h1 style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.h1Size}; color: ${theme.palette.primary.dark}; margin-top: 0; margin-bottom: 20px; font-weight: ${theme.typography.fontWeightBold}; text-align: center;">
                          ${headline}
                        </h1>
                        ${contentHtml}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td align="center" style="padding: 30px 20px; font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.smallSize}; color: ${theme.palette.text.secondary}; line-height: 1.5;">
                  <p style="margin: 0 0 10px 0;">If you have any questions, please contact our support team at <a href="mailto:${REPLY_TO_EMAIL_ADDRESS}" style="color: ${theme.palette.primary.main}; text-decoration: underline;">${REPLY_TO_EMAIL_ADDRESS}</a>.</p>
                  <p style="margin: 0 0 10px 0;">&copy; ${new Date().getFullYear()} ${ADWIN_SERVICE_NAME}. All rights reserved.</p>
                  <p style="margin: 0;">${AICRAFTERS_SIGNATURE_NAME}</p>
                   <p style="margin: 10px 0 0 0;"><a href="${FRONTEND_URL}" target="_blank" style="color: ${theme.palette.primary.main}; text-decoration: underline;">Visit ${ADWIN_SERVICE_NAME}</a></p>
                </td>
              </tr>
            </table>
            <!--[if (gte mso 9)|(IE)]>
            </td>
            </tr>
            </table>
            <![endif]-->
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

console.log('HTML template system (base, button, card, list helpers) initialized.');

// --- Token Generation (Unchanged logic, just ensuring they are present) ---
export const generateVerificationToken = (email: string): string => {
  console.log(`Generating verification token for: ${email}`);
  return jwt.sign({ email }, JWT_SECRET, { expiresIn: '24h' });
};

export const generatePasswordResetToken = (email: string): string => {
  console.log(`Generating password reset token for: ${email}`);
  return jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
};

// --- Email Sending Functions (Rewritten with new templates) ---

export const sendVerificationEmail = async (email: string, fullName: string, token: string) => {
  const subject = `Verify Your Email - ${ADWIN_SERVICE_NAME}`;
  console.log(`Attempting to send verification email to: ${email} with subject: "${subject}"`);
  try {
    const verificationLink = `${FRONTEND_URL}/en/verify-email/${token}`;
    const preheaderText = `Welcome, ${fullName}! Please verify your email to activate your ${ADWIN_SERVICE_NAME} account.`;
    const contentHtml = `
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 15px; line-height: 1.6;">
        Hello ${fullName},
      </p>
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 25px; line-height: 1.6;">
        Thank you for registering with ADWIN. To complete your registration and start using ${ADWIN_SERVICE_NAME}, please verify your email address by clicking the button below:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        ${createStyledButton('Verify Email Address', verificationLink, 'primary')}
      </div>
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.secondary}; margin-bottom: 15px; line-height: 1.6;">
        This verification link will expire in 24 hours.
      </p>
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.smallSize}; color: ${theme.palette.text.secondary}; margin-bottom: 15px; line-height: 1.6;">
        If you did not create an account with ADWIN, please ignore this email. Your security is important to us.
      </p>
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 0; line-height: 1.6;">
        Welcome aboard!
      </p>
    `;

    const emailHtml = createBaseEmailHtml(`Welcome to ${ADWIN_SERVICE_NAME}!`, contentHtml, preheaderText);

    await transporter.sendMail({
      from: FROM_EMAIL_ADDRESS,
      to: email,
      subject: subject,
      html: emailHtml,
      replyTo: REPLY_TO_EMAIL_ADDRESS
    });
    console.log(`Verification email sent successfully to: ${email}`);
  } catch (error) {
    console.error(`Error sending verification email to ${email}:`, error);
    if (error instanceof Error) {
      console.error('Detailed verification email error:', {
        message: error.message,
        stack: error.stack,
        recipient: email,
      });
    }
    throw error; // Re-throw to be handled by caller
  }
};

export const sendWelcomeEmail = async (email: string, fullName: string, password: string) => {
  const subject = `Welcome to ${ADWIN_SERVICE_NAME} - Your Account Details`;
  console.log(`Attempting to send welcome email to: ${email} with subject: "${subject}"`);
  try {
    const loginUrl = `${FRONTEND_URL}/en/login`; // Assuming a generic login page
    const preheaderText = `Welcome, ${fullName}! Your ${ADWIN_SERVICE_NAME} account has been created.`;
    const cardContent = `
      <p style="margin: 0 0 10px 0; font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary};"><strong>Email:</strong> ${email}</p>
      <p style="margin: 0 0 10px 0; font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary};"><strong>Password:</strong> ${password}</p>
      <p style="margin: 0; font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary};"><strong>Login URL:</strong> <a href="${loginUrl}" target="_blank" style="color: ${theme.palette.primary.main}; text-decoration: underline;">${loginUrl}</a></p>
    `;

    const contentHtml = `
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 15px; line-height: 1.6;">
        Hello ${fullName},
      </p>
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 20px; line-height: 1.6;">
        An administrator has created an account for you at ADWIN. Here are your login credentials:
      </p>
      ${createStyledCard(cardContent, theme.palette.background.default)}
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-top: 25px; margin-bottom: 15px; line-height: 1.6;">
        For security reasons, we strongly recommend changing your password after your first login.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        ${createStyledButton('Login to Your Account', loginUrl, 'primary')}
      </div>
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 0; line-height: 1.6;">
        If you have any questions or need assistance, please don't hesitate to contact our support team.
      </p>
    `;

    const emailHtml = createBaseEmailHtml(`Your ${ADWIN_SERVICE_NAME} Account is Ready!`, contentHtml, preheaderText);

    await transporter.sendMail({
      from: FROM_EMAIL_ADDRESS,
      to: email,
      subject: subject,
      html: emailHtml,
      replyTo: REPLY_TO_EMAIL_ADDRESS
    });
    console.log(`Welcome email sent successfully to: ${email}`);
  } catch (error) {
    console.error(`Error sending welcome email to ${email}:`, error);
     if (error instanceof Error) {
      console.error('Detailed welcome email error:', {
        message: error.message,
        stack: error.stack,
        recipient: email,
      });
    }
    throw error;
  }
};

export const sendCourseApprovalEmail = async (email: string, fullName: string, courseTitle: string, courseId: string) => {
  const subject = `Your Course Has Been Approved! - ${ADWIN_SERVICE_NAME}`;
  console.log(`Attempting to send course approval email to: ${email} for course: "${courseTitle}" with subject: "${subject}"`);
  try {
    const courseUrl = `${FRONTEND_URL}/en/courses/${courseId}`;
    const preheaderText = `Great news, ${fullName}! Your course "${courseTitle}" is now live on ${ADWIN_SERVICE_NAME}.`;
    const cardContent = `
      <p style="margin: 0 0 10px 0; font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary};"><strong>Course Title:</strong> ${courseTitle}</p>
      <p style="margin: 0; font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary};"><strong>Course URL:</strong> <a href="${courseUrl}" target="_blank" style="color: ${theme.palette.primary.main}; text-decoration: underline;">View Course</a></p>
    `;
    const listItems = [
      "Monitor user enrollments",
      "Track course progress",
      "Engage with your users",
      "Update course content as needed"
    ];

    const contentHtml = `
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 15px; line-height: 1.6;">
        Hello ${fullName},
      </p>
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 20px; line-height: 1.6;">
        Great news! Your course "<strong>${courseTitle}</strong>" has been approved and is now published on ${ADWIN_SERVICE_NAME} platform.
      </p>
      ${createStyledCard(cardContent, theme.palette.background.default)}
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-top: 25px; margin-bottom: 10px; line-height: 1.6;">
        Your course is now live and accessible to users. You can:
      </p>
      ${createStyledList(listItems)}
      <div style="text-align: center; margin: 30px 0;">
        ${createStyledButton('View Your Course', courseUrl, 'primary')}
      </div>
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 0; line-height: 1.6;">
        Congratulations on your published course!
      </p>
    `;

    const emailHtml = createBaseEmailHtml('Course Approved & Published!', contentHtml, preheaderText);

    await transporter.sendMail({
      from: FROM_EMAIL_ADDRESS,
      to: email,
      subject: subject,
      html: emailHtml,
      replyTo: REPLY_TO_EMAIL_ADDRESS
    });
    console.log(`Course approval email sent successfully to: ${email} for course: "${courseTitle}"`);
  } catch (error) {
    console.error(`Course approval email error for ${email}, course "${courseTitle}":`, error);
    if (error instanceof Error) {
      console.error('Detailed course approval email error:', {
        message: error.message,
        stack: error.stack,
        recipient: email,
        courseTitle: courseTitle,
      });
    }
    throw error;
  }
};

export const sendCourseRejectionEmail = async (email: string, fullName: string, courseTitle: string, courseId: string) => {
  const subject = `Course Review Update - Revisions Required - ${ADWIN_SERVICE_NAME}`;
  console.log(`Attempting to send course rejection email to: ${email} for course: "${courseTitle}" with subject: "${subject}"`);
  try {
    const preheaderText = `Action required for your course "${courseTitle}" on ${ADWIN_SERVICE_NAME}.`;
    const cardContent = `
      <p style="margin: 0; font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary};"><strong>Course Title:</strong> ${courseTitle}</p>
    `;
    const listItems = [
      "Ensure all course content meets our quality standards.",
      "Check that all materials are properly organized and up-to-date.",
      "Verify that all links and resources are working correctly.",
      "Make sure the course description is complete, accurate, and compelling."
    ];

    const contentHtml = `
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 15px; line-height: 1.6;">
        Hello ${fullName},
      </p>
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 20px; line-height: 1.6;">
        We've reviewed your course submission "<strong>${courseTitle}</strong>" for the  ${ADWIN_SERVICE_NAME} platform. It requires some revisions before it can be published.
      </p>
      ${createStyledCard(cardContent, theme.palette.background.default)}
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-top: 25px; margin-bottom: 10px; line-height: 1.6;">
        Please review the following general guidelines (specific feedback may be available in your dashboard):
      </p>
      ${createStyledList(listItems)}
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-top: 20px; margin-bottom: 15px; line-height: 1.6;">
        Once you've made the necessary revisions, please resubmit the course for another review through your dashboard.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        ${createStyledButton('Go to Your Dashboard', `${FRONTEND_URL}/en/dashboard/instructor/courses`, 'primary')}
      </div>
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 0; line-height: 1.6;">
        We appreciate your effort and look forward to seeing your updated course.
      </p>
    `;

    const emailHtml = createBaseEmailHtml('Course Revisions Required', contentHtml, preheaderText);

    await transporter.sendMail({
      from: FROM_EMAIL_ADDRESS,
      to: email,
      subject: subject,
      html: emailHtml,
      replyTo: REPLY_TO_EMAIL_ADDRESS
    });
    console.log(`Course rejection email sent successfully to: ${email} for course: "${courseTitle}"`);
  } catch (error) {
    console.error(`Course rejection email error for ${email}, course "${courseTitle}":`, error);
    if (error instanceof Error) {
      console.error('Detailed course rejection email error:', {
        message: error.message,
        stack: error.stack,
        recipient: email,
        courseTitle: courseTitle,
      });
    }
    throw error;
  }
};

export const sendCourseSubmissionEmail = async (email: string, fullName: string, courseTitle: string) => {
  // This email is typically for admins/reviewers
  const subject = `New Course Submitted for Review: "${courseTitle}" - ${ADWIN_SERVICE_NAME}`;
  console.log(`Attempting to send course submission notification to admin: ${email} for course: "${courseTitle}" with subject: "${subject}"`);
  try {
    const preheaderText = `Admin Action: New course "${courseTitle}" is awaiting review on ${ADWIN_SERVICE_NAME}.`;
    const cardContent = `
      <p style="margin: 0; font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary};"><strong>Course Title:</strong> ${courseTitle}</p>
    `;
    const listItems = [
      "Check the course content and materials for quality and accuracy.",
      "Verify that it meets our platform's guidelines and standards.",
      "Ensure all materials are appropriate, well-organized, and engaging.",
      "Approve the course or request revisions as needed."
    ];
    const adminDashboardLink = `${FRONTEND_URL}/en/dashboard/admin/courses`; // Example admin link

    const contentHtml = `
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 15px; line-height: 1.6;">
        Hello ${fullName} (Admin),
      </p>
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 20px; line-height: 1.6;">
        A new course, "<strong>${courseTitle}</strong>", has been submitted for review on the  ${ADWIN_SERVICE_NAME} platform.
      </p>
      ${createStyledCard(cardContent, theme.palette.background.default)}
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-top: 25px; margin-bottom: 10px; line-height: 1.6;">
        Please review this course at your earliest convenience. Key areas to check:
      </p>
      ${createStyledList(listItems)}
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-top: 20px; margin-bottom: 15px; line-height: 1.6;">
        You can access the course review page through your admin dashboard.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        ${createStyledButton('Review Course Now', adminDashboardLink, 'primary')}
      </div>
    `;

    const emailHtml = createBaseEmailHtml('New Course Review Request', contentHtml, preheaderText);

    await transporter.sendMail({
      from: FROM_EMAIL_ADDRESS,
      to: email, // Admin's email
      subject: subject,
      html: emailHtml,
      replyTo: REPLY_TO_EMAIL_ADDRESS
    });
    console.log(`Course submission notification sent successfully to admin: ${email} for course: "${courseTitle}"`);
  } catch (error) {
    console.error(`Course submission email error for admin ${email}, course "${courseTitle}":`, error);
    if (error instanceof Error) {
      console.error('Detailed course submission email error:', {
        message: error.message,
        stack: error.stack,
        recipient: email,
        courseTitle: courseTitle,
      });
    }
    throw error;
  }
};

export const sendAccountActivationEmail = async (email: string, fullName: string) => {
  const subject = `Welcome to ${ADWIN_SERVICE_NAME} - Your Account is Now Active!`;
  console.log(`Attempting to send account activation email to: ${email} with subject: "${subject}"`);
  try {
    const coursesLink = `${FRONTEND_URL}/en/courses`;
    const preheaderText = `Your ${ADWIN_SERVICE_NAME} account is active, ${fullName}! Start exploring courses now.`;
    const listItems = [
      `Browse our extensive course catalog on the ${ADWIN_SERVICE_NAME} platform.`,
      "Save courses to your wishlist.",
      "Purchase and enroll in courses.",
      "Track your learning progress.",
      "Interact with instructors and other learners."
    ];
    const cardContent = `
      <h3 style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.h3Size}; color: ${theme.palette.primary.dark}; margin-top: 0; margin-bottom: 15px;">
        What you can do now:
      </h3>
      ${createStyledList(listItems)}
    `;

    const contentHtml = `
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 15px; line-height: 1.6;">
        Hello ${fullName},
      </p>
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 20px; line-height: 1.6;">
        Great news! Your account on ${ADWIN_SERVICE_NAME} has been successfully verified and activated. You now have full access to all features of our platform.
      </p>
      ${createStyledCard(cardContent, theme.palette.background.default)}
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-top: 25px; margin-bottom: 10px; font-weight: ${theme.typography.fontWeightBold}; line-height: 1.6;">
        Ready to start learning?
      </p>
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 20px; line-height: 1.6;">
        Visit our course catalog and begin your learning journey today!
      </p>
      <div style="text-align: center; margin: 30px 0;">
        ${createStyledButton('Browse Courses', coursesLink, 'primary')}
      </div>
    `;

    const emailHtml = createBaseEmailHtml('Your Account is Active!', contentHtml, preheaderText);

    await transporter.sendMail({
      from: FROM_EMAIL_ADDRESS,
      to: email,
      subject: subject,
      html: emailHtml,
      replyTo: REPLY_TO_EMAIL_ADDRESS
    });
    console.log(`Account activation email sent successfully to: ${email}`);
  } catch (error) {
    console.error(`Account activation email error for ${email}:`, error);
    if (error instanceof Error) {
      console.error('Detailed account activation email error:', {
        message: error.message,
        stack: error.stack,
        recipient: email,
      });
    }
    throw error;
  }
};

export const sendPurchaseConfirmationEmail = async (email: string, fullName: string, courseTitle: string, courseId: string, instructorName: string) => {
  const subject = `Course Purchase Confirmation - ${ADWIN_SERVICE_NAME}`;
  console.log(`Attempting to send purchase confirmation email to: ${email} for course: "${courseTitle}" with subject: "${subject}"`);
  try {
    const learningDashboardLink = `${FRONTEND_URL}/en/dashboard/user/learning`;
    const preheaderText = `Thank you, ${fullName}! You're enrolled in "${courseTitle}" on ${ADWIN_SERVICE_NAME}.`;
    
    const courseDetailsCard = `
      <h3 style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.h3Size}; color: ${theme.palette.primary.dark}; margin-top: 0; margin-bottom: 15px;">Course Details:</h3>
      <p style="margin: 0 0 10px 0; font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary};"><strong>Course:</strong> ${courseTitle}</p>
      <p style="margin: 0; font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary};"><strong>Instructor:</strong> ${instructorName}</p>
    `;
    
    const nextStepsItems = [
      "Access all course materials at your own pace.",
      "Track your progress through the course.",
      "Participate in course discussions and Q&A.",
      "Complete exercises and assignments (if any).",
      "Earn your completion certificate (if applicable)."
    ];
    const nextStepsCard = `
      <h3 style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.h3Size}; color: ${theme.palette.primary.dark}; margin-top: 0; margin-bottom: 15px;">What's Next?</h3>
      ${createStyledList(nextStepsItems)}
    `;

    const contentHtml = `
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 15px; line-height: 1.6;">
        Hello ${fullName},
      </p>
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 20px; line-height: 1.6;">
        Thank you for purchasing the course "<strong>${courseTitle}</strong>" by ${instructorName} on the ${ADWIN_SERVICE_NAME} platform. Your enrollment has been confirmed, and you now have full access to all course materials.
      </p>
      ${createStyledCard(courseDetailsCard, theme.palette.background.default)}
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-top: 25px; margin-bottom: 10px; font-weight: ${theme.typography.fontWeightBold}; line-height: 1.6;">
        Ready to start learning?
      </p>
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 20px; line-height: 1.6;">
        Click the button below to access your course:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        ${createStyledButton('Start Learning Now', learningDashboardLink, 'primary')}
      </div>
      ${createStyledCard(nextStepsCard, theme.palette.info.main + '1A')}
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-top: 25px; margin-bottom: 0; line-height: 1.6;">
        Happy learning!
      </p>
    `;

    const emailHtml = createBaseEmailHtml('Thank You for Your Purchase!', contentHtml, preheaderText);

    await transporter.sendMail({
      from: FROM_EMAIL_ADDRESS,
      to: email,
      subject: subject,
      html: emailHtml,
      replyTo: REPLY_TO_EMAIL_ADDRESS
    });
    console.log(`Purchase confirmation email sent successfully to: ${email} for course: "${courseTitle}"`);
  } catch (error) {
    console.error(`Purchase confirmation email error for ${email}, course "${courseTitle}":`, error);
    if (error instanceof Error) {
      console.error('Detailed purchase confirmation email error:', {
        message: error.message,
        stack: error.stack,
        recipient: email,
        courseTitle: courseTitle,
      });
    }
    throw error;
  }
};

export const sendNewUserNotificationEmail = async (adminEmail: string, adminName: string, userName: string, userEmail: string) => {
  // This email is for admins
  const subject = `New User Registration - ${ADWIN_SERVICE_NAME}`;
  console.log(`Attempting to send new user notification to admin: ${adminEmail} for user: ${userEmail} with subject: "${subject}"`);
  try {
    const usersDashboardLink = `${FRONTEND_URL}/en/dashboard/admin/users`;
    const preheaderText = `Admin Info: New user ${userName} (${userEmail}) has registered on ${ADWIN_SERVICE_NAME}.`;
    const userDetailsCard = `
      <h3 style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.h3Size}; color: ${theme.palette.primary.dark}; margin-top: 0; margin-bottom: 15px;">User Details:</h3>
      <p style="margin: 0 0 10px 0; font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary};"><strong>Name:</strong> ${userName}</p>
      <p style="margin: 0; font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary};"><strong>Email:</strong> ${userEmail}</p>
    `;

    const contentHtml = `
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 15px; line-height: 1.6;">
        Hello ${adminName} (Admin),
      </p>
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 20px; line-height: 1.6;">
        A new user has registered on the ${ADWIN_SERVICE_NAME} platform.
      </p>
      ${createStyledCard(userDetailsCard, theme.palette.background.default)}
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-top: 25px; margin-bottom: 20px; line-height: 1.6;">
        You can view and manage this user's account through your admin dashboard.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        ${createStyledButton('View Users Dashboard', usersDashboardLink, 'primary')}
      </div>
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.smallSize}; color: ${theme.palette.text.secondary}; margin-top: 20px; margin-bottom: 0; line-height: 1.6; text-align: center;">
        This is an automated notification.
      </p>
    `;

    const emailHtml = createBaseEmailHtml('New User Registration', contentHtml, preheaderText);

    await transporter.sendMail({
      from: FROM_EMAIL_ADDRESS,
      to: adminEmail,
      subject: subject,
      html: emailHtml,
      replyTo: REPLY_TO_EMAIL_ADDRESS
    });
    console.log(`New user notification email sent successfully to admin: ${adminEmail} for user: ${userEmail}`);
  } catch (error) {
    console.error(`New user notification email error for admin ${adminEmail}, user ${userEmail}:`, error);
    if (error instanceof Error) {
      console.error('Detailed new user notification email error:', {
        message: error.message,
        stack: error.stack,
        adminEmail: adminEmail,
        newUserEmail: userEmail,
      });
    }
    throw error;
  }
};

export const sendCourseInvitationEmail = async (email: string, courseTitle: string, courseId: string, instructorName: string) => {
  const subject = `You've Been Invited to Join "${courseTitle}" on ${ADWIN_SERVICE_NAME}!`;
  console.log(`Attempting to send course invitation email to: ${email} for course: "${courseTitle}" with subject: "${subject}"`);
  try {
    const courseAccessLink = `${FRONTEND_URL}/en/dashboard/user/learning/${courseId}`; // Assuming direct link to course in learning dashboard
    const preheaderText = `You're invited by ${instructorName} to join the course "${courseTitle}" on ${ADWIN_SERVICE_NAME}.`;
    
    const contentHtml = `
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 15px; line-height: 1.6;">
        Hello,
      </p>
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 20px; line-height: 1.6;">
        You have been personally invited by <strong>${instructorName}</strong> to join the course "<strong>${courseTitle}</strong>" on the ${ADWIN_SERVICE_NAME} platform.
      </p>
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 25px; line-height: 1.6;">
        You can access the course content immediately through your dashboard by clicking the button below:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        ${createStyledButton('Access Course Now', courseAccessLink, 'primary')}
      </div>
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 0; line-height: 1.6;">
        We hope you enjoy the course!
      </p>
    `;

    const emailHtml = createBaseEmailHtml(`Invitation to Join "${courseTitle}"`, contentHtml, preheaderText);

    await transporter.sendMail({
      from: FROM_EMAIL_ADDRESS,
      to: email,
      subject: subject,
      html: emailHtml,
      replyTo: REPLY_TO_EMAIL_ADDRESS
    });
    console.log(`Course invitation email sent successfully to: ${email} for course: "${courseTitle}"`);
  } catch (error) {
    console.error(`Error sending course invitation email to ${email} for course "${courseTitle}":`, error);
     if (error instanceof Error) {
      console.error('Detailed course invitation email error:', {
        message: error.message,
        stack: error.stack,
        recipient: email,
        courseTitle: courseTitle,
      });
    }
    throw error;
  }
};

export const sendPasswordResetEmail = async (email: string, fullName: string, token: string) => {
  const subject = `Reset Your Password - ${ADWIN_SERVICE_NAME}`;
  console.log(`Attempting to send password reset email to: ${email} with subject: "${subject}"`);
  try {
    const resetLink = `${FRONTEND_URL}/en/reset-password/${token}`;
    const preheaderText = `Password reset request for your ${ADWIN_SERVICE_NAME} account.`;
    
    const securityTips = [
      "Never share your password with anyone.",
      `Use a unique, strong password for your ${ADWIN_SERVICE_NAME} account.`,
      "Ensure you are on the official Adwin website when resetting your password."
    ];
    const securityCard = `
      <h3 style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.h3Size}; color: ${theme.palette.warning.main}; margin-top: 0; margin-bottom: 15px;">Security Tips:</h3>
      ${createStyledList(securityTips)}
    `;

    const contentHtml = `
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 15px; line-height: 1.6;">
        Hello ${fullName},
      </p>
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 25px; line-height: 1.6;">
        We received a request to reset your password for your account on ${ADWIN_SERVICE_NAME} . If you made this request, please click the button below to create a new password:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        ${createStyledButton('Reset Your Password', resetLink, 'primary')}
      </div>
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.secondary}; margin-bottom: 15px; line-height: 1.6;">
        This password reset link will expire in 1 hour.
      </p>
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.smallSize}; color: ${theme.palette.text.secondary}; margin-bottom: 25px; line-height: 1.6;">
        If you did not request a password reset, please ignore this email or contact support if you have concerns. No changes have been made to your account yet.
      </p>
      ${createStyledCard(securityCard, theme.palette.warning.main + '1A')}
    `;

    const emailHtml = createBaseEmailHtml('Password Reset Request', contentHtml, preheaderText);

    await transporter.sendMail({
      from: FROM_EMAIL_ADDRESS,
      to: email,
      subject: subject,
      html: emailHtml,
      replyTo: REPLY_TO_EMAIL_ADDRESS
    });
    console.log(`Password reset email sent successfully to: ${email}`);
  } catch (error) {
    console.error(`Password reset email error for ${email}:`, error);
    if (error instanceof Error) {
      console.error('Detailed password reset email error:', {
        message: error.message,
        stack: error.stack,
        recipient: email,
      });
    }
    throw error;
  }
};

export const sendPasswordResetConfirmationEmail = async (email: string, fullName: string) => {
  const subject = `Password Reset Confirmation - ${ADWIN_SERVICE_NAME}`;
  console.log(`Attempting to send password reset confirmation to: ${email} with subject: "${subject}"`);
  try {
    const loginLink = `${FRONTEND_URL}/en/login`;
    const preheaderText = `Your ${ADWIN_SERVICE_NAME} password has been successfully changed.`;
    
    const securityNotice = [
      `This change was made on ${new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}.`,
      `If you did NOT make this change, please secure your account immediately by resetting your password again and contact our support team.`
    ];
    const noticeCard = `
      <h3 style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.h3Size}; color: ${theme.palette.error.main}; margin-top: 0; margin-bottom: 15px;">Important Security Notice:</h3>
      ${createStyledList(securityNotice)}
    `;

    const contentHtml = `
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 15px; line-height: 1.6;">
        Hello ${fullName},
      </p>
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 25px; line-height: 1.6;">
        This email confirms that the password for your account on ${ADWIN_SERVICE_NAME}  has been successfully changed.
      </p>
      ${createStyledCard(noticeCard, theme.palette.error.main + '1A')}
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-top: 25px; margin-bottom: 20px; line-height: 1.6;">
        You can now log in with your new password.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        ${createStyledButton('Login to Your Account', loginLink, 'primary')}
      </div>
    `;

    const emailHtml = createBaseEmailHtml('Password Successfully Reset', contentHtml, preheaderText);

    await transporter.sendMail({
      from: FROM_EMAIL_ADDRESS,
      to: email,
      subject: subject,
      html: emailHtml,
      replyTo: REPLY_TO_EMAIL_ADDRESS
    });
    console.log(`Password reset confirmation email sent successfully to: ${email}`);
  } catch (error) {
    console.error(`Error sending password reset confirmation email to ${email}:`, error);
    if (error instanceof Error) {
      console.error('Detailed password reset confirmation error:', {
        message: error.message,
        stack: error.stack,
        recipient: email,
      });
    }
    throw error;
  }
};

export const sendMentorApprovalEmail = async (email: string, fullName: string) => {
  const subject = `Your Mentor Application Has Been Approved! - ${ADWIN_SERVICE_NAME}`;
  console.log(`Attempting to send mentor approval email to: ${email} with subject: "${subject}"`);
  try {
    const mentorDashboardLink = `${FRONTEND_URL}/en/dashboard/mentor`;
    const preheaderText = `Congratulations, ${fullName}! You're now an official mentor on ${ADWIN_SERVICE_NAME}.`;
    
    const nextSteps = [
      "Complete your mentor profile to attract more students.",
      "Set your availability schedule.",
      "Familiarize yourself with the mentor dashboard and tools.",
      `Start connecting with students looking for mentorship on the ${ADWIN_SERVICE_NAME} platform.`
    ];
    const nextStepsCard = `
      <h3 style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.h3Size}; color: ${theme.palette.primary.dark}; margin-top: 0; margin-bottom: 15px;">What's Next:</h3>
      ${createStyledList(nextSteps)}
    `;

    const contentHtml = `
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 15px; line-height: 1.6;">
        Hello ${fullName},
      </p>
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 20px; line-height: 1.6;">
        We are thrilled to inform you that your application to become a mentor on ${ADWIN_SERVICE_NAME}  has been approved! Congratulations and welcome to our community of mentors.
      </p>
      ${createStyledCard(nextStepsCard, theme.palette.success.main + '1A')}
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-top: 25px; margin-bottom: 20px; line-height: 1.6;">
        As a mentor, you'll be able to share your knowledge and experience with eager learners, guide them through their learning journey, provide career advice, and help them achieve their goals.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        ${createStyledButton('Go to Mentor Dashboard', mentorDashboardLink, 'primary')}
      </div>
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 0; line-height: 1.6;">
        Thank you for joining us. We look forward to the positive impact you'll make!
      </p>
    `;

    const emailHtml = createBaseEmailHtml("Congratulations! You're Now a Mentor", contentHtml, preheaderText);

    await transporter.sendMail({
      from: FROM_EMAIL_ADDRESS,
      to: email,
      subject: subject,
      html: emailHtml,
      replyTo: REPLY_TO_EMAIL_ADDRESS
    });
    console.log(`Mentor approval email sent successfully to: ${email}`);
  } catch (error) {
    console.error(`Error sending mentor approval email to ${email}:`, error);
    if (error instanceof Error) {
      console.error('Detailed mentor approval email error:', {
        message: error.message,
        stack: error.stack,
        recipient: email,
      });
    }
    throw error;
  }
};

export const sendMentorRejectionEmail = async (email: string, fullName: string, reason?: string) => {
  const subject = `Update on Your Mentor Application - ${ADWIN_SERVICE_NAME}`;
  console.log(`Attempting to send mentor rejection email to: ${email} with subject: "${subject}"`);
  try {
    const preheaderText = `An update regarding your mentor application with ${ADWIN_SERVICE_NAME}.`;
    
    let feedbackCardHtml = '';
    if (reason) {
      const feedbackContent = `
        <h3 style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.h3Size}; color: ${theme.palette.primary.dark}; margin-top: 0; margin-bottom: 10px;">Feedback:</h3>
        <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin: 0; line-height: 1.6;">${reason}</p>
      `;
      feedbackCardHtml = createStyledCard(feedbackContent, theme.palette.background.default);
    }

    const encouragementItems = [
      "Review our mentor requirements and guidelines thoroughly.",
      "Consider enhancing your professional profile with additional relevant experience or certifications.",
      "You are welcome to apply again in the future if you feel your qualifications better align with our mentor criteria."
    ];

    const contentHtml = `
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 15px; line-height: 1.6;">
        Hello ${fullName},
      </p>
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 20px; line-height: 1.6;">
        Thank you for your interest in becoming a mentor on ${ADWIN_SERVICE_NAME} . We've carefully reviewed your application.
      </p>
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 20px; line-height: 1.6;">
        Unfortunately, we are unable to approve your application at this time.
      </p>
      ${feedbackCardHtml}
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-top: 25px; margin-bottom: 10px; line-height: 1.6;">
        We understand this may be disappointing, and we encourage you to:
      </p>
      ${createStyledList(encouragementItems)}
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-top: 20px; margin-bottom: 0; line-height: 1.6;">
        Thank you for your understanding. We wish you the best in your endeavors.
      </p>
    `;

    const emailHtml = createBaseEmailHtml('Mentor Application Update', contentHtml, preheaderText);

    await transporter.sendMail({
      from: FROM_EMAIL_ADDRESS,
      to: email,
      subject: subject,
      html: emailHtml,
      replyTo: REPLY_TO_EMAIL_ADDRESS
    });
    console.log(`Mentor rejection email sent successfully to: ${email}`);
  } catch (error) {
    console.error(`Error sending mentor rejection email to ${email}:`, error);
    if (error instanceof Error) {
      console.error('Detailed mentor rejection email error:', {
        message: error.message,
        stack: error.stack,
        recipient: email,
      });
    }
    throw error;
  }
};

export const sendMentorWelcomeEmail = async (email: string, fullName: string, password: string) => {
  const subject = `Welcome to ${ADWIN_SERVICE_NAME} Mentorship Program - Your Account Details`;
  console.log(`Attempting to send mentor welcome email to: ${email} with subject: "${subject}"`);
  try {
    const loginLink = `${FRONTEND_URL}/en/login`;
    const preheaderText = `Welcome, ${fullName}! Your ${ADWIN_SERVICE_NAME} mentor account is ready.`;

    const accountDetailsCard = `
      <h3 style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.h3Size}; color: ${theme.palette.primary.dark}; margin-top: 0; margin-bottom: 15px;">Your Account Details:</h3>
      <p style="margin: 0 0 10px 0; font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary};"><strong>Email:</strong> ${email}</p>
      <p style="margin: 0; font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary};"><strong>Password:</strong> ${password} (Temporary)</p>
    `;
    
    const securityNoteCard = `
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.warning.main}; margin: 0; font-weight: ${theme.typography.fontWeightBold};">
        For security reasons, please change your password after your first login.
      </p>
    `;

    const mentorAbilities = [
      "Complete your profile to attract potential mentees.",
      "Set your availability schedule for mentorship sessions.",
      "Connect with students seeking guidance on the ${ADWIN_SERVICE_NAME} platform.",
      "Track your mentorship sessions and manage bookings.",
      "Receive payments for your mentoring services (if applicable)."
    ];

    const contentHtml = `
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 15px; line-height: 1.6;">
        Hello ${fullName},
      </p>
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 20px; line-height: 1.6;">
        We are delighted to inform you that your application to become a mentor on ${ADWIN_SERVICE_NAME}  has been approved! We've created an account for you with mentor privileges.
      </p>
      ${createStyledCard(accountDetailsCard, theme.palette.background.default)}
      ${createStyledCard(securityNoteCard, theme.palette.warning.main + '1A')}
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-top: 25px; margin-bottom: 10px; line-height: 1.6;">
        As a mentor, you'll be able to:
      </p>
      ${createStyledList(mentorAbilities)}
      <div style="text-align: center; margin: 30px 0;">
        ${createStyledButton('Login to Your Mentor Dashboard', loginLink, 'primary')}
      </div>
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 0; line-height: 1.6;">
        Welcome to the team! We're excited to have you.
      </p>
    `;

    const emailHtml = createBaseEmailHtml(`Welcome, ${ADWIN_SERVICE_NAME} Mentor!`, contentHtml, preheaderText);

    await transporter.sendMail({
      from: FROM_EMAIL_ADDRESS,
      to: email,
      subject: subject,
      html: emailHtml,
      replyTo: REPLY_TO_EMAIL_ADDRESS
    });
    console.log(`Mentor welcome email sent successfully to: ${email}`);
  } catch (error) {
    console.error(`Error sending mentor welcome email to ${email}:`, error);
    if (error instanceof Error) {
      console.error('Detailed mentor welcome email error:', {
        message: error.message,
        stack: error.stack,
        recipient: email,
      });
    }
    throw error;
  }
};

// --- Booking Related Emails ---

const formatDateForDisplay = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const createIcsContent = (summary: string, startDate: Date, endDate: Date, description: string, location: string = 'Online'): string => {
  const formatICSDate = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, '');
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//${ADWIN_SERVICE_NAME}//Mentorship Session//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
SUMMARY:${summary}
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
DESCRIPTION:${description.replace(/\n/g, '\\n')}
LOCATION:${location}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT30M
ACTION:DISPLAY
DESCRIPTION:Reminder
END:VALARM
END:VEVENT
END:VCALENDAR`;
};

const createGoogleCalendarLink = (summary: string, startDate: Date, endDate: Date, description: string, location: string = 'Online'): string => {
  const formatICSDate = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, '');
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(summary)}&dates=${formatICSDate(startDate)}/${formatICSDate(endDate)}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}&sf=true&output=xml`;
};

const createCalendarSectionHtml = (icsContent: string, googleLink: string): string => {
  return `
    <div style="background-color: ${theme.palette.info.main + '1A'}; padding: 20px; border-radius: ${theme.shape.borderRadius}; margin: 25px 0; border: 1px solid ${theme.palette.info.main + '33'};">
      <h3 style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.h3Size}; color: ${theme.palette.primary.dark}; margin-top: 0; margin-bottom: 15px;">Add to Your Calendar:</h3>
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 15px; line-height: 1.6;">
        Don't miss your session! Add it to your preferred calendar:
      </p>
      <div style="text-align: left;">
        <a href="${googleLink}" target="_blank" style="background-color: #4285F4; color: white; padding: 10px 18px; text-decoration: none; border-radius: ${theme.shape.borderRadius}; display: inline-block; margin-right: 10px; margin-bottom:10px; font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.smallSize};">
          Add to Google Calendar
        </a>
        <a href="data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}" download="mentorship-session.ics" style="background-color: ${theme.palette.secondary.main}; color: white; padding: 10px 18px; text-decoration: none; border-radius: ${theme.shape.borderRadius}; display: inline-block; margin-bottom:10px; font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.smallSize};">
          Download .ICS File
        </a>
      </div>
    </div>
  `;
};


export const sendMentorBookingNotificationEmail = async (
  mentorEmail: string,
  mentorName: string,
  menteeName: string,
  bookingId: string,
  topic: string,
  scheduledDate: string, // YYYY-MM-DD
  startTime: string, // HH:MM (24h)
  endTime: string, // HH:MM (24h)
  meetingLink?: string // Optional meeting link
) => {
  const subject = `New Mentorship Session Booked with ${menteeName} - ${ADWIN_SERVICE_NAME}`;
  console.log(`Attempting to send mentor booking notification to: ${mentorEmail} with subject: "${subject}"`);
  try {
    const formattedDisplayDate = formatDateForDisplay(scheduledDate);
    const bookingDetailsLink = `${FRONTEND_URL}/en/dashboard/mentor/bookings/${bookingId}`;
    const preheaderText = `New booking from ${menteeName} for ${formattedDisplayDate} at ${startTime}.`;

    const sessionDetails = [
      `<strong>Mentee:</strong> ${menteeName}`,
      `<strong>Topic:</strong> ${topic}`,
      `<strong>Date:</strong> ${formattedDisplayDate}`,
      `<strong>Time:</strong> ${startTime} - ${endTime}`,
    ];
    if (meetingLink) {
        sessionDetails.push(`<strong>Meeting Link:</strong> <a href="${meetingLink}" target="_blank" style="color: ${theme.palette.primary.main};">${meetingLink}</a>`);
    } else {
        sessionDetails.push(`<strong>Meeting Link:</strong> Please add a meeting link via your dashboard.`);
    }

    const sessionDetailsCardContent = sessionDetails.map(detail => `<p style="margin: 0 0 8px 0; font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; line-height: 1.6;">${detail}</p>`).join('');
    const sessionDetailsCard = createStyledCard(`<h3 style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.h3Size}; color: ${theme.palette.primary.dark}; margin-top: 0; margin-bottom: 15px;">Session Details:</h3>${sessionDetailsCardContent}`, theme.palette.background.default);

    const nextSteps = [
      "Review the session details and mentee's request.",
      meetingLink ? "Confirm the meeting link is correct and accessible." : "<strong>Crucial: Add a meeting link for this session via your dashboard.</strong>",
      "Prepare any necessary materials or topics for discussion.",
      "Contact the mentee through the platform if you need more information beforehand."
    ];
    const nextStepsCardContent = `<h3 style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.h3Size}; color: ${theme.palette.primary.dark}; margin-top: 0; margin-bottom: 15px;">Next Steps:</h3> ${createStyledList(nextSteps)}`;
    const nextStepsCard = createStyledCard(nextStepsCardContent, theme.palette.info.main + '1A');

    // Calendar Integration
    const eventStartDate = new Date(`${scheduledDate}T${startTime}`);
    const eventEndDate = new Date(`${scheduledDate}T${endTime}`);
    const calendarDescription = `Mentorship Session with ${menteeName}\nTopic: ${topic}\n${meetingLink ? `Meeting Link: ${meetingLink}` : 'Meeting link to be provided via dashboard.'}`;
    const icsData = createIcsContent(`Mentorship: ${menteeName} - ${topic}`, eventStartDate, eventEndDate, calendarDescription);
    const googleCalendarUrl = createGoogleCalendarLink(`Mentorship: ${menteeName} - ${topic}`, eventStartDate, eventEndDate, calendarDescription);
    const calendarSection = createCalendarSectionHtml(icsData, googleCalendarUrl);


    const contentHtml = `
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 15px; line-height: 1.6;">
        Hello ${mentorName},
      </p>
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 20px; line-height: 1.6;">
        You have a new mentorship session booking from <strong>${menteeName}</strong> on the ${ADWIN_SERVICE_NAME} platform.
      </p>
      ${sessionDetailsCard}
      ${calendarSection}
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-top: 25px; margin-bottom: 20px; line-height: 1.6;">
        You can view the complete details and manage this booking (e.g., add/update meeting link, share notes) through your mentor dashboard:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        ${createStyledButton('View Booking Details', bookingDetailsLink, 'primary')}
      </div>
      ${nextStepsCard}
    `;

    const emailHtml = createBaseEmailHtml('New Mentorship Booking', contentHtml, preheaderText);

    await transporter.sendMail({
      from: FROM_EMAIL_ADDRESS,
      to: mentorEmail,
      subject: subject,
      html: emailHtml,
      replyTo: REPLY_TO_EMAIL_ADDRESS,
      attachments: [{
          filename: 'mentorship-session.ics',
          content: icsData,
          contentType: 'text/calendar; charset=utf-8; method=REQUEST'
      }]
    });
    console.log(`Mentor booking notification email sent successfully to: ${mentorEmail}`);
  } catch (error) {
    console.error(`Error sending mentor booking notification email to ${mentorEmail}:`, error);
    if (error instanceof Error) {
      console.error('Detailed error (mentor booking notification):', {
        message: error.message,
        stack: error.stack,
        recipient: mentorEmail,
      });
    }
    throw error;
  }
};

export const sendMenteeBookingConfirmationEmail = async (
  menteeEmail: string,
  menteeName: string,
  mentorName: string,
  bookingId: string,
  topic: string,
  scheduledDate: string, // YYYY-MM-DD
  startTime: string, // HH:MM (24h)
  endTime: string, // HH:MM (24h)
  price: number, // Assuming price is passed
  meetingLink?: string // Optional meeting link if provided by mentor immediately
) => {
  const subject = `Your Mentorship Session with ${mentorName} is Confirmed! - ${ADWIN_SERVICE_NAME}`;
  console.log(`Attempting to send mentee booking confirmation to: ${menteeEmail} with subject: "${subject}"`);
  try {
    const formattedDisplayDate = formatDateForDisplay(scheduledDate);
    const bookingDetailsLink = `${FRONTEND_URL}/en/dashboard/user/bookings/${bookingId}`;
    const preheaderText = `Confirmed: Your session with ${mentorName} on ${formattedDisplayDate} at ${startTime}. Price: $${price.toFixed(2)}.`;

    const sessionDetails = [
      `<strong>Mentor:</strong> ${mentorName}`,
      `<strong>Topic:</strong> ${topic}`,
      `<strong>Date:</strong> ${formattedDisplayDate}`,
      `<strong>Time:</strong> ${startTime} - ${endTime}`,
      `<strong>Price:</strong> $${price.toFixed(2)}`
    ];
     if (meetingLink) {
        sessionDetails.push(`<strong>Meeting Link:</strong> <a href="${meetingLink}" target="_blank" style="color: ${theme.palette.primary.main};">${meetingLink}</a>`);
    } else {
        sessionDetails.push(`<strong>Meeting Link:</strong> Your mentor will provide the meeting link via your dashboard before the session.`);
    }

    const sessionDetailsCardContent = sessionDetails.map(detail => `<p style="margin: 0 0 8px 0; font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; line-height: 1.6;">${detail}</p>`).join('');
    const sessionDetailsCard = createStyledCard(`<h3 style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.h3Size}; color: ${theme.palette.primary.dark}; margin-top: 0; margin-bottom: 15px;">Session Confirmed:</h3>${sessionDetailsCardContent}`, theme.palette.background.default);

    const importantInfo = [
      meetingLink ? "Your meeting link is included above. Please test it beforehand." : "Your mentor will add a meeting link to the booking details in your dashboard. Please check for updates.",
      "You can typically cancel or reschedule this booking up to 24 hours before the scheduled time (check platform policy).",
      "Prepare any questions or topics you'd like to discuss in advance to make the most of your session.",
      "Ensure you have a stable internet connection and a quiet environment for the session."
    ];
    const importantInfoCardContent = `<h3 style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.h3Size}; color: ${theme.palette.primary.dark}; margin-top: 0; margin-bottom: 15px;">Important Information:</h3> ${createStyledList(importantInfo)}`;
    const importantInfoCard = createStyledCard(importantInfoCardContent, theme.palette.info.main + '1A');

    // Calendar Integration
    const eventStartDate = new Date(`${scheduledDate}T${startTime}`);
    const eventEndDate = new Date(`${scheduledDate}T${endTime}`);
    const calendarDescription = `Mentorship Session with ${mentorName}\nTopic: ${topic}\n${meetingLink ? `Meeting Link: ${meetingLink}`: 'Meeting link will be provided via dashboard.'}`;
    const icsData = createIcsContent(`Mentorship: ${mentorName} - ${topic}`, eventStartDate, eventEndDate, calendarDescription);
    const googleCalendarUrl = createGoogleCalendarLink(`Mentorship: ${mentorName} - ${topic}`, eventStartDate, eventEndDate, calendarDescription);
    const calendarSection = createCalendarSectionHtml(icsData, googleCalendarUrl);


    const contentHtml = `
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 15px; line-height: 1.6;">
        Hello ${menteeName},
      </p>
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 20px; line-height: 1.6;">
        Great news! Your mentorship session with <strong>${mentorName}</strong> on the ${ADWIN_SERVICE_NAME} platform has been successfully booked and confirmed.
      </p>
      ${sessionDetailsCard}
      ${calendarSection}
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-top: 25px; margin-bottom: 20px; line-height: 1.6;">
        You can view the complete details of your booking, including any updates from your mentor, through your dashboard:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        ${createStyledButton('View Your Booking', bookingDetailsLink, 'primary')}
      </div>
      ${importantInfoCard}
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-top: 25px; margin-bottom: 0; line-height: 1.6;">
        We hope you have a productive and insightful mentorship session!
      </p>
    `;

    const emailHtml = createBaseEmailHtml('Booking Confirmed!', contentHtml, preheaderText);

    await transporter.sendMail({
      from: FROM_EMAIL_ADDRESS,
      to: menteeEmail,
      subject: subject,
      html: emailHtml,
      replyTo: REPLY_TO_EMAIL_ADDRESS,
       attachments: [{
          filename: 'mentorship-session.ics',
          content: icsData,
          contentType: 'text/calendar; charset=utf-8; method=REQUEST'
      }]
    });
    console.log(`Mentee booking confirmation email sent successfully to: ${menteeEmail}`);
  } catch (error) {
    console.error(`Error sending mentee booking confirmation email to ${menteeEmail}:`, error);
    if (error instanceof Error) {
      console.error('Detailed error (mentee booking confirmation):', {
        message: error.message,
        stack: error.stack,
        recipient: menteeEmail,
      });
    }
    throw error;
  }
};

// Overload for sendMentorBookingConfirmationEmail from user provided code
// This seems to be a duplicate intention to the one above for mentors.
// I'll create a new distinct one as requested based on the final functions in the input.
export const sendMentorBookingConfirmedEmail = async ( // Note: Renamed from the original to avoid conflict, assuming this is the intended final name for the "mentor" confirmation
  mentorEmail: string,
  mentorName: string,
  menteeName: string,
  bookingId: string,
  topic: string,
  scheduledDate: string,
  startTime: string,
  endTime: string,
  meetingLink?: string
) => {
  const subject = `Mentorship Session Confirmed: ${menteeName} - ${ADWIN_SERVICE_NAME}`;
  console.log(`Attempting to send mentor booking CONFIRMED email to: ${mentorEmail} for mentee ${menteeName} with subject: "${subject}"`);
  try {
    const formattedDisplayDate = formatDateForDisplay(scheduledDate);
    const bookingDetailsLink = `${FRONTEND_URL}/en/dashboard/mentor/bookings/${bookingId}`;
    const preheaderText = `Session with ${menteeName} on ${formattedDisplayDate} at ${startTime} is confirmed.`;

    const sessionDetails = [
      `<strong>Mentee:</strong> ${menteeName}`,
      `<strong>Topic:</strong> ${topic}`,
      `<strong>Date:</strong> ${formattedDisplayDate}`,
      `<strong>Time:</strong> ${startTime} - ${endTime}`,
    ];
    if (meetingLink) {
        sessionDetails.push(`<strong>Meeting Link:</strong> <a href="${meetingLink}" target="_blank" style="color: ${theme.palette.primary.main};">${meetingLink}</a>`);
    } else {
        sessionDetails.push(`<strong>Meeting Link:</strong> You can add/update this via your dashboard.`);
    }

    const sessionDetailsCardContent = sessionDetails.map(detail => `<p style="margin: 0 0 8px 0; font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; line-height: 1.6;">${detail}</p>`).join('');
    const sessionDetailsCard = createStyledCard(`<h3 style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.h3Size}; color: ${theme.palette.primary.dark}; margin-top: 0; margin-bottom: 15px;">Session Confirmed:</h3>${sessionDetailsCardContent}`, theme.palette.background.default);

    const prepInfo = [
      `Review the mentee's profile and any initial questions/topics they provided.`,
      meetingLink ? `Ensure your meeting link (${meetingLink}) is active and ready.` : `<strong>Remember to add a meeting link in the dashboard if you haven't already.</strong>`,
      `Prepare any relevant materials or discussion points.`,
      `Ensure you have a stable internet connection and a quiet environment for the session.`
    ];
    const prepInfoCardContent = `<h3 style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.h3Size}; color: ${theme.palette.primary.dark}; margin-top: 0; margin-bottom: 15px;">Preparing for the Session:</h3> ${createStyledList(prepInfo)}`;
    const prepInfoCard = createStyledCard(prepInfoCardContent, theme.palette.info.main + '1A');

    // Calendar Integration
    const eventStartDate = new Date(`${scheduledDate}T${startTime}`);
    const eventEndDate = new Date(`${scheduledDate}T${endTime}`);
    const calendarDescription = `Mentorship Session with ${menteeName}\nTopic: ${topic}\n${meetingLink ? `Meeting Link: ${meetingLink}` : 'Meeting link to be provided via dashboard.'}`;
    const icsData = createIcsContent(`Mentorship: ${menteeName} - ${topic}`, eventStartDate, eventEndDate, calendarDescription);
    const googleCalendarUrl = createGoogleCalendarLink(`Mentorship: ${menteeName} - ${topic}`, eventStartDate, eventEndDate, calendarDescription);
    const calendarSection = createCalendarSectionHtml(icsData, googleCalendarUrl);

    const contentHtml = `
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 15px; line-height: 1.6;">
        Hello ${mentorName},
      </p>
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 20px; line-height: 1.6;">
        This email confirms your upcoming mentorship session with <strong>${menteeName}</strong> on the ${ADWIN_SERVICE_NAME} platform.
      </p>
      ${sessionDetailsCard}
      ${calendarSection}
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-top: 25px; margin-bottom: 20px; line-height: 1.6;">
        You can manage this booking, add notes, or update the meeting link through your dashboard:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        ${createStyledButton('View Booking in Dashboard', bookingDetailsLink, 'primary')}
      </div>
      ${prepInfoCard}
    `;

    const emailHtml = createBaseEmailHtml('Mentorship Session Confirmed', contentHtml, preheaderText);

    await transporter.sendMail({
      from: FROM_EMAIL_ADDRESS,
      to: mentorEmail,
      subject: subject,
      html: emailHtml,
      replyTo: REPLY_TO_EMAIL_ADDRESS,
      attachments: [{
          filename: 'mentorship-session.ics',
          content: icsData,
          contentType: 'text/calendar; charset=utf-8; method=REQUEST'
      }]
    });
    console.log(`Mentor booking CONFIRMED email sent successfully to: ${mentorEmail} for mentee ${menteeName}`);
  } catch (error) {
    console.error(`Error sending mentor booking CONFIRMED email to ${mentorEmail}:`, error);
    if (error instanceof Error) {
      console.error('Detailed error (mentor booking CONFIRMED):', {
        message: error.message,
        stack: error.stack,
        recipient: mentorEmail,
      });
    }
    throw error;
  }
};

// Overload for sendMenteeBookingConfirmedEmail from user provided code
// This one does not have the `price` parameter, which the one above has.
// I'll create this specific version as requested.
export const sendMenteeBookingConfirmedEmail = async ( // This is the second version from the user's input
  menteeEmail: string,
  menteeName: string,
  mentorName: string,
  bookingId: string,
  topic: string,
  scheduledDate: string,
  startTime: string,
  endTime: string,
  meetingLink?: string
) => {
  const subject = `Your Mentorship Session with ${mentorName} is Confirmed! - ${ADWIN_SERVICE_NAME}`;
  console.log(`Attempting to send mentee booking confirmed (v2) to: ${menteeEmail} with subject: "${subject}"`);
  try {
    const formattedDisplayDate = formatDateForDisplay(scheduledDate);
    const bookingDetailsLink = `${FRONTEND_URL}/en/dashboard/user/bookings/${bookingId}`;
    const preheaderText = `Confirmed: Your session with ${mentorName} on ${formattedDisplayDate} at ${startTime}.`;

    const sessionDetails = [
      `<strong>Mentor:</strong> ${mentorName}`,
      `<strong>Topic:</strong> ${topic}`,
      `<strong>Date:</strong> ${formattedDisplayDate}`,
      `<strong>Time:</strong> ${startTime} - ${endTime}`,
    ];
     if (meetingLink) {
        sessionDetails.push(`<strong>Meeting Link:</strong> <a href="${meetingLink}" target="_blank" style="color: ${theme.palette.primary.main};">${meetingLink}</a>`);
    } else {
        sessionDetails.push(`<strong>Meeting Link:</strong> Your mentor will provide the meeting link via your dashboard before the session.`);
    }

    const sessionDetailsCardContent = sessionDetails.map(detail => `<p style="margin: 0 0 8px 0; font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; line-height: 1.6;">${detail}</p>`).join('');
    const sessionDetailsCard = createStyledCard(`<h3 style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.h3Size}; color: ${theme.palette.primary.dark}; margin-top: 0; margin-bottom: 15px;">Session Confirmed:</h3>${sessionDetailsCardContent}`, theme.palette.background.default);

    const importantInfo = [
      meetingLink ? "Your meeting link is included above. Please test it beforehand." : "Your mentor will add a meeting link to the booking details in your dashboard. Please check for updates.",
      "You can typically cancel or reschedule this booking up to 24 hours before the scheduled time (check platform policy).",
      "Prepare any questions or topics you'd like to discuss in advance to make the most of your session.",
      "Ensure you have a stable internet connection and a quiet environment for the session."
    ];
    const importantInfoCardContent = `<h3 style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.h3Size}; color: ${theme.palette.primary.dark}; margin-top: 0; margin-bottom: 15px;">Preparing for Your Session:</h3> ${createStyledList(importantInfo)}`;
    const importantInfoCard = createStyledCard(importantInfoCardContent, theme.palette.info.main + '1A');

    // Calendar Integration
    const eventStartDate = new Date(`${scheduledDate}T${startTime}`);
    const eventEndDate = new Date(`${scheduledDate}T${endTime}`);
    const calendarDescription = `Mentorship Session with ${mentorName}\nTopic: ${topic}\n${meetingLink ? `Meeting Link: ${meetingLink}`: 'Meeting link will be provided via dashboard.'}`;
    const icsData = createIcsContent(`Mentorship: ${mentorName} - ${topic}`, eventStartDate, eventEndDate, calendarDescription);
    const googleCalendarUrl = createGoogleCalendarLink(`Mentorship: ${mentorName} - ${topic}`, eventStartDate, eventEndDate, calendarDescription);
    const calendarSection = createCalendarSectionHtml(icsData, googleCalendarUrl);

    const contentHtml = `
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 15px; line-height: 1.6;">
        Hello ${menteeName},
      </p>
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 20px; line-height: 1.6;">
        This confirms your mentorship session with <strong>${mentorName}</strong> on the ${ADWIN_SERVICE_NAME} platform is booked and ready to go!
      </p>
      ${sessionDetailsCard}
      ${calendarSection}
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-top: 25px; margin-bottom: 20px; line-height: 1.6;">
        Access your booking details, including any updates from your mentor, through your dashboard:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        ${createStyledButton('View Your Booking', bookingDetailsLink, 'primary')}
      </div>
      ${importantInfoCard}
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-top: 25px; margin-bottom: 0; line-height: 1.6;">
        We're looking forward to your session!
      </p>
    `;

    const emailHtml = createBaseEmailHtml('Your Session is Confirmed!', contentHtml, preheaderText);

    await transporter.sendMail({
      from: FROM_EMAIL_ADDRESS,
      to: menteeEmail,
      subject: subject,
      html: emailHtml,
      replyTo: REPLY_TO_EMAIL_ADDRESS,
       attachments: [{
          filename: 'mentorship-session.ics',
          content: icsData,
          contentType: 'text/calendar; charset=utf-8; method=REQUEST'
      }]
    });
    console.log(`Mentee booking confirmed (v2) email sent successfully to: ${menteeEmail}`);
  } catch (error) {
    console.error(`Error sending mentee booking confirmed (v2) email to ${menteeEmail}:`, error);
    if (error instanceof Error) {
      console.error('Detailed error (mentee booking confirmed v2):', {
        message: error.message,
        stack: error.stack,
        recipient: menteeEmail,
      });
    }
    throw error;
  }
};


export const sendMenteeBookingCancelledEmail = async (
  menteeEmail: string,
  menteeName: string,
  mentorName: string,
  topic: string,
  scheduledDate: string, // YYYY-MM-DD
  startTime: string, // HH:MM (24h)
  endTime: string, // HH:MM (24h)
  cancelledBy: 'mentor' | 'mentee',
  reason: string
) => {
  const subject = `Mentorship Session Cancelled - ${ADWIN_SERVICE_NAME}`;
  console.log(`Attempting to send mentee booking CANCELLED email to: ${menteeEmail} with subject: "${subject}"`);
  try {
    const formattedDisplayDate = formatDateForDisplay(scheduledDate);
    const findMentorsLink = `${FRONTEND_URL}/en/mentors`;
    const preheaderText = `Update: Your session with ${mentorName} on ${formattedDisplayDate} has been cancelled.`;

    const cancelMessage = cancelledBy === 'mentor'
      ? `We regret to inform you that your mentorship session with <strong>${mentorName}</strong>, scheduled for ${formattedDisplayDate} at ${startTime}, has been cancelled by the mentor.`
      : `This email confirms that you have successfully cancelled your mentorship session with <strong>${mentorName}</strong>, scheduled for ${formattedDisplayDate} at ${startTime}.`;

    const sessionDetails = [
      `<strong>Mentor:</strong> ${mentorName}`,
      `<strong>Topic:</strong> ${topic}`,
      `<strong>Original Date:</strong> ${formattedDisplayDate}`,
      `<strong>Original Time:</strong> ${startTime} - ${endTime}`
    ];
    const sessionDetailsCardContent = sessionDetails.map(detail => `<p style="margin: 0 0 8px 0; font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; line-height: 1.6;">${detail}</p>`).join('');
    const sessionDetailsCard = createStyledCard(`<h3 style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.h3Size}; color: ${theme.palette.primary.dark}; margin-top: 0; margin-bottom: 15px;">Cancelled Session Details:</h3>${sessionDetailsCardContent}`, theme.palette.background.default);
    
    const reasonCardContent = `<h3 style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.h3Size}; color: ${theme.palette.warning.main}; margin-top: 0; margin-bottom: 10px;">Reason for Cancellation:</h3> <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin:0; line-height: 1.6;">${reason || 'No specific reason provided.'}</p>`;
    const reasonCard = createStyledCard(reasonCardContent, theme.palette.warning.main + '1A');

    const contentHtml = `
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 15px; line-height: 1.6;">
        Hello ${menteeName},
      </p>
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 20px; line-height: 1.6;">
        ${cancelMessage}
      </p>
      ${sessionDetailsCard}
      ${reasonCard}
      ${cancelledBy === 'mentor' ? `
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-top: 25px; margin-bottom: 10px; line-height: 1.6;">
        We apologize for any inconvenience this may cause. Any payments made for this session will be handled according to our refund policy.
      </p>
      ` : `
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-top: 25px; margin-bottom: 10px; line-height: 1.6;">
        Your cancellation has been processed. Any applicable refunds will be handled according to our policy.
      </p>
      `}
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 20px; line-height: 1.6;">
        You can book another session with ${mentorName} or explore other available mentors on the ${ADWIN_SERVICE_NAME} platform:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        ${createStyledButton('Find Other Mentors', findMentorsLink, 'primary')}
      </div>
    `;

    const emailHtml = createBaseEmailHtml('Mentorship Session Cancelled', contentHtml, preheaderText);

    await transporter.sendMail({
      from: FROM_EMAIL_ADDRESS,
      to: menteeEmail,
      subject: subject,
      html: emailHtml,
      replyTo: REPLY_TO_EMAIL_ADDRESS
    });
    console.log(`Mentee booking CANCELLED email sent successfully to: ${menteeEmail}`);
  } catch (error) {
    console.error(`Error sending mentee booking CANCELLED email to ${menteeEmail}:`, error);
    if (error instanceof Error) {
      console.error('Detailed error (mentee booking cancelled):', {
        message: error.message,
        stack: error.stack,
        recipient: menteeEmail,
      });
    }
    throw error;
  }
};

export const sendMentorBookingCancelledEmail = async (
  mentorEmail: string,
  mentorName: string,
  menteeName: string,
  topic: string,
  scheduledDate: string, // YYYY-MM-DD
  startTime: string, // HH:MM (24h)
  endTime: string, // HH:MM (24h)
  cancelledBy: 'mentor' | 'mentee',
  reason: string
) => {
  const subject = `Mentorship Session with ${menteeName} Cancelled - ${ADWIN_SERVICE_NAME}`;
  console.log(`Attempting to send mentor booking CANCELLED email to: ${mentorEmail} with subject: "${subject}"`);
  try {
    const formattedDisplayDate = formatDateForDisplay(scheduledDate);
    const availabilityLink = `${FRONTEND_URL}/en/dashboard/mentor/availability`;
    const preheaderText = `Update: Session with ${menteeName} on ${formattedDisplayDate} has been cancelled.`;

    const cancelMessage = cancelledBy === 'mentee'
      ? `The mentorship session with <strong>${menteeName}</strong>, scheduled for ${formattedDisplayDate} at ${startTime}, has been cancelled by the mentee.`
      : `This email confirms that you have successfully cancelled your mentorship session with <strong>${menteeName}</strong>, scheduled for ${formattedDisplayDate} at ${startTime}.`;

    const sessionDetails = [
      `<strong>Mentee:</strong> ${menteeName}`,
      `<strong>Topic:</strong> ${topic}`,
      `<strong>Original Date:</strong> ${formattedDisplayDate}`,
      `<strong>Original Time:</strong> ${startTime} - ${endTime}`
    ];
    const sessionDetailsCardContent = sessionDetails.map(detail => `<p style="margin: 0 0 8px 0; font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; line-height: 1.6;">${detail}</p>`).join('');
    const sessionDetailsCard = createStyledCard(`<h3 style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.h3Size}; color: ${theme.palette.primary.dark}; margin-top: 0; margin-bottom: 15px;">Cancelled Session Details:</h3>${sessionDetailsCardContent}`, theme.palette.background.default);
    
    const reasonCardContent = `<h3 style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.h3Size}; color: ${theme.palette.warning.main}; margin-top: 0; margin-bottom: 10px;">Reason for Cancellation:</h3> <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin:0; line-height: 1.6;">${reason || 'No specific reason provided.'}</p>`;
    const reasonCard = createStyledCard(reasonCardContent, theme.palette.warning.main + '1A');

    const contentHtml = `
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 15px; line-height: 1.6;">
        Hello ${mentorName},
      </p>
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 20px; line-height: 1.6;">
        ${cancelMessage}
      </p>
      ${sessionDetailsCard}
      ${reasonCard}
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-top: 25px; margin-bottom: 20px; line-height: 1.6;">
        This time slot (${formattedDisplayDate}, ${startTime}-${endTime}) in your schedule on the ${ADWIN_SERVICE_NAME} platform may now be available for other bookings. Please verify and update your availability if needed.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        ${createStyledButton('Manage Your Availability', availabilityLink, 'primary')}
      </div>
    `;

    const emailHtml = createBaseEmailHtml('Mentorship Session Cancelled', contentHtml, preheaderText);

    await transporter.sendMail({
      from: FROM_EMAIL_ADDRESS,
      to: mentorEmail,
      subject: subject,
      html: emailHtml,
      replyTo: REPLY_TO_EMAIL_ADDRESS
    });
    console.log(`Mentor booking CANCELLED email sent successfully to: ${mentorEmail}`);
  } catch (error) {
    console.error(`Error sending mentor booking CANCELLED email to ${mentorEmail}:`, error);
    if (error instanceof Error) {
      console.error('Detailed error (mentor booking cancelled):', {
        message: error.message,
        stack: error.stack,
        recipient: mentorEmail,
      });
    }
    throw error;
  }
};

export const sendBookingUpdateEmail = async (
  menteeEmail: string,
  menteeName: string,
  mentorName: string,
  bookingId: string,
  topic: string,
  scheduledDate: string, // YYYY-MM-DD
  startTime: string, // HH:MM (24h)
  endTime: string, // HH:MM (24h)
  meetingLink?: string,
  sharedNotes?: string
) => {
  const updateType = meetingLink && !sharedNotes ? 'Meeting Link Added/Updated' : (sharedNotes && !meetingLink ? 'Session Notes Added/Updated' : 'Session Details Updated');
  const subject = `Mentorship Session Update: ${updateType} - ${ADWIN_SERVICE_NAME}`;
  console.log(`Attempting to send booking UPDATE email to: ${menteeEmail} with subject: "${subject}"`);
  try {
    const formattedDisplayDate = formatDateForDisplay(scheduledDate);
    const bookingDetailsLink = `${FRONTEND_URL}/en/dashboard/user/bookings/${bookingId}`;
    const preheaderText = `Update for your session with ${mentorName} on ${formattedDisplayDate}.`;

    const sessionDetails = [
      `<strong>Mentor:</strong> ${mentorName}`,
      `<strong>Topic:</strong> ${topic}`,
      `<strong>Date:</strong> ${formattedDisplayDate}`,
      `<strong>Time:</strong> ${startTime} - ${endTime}`
    ];
    if (meetingLink) {
      sessionDetails.push(`<strong>Meeting Link:</strong> <a href="${meetingLink}" target="_blank" style="color: ${theme.palette.primary.main}; text-decoration: underline;">${meetingLink}</a>`);
    }
    const sessionDetailsCardContent = sessionDetails.map(detail => `<p style="margin: 0 0 8px 0; font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; line-height: 1.6;">${detail}</p>`).join('');
    const sessionDetailsCard = createStyledCard(`<h3 style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.h3Size}; color: ${theme.palette.primary.dark}; margin-top: 0; margin-bottom: 15px;">Updated Session Details:</h3>${sessionDetailsCardContent}`, theme.palette.background.default);
    
    let notesCardHtml = '';
    if (sharedNotes) {
      const notesCardContent = `<h3 style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.h3Size}; color: ${theme.palette.primary.dark}; margin-top: 0; margin-bottom: 10px;">Shared Notes from Mentor:</h3> <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin:0; line-height: 1.6; white-space: pre-wrap;">${sharedNotes}</p>`; // white-space: pre-wrap to respect newlines in notes
      notesCardHtml = createStyledCard(notesCardContent, theme.palette.info.main + '1A');
    }

    const contentHtml = `
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 15px; line-height: 1.6;">
        Hello ${menteeName},
      </p>
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 20px; line-height: 1.6;">
        Your upcoming mentorship session with <strong>${mentorName}</strong> on the ${ADWIN_SERVICE_NAME} platform has been updated by your mentor.
      </p>
      ${sessionDetailsCard}
      ${notesCardHtml}
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-top: 25px; margin-bottom: 20px; line-height: 1.6;">
        Please review the updated details. You can always view the most current information for your booking in your dashboard:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        ${createStyledButton('View Booking Details', bookingDetailsLink, 'primary')}
      </div>
    `;

    const emailHtml = createBaseEmailHtml(`Session Update: ${updateType}`, contentHtml, preheaderText);

    await transporter.sendMail({
      from: FROM_EMAIL_ADDRESS,
      to: menteeEmail,
      subject: subject,
      html: emailHtml,
      replyTo: REPLY_TO_EMAIL_ADDRESS
    });
    console.log(`Booking UPDATE email sent successfully to: ${menteeEmail}`);
  } catch (error) {
    console.error(`Error sending booking UPDATE email to ${menteeEmail}:`, error);
    if (error instanceof Error) {
      console.error('Detailed error (booking update):', {
        message: error.message,
        stack: error.stack,
        recipient: menteeEmail,
      });
    }
    throw error;
  }
};

export const sendSessionCompletionEmail = async (
  menteeEmail: string,
  menteeName: string,
  mentorName: string,
  bookingId: string,
  topic: string,
  scheduledDate: string, // YYYY-MM-DD
  sharedNotes?: string
) => {
  const subject = `Mentorship Session with ${mentorName} Completed - ${ADWIN_SERVICE_NAME}`;
  console.log(`Attempting to send session COMPLETION email to: ${menteeEmail} with subject: "${subject}"`);
  try {
    const formattedDisplayDate = formatDateForDisplay(scheduledDate);
    const rateSessionLink = `${FRONTEND_URL}/en/dashboard/user/bookings/${bookingId}?action=rate`; // Added action query param
    const preheaderText = `Your session with ${mentorName} on ${topic} is complete! Please share your feedback.`;

    const sessionDetails = [
      `<strong>Mentor:</strong> ${mentorName}`,
      `<strong>Topic:</strong> ${topic}`,
      `<strong>Date:</strong> ${formattedDisplayDate}`
    ];
    const sessionDetailsCardContent = sessionDetails.map(detail => `<p style="margin: 0 0 8px 0; font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; line-height: 1.6;">${detail}</p>`).join('');
    const sessionDetailsCard = createStyledCard(`<h3 style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.h3Size}; color: ${theme.palette.primary.dark}; margin-top: 0; margin-bottom: 15px;">Completed Session Details:</h3>${sessionDetailsCardContent}`, theme.palette.background.default);
    
    let notesCardHtml = '';
    if (sharedNotes) {
      const notesCardContent = `<h3 style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.h3Size}; color: ${theme.palette.primary.dark}; margin-top: 0; margin-bottom: 10px;">Notes from Your Mentor:</h3> <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin:0; line-height: 1.6; white-space: pre-wrap;">${sharedNotes}</p>`;
      notesCardHtml = createStyledCard(notesCardContent, theme.palette.info.main + '1A');
    }

    const furtherLearning = [
      `Book another session with ${mentorName} or explore other mentors on the ${ADWIN_SERVICE_NAME} platform.`,
      "Check out courses related to your interests and newly gained insights.",
      "Join our community forums to discuss what you've learned and connect with peers."
    ];
    const furtherLearningCardContent = `<h3 style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.h3Size}; color: ${theme.palette.primary.dark}; margin-top: 0; margin-bottom: 15px;">Want to Continue Learning?</h3> ${createStyledList(furtherLearning)}`;
    const furtherLearningCard = createStyledCard(furtherLearningCardContent, theme.palette.background.default);

    const contentHtml = `
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 15px; line-height: 1.6;">
        Hello ${menteeName},
      </p>
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 20px; line-height: 1.6;">
        Your mentorship session with <strong>${mentorName}</strong> regarding "<strong>${topic}</strong>" on the ${ADWIN_SERVICE_NAME} platform has been marked as completed.
      </p>
      ${sessionDetailsCard}
      ${notesCardHtml}
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-top: 25px; margin-bottom: 10px; font-weight: ${theme.typography.fontWeightBold}; line-height: 1.6;">
        Please take a moment to rate your session experience.
      </p>
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-bottom: 20px; line-height: 1.6;">
        Your feedback is valuable to ${mentorName} and helps other users on ${ADWIN_SERVICE_NAME} find quality mentorship.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        ${createStyledButton('Rate Your Session', rateSessionLink, 'primary')}
      </div>
      ${furtherLearningCard}
      <p style="font-family: ${theme.typography.fontFamily}; font-size: ${theme.typography.bodySize}; color: ${theme.palette.text.primary}; margin-top: 25px; margin-bottom: 0; line-height: 1.6;">
        Thank you for using ${ADWIN_SERVICE_NAME} for your mentorship needs!
      </p>
    `;

    const emailHtml = createBaseEmailHtml('Mentorship Session Completed', contentHtml, preheaderText);

    await transporter.sendMail({
      from: FROM_EMAIL_ADDRESS,
      to: menteeEmail,
      subject: subject,
      html: emailHtml,
      replyTo: REPLY_TO_EMAIL_ADDRESS
    });
    console.log(`Session COMPLETION email sent successfully to: ${menteeEmail}`);
  } catch (error) {
    console.error(`Error sending session COMPLETION email to ${menteeEmail}:`, error);
    if (error instanceof Error) {
      console.error('Detailed error (session completion):', {
        message: error.message,
        stack: error.stack,
        recipient: menteeEmail,
      });
    }
    throw error;
  }
};

console.log('Email service module fully loaded and initialized.');