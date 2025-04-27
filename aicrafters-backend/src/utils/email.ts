import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

dotenv.config();

// Create nodemailer transporter for Brevo SMTP
const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST,
  port: parseInt(process.env.BREVO_SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://aicrafters.aicademy.com';
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';

export const generateVerificationToken = (email: string): string => {
  return jwt.sign({ email }, JWT_SECRET, { expiresIn: '24h' });
};

export const sendVerificationEmail = async (email: string, fullName: string, token: string) => {
  try {
    const verificationLink = `${FRONTEND_URL}/en/verify-email/${token}`;

    await transporter.sendMail({
      from: 'AiCrafters <no-reply@aicrafters.com>',
      to: email,
      subject: 'Verify Your Email - AiCrafters',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Welcome to AiCrafters!</h2>
          <p>Hello ${fullName},</p>
          <p>Thank you for registering with AiCrafters. To complete your registration, please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
          </div>
          <p>This verification link will expire in 24 hours.</p>
          <p>If you didn't create an account with AiCrafters, please ignore this email.</p>
          <p>Best regards,<br>The AiCrafters Team</p>
        </div>
      `,
      replyTo: 'hello@aicrafters.com'
    });

  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

export const sendWelcomeEmail = async (email: string, fullName: string, password: string) => {
  try {
    await transporter.sendMail({
      from: 'AiCrafters <no-reply@aicrafters.com>',
      to: email,
      subject: 'Welcome to AiCrafters - Your Account Details',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Welcome to AiCrafters!</h2>
          <p>Hello ${fullName},</p>
          <p>An administrator has created an account for you at AiCrafters. Here are your login credentials:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 10px 0 0;"><strong>Password:</strong> ${password}</p>
            <p style="margin: 10px 0 0;"><strong>URL:</strong> <a href="https://aicrafters.aicademy.com/">aicrafters.aicademy.com</a></p>
          </div>
          <p>For security reasons, we recommend changing your password after your first login.</p>
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          <p>Best regards,<br>The AiCrafters Team</p>
        </div>
      `,
      replyTo: 'hello@aicrafters.com'
    });

  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

export const sendCourseApprovalEmail = async (email: string, fullName: string, courseTitle: string, courseId: string) => {
  try {
    await transporter.sendMail({
      from: 'AiCrafters <no-reply@aicrafters.com>',
      to: email,
      subject: 'Your Course Has Been Approved!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Course Approval Notification</h2>
          <p>Hello ${fullName},</p>
          <p>Great news! Your course "${courseTitle}" has been approved and is now published on AiCrafters.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Course Title:</strong> ${courseTitle}</p>
            <p style="margin: 10px 0 0;"><strong>Course URL:</strong> <a href="https://aicrafters.aicademy.com/en/courses/${courseId}">View Course</a></p>
          </div>
          <p>Your course is now live and accessible to users. You can:</p>
          <ul>
            <li>Monitor user enrollments</li>
            <li>Track course progress</li>
            <li>Engage with your users</li>
            <li>Update course content as needed</li>
          </ul>
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          <p>Best regards,<br>The AiCrafters Team</p>
        </div>
      `,
      replyTo: 'hello@aicrafters.com'
    });

  } catch (error) {
    console.error('Course approval email error:', error);
    if (error instanceof Error) {
      console.error('Detailed course approval email error:', {
        message: error.message,
        stack: error.stack,
        email
      });
    } else {
      console.error('Unknown email error:', error);
    }
    throw error;
  }
};

export const sendCourseRejectionEmail = async (email: string, fullName: string, courseTitle: string, courseId: string) => {
  try {
    await transporter.sendMail({
      from: 'AiCrafters <no-reply@aicrafters.com>',
      to: email,
      subject: 'Course Review Update - Revisions Required',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Course Review Update</h2>
          <p>Hello ${fullName},</p>
          <p>We've reviewed your course "${courseTitle}" and it requires some revisions before it can be published.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Course Title:</strong> ${courseTitle}</p>
          </div>
          <p>Please review the following:</p>
          <ul>
            <li>Ensure all course content meets our quality standards</li>
            <li>Check that all materials are properly organized</li>
            <li>Verify that all links and resources are working</li>
            <li>Make sure the course description is complete and accurate</li>
          </ul>
          <p>Once you've made the necessary revisions, you can resubmit the course for review.</p>
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          <p>Best regards,<br>The AiCrafters Team</p>
        </div>
      `,
      replyTo: 'hello@aicrafters.com'
    });

  } catch (error) {
    console.error('Course rejection email error:', error);
    if (error instanceof Error) {
      console.error('Detailed course rejection email error:', {
        message: error.message,
        stack: error.stack,
        email
      });
    } else {
      console.error('Unknown email error:', error);
    }
    throw error;
  }
};

export const sendCourseSubmissionEmail = async (email: string, fullName: string, courseTitle: string) => {
  try {
    await transporter.sendMail({
      from: 'AiCrafters <no-reply@aicrafters.com>',
      to: email,
      subject: 'New Course Submitted for Review',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">New Course Review Request</h2>
          <p>Hello ${fullName},</p>
          <p>A new course "${courseTitle}" has been submitted for review.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Course Title:</strong> ${courseTitle}</p>
          </div>
          <p>Please review this course at your earliest convenience. You can:</p>
          <ul>
            <li>Check the course content and materials</li>
            <li>Verify that it meets our quality standards</li>
            <li>Ensure all materials are appropriate and well-organized</li>
            <li>Approve or request revisions as needed</li>
          </ul>
          <p>You can access the course review page through your admin dashboard.</p>
          <p>Best regards,<br>The AiCrafters Team</p>
        </div>
      `,
      replyTo: 'hello@aicrafters.com'
    });

  } catch (error) {
    console.error('Course submission email error:', error);
    if (error instanceof Error) {
      console.error('Detailed course submission email error:', {
        message: error.message,
        stack: error.stack,
        email
      });
    } else {
      console.error('Unknown email error:', error);
    }
    throw error;
  }
};

export const sendAccountActivationEmail = async (email: string, fullName: string) => {
  try {
    await transporter.sendMail({
      from: 'AiCrafters <no-reply@aicrafters.com>',
      to: email,
      subject: 'Welcome to AiCrafters - Your Account is Now Active!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Welcome to AiCrafters!</h2>
          <p>Hello ${fullName},</p>
          <p>Great news! Your account has been successfully verified and activated. You now have full access to all features of the AiCrafters platform.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">What you can do now:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Browse our extensive course catalog</li>
              <li>Save courses to your wishlist</li>
              <li>Purchase and enroll in courses</li>
              <li>Track your learning progress</li>
              <li>Interact with instructors and other learners</li>
            </ul>
          </div>

          <div style="margin: 20px 0;">
            <p><strong>Ready to start learning?</strong></p>
            <p>Visit our course catalog and begin your learning journey today!</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${FRONTEND_URL}/en/courses" 
                 style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Browse Courses
              </a>
            </div>
          </div>

          <div style="border-top: 1px solid #eee; margin-top: 20px; padding-top: 20px;">
            <p>Need help getting started?</p>
            <p>Our support team is always here to help! Feel free to contact us at <a href="mailto:aicrafters@aicademy.com">aicrafters@aicademy.com</a> if you have any questions.</p>
          </div>

          <p>Best regards,<br>The AiCrafters Team</p>
        </div>
      `,
      replyTo: 'hello@aicrafters.com'
    });

  } catch (error) {
    console.error('Account activation email error:', error);
    if (error instanceof Error) {
      console.error('Detailed account activation email error:', {
        message: error.message,
        stack: error.stack,
        email
      });
    } else {
      console.error('Unknown email error:', error);
    }
    throw error;
  }
};

export const sendPurchaseConfirmationEmail = async (email: string, fullName: string, courseTitle: string, courseId: string, instructorName: string) => {
  try {
    await transporter.sendMail({
      from: 'AiCrafters <no-reply@aicrafters.com>',
      to: email,
      subject: 'Course Purchase Confirmation - AiCrafters',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Thank You for Your Purchase!</h2>
          <p>Hello ${fullName},</p>
          <p>Thank you for purchasing the course "${courseTitle}" by ${instructorName}. Your enrollment has been confirmed, and you now have full access to all course materials.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Course Details:</h3>
            <p style="margin: 0;"><strong>Course:</strong> ${courseTitle}</p>
            <p style="margin: 10px 0 0;"><strong>Instructor:</strong> ${instructorName}</p>
          </div>

          <div style="margin: 20px 0;">
            <p><strong>Ready to start learning?</strong></p>
            <p>Click the button below to access your course:</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${FRONTEND_URL}/en/dashboard/user/learning" 
                 style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Start Learning
              </a>
            </div>
          </div>

          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">What's Next?</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Access all course materials at your own pace</li>
              <li>Track your progress through the course</li>
              <li>Participate in course discussions</li>
              <li>Complete exercises and assignments</li>
              <li>Earn your completion certificate</li>
            </ul>
          </div>

          <div style="border-top: 1px solid #eee; margin-top: 20px; padding-top: 20px;">
            <p>Need help with the course?</p>
            <p>You can reach out to your instructor through the course platform or contact our support team at <a href="mailto:aicrafters@aicademy.com">aicrafters@aicademy.com</a>.</p>
          </div>

          <p>Happy learning!<br>The AiCrafters Team</p>
        </div>
      `,
      replyTo: 'hello@aicrafters.com'
    });

  } catch (error) {
    console.error('Purchase confirmation email error:', error);
    if (error instanceof Error) {
      console.error('Detailed purchase confirmation email error:', {
        message: error.message,
        stack: error.stack,
        email
      });
    } else {
      console.error('Unknown email error:', error);
    }
    throw error;
  }
};

export const sendNewUserNotificationEmail = async (adminEmail: string, adminName: string, userName: string, userEmail: string) => {
  try {
    await transporter.sendMail({
      from: 'AiCrafters <no-reply@aicrafters.com>',
      to: adminEmail,
      subject: 'New User Registration - AiCrafters',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">New User Registration</h2>
          <p>Hello ${adminName},</p>
          <p>A new user has registered on AiCrafters.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">User Details:</h3>
            <p style="margin: 0;"><strong>Name:</strong> ${userName}</p>
            <p style="margin: 10px 0 0;"><strong>Email:</strong> ${userEmail}</p>
          </div>

          <div style="margin: 20px 0;">
            <p>You can view and manage this user's account through your admin dashboard.</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${FRONTEND_URL}/en/dashboard/admin/users" 
                 style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Users
              </a>
            </div>
          </div>

          <div style="border-top: 1px solid #eee; margin-top: 20px; padding-top: 20px;">
            <p>This is an automated notification. Please do not reply to this email.</p>
          </div>

          <p>Best regards,<br>The AiCrafters Team</p>
        </div>
      `,
      replyTo: 'hello@aicrafters.com'
    });

  } catch (error) {
    console.error('New user notification email error:', error);
    if (error instanceof Error) {
      console.error('Detailed new user notification email error:', {
        message: error.message,
        stack: error.stack,
        email: adminEmail
      });
    } else {
      console.error('Unknown email error:', error);
    }
    throw error;
  }
};

export const sendCourseInvitationEmail = async (
  email: string,
  courseTitle: string,
  courseId: string,
  instructorName: string
) => {
  try {
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to ${courseTitle}!</h2>
        <p>Hello,</p>
        <p>You have been invited by ${instructorName} to join the course "${courseTitle}".</p>
        <p>You can access the course content immediately through your dashboard.</p>
        <div style="margin: 30px 0;">
          <a href="${FRONTEND_URL}/en/dashboard/user/learning/${courseId}" 
             style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px;">
            Access Course
          </a>
        </div>
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        <p>Best regards,<br>The AiCrafters Team</p>
      </div>
    `;

    await transporter.sendMail({
      from: 'AiCrafters <no-reply@aicrafters.com>',
      to: email,
      subject: `You've Been Invited to ${courseTitle}`,
      html: emailHtml,
      replyTo: 'hello@aicrafters.com'
    });

  } catch (error) {
    console.error('Error sending course invitation email:', error);
    throw error;
  }
};

export const generatePasswordResetToken = (email: string): string => {
  return jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
};

export const sendPasswordResetEmail = async (email: string, fullName: string, token: string) => {
  try {
    // Use /en as default language for password reset link
    const resetLink = `${FRONTEND_URL}/en/reset-password/${token}`;

    await transporter.sendMail({
      from: 'AiCrafters <no-reply@aicrafters.com>',
      to: email,
      subject: 'Reset Your Password - AiCrafters',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Reset Your Password</h2>
          <p>Hello ${fullName},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>This password reset link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
          <div style="border-top: 1px solid #eee; margin-top: 20px; padding-top: 20px;">
            <p>For security reasons, please:</p>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Never share your password with anyone</li>
              <li>Use a unique password for your AiCrafters account</li>
            </ul>
          </div>
          <p>Best regards,<br>The AiCrafters Team</p>
        </div>
      `,
      replyTo: 'hello@aicrafters.com'
    });

  } catch (error) {
    console.error('Password reset email error:', error);
    if (error instanceof Error) {
      console.error('Detailed password reset email error:', {
        message: error.message,
        stack: error.stack,
        email
      });
    } else {
      console.error('Unknown email error:', error);
    }
    throw error;
  }
};

export const sendPasswordResetConfirmationEmail = async (email: string, fullName: string) => {
  try {
    await transporter.sendMail({
      from: 'AiCrafters <no-reply@aicrafters.com>',
      to: email,
      subject: 'Password Reset Confirmation - AiCrafters',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Password Reset Confirmation</h2>
          <p>Hello ${fullName},</p>
          <p>Your password has been successfully reset. This email confirms that your password was changed.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Security Notice:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>This change was made from your account settings</li>
              <li>Time of change: ${new Date().toLocaleString()}</li>
            </ul>
          </div>

          <div style="margin: 20px 0;">
            <p>If you did not make this change, please:</p>
            <ol style="margin: 10px 0; padding-left: 20px;">
              <li>Change your password immediately</li>
              <li>Contact our support team</li>
            </ol>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${FRONTEND_URL}/en/login" 
               style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px;">
              Login to Your Account
            </a>
          </div>

          <div style="border-top: 1px solid #eee; margin-top: 20px; padding-top: 20px;">
            <p>For security reasons, please:</p>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Never share your password with anyone</li>
              <li>Use a unique password for your AiCrafters account</li>
            </ul>
          </div>

          <p>If you have any questions or concerns, please contact our support team at <a href="mailto:aicrafters@aicademy.com">aicrafters@aicademy.com</a>.</p>
          <p>Best regards,<br>The AiCrafters Team</p>
        </div>
      `,
      replyTo: 'hello@aicrafters.com'
    });

  } catch (error) {
    console.error('Error sending password reset confirmation email:', error);
    throw error;
  }
}; 