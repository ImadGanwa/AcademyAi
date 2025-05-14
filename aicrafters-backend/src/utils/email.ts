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

// Email template management
interface EmailTemplates {
  [key: string]: {
    subject: string;
    html: (data: any) => string;
  };
}

// Email templates by language
const emailTemplates: { [key: string]: EmailTemplates } = {
  // English templates
  en: {
    verificationEmail: {
      subject: 'Verify Your Email - AiCrafters',
      html: ({ fullName, verificationLink }) => `
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
      `
    },
    accountActivationEmail: {
      subject: 'Welcome to AiCrafters - Your Account is Now Active!',
      html: ({ fullName, coursesLink }) => `
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
              <a href="${coursesLink}" 
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
      `
    },
    courseApprovalEmail: {
      subject: 'Your Course Has Been Approved!',
      html: ({ fullName, courseTitle, courseId, courseUrl }) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Course Approval Notification</h2>
          <p>Hello ${fullName},</p>
          <p>Great news! Your course "${courseTitle}" has been approved and is now published on AiCrafters.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Course Title:</strong> ${courseTitle}</p>
            <p style="margin: 10px 0 0;"><strong>Course URL:</strong> <a href="${courseUrl}">View Course</a></p>
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
      `
    },
    courseRejectionEmail: {
      subject: 'Course Review Update - Revisions Required',
      html: ({ fullName, courseTitle, courseId }) => `
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
      `
    },
    courseSubmissionEmail: {
      subject: 'New Course Submitted for Review',
      html: ({ fullName, courseTitle }) => `
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
      `
    },
    newUserNotificationEmail: {
      subject: 'New User Registration - AiCrafters',
      html: ({ adminName, userName, userEmail, userDashboardUrl }) => `
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
              <a href="${userDashboardUrl}" 
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
      `
    },
    courseInvitationEmail: {
      subject: `You've Been Invited to a Course`,
      html: ({ courseTitle, instructorName, courseLink }) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to ${courseTitle}!</h2>
          <p>Hello,</p>
          <p>You have been invited by ${instructorName} to join the course "${courseTitle}".</p>
          <p>You can access the course content immediately through your dashboard.</p>
          <div style="margin: 30px 0;">
            <a href="${courseLink}" 
               style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px;">
              Access Course
            </a>
          </div>
          <p>If you have any questions, please don't hesitate to contact our support team.</p>
          <p>Best regards,<br>The AiCrafters Team</p>
        </div>
      `
    },
    passwordResetEmail: {
      subject: 'Reset Your Password - AiCrafters',
      html: ({ fullName, resetLink }) => `
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
      `
    },
    passwordResetConfirmationEmail: {
      subject: 'Password Reset Confirmation - AiCrafters',
      html: ({ fullName, loginLink }) => `
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
            <a href="${loginLink}" 
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
      `
    }
  },
  // French templates
  fr: {
    verificationEmail: {
      subject: 'Vérifiez votre email - AiCrafters',
      html: ({ fullName, verificationLink }) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Bienvenue sur AiCrafters !</h2>
          <p>Bonjour ${fullName},</p>
          <p>Merci de vous être inscrit sur AiCrafters. Pour finaliser votre inscription, veuillez vérifier votre adresse e-mail en cliquant sur le bouton ci-dessous :</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block;">Vérifier l'email</a>
          </div>
          <p>Ce lien de vérification expirera dans 24 heures.</p>
          <p>Si vous n'avez pas créé de compte AiCrafters, veuillez ignorer cet e-mail.</p>
          <p>Cordialement,<br>L'équipe AiCrafters</p>
        </div>
      `
    },
    accountActivationEmail: {
      subject: 'Bienvenue sur AiCrafters - Votre compte est maintenant actif !',
      html: ({ fullName, coursesLink }) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Bienvenue sur AiCrafters !</h2>
          <p>Bonjour ${fullName},</p>
          <p>Bonne nouvelle ! Votre compte a été vérifié et activé avec succès. Vous avez maintenant accès à toutes les fonctionnalités de la plateforme AiCrafters.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Ce que vous pouvez faire maintenant :</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Parcourir notre vaste catalogue de cours</li>
              <li>Sauvegarder des cours dans votre liste de souhaits</li>
              <li>Acheter et vous inscrire à des cours</li>
              <li>Suivre votre progression d'apprentissage</li>
              <li>Interagir avec les instructeurs et autres apprenants</li>
            </ul>
          </div>

          <div style="margin: 20px 0;">
            <p><strong>Prêt à commencer à apprendre ?</strong></p>
            <p>Visitez notre catalogue de cours et commencez votre parcours d'apprentissage dès aujourd'hui !</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${coursesLink}" 
                 style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Parcourir les cours
              </a>
            </div>
          </div>

          <div style="border-top: 1px solid #eee; margin-top: 20px; padding-top: 20px;">
            <p>Besoin d'aide pour commencer ?</p>
            <p>Notre équipe de support est toujours là pour vous aider ! N'hésitez pas à nous contacter à <a href="mailto:aicrafters@aicademy.com">aicrafters@aicademy.com</a> si vous avez des questions.</p>
          </div>

          <p>Cordialement,<br>L'équipe AiCrafters</p>
        </div>
      `
    },
    courseApprovalEmail: {
      subject: 'Votre cours a été approuvé !',
      html: ({ fullName, courseTitle, courseId, courseUrl }) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Notification d'approbation de cours</h2>
          <p>Bonjour ${fullName},</p>
          <p>Bonne nouvelle ! Votre cours "${courseTitle}" a été approuvé et est maintenant publié sur AiCrafters.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Titre du cours :</strong> ${courseTitle}</p>
            <p style="margin: 10px 0 0;"><strong>URL du cours :</strong> <a href="${courseUrl}">Voir le cours</a></p>
          </div>
          <p>Votre cours est maintenant en ligne et accessible aux utilisateurs. Vous pouvez :</p>
          <ul>
            <li>Suivre les inscriptions des utilisateurs</li>
            <li>Suivre la progression du cours</li>
            <li>Interagir avec vos utilisateurs</li>
            <li>Mettre à jour le contenu du cours si nécessaire</li>
          </ul>
          <p>Si vous avez des questions ou besoin d'assistance, n'hésitez pas à contacter notre équipe de support.</p>
          <p>Cordialement,<br>L'équipe AiCrafters</p>
        </div>
      `
    },
    courseRejectionEmail: {
      subject: 'Mise à jour de l\'examen du cours - Révisions nécessaires',
      html: ({ fullName, courseTitle, courseId }) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Mise à jour de l'examen du cours</h2>
          <p>Bonjour ${fullName},</p>
          <p>Nous avons examiné votre cours "${courseTitle}" et il nécessite quelques révisions avant de pouvoir être publié.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Titre du cours :</strong> ${courseTitle}</p>
          </div>
          <p>Veuillez examiner les points suivants :</p>
          <ul>
            <li>Assurez-vous que tout le contenu du cours répond à nos normes de qualité</li>
            <li>Vérifiez que tous les matériaux sont correctement organisés</li>
            <li>Vérifiez que tous les liens et ressources fonctionnent</li>
            <li>Assurez-vous que la description du cours est complète et précise</li>
          </ul>
          <p>Une fois que vous aurez effectué les révisions nécessaires, vous pourrez soumettre à nouveau le cours pour examen.</p>
          <p>Si vous avez des questions ou besoin d'assistance, n'hésitez pas à contacter notre équipe de support.</p>
          <p>Cordialement,<br>L'équipe AiCrafters</p>
        </div>
      `
    },
    courseSubmissionEmail: {
      subject: 'Nouveau cours soumis pour examen',
      html: ({ fullName, courseTitle }) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Demande d'examen de nouveau cours</h2>
          <p>Bonjour ${fullName},</p>
          <p>Un nouveau cours "${courseTitle}" a été soumis pour examen.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Titre du cours :</strong> ${courseTitle}</p>
          </div>
          <p>Veuillez examiner ce cours dès que possible. Vous pouvez :</p>
          <ul>
            <li>Vérifier le contenu et les documents du cours</li>
            <li>Vérifier qu'il répond à nos normes de qualité</li>
            <li>Vous assurer que tous les documents sont appropriés et bien organisés</li>
            <li>Approuver ou demander des révisions si nécessaire</li>
          </ul>
          <p>Vous pouvez accéder à la page d'examen du cours via votre tableau de bord d'administrateur.</p>
          <p>Best regards,<br>The AiCrafters Team</p>
        </div>
      `
    },
    newUserNotificationEmail: {
      subject: 'Nouvelle inscription d\'utilisateur - AiCrafters',
      html: ({ adminName, userName, userEmail, userDashboardUrl }) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Nouvelle inscription d'utilisateur</h2>
          <p>Bonjour ${adminName},</p>
          <p>Un nouvel utilisateur s'est inscrit sur AiCrafters.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Détails de l'utilisateur :</h3>
            <p style="margin: 0;"><strong>Nom :</strong> ${userName}</p>
            <p style="margin: 10px 0 0;"><strong>Email :</strong> ${userEmail}</p>
          </div>

          <div style="margin: 20px 0;">
            <p>Vous pouvez consulter et gérer le compte de cet utilisateur via votre tableau de bord d'administrateur.</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${userDashboardUrl}" 
                 style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Voir les utilisateurs
              </a>
            </div>
          </div>

          <div style="border-top: 1px solid #eee; margin-top: 20px; padding-top: 20px;">
            <p>Ceci est une notification automatique. Veuillez ne pas répondre à cet e-mail.</p>
          </div>

          <p>Best regards,<br>The AiCrafters Team</p>
        </div>
      `
    },
    courseInvitationEmail: {
      subject: `Vous avez été invité à un cours`,
      html: ({ courseTitle, instructorName, courseLink }) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Bienvenue au cours ${courseTitle} !</h2>
          <p>Bonjour,</p>
          <p>Vous avez été invité par ${instructorName} à rejoindre le cours "${courseTitle}".</p>
          <p>Vous pouvez accéder au contenu du cours immédiatement via votre tableau de bord.</p>
          <div style="margin: 30px 0;">
            <a href="${courseLink}" 
               style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px;">
              Accéder au cours
            </a>
          </div>
          <p>Si vous avez des questions, n'hésitez pas à contacter notre équipe de support.</p>
          <p>Cordialement,<br>L'équipe AiCrafters</p>
        </div>
      `
    },
    passwordResetEmail: {
      subject: 'Réinitialisation de votre mot de passe - AiCrafters',
      html: ({ fullName, resetLink }) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Réinitialisation de votre mot de passe</h2>
          <p>Bonjour ${fullName},</p>
          <p>Nous avons reçu une demande de réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Réinitialiser le mot de passe
            </a>
          </div>
          <p>Ce lien de réinitialisation de mot de passe expirera dans 1 heure.</p>
          <p>Si vous n'avez pas demandé de réinitialisation de mot de passe, veuillez ignorer cet e-mail ou contacter le support si vous avez des préoccupations.</p>
          <div style="border-top: 1px solid #eee; margin-top: 20px; padding-top: 20px;">
            <p>Pour des raisons de sécurité, veuillez :</p>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Ne jamais partager votre mot de passe avec qui que ce soit</li>
              <li>Utiliser un mot de passe unique pour votre compte AiCrafters</li>
            </ul>
          </div>
          <p>Cordialement,<br>L'équipe AiCrafters</p>
        </div>
      `
    },
    passwordResetConfirmationEmail: {
      subject: 'Confirmation de réinitialisation de mot de passe - AiCrafters',
      html: ({ fullName, loginLink }) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Confirmation de réinitialisation de mot de passe</h2>
          <p>Bonjour ${fullName},</p>
          <p>Votre mot de passe a été réinitialisé avec succès. Cet e-mail confirme que votre mot de passe a été modifié.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Avis de sécurité :</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Cette modification a été effectuée depuis les paramètres de votre compte</li>
              <li>Heure du changement : ${new Date().toLocaleString()}</li>
            </ul>
          </div>

          <div style="margin: 20px 0;">
            <p>Si vous n'avez pas effectué cette modification, veuillez :</p>
            <ol style="margin: 10px 0; padding-left: 20px;">
              <li>Changer immédiatement votre mot de passe</li>
              <li>Contacter notre équipe de support</li>
            </ol>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginLink}" 
               style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px;">
              Connectez-vous à votre compte
            </a>
          </div>

          <div style="border-top: 1px solid #eee; margin-top: 20px; padding-top: 20px;">
            <p>Pour des raisons de sécurité, veuillez :</p>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Ne jamais partager votre mot de passe avec qui que ce soit</li>
              <li>Utiliser un mot de passe unique pour votre compte AiCrafters</li>
            </ul>
          </div>

          <p>Si vous avez des questions ou des préoccupations, veuillez contacter notre équipe de support à <a href="mailto:aicrafters@aicademy.com">aicrafters@aicademy.com</a>.</p>
          <p>Cordialement,<br>L'équipe AiCrafters</p>
        </div>
      `
    }
  },
  // Arabic templates
  ar: {
    verificationEmail: {
      subject: 'تحقق من بريدك الإلكتروني - AiCrafters',
      html: ({ fullName, verificationLink }) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; direction: rtl; text-align: right;">
          <h2 style="color: #333;">مرحبًا بك في AiCrafters!</h2>
          <p>مرحبًا ${fullName}،</p>
          <p>شكرًا لتسجيلك في AiCrafters. لإكمال تسجيلك، يرجى التحقق من عنوان بريدك الإلكتروني بالنقر على الزر أدناه:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block;">تحقق من البريد الإلكتروني</a>
          </div>
          <p>ستنتهي صلاحية رابط التحقق هذا في غضون 24 ساعة.</p>
          <p>إذا لم تقم بإنشاء حساب على AiCrafters، يرجى تجاهل هذا البريد الإلكتروني.</p>
          <p>مع أطيب التحيات،<br>فريق AiCrafters</p>
        </div>
      `
    },
    accountActivationEmail: {
      subject: 'مرحبًا بك في AiCrafters - حسابك نشط الآن!',
      html: ({ fullName, coursesLink }) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">مرحبًا بك في AiCrafters!</h2>
          <p>مرحبًا ${fullName}،</p>
          <p>خبر رائع! تم التحقق من حسابك وتنشيطه بنجاح. لديك الآن وصول كامل إلى جميع ميزات منصة AiCrafters.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">ما يمكنك القيام به الآن:</h3>
            <ul style="margin: 0; padding-right: 20px;">
              <li>تصفح كتالوج الدورات التدريبية الشامل لدينا</li>
              <li>حفظ الدورات في قائمة الرغبات الخاصة بك</li>
              <li>شراء والتسجيل في الدورات</li>
              <li>تتبع تقدمك في التعلم</li>
              <li>التفاعل مع المدربين والمتعلمين الآخرين</li>
            </ul>
          </div>

          <div style="margin: 20px 0;">
            <p><strong>مستعد لبدء التعلم؟</strong></p>
            <p>قم بزيارة كتالوج الدورات وابدأ رحلة التعلم الخاصة بك اليوم!</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${coursesLink}" 
                 style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Browse Courses
              </a>
            </div>
          </div>

          <div style="border-top: 1px solid #eee; margin-top: 20px; padding-top: 20px;">
            <p>هل تحتاج إلى مساعدة للبدء؟</p>
            <p>فريق الدعم لدينا موجود دائمًا للمساعدة! لا تتردد في التواصل معنا على <a href="mailto:aicrafters@aicademy.com">aicrafters@aicademy.com</a> إذا كان لديك أي أسئلة.</p>
          </div>

          <p>مع أطيب التحيات،<br>فريق AiCrafters</p>
        </div>
      `
    },
    courseApprovalEmail: {
      subject: 'تمت الموافقة على دورتك!',
      html: ({ fullName, courseTitle, courseId, courseUrl }) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">إشعار الموافقة على الدورة</h2>
          <p>مرحبًا ${fullName}،</p>
          <p>خبر رائع! تمت الموافقة على دورتك "${courseTitle}" وهي الآن منشورة على AiCrafters.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>عنوان الدورة:</strong> ${courseTitle}</p>
            <p style="margin: 10px 0 0;"><strong>رابط الدورة:</strong> <a href="${courseUrl}">عرض الدورة</a></p>
          </div>
          <p>دورتك الآن مباشرة ويمكن للمستخدمين الوصول إليها. يمكنك:</p>
          <ul>
            <li>مراقبة تسجيلات المستخدمين</li>
            <li>تتبع تقدم الدورة</li>
            <li>التفاعل مع المستخدمين</li>
            <li>تحديث محتوى الدورة حسب الحاجة</li>
          </ul>
          <p>إذا كان لديك أي أسئلة أو تحتاج إلى مساعدة، فلا تتردد في الاتصال بفريق الدعم الخاص بنا.</p>
          <p>مع أطيب التحيات،<br>فريق AiCrafters</p>
        </div>
      `
    },
    courseRejectionEmail: {
      subject: 'تحديث مراجعة الدورة - المراجعات المطلوبة',
      html: ({ fullName, courseTitle, courseId }) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">تحديث مراجعة الدورة</h2>
          <p>مرحبًا ${fullName}،</p>
          <p>لقد راجعنا دورتك "${courseTitle}" وهي تتطلب بعض المراجعات قبل أن يتم نشرها.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>عنوان الدورة:</strong> ${courseTitle}</p>
          </div>
          <p>يرجى مراجعة ما يلي:</p>
          <ul>
            <li>تأكد من أن جميع محتويات الدورة تلبي معايير الجودة لدينا</li>
            <li>تحقق من أن جميع المواد منظمة بشكل صحيح</li>
            <li>تحقق من أن جميع الروابط والموارد تعمل</li>
            <li>تأكد من أن وصف الدورة كامل ودقيق</li>
          </ul>
          <p>بمجراء المراجعات اللازمة، يمكنك إعادة تقديم الدورة للمراجعة.</p>
          <p>إذا كان لديك أي أسئلة أو تحتاج إلى مساعدة، فلا تتردد في الاتصال بفريق الدعم الخاص بنا.</p>
          <p>مع أطيب التحيات،<br>فريق AiCrafters</p>
        </div>
      `
    },
    courseSubmissionEmail: {
      subject: 'تم تقديم دورة جديدة للمراجعة',
      html: ({ fullName, courseTitle }) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">طلب مراجعة دورة جديدة</h2>
          <p>مرحبًا ${fullName},</p>
          <p>تم تقديم دورة جديدة "${courseTitle}" للمراجعة.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>عنوان الدورة:</strong> ${courseTitle}</p>
          </div>
          <p>يرجى مراجعة هذه الدورة في أقرب وقت ممكن. يمكنك:</p>
          <ul>
            <li>التحقق من محتوى الدورة والمواد</li>
            <li>التأكد من أنها تلبي معايير الجودة لدينا</li>
            <li>ضمان أن جميع المواد مناسبة ومنظمة جيدًا</li>
            <li>الموافقة أو طلب المراجعات حسب الحاجة</li>
          </ul>
          <p>يمكنك الوصول إلى صفحة مراجعة الدورة من خلال لوحة تحكم المشرف الخاصة بك.</p>
          <p>مع أطيب التحيات،<br>فريق AiCrafters</p>
        </div>
      `
    },
    newUserNotificationEmail: {
      subject: 'تسجيل مستخدم جديد - AiCrafters',
      html: ({ adminName, userName, userEmail, userDashboardUrl }) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">تسجيل مستخدم جديد</h2>
          <p>مرحبًا ${adminName},</p>
          <p>قام مستخدم جديد بالتسجيل في AiCrafters.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">تفاصيل المستخدم:</h3>
            <p style="margin: 0;"><strong>الاسم:</strong> ${userName}</p>
            <p style="margin: 10px 0 0;"><strong>البريد الإلكتروني:</strong> ${userEmail}</p>
          </div>

          <div style="margin: 20px 0;">
            <p>يمكنك عرض وإدارة حساب هذا المستخدم من خلال لوحة تحكم المشرف الخاصة بك.</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${userDashboardUrl}" 
                 style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Voir les utilisateurs
              </a>
            </div>
          </div>

          <div style="border-top: 1px solid #eee; margin-top: 20px; padding-top: 20px;">
            <p>هذا إشعار تلقائي. يرجى عدم الرد على هذا البريد الإلكتروني.</p>
          </div>

          <p>مع أطيب التحيات،<br>فريق AiCrafters</p>
        </div>
      `
    },
    courseInvitationEmail: {
      subject: `تمت دعوتك إلى دورة`,
      html: ({ courseTitle, instructorName, courseLink }) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl; text-align: right;">
          <h2>مرحبًا بك في دورة ${courseTitle}!</h2>
          <p>مرحبًا،</p>
          <p>لقد تمت دعوتك من قبل ${instructorName} للانضمام إلى دورة "${courseTitle}".</p>
          <p>يمكنك الوصول إلى محتوى الدورة فورًا من خلال لوحة التحكم الخاصة بك.</p>
          <div style="margin: 30px 0;">
            <a href="${courseLink}" 
               style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px;">
              الوصول إلى الدورة
            </a>
          </div>
          <p>إذا كان لديك أي أسئلة، فلا تتردد في الاتصال بفريق الدعم الخاص بنا.</p>
          <p>مع أطيب التحيات،<br>فريق AiCrafters</p>
        </div>
      `
    },
    passwordResetEmail: {
      subject: 'إعادة تعيين كلمة المرور الخاصة بك - AiCrafters',
      html: ({ fullName, resetLink }) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; direction: rtl; text-align: right;">
          <h2 style="color: #333;">إعادة تعيين كلمة المرور الخاصة بك</h2>
          <p>مرحبًا ${fullName}،</p>
          <p>لقد تلقينا طلبًا لإعادة تعيين كلمة المرور الخاصة بك. انقر على الزر أدناه لإنشاء كلمة مرور جديدة:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block;">
              إعادة تعيين كلمة المرور
            </a>
          </div>
          <p>ستنتهي صلاحية رابط إعادة تعيين كلمة المرور هذا في غضون ساعة واحدة.</p>
          <p>إذا لم تطلب إعادة تعيين كلمة المرور، فيرجى تجاهل هذا البريد الإلكتروني أو الاتصال بالدعم إذا كانت لديك مخاوف.</p>
          <div style="border-top: 1px solid #eee; margin-top: 20px; padding-top: 20px;">
            <p>لأسباب أمنية، يرجى:</p>
            <ul style="margin: 0; padding-right: 20px;">
              <li>عدم مشاركة كلمة المرور الخاصة بك مع أي شخص</li>
              <li>استخدام كلمة مرور فريدة لحساب AiCrafters الخاص بك</li>
            </ul>
          </div>
          <p>مع أطيب التحيات،<br>فريق AiCrafters</p>
        </div>
      `
    },
    passwordResetConfirmationEmail: {
      subject: 'تأكيد إعادة تعيين كلمة المرور - AiCrafters',
      html: ({ fullName, loginLink }) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; direction: rtl; text-align: right;">
          <h2 style="color: #333;">تأكيد إعادة تعيين كلمة المرور</h2>
          <p>مرحبًا ${fullName}،</p>
          <p>تمت إعادة تعيين كلمة المرور الخاصة بك بنجاح. يؤكد هذا البريد الإلكتروني أنه تم تغيير كلمة المرور الخاصة بك.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">إشعار أمني:</h3>
            <ul style="margin: 0; padding-right: 20px;">
              <li>تم إجراء هذا التغيير من إعدادات حسابك</li>
              <li>وقت التغيير: ${new Date().toLocaleString()}</li>
            </ul>
          </div>

          <div style="margin: 20px 0;">
            <p>إذا لم تقم بإجراء هذا التغيير، فيرجى:</p>
            <ol style="margin: 10px 0; padding-right: 20px;">
              <li>تغيير كلمة المرور الخاصة بك على الفور</li>
              <li>الاتصال بفريق الدعم لدينا</li>
            </ol>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginLink}" 
               style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px;">
              تسجيل الدخول إلى حسابك
            </a>
          </div>

          <div style="border-top: 1px solid #eee; margin-top: 20px; padding-top: 20px;">
            <p>لأسباب أمنية، يرجى:</p>
            <ul style="margin: 0; padding-right: 20px;">
              <li>عدم مشاركة كلمة المرور الخاصة بك مع أي شخص</li>
              <li>استخدام كلمة مرور فريدة لحساب AiCrafters الخاص بك</li>
            </ul>
          </div>

          <p>إذا كان لديك أي أسئلة أو مخاوف، فيرجى الاتصال بفريق الدعم لدينا على <a href="mailto:aicrafters@aicademy.com">aicrafters@aicademy.com</a>.</p>
          <p>مع أطيب التحيات،<br>فريق AiCrafters</p>
        </div>
      `
    }
  }
};

// Function to get template based on language
const getEmailTemplate = (templateName: string, language: string = 'en') => {
  // Default to English if language not supported
  if (!emailTemplates[language]) {
    language = 'en';
  }
  
  // Default to English template if specified template not available for language
  if (!emailTemplates[language][templateName]) {
    language = 'en';
  }
  
  return emailTemplates[language][templateName];
};

export const generateVerificationToken = (email: string): string => {
  return jwt.sign({ email }, JWT_SECRET, { expiresIn: '24h' });
};

export const sendVerificationEmail = async (email: string, fullName: string, token: string, language: string = 'en') => {
  try {
    const verificationLink = `${FRONTEND_URL}/${language}/verify-email/${token}`;
    
    // Get the template based on language
    const template = getEmailTemplate('verificationEmail', language);

    await transporter.sendMail({
      from: 'AiCrafters <no-reply@aicrafters.com>',
      to: email,
      subject: template.subject,
      html: template.html({ fullName, verificationLink }),
      replyTo: 'hello@aicrafters.com'
    });

  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

export const sendWelcomeEmail = async (email: string, fullName: string, password: string, language: string = 'en') => {
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
            <p style="margin: 10px 0 0;"><strong>URL:</strong> <a href="https://aicrafters.aicademy.com/${language}">aicrafters.aicademy.com</a></p>
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

export const sendCourseApprovalEmail = async (email: string, fullName: string, courseTitle: string, courseId: string, language: string = 'en') => {
  try {
    const courseUrl = `${FRONTEND_URL}/${language}/courses/${courseId}`;
    
    // Get the template based on language
    const template = getEmailTemplate('courseApprovalEmail', language);

    await transporter.sendMail({
      from: 'AiCrafters <no-reply@aicrafters.com>',
      to: email,
      subject: template.subject,
      html: template.html({ fullName, courseTitle, courseId, courseUrl }),
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

export const sendCourseRejectionEmail = async (email: string, fullName: string, courseTitle: string, courseId: string, language: string = 'en') => {
  try {
    // Get the template based on language
    const template = getEmailTemplate('courseRejectionEmail', language);

    await transporter.sendMail({
      from: 'AiCrafters <no-reply@aicrafters.com>',
      to: email,
      subject: template.subject,
      html: template.html({ fullName, courseTitle, courseId }),
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

export const sendCourseSubmissionEmail = async (email: string, fullName: string, courseTitle: string, language: string = 'en') => {
  try {
    // Get the template based on language
    const template = getEmailTemplate('courseSubmissionEmail', language);

    await transporter.sendMail({
      from: 'AiCrafters <no-reply@aicrafters.com>',
      to: email,
      subject: template.subject,
      html: template.html({ fullName, courseTitle }),
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

export const sendAccountActivationEmail = async (email: string, fullName: string, language: string = 'en') => {
  try {
    const coursesLink = `${FRONTEND_URL}/${language}/courses`;
    
    // Get the template based on language
    const template = getEmailTemplate('accountActivationEmail', language);

    await transporter.sendMail({
      from: 'AiCrafters <no-reply@aicrafters.com>',
      to: email,
      subject: template.subject,
      html: template.html({ fullName, coursesLink }),
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

export const sendPurchaseConfirmationEmail = async (email: string, fullName: string, courseTitle: string, courseId: string, instructorName: string, language: string = 'en') => {
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
              <a href="${FRONTEND_URL}/${language}/dashboard/user/learning" 
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

export const sendNewUserNotificationEmail = async (adminEmail: string, adminName: string, userName: string, userEmail: string, language: string = 'en') => {
  try {
    const userDashboardUrl = `${FRONTEND_URL}/${language}/dashboard/admin/users`;
    
    // Get the template based on language
    const template = getEmailTemplate('newUserNotificationEmail', language);

    await transporter.sendMail({
      from: 'AiCrafters <no-reply@aicrafters.com>',
      to: adminEmail,
      subject: template.subject,
      html: template.html({ adminName, userName, userEmail, userDashboardUrl }),
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
  instructorName: string,
  language: string = 'en'
) => {
  try {
    const courseLink = `${FRONTEND_URL}/${language}/dashboard/user/learning/${courseId}`;
    
    // Get the template based on language
    const template = getEmailTemplate('courseInvitationEmail', language);

    await transporter.sendMail({
      from: 'AiCrafters <no-reply@aicrafters.com>',
      to: email,
      subject: template.subject.replace(`a Course`, courseTitle),
      html: template.html({ courseTitle, instructorName, courseLink }),
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

export const sendPasswordResetEmail = async (email: string, fullName: string, token: string, language: string = 'en') => {
  try {
    // Use user's preferred language for password reset link
    const resetLink = `${FRONTEND_URL}/${language}/reset-password/${token}`;
    
    // Get the template based on language
    const template = getEmailTemplate('passwordResetEmail', language);

    await transporter.sendMail({
      from: 'AiCrafters <no-reply@aicrafters.com>',
      to: email,
      subject: template.subject,
      html: template.html({ fullName, resetLink }),
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

export const sendPasswordResetConfirmationEmail = async (email: string, fullName: string, language: string = 'en') => {
  try {
    const loginLink = `${FRONTEND_URL}/${language}/login`;
    
    // Get the template based on language
    const template = getEmailTemplate('passwordResetConfirmationEmail', language);

    await transporter.sendMail({
      from: 'AiCrafters <no-reply@aicrafters.com>',
      to: email,
      subject: template.subject,
      html: template.html({ fullName, loginLink }),
      replyTo: 'hello@aicrafters.com'
    });

  } catch (error) {
    console.error('Error sending password reset confirmation email:', error);
    throw error;
  }
}; 