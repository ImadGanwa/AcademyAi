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

const FRONTEND_URL = process.env.FRONTEND_URL;
const JWT_SECRET = process.env.JWT_SECRET;

// Check if JWT_SECRET is defined
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined');
}

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

export const sendMentorApprovalEmail = async (email: string, fullName: string) => {
  try {
    await transporter.sendMail({
      from: 'AiCrafters <no-reply@aicrafters.com>',
      to: email,
      subject: 'Your Mentor Application Has Been Approved!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Congratulations! You're Now a Mentor</h2>
          <p>Hello ${fullName},</p>
          <p>We are pleased to inform you that your application to become a mentor on AiCrafters has been approved!</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">What's Next:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Complete your mentor profile to attract more students</li>
              <li>Set your availability schedule</li>
              <li>Start connecting with students looking for mentorship</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${FRONTEND_URL}/en/dashboard/mentor" 
               style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Go to Mentor Dashboard
            </a>
          </div>

          <p>As a mentor, you'll be able to share your knowledge and experience with eager learners. You can guide them through their learning journey, provide career advice, and help them achieve their goals.</p>
          
          <div style="border-top: 1px solid #eee; margin-top: 20px; padding-top: 20px;">
            <p>If you have any questions about being a mentor or need assistance with your mentor profile, please contact our support team at <a href="mailto:aicrafters@aicademy.com">aicrafters@aicademy.com</a>.</p>
          </div>

          <p>Thank you for joining our community of mentors!</p>
          <p>Best regards,<br>The AiCrafters Team</p>
        </div>
      `,
      replyTo: 'hello@aicrafters.com'
    });

  } catch (error) {
    console.error('Error sending mentor approval email:', error);
    if (error instanceof Error) {
      console.error('Detailed mentor approval email error:', {
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

export const sendMentorRejectionEmail = async (email: string, fullName: string, reason?: string) => {
  try {
    await transporter.sendMail({
      from: 'AiCrafters <no-reply@aicrafters.com>',
      to: email,
      subject: 'Update on Your Mentor Application',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Mentor Application Update</h2>
          <p>Hello ${fullName},</p>
          <p>Thank you for your interest in becoming a mentor on AiCrafters. We've carefully reviewed your application, and unfortunately, we are unable to approve it at this time.</p>
          
          ${reason ? `
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Feedback:</h3>
            <p>${reason}</p>
          </div>
          ` : ''}

          <p>We encourage you to:</p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Review our mentor requirements and guidelines</li>
            <li>Enhance your professional profile with additional experience or certifications</li>
            <li>Apply again in the future when you feel your qualifications better align with our mentor criteria</li>
          </ul>

          <div style="border-top: 1px solid #eee; margin-top: 20px; padding-top: 20px;">
            <p>If you have any questions or would like more detailed feedback, please contact our support team at <a href="mailto:aicrafters@aicademy.com">aicrafters@aicademy.com</a>.</p>
          </div>

          <p>Thank you for your understanding.</p>
          <p>Best regards,<br>The AiCrafters Team</p>
        </div>
      `,
      replyTo: 'hello@aicrafters.com'
    });

  } catch (error) {
    console.error('Error sending mentor rejection email:', error);
    if (error instanceof Error) {
      console.error('Detailed mentor rejection email error:', {
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

export const sendMentorWelcomeEmail = async (email: string, fullName: string, password: string) => {
  try {
    await transporter.sendMail({
      from: 'AiCrafters <no-reply@aicrafters.com>',
      to: email,
      subject: 'Welcome to AiCrafters Mentorship Program - Your Account Details',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Congratulations! You're Now an AiCrafters Mentor</h2>
          <p>Hello ${fullName},</p>
          <p>We are pleased to inform you that your application to become a mentor on AiCrafters has been approved! We've created an account for you with mentor privileges.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Your Account Details:</h3>
            <p style="margin: 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 10px 0 0;"><strong>Password:</strong> ${password}</p>
          </div>
          
          <div style="background-color: #fff4e5; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #ffd699;">
            <p style="color: #663c00; margin: 0; font-weight: 500;">For security reasons, we recommend changing your password after your first login.</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${FRONTEND_URL}/en/login" 
               style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Login to Your Mentor Dashboard
            </a>
          </div>

          <p>As a mentor, you'll be able to:</p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Complete your profile to attract potential mentees</li>
            <li>Set your availability schedule</li>
            <li>Connect with students looking for mentorship</li>
            <li>Track your mentorship sessions</li>
            <li>Receive payments for your mentoring services</li>
          </ul>
          
          <div style="border-top: 1px solid #eee; margin-top: 20px; padding-top: 20px;">
            <p>If you have any questions about being a mentor or need assistance with your mentor profile, please contact our support team at <a href="mailto:aicrafters@aicademy.com">aicrafters@aicademy.com</a>.</p>
          </div>

          <p>Thank you for joining our community of mentors!</p>
          <p>Best regards,<br>The AiCrafters Team</p>
        </div>
      `,
      replyTo: 'hello@aicrafters.com'
    });

  } catch (error) {
    console.error('Error sending mentor welcome email:', error);
    if (error instanceof Error) {
      console.error('Detailed mentor welcome email error:', {
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

// Booking related emails

export const sendMentorBookingNotificationEmail = async (
  mentorEmail: string, 
  mentorName: string,
  menteeName: string,
  bookingId: string,
  topic: string,
  scheduledDate: string,
  startTime: string,
  endTime: string
) => {
  try {
    // Format date for display
    const formattedDate = new Date(scheduledDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    await transporter.sendMail({
      from: 'AiCrafters <no-reply@aicrafters.com>',
      to: mentorEmail,
      subject: 'New Mentorship Session Booked - AiCrafters',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">New Mentorship Session Booked</h2>
          <p>Hello ${mentorName},</p>
          <p>You have a new mentorship session booking from ${menteeName}.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Session Details:</h3>
            <p style="margin: 0;"><strong>Topic:</strong> ${topic}</p>
            <p style="margin: 10px 0 0;"><strong>Date:</strong> ${formattedDate}</p>
            <p style="margin: 10px 0 0;"><strong>Time:</strong> ${startTime} - ${endTime}</p>
          </div>

          <div style="margin: 20px 0;">
            <p>You can view the complete details and manage this booking through your mentor dashboard.</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${FRONTEND_URL}/en/dashboard/mentor/bookings/${bookingId}" 
                 style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Booking
              </a>
            </div>
          </div>

          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Next Steps:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Review the session details</li>
              <li>Add a meeting link for the session</li>
              <li>Prepare any necessary materials</li>
              <li>Contact the mentee if you need more information</li>
            </ul>
          </div>

          <p>Best regards,<br>The AiCrafters Team</p>
        </div>
      `,
      replyTo: 'hello@aicrafters.com'
    });

  } catch (error) {
    console.error('Error sending mentor booking notification email:', error);
    if (error instanceof Error) {
      console.error('Detailed error:', {
        message: error.message,
        stack: error.stack,
        email: mentorEmail
      });
    } else {
      console.error('Unknown email error:', error);
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
  scheduledDate: string,
  startTime: string,
  endTime: string,
  price: number
) => {
  try {
    // Format date for display
    const formattedDate = new Date(scheduledDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    await transporter.sendMail({
      from: 'AiCrafters <no-reply@aicrafters.com>',
      to: menteeEmail,
      subject: 'Mentorship Session Booking Confirmation - AiCrafters',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Booking Confirmation</h2>
          <p>Hello ${menteeName},</p>
          <p>Your mentorship session with ${mentorName} has been successfully booked.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Session Details:</h3>
            <p style="margin: 0;"><strong>Mentor:</strong> ${mentorName}</p>
            <p style="margin: 10px 0 0;"><strong>Topic:</strong> ${topic}</p>
            <p style="margin: 10px 0 0;"><strong>Date:</strong> ${formattedDate}</p>
            <p style="margin: 10px 0 0;"><strong>Time:</strong> ${startTime} - ${endTime}</p>
            <p style="margin: 10px 0 0;"><strong>Price:</strong> $${price.toFixed(2)}</p>
          </div>

          <div style="margin: 20px 0;">
            <p>You can view the complete details of your booking through your dashboard.</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${FRONTEND_URL}/en/dashboard/user/bookings/${bookingId}" 
                 style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Booking
              </a>
            </div>
          </div>

          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Important Information:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Your mentor will provide a meeting link closer to the session time</li>
              <li>You can cancel this booking up to 24 hours before the scheduled time</li>
              <li>Prepare any questions or topics you'd like to discuss in advance</li>
            </ul>
          </div>

          <p>We hope you have a productive mentorship session!</p>
          <p>Best regards,<br>The AiCrafters Team</p>
        </div>
      `,
      replyTo: 'hello@aicrafters.com'
    });

  } catch (error) {
    console.error('Error sending mentee booking confirmation email:', error);
    if (error instanceof Error) {
      console.error('Detailed error:', {
        message: error.message,
        stack: error.stack,
        email: menteeEmail
      });
    } else {
      console.error('Unknown email error:', error);
    }
    throw error;
  }
};

export const sendMenteeBookingCancelledEmail = async (
  menteeEmail: string, 
  menteeName: string,
  mentorName: string,
  topic: string,
  scheduledDate: string,
  startTime: string,
  endTime: string,
  cancelledBy: 'mentor' | 'mentee',
  reason: string
) => {
  try {
    // Format date for display
    const formattedDate = new Date(scheduledDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const cancelMessage = cancelledBy === 'mentor' 
      ? `Your mentorship session with ${mentorName} has been cancelled by the mentor.` 
      : 'You have cancelled your mentorship session.';

    await transporter.sendMail({
      from: 'AiCrafters <no-reply@aicrafters.com>',
      to: menteeEmail,
      subject: 'Mentorship Session Cancelled - AiCrafters',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Booking Cancellation</h2>
          <p>Hello ${menteeName},</p>
          <p>${cancelMessage}</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Session Details:</h3>
            <p style="margin: 0;"><strong>Mentor:</strong> ${mentorName}</p>
            <p style="margin: 10px 0 0;"><strong>Topic:</strong> ${topic}</p>
            <p style="margin: 10px 0 0;"><strong>Date:</strong> ${formattedDate}</p>
            <p style="margin: 10px 0 0;"><strong>Time:</strong> ${startTime} - ${endTime}</p>
          </div>

          <div style="background-color: #fff4e5; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #ffd699;">
            <h3 style="color: #663c00; margin-top: 0;">Cancellation Reason:</h3>
            <p style="color: #663c00; margin: 0;">${reason}</p>
          </div>

          <div style="margin: 20px 0;">
            <p>You can book another session with the same or a different mentor through our platform.</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${FRONTEND_URL}/en/mentors" 
                 style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Find Mentors
              </a>
            </div>
          </div>

          <p>If you have any questions, please don't hesitate to contact our support team.</p>
          <p>Best regards,<br>The AiCrafters Team</p>
        </div>
      `,
      replyTo: 'hello@aicrafters.com'
    });

  } catch (error) {
    console.error('Error sending mentee booking cancellation email:', error);
    if (error instanceof Error) {
      console.error('Detailed error:', {
        message: error.message,
        stack: error.stack,
        email: menteeEmail
      });
    } else {
      console.error('Unknown email error:', error);
    }
    throw error;
  }
};

export const sendMentorBookingCancelledEmail = async (
  mentorEmail: string, 
  mentorName: string,
  menteeName: string,
  topic: string,
  scheduledDate: string,
  startTime: string,
  endTime: string,
  cancelledBy: 'mentor' | 'mentee',
  reason: string
) => {
  try {
    // Format date for display
    const formattedDate = new Date(scheduledDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const cancelMessage = cancelledBy === 'mentee' 
      ? `A mentorship session with ${menteeName} has been cancelled by the mentee.` 
      : 'You have cancelled a mentorship session.';

    await transporter.sendMail({
      from: 'AiCrafters <no-reply@aicrafters.com>',
      to: mentorEmail,
      subject: 'Mentorship Session Cancelled - AiCrafters',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Booking Cancellation</h2>
          <p>Hello ${mentorName},</p>
          <p>${cancelMessage}</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Session Details:</h3>
            <p style="margin: 0;"><strong>Mentee:</strong> ${menteeName}</p>
            <p style="margin: 10px 0 0;"><strong>Topic:</strong> ${topic}</p>
            <p style="margin: 10px 0 0;"><strong>Date:</strong> ${formattedDate}</p>
            <p style="margin: 10px 0 0;"><strong>Time:</strong> ${startTime} - ${endTime}</p>
          </div>

          <div style="background-color: #fff4e5; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #ffd699;">
            <h3 style="color: #663c00; margin-top: 0;">Cancellation Reason:</h3>
            <p style="color: #663c00; margin: 0;">${reason}</p>
          </div>

          <div style="margin: 20px 0;">
            <p>This time slot is now available for other bookings.</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${FRONTEND_URL}/en/dashboard/mentor/availability" 
                 style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Manage Availability
              </a>
            </div>
          </div>

          <p>If you have any questions, please don't hesitate to contact our support team.</p>
          <p>Best regards,<br>The AiCrafters Team</p>
        </div>
      `,
      replyTo: 'hello@aicrafters.com'
    });

  } catch (error) {
    console.error('Error sending mentor booking cancellation email:', error);
    if (error instanceof Error) {
      console.error('Detailed error:', {
        message: error.message,
        stack: error.stack,
        email: mentorEmail
      });
    } else {
      console.error('Unknown email error:', error);
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
  scheduledDate: string,
  startTime: string,
  endTime: string,
  meetingLink?: string,
  sharedNotes?: string
) => {
  try {
    // Format date for display
    const formattedDate = new Date(scheduledDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const updateType = meetingLink ? 'Meeting Link Added' : 'Session Notes Updated';

    await transporter.sendMail({
      from: 'AiCrafters <no-reply@aicrafters.com>',
      to: menteeEmail,
      subject: `Mentorship Session Update: ${updateType} - AiCrafters`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Mentorship Session Update</h2>
          <p>Hello ${menteeName},</p>
          <p>Your upcoming mentorship session with ${mentorName} has been updated.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Session Details:</h3>
            <p style="margin: 0;"><strong>Mentor:</strong> ${mentorName}</p>
            <p style="margin: 10px 0 0;"><strong>Topic:</strong> ${topic}</p>
            <p style="margin: 10px 0 0;"><strong>Date:</strong> ${formattedDate}</p>
            <p style="margin: 10px 0 0;"><strong>Time:</strong> ${startTime} - ${endTime}</p>
            ${meetingLink ? `<p style="margin: 10px 0 0;"><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
          </div>

          ${sharedNotes ? `
          <div style="background-color: #edf7ed; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #c8e6c9;">
            <h3 style="color: #1b5e20; margin-top: 0;">Session Notes:</h3>
            <p style="color: #1b5e20; margin: 0;">${sharedNotes}</p>
          </div>
          ` : ''}

          <div style="margin: 20px 0;">
            <p>You can view the complete details of your booking through your dashboard.</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${FRONTEND_URL}/en/dashboard/user/bookings/${bookingId}" 
                 style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Booking
              </a>
            </div>
          </div>

          <p>We hope you have a productive mentorship session!</p>
          <p>Best regards,<br>The AiCrafters Team</p>
        </div>
      `,
      replyTo: 'hello@aicrafters.com'
    });

  } catch (error) {
    console.error('Error sending booking update email:', error);
    if (error instanceof Error) {
      console.error('Detailed error:', {
        message: error.message,
        stack: error.stack,
        email: menteeEmail
      });
    } else {
      console.error('Unknown email error:', error);
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
  scheduledDate: string,
  sharedNotes?: string
) => {
  try {
    // Format date for display
    const formattedDate = new Date(scheduledDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    await transporter.sendMail({
      from: 'AiCrafters <no-reply@aicrafters.com>',
      to: menteeEmail,
      subject: 'Mentorship Session Completed - AiCrafters',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Mentorship Session Completed</h2>
          <p>Hello ${menteeName},</p>
          <p>Your mentorship session with ${mentorName} has been marked as completed.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Session Details:</h3>
            <p style="margin: 0;"><strong>Mentor:</strong> ${mentorName}</p>
            <p style="margin: 10px 0 0;"><strong>Topic:</strong> ${topic}</p>
            <p style="margin: 10px 0 0;"><strong>Date:</strong> ${formattedDate}</p>
          </div>

          ${sharedNotes ? `
          <div style="background-color: #edf7ed; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #c8e6c9;">
            <h3 style="color: #1b5e20; margin-top: 0;">Session Notes:</h3>
            <p style="color: #1b5e20; margin: 0;">${sharedNotes}</p>
          </div>
          ` : ''}

          <div style="margin: 20px 0;">
            <p><strong>Please take a moment to rate your session experience.</strong></p>
            <p>Your feedback is valuable and helps other users find quality mentors.</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${FRONTEND_URL}/en/dashboard/user/bookings/${bookingId}" 
                 style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Rate Your Session
              </a>
            </div>
          </div>

          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Want to continue learning?</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Book another session with ${mentorName} or explore other mentors</li>
              <li>Check out our courses related to your interests</li>
              <li>Join our community forums to discuss what you've learned</li>
            </ul>
          </div>

          <p>Thank you for using AiCrafters for your mentorship needs!</p>
          <p>Best regards,<br>The AiCrafters Team</p>
        </div>
      `,
      replyTo: 'hello@aicrafters.com'
    });

  } catch (error) {
    console.error('Error sending session completion email:', error);
    if (error instanceof Error) {
      console.error('Detailed error:', {
        message: error.message,
        stack: error.stack,
        email: menteeEmail
      });
    } else {
      console.error('Unknown email error:', error);
    }
    throw error;
  }
};

export const sendMentorBookingConfirmationEmail = async (
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
  try {
    // Format date for display
    const formattedDate = new Date(scheduledDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Create ICS calendar event data
    const eventStartDate = new Date(`${scheduledDate}T${startTime}`);
    const eventEndDate = new Date(`${scheduledDate}T${endTime}`);
    
    // Format dates for ICS file
    const formatICSDate = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//AiCrafters//Mentorship Session//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
SUMMARY:Mentorship Session with ${menteeName}
DTSTART:${formatICSDate(eventStartDate)}
DTEND:${formatICSDate(eventEndDate)}
DESCRIPTION:Topic: ${topic}\\n${meetingLink ? `Meeting Link: ${meetingLink}` : 'Meeting link will be provided soon'}
LOCATION:Online
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT30M
ACTION:DISPLAY
DESCRIPTION:Reminder
END:VALARM
END:VEVENT
END:VCALENDAR`;

    // Generate Google Calendar link
    const googleCalendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Mentorship Session with ${menteeName}`)}&dates=${formatICSDate(eventStartDate)}/${formatICSDate(eventEndDate)}&details=${encodeURIComponent(`Topic: ${topic}\n${meetingLink ? `Meeting Link: ${meetingLink}` : 'Meeting link will be provided soon'}`)}&location=${encodeURIComponent('Online')}&sf=true&output=xml`;

    await transporter.sendMail({
      from: 'AiCrafters <no-reply@aicrafters.com>',
      to: mentorEmail,
      subject: 'Mentorship Session Confirmed - AiCrafters',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Your Mentorship Session is Confirmed</h2>
          <p>Hello ${mentorName},</p>
          <p>This is a confirmation for your upcoming mentorship session with <strong>${menteeName}</strong>.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Session Details:</h3>
            <p style="margin: 0;"><strong>Mentee:</strong> ${menteeName}</p>
            <p style="margin: 10px 0 0;"><strong>Topic:</strong> ${topic}</p>
            <p style="margin: 10px 0 0;"><strong>Date:</strong> ${formattedDate}</p>
            <p style="margin: 10px 0 0;"><strong>Time:</strong> ${startTime} - ${endTime}</p>
            ${meetingLink ? `<p style="margin: 10px 0 0;"><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
          </div>

          <div style="background-color: #edf7ed; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #c8e6c9;">
            <h3 style="color: #1b5e20; margin-top: 0;">Add to Calendar:</h3>
            <p style="margin: 10px 0 0;">Add this session to your calendar to make sure you don't miss it:</p>
            <div style="margin-top: 15px;">
              <a href="${googleCalendarLink}" style="display: inline-block; background-color: #4285F4; color: white; padding: 8px 15px; text-decoration: none; border-radius: 3px; margin-right: 10px;">
                Add to Google Calendar
              </a>
              <a href="data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}" download="mentorship-session.ics" style="display: inline-block; background-color: #0078D4; color: white; padding: 8px 15px; text-decoration: none; border-radius: 3px;">
                Download ICS File
              </a>
            </div>
          </div>

          <div style="margin: 20px 0;">
            <p>You can view the complete details and manage this booking through your mentor dashboard.</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${FRONTEND_URL}/en/dashboard/mentor/bookings/${bookingId}" 
                 style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Booking
              </a>
            </div>
          </div>

          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Preparing for the Session:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Review the mentee's questions and topic</li>
              <li>${!meetingLink ? 'Add a meeting link for the session' : 'Test your meeting link before the session'}</li>
              <li>Prepare any necessary materials</li>
              <li>Ensure you have a stable internet connection and quiet environment</li>
            </ul>
          </div>

          <p>Best regards,<br>The AiCrafters Team</p>
        </div>
      `,
      attachments: [
        {
          filename: 'mentorship-session.ics',
          content: icsContent,
          contentType: 'text/calendar'
        }
      ],
      replyTo: 'hello@aicrafters.com'
    });

  } catch (error) {
    console.error('Error sending mentor booking confirmation email:', error);
    if (error instanceof Error) {
      console.error('Detailed error:', {
        message: error.message,
        stack: error.stack,
        email: mentorEmail
      });
    } else {
      console.error('Unknown email error:', error);
    }
    throw error;
  }
};

export const sendMenteeBookingConfirmedEmail = async (
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
  try {
    // Format date for display
    const formattedDate = new Date(scheduledDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Create ICS calendar event data
    const eventStartDate = new Date(`${scheduledDate}T${startTime}`);
    const eventEndDate = new Date(`${scheduledDate}T${endTime}`);
    
    // Format dates for ICS file
    const formatICSDate = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//AiCrafters//Mentorship Session//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
SUMMARY:Mentorship Session with ${mentorName}
DTSTART:${formatICSDate(eventStartDate)}
DTEND:${formatICSDate(eventEndDate)}
DESCRIPTION:Topic: ${topic}\\n${meetingLink ? `Meeting Link: ${meetingLink}` : 'Meeting link will be provided by your mentor'}
LOCATION:Online
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT30M
ACTION:DISPLAY
DESCRIPTION:Reminder
END:VALARM
END:VEVENT
END:VCALENDAR`;

    // Generate Google Calendar link
    const googleCalendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Mentorship Session with ${mentorName}`)}&dates=${formatICSDate(eventStartDate)}/${formatICSDate(eventEndDate)}&details=${encodeURIComponent(`Topic: ${topic}\n${meetingLink ? `Meeting Link: ${meetingLink}` : 'Meeting link will be provided by your mentor'}`)}&location=${encodeURIComponent('Online')}&sf=true&output=xml`;

    await transporter.sendMail({
      from: 'AiCrafters <no-reply@aicrafters.com>',
      to: menteeEmail,
      subject: 'Your Mentorship Session is Confirmed - AiCrafters',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Your Mentorship Session is Confirmed</h2>
          <p>Hello ${menteeName},</p>
          <p>Your mentorship session with <strong>${mentorName}</strong> has been confirmed.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Session Details:</h3>
            <p style="margin: 0;"><strong>Mentor:</strong> ${mentorName}</p>
            <p style="margin: 10px 0 0;"><strong>Topic:</strong> ${topic}</p>
            <p style="margin: 10px 0 0;"><strong>Date:</strong> ${formattedDate}</p>
            <p style="margin: 10px 0 0;"><strong>Time:</strong> ${startTime} - ${endTime}</p>
            ${meetingLink ? `<p style="margin: 10px 0 0;"><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : '<p style="margin: 10px 0 0;"><strong>Meeting Link:</strong> Your mentor will provide the meeting link before the session</p>'}
          </div>

          <div style="background-color: #edf7ed; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #c8e6c9;">
            <h3 style="color: #1b5e20; margin-top: 0;">Add to Calendar:</h3>
            <p style="margin: 10px 0 0;">Add this session to your calendar to make sure you don't miss it:</p>
            <div style="margin-top: 15px;">
              <a href="${googleCalendarLink}" style="display: inline-block; background-color: #4285F4; color: white; padding: 8px 15px; text-decoration: none; border-radius: 3px; margin-right: 10px;">
                Add to Google Calendar
              </a>
              <a href="data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}" download="mentorship-session.ics" style="display: inline-block; background-color: #0078D4; color: white; padding: 8px 15px; text-decoration: none; border-radius: 3px;">
                Download ICS File
              </a>
            </div>
          </div>

          <div style="margin: 20px 0;">
            <p>You can view the complete details of your booking through your dashboard.</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${FRONTEND_URL}/en/dashboard/user/bookings/${bookingId}" 
                 style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Booking
              </a>
            </div>
          </div>

          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Preparing for the Session:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Prepare specific questions or topics you'd like to discuss</li>
              <li>Research any background information that might be helpful</li>
              <li>Test your audio/video setup before the session</li>
              <li>Find a quiet place with a stable internet connection</li>
              <li>Be on time - sessions start promptly at the scheduled time</li>
            </ul>
          </div>

          <p>We hope you have a productive mentorship session!</p>
          <p>Best regards,<br>The AiCrafters Team</p>
        </div>
      `,
      attachments: [
        {
          filename: 'mentorship-session.ics',
          content: icsContent,
          contentType: 'text/calendar'
        }
      ],
      replyTo: 'hello@aicrafters.com'
    });

  } catch (error) {
    console.error('Error sending mentee booking confirmed email:', error);
    if (error instanceof Error) {
      console.error('Detailed error:', {
        message: error.message,
        stack: error.stack,
        email: menteeEmail
      });
    } else {
      console.error('Unknown email error:', error);
    }
    throw error;
  }
}; 