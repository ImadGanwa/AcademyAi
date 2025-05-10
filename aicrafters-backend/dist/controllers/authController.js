"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const error_1 = require("../utils/error");
const dotenv_1 = __importDefault(require("dotenv"));
const email_1 = require("../utils/email");
const notifications_1 = require("../utils/notifications");
const axios_1 = __importDefault(require("axios"));
const google_auth_library_1 = require("google-auth-library");
// Load environment variables
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';
const JWT_EXPIRES_IN = '7d';
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const LINKEDIN_REDIRECT_URI = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000/auth/linkedin/callback'
    : process.env.LINKEDIN_REDIRECT_URI || 'https://aicrafters.aicademy.com/auth/linkedin/callback';
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is missing');
}
if (!RECAPTCHA_SECRET_KEY) {
    throw new Error('RECAPTCHA_SECRET_KEY environment variable is missing');
}
if (!GOOGLE_CLIENT_ID) {
    throw new Error('GOOGLE_CLIENT_ID environment variable is missing');
}
if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET || !LINKEDIN_REDIRECT_URI) {
    throw new Error('LinkedIn configuration is incomplete');
}
const googleClient = new google_auth_library_1.OAuth2Client(GOOGLE_CLIENT_ID);
// Verify reCAPTCHA token
const verifyRecaptcha = (token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.post('https://www.google.com/recaptcha/api/siteverify', `secret=${RECAPTCHA_SECRET_KEY}&response=${token}`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        if (!response.data.success) {
            return false;
        }
        return true;
    }
    catch (error) {
        console.error('reCAPTCHA verification error:', error);
        return false;
    }
});
exports.authController = {
    register: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email, password, fullName, marketingConsent, recaptchaToken } = req.body;
            // Validate input
            if (!email || !password || !fullName || !recaptchaToken) {
                return res.status(400).json((0, error_1.createError)('All fields are required'));
            }
            // Verify reCAPTCHA
            const isRecaptchaValid = yield verifyRecaptcha(recaptchaToken);
            if (!isRecaptchaValid) {
                return res.status(400).json((0, error_1.createError)('Invalid reCAPTCHA. Please try again.'));
            }
            // Check if user already exists
            const existingUser = yield User_1.User.findOne({ email });
            if (existingUser) {
                return res.status(400).json((0, error_1.createError)('Email already registered'));
            }
            // Generate verification token
            const verificationToken = (0, email_1.generateVerificationToken)(email);
            // Create new user
            const user = new User_1.User({
                email,
                password,
                fullName,
                marketingConsent,
                isEmailVerified: false,
                status: 'pending',
                verificationToken,
                lastActive: new Date()
            });
            yield user.save();
            // Send verification email
            try {
                yield (0, email_1.sendVerificationEmail)(email, fullName, verificationToken);
            }
            catch (error) {
                console.error('Error sending verification email:', error);
                // Don't fail registration if email fails, but log it
            }
            // Send notifications to all admins
            try {
                const admins = yield User_1.User.find({ role: 'admin' });
                // Send email and create notification for each admin
                for (const admin of admins) {
                    // Send email to admin
                    yield (0, email_1.sendNewUserNotificationEmail)(admin.email, admin.fullName, fullName, email);
                    // Create notification for admin
                    yield (0, notifications_1.createNotification)({
                        recipient: admin._id.toString(),
                        type: 'user',
                        title: 'New User Registration',
                        message: `${fullName} has registered as a new user.`,
                        relatedId: user._id.toString()
                    });
                }
            }
            catch (error) {
                console.error('Error sending admin notifications:', error);
                // Don't fail registration if notifications fail, but log it
            }
            // Return success response without token
            res.status(201).json({
                message: 'Registration successful. Please check your email to verify your account.',
                requiresVerification: true,
                user: User_1.User.getSafeUser(user),
            });
        }
        catch (error) {
            console.error('Registration error:', error);
            res.status(500).json((0, error_1.createError)('Error registering user', error));
        }
    }),
    login: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email, password } = req.body;
            const user = yield User_1.User.findOne({ email }).select('+password +role +courses');
            if (!user) {
                return res.status(401).json((0, error_1.createError)('Invalid credentials'));
            }
            const isPasswordValid = yield user.comparePassword(password);
            if (!isPasswordValid) {
                return res.status(401).json((0, error_1.createError)('Invalid credentials'));
            }
            // Check if email is verified
            if (!user.isEmailVerified) {
                return res.status(403).json((0, error_1.createError)('Please verify your email address before logging in.'));
            }
            // Check user status
            switch (user.status) {
                case 'pending':
                    return res.status(403).json((0, error_1.createError)('Your account is pending verification. Please verify your email to continue.'));
                case 'inactive':
                    return res.status(403).json((0, error_1.createError)('Your account has been deactivated. Please contact support for assistance.'));
                case 'suspended':
                    return res.status(403).json((0, error_1.createError)('Your account has been suspended. Please contact support for more information.'));
                case 'active':
                    break;
                default:
                    return res.status(403).json((0, error_1.createError)('Account status error. Please contact support.'));
            }
            // Update last active timestamp
            user.lastActive = new Date();
            yield user.save();
            const payload = {
                id: user._id.toString(),
                email: user.email,
                role: user.role
            };
            const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
            res.json({
                message: 'Login successful',
                token,
                user: User_1.User.getSafeUser(user),
            });
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(500).json((0, error_1.createError)('Error during login', error));
        }
    }),
    verifyEmail: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { token } = req.params;
            // Verify token to get email
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            // Find user by email and token
            const user = yield User_1.User.findOne({
                email: decoded.email,
                verificationToken: token
            });
            if (!user) {
                return res.status(400).json((0, error_1.createError)('Invalid verification token'));
            }
            // If already verified, return success
            if (user.isEmailVerified) {
                return res.json({
                    message: 'Email verified successfully',
                    status: 'active'
                });
            }
            // Update user status but keep the token
            user.isEmailVerified = true;
            user.status = 'active';
            user.lastActive = new Date();
            yield user.save();
            // Send account activation confirmation email
            try {
                yield (0, email_1.sendAccountActivationEmail)(user.email, user.fullName);
            }
            catch (error) {
                console.error('Error sending account activation email:', error);
                // Don't fail verification if email fails, but log it
            }
            res.json({
                message: 'Email verified successfully. You can now log in.',
                status: 'active'
            });
        }
        catch (error) {
            console.error('Email verification error:', error);
            res.status(400).json((0, error_1.createError)('Invalid or expired verification token'));
        }
    }),
    resendVerification: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json((0, error_1.createError)('Email is required'));
            }
            const user = yield User_1.User.findOne({ email });
            if (!user) {
                return res.status(404).json((0, error_1.createError)('User not found'));
            }
            if (user.isEmailVerified) {
                return res.status(400).json((0, error_1.createError)('Email is already verified'));
            }
            // Generate new verification token
            const verificationToken = (0, email_1.generateVerificationToken)(email);
            user.verificationToken = verificationToken;
            yield user.save();
            // Send new verification email
            try {
                yield (0, email_1.sendVerificationEmail)(email, user.fullName, verificationToken);
                res.json({ message: 'Verification email sent successfully' });
            }
            catch (error) {
                console.error('Error sending verification email:', error);
                res.status(500).json((0, error_1.createError)('Error sending verification email'));
            }
        }
        catch (error) {
            console.error('Resend verification error:', error);
            res.status(500).json((0, error_1.createError)('Error resending verification email'));
        }
    }),
    getCurrentUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const user = yield User_1.User.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a.id).select('+courses');
            if (!user) {
                return res.status(404).json((0, error_1.createError)('User not found'));
            }
            res.json(User_1.User.getSafeUser(user));
        }
        catch (error) {
            res.status(500).json((0, error_1.createError)('Error fetching user data', error));
        }
    }),
    logout: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        // Since we're using JWT, we don't need to do anything server-side
        // The client will handle removing the token
        res.json({ message: 'Logged out successfully' });
    }),
    googleAuth: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { token } = req.body;
            if (!token) {
                return res.status(400).json((0, error_1.createError)('Google token is required'));
            }
            // Verify Google token
            const ticket = yield googleClient.verifyIdToken({
                idToken: token,
                audience: GOOGLE_CLIENT_ID
            });
            const payload = ticket.getPayload();
            if (!payload || !payload.email || !payload.email_verified) {
                return res.status(400).json((0, error_1.createError)('Invalid Google account'));
            }
            // Find or create user
            let user = yield User_1.User.findOne({ email: payload.email });
            if (!user) {
                // Create new user with isGoogleUser flag
                user = new User_1.User({
                    email: payload.email,
                    fullName: payload.name || payload.email.split('@')[0],
                    isEmailVerified: true,
                    status: 'active',
                    profileImage: payload.picture || undefined,
                    lastActive: new Date(),
                    marketingConsent: false,
                    isGoogleUser: true, // Add this flag to indicate Google user
                    password: undefined // No password needed for Google users
                });
                try {
                    yield user.save({ validateBeforeSave: false }); // Skip password validation for Google users
                    // Notify admins about new user
                    const admins = yield User_1.User.find({ role: 'admin' });
                    for (const admin of admins) {
                        yield (0, email_1.sendNewUserNotificationEmail)(admin.email, admin.fullName, user.fullName, user.email);
                        yield (0, notifications_1.createNotification)({
                            recipient: admin._id.toString(),
                            type: 'user',
                            title: 'New User Registration',
                            message: `${user.fullName} has registered using Google Sign-In.`,
                            relatedId: user._id.toString()
                        });
                    }
                }
                catch (error) {
                    console.error('Error creating Google user:', error);
                    return res.status(500).json((0, error_1.createError)('Error creating user account'));
                }
            }
            else {
                // Update existing user's last active timestamp
                user.lastActive = new Date();
                if (!user.profileImage && payload.picture) {
                    user.profileImage = payload.picture;
                }
                yield user.save({ validateBeforeSave: false }); // Skip validation for Google users
            }
            // Generate JWT token
            const jwtPayload = {
                id: user._id.toString(),
                email: user.email,
                role: user.role
            };
            const jwtToken = jsonwebtoken_1.default.sign(jwtPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
            res.json({
                message: 'Google authentication successful',
                token: jwtToken,
                user: User_1.User.getSafeUser(user)
            });
        }
        catch (error) {
            console.error('Google authentication error:', error);
            res.status(500).json((0, error_1.createError)('Error during Google authentication'));
        }
    }),
    linkedinAuth: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        try {
            const { code } = req.body;
            if (!code) {
                return res.status(400).json((0, error_1.createError)('Authorization code is required'));
            }
            if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET || !LINKEDIN_REDIRECT_URI) {
                return res.status(500).json((0, error_1.createError)('LinkedIn configuration is incomplete'));
            }
            // Exchange code for access token
            const tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
            const tokenData = new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                client_id: LINKEDIN_CLIENT_ID,
                client_secret: LINKEDIN_CLIENT_SECRET,
                redirect_uri: LINKEDIN_REDIRECT_URI
            });
            const tokenResponse = yield axios_1.default.post(tokenUrl, tokenData.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            const { access_token: accessToken, id_token } = tokenResponse.data;
            if (!accessToken) {
                console.error('5. Error: No access token in response');
                return res.status(400).json((0, error_1.createError)('Failed to obtain access token from LinkedIn'));
            }
            // Decode the ID token to get user info
            let profile;
            if (id_token) {
                try {
                    const decoded = jsonwebtoken_1.default.decode(id_token);
                    profile = decoded;
                }
                catch (error) {
                    console.error('Error decoding ID token:', error);
                }
            }
            // If no ID token or decoding failed, get profile from API
            if (!profile) {
                const profileResponse = yield axios_1.default.get('https://api.linkedin.com/v2/me', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'cache-control': 'no-cache'
                    }
                });
                const emailResponse = yield axios_1.default.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'cache-control': 'no-cache'
                    }
                });
                profile = Object.assign(Object.assign({}, profileResponse.data), { email: (_c = (_b = (_a = emailResponse.data.elements) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b['handle~']) === null || _c === void 0 ? void 0 : _c.emailAddress });
            }
            if (!profile.email) {
                console.error('8. Error: No email in profile');
                return res.status(400).json((0, error_1.createError)('Email not provided by LinkedIn'));
            }
            // Find or create user
            let user = yield User_1.User.findOne({ email: profile.email });
            if (!user) {
                // Create new user
                user = new User_1.User({
                    email: profile.email,
                    fullName: profile.name || `${profile.localizedFirstName} ${profile.localizedLastName}`,
                    isEmailVerified: true,
                    status: 'active',
                    lastActive: new Date(),
                    isLinkedinUser: true,
                    linkedinId: profile.sub || profile.id
                });
                yield user.save();
                // Send notifications to admins about new user
                try {
                    const admins = yield User_1.User.find({ role: 'admin' });
                    for (const admin of admins) {
                        yield (0, email_1.sendNewUserNotificationEmail)(admin.email, admin.fullName, user.fullName, user.email);
                        yield (0, notifications_1.createNotification)({
                            recipient: admin._id.toString(),
                            type: 'user',
                            title: 'New User Registration',
                            message: `${user.fullName} has registered as a new user via LinkedIn.`,
                            relatedId: user._id.toString()
                        });
                    }
                }
                catch (error) {
                    console.error('Error sending admin notifications:', error);
                }
            }
            else {
                // Update existing user's LinkedIn info
                user.isLinkedinUser = true;
                user.linkedinId = profile.sub || profile.id;
                user.fullName = profile.name || `${profile.localizedFirstName} ${profile.localizedLastName}`;
                if (!user.profileImage && profile.picture) {
                    user.profileImage = profile.picture;
                }
                user.lastActive = new Date();
                yield user.save();
            }
            // Generate JWT token
            const payload = {
                id: user._id.toString(),
                email: user.email,
                role: user.role
            };
            const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
            res.json({
                message: 'LinkedIn authentication successful',
                token,
                user: User_1.User.getSafeUser(user)
            });
        }
        catch (error) {
            console.error('LinkedIn authentication error:', {
                message: error.message,
                response: (_d = error.response) === null || _d === void 0 ? void 0 : _d.data,
                status: (_e = error.response) === null || _e === void 0 ? void 0 : _e.status
            });
            res.status(500).json((0, error_1.createError)('Error during LinkedIn authentication', error));
        }
    }),
    requestPasswordReset: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json((0, error_1.createError)('Email is required'));
            }
            const user = yield User_1.User.findOne({ email });
            if (!user) {
                // For security reasons, we still return success even if the email doesn't exist
                return res.json({ message: 'If an account exists with this email, you will receive a password reset link' });
            }
            // Generate password reset token
            const resetToken = (0, email_1.generatePasswordResetToken)(email);
            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour from now
            yield user.save();
            // Send password reset email
            try {
                yield (0, email_1.sendPasswordResetEmail)(email, user.fullName, resetToken);
                res.json({ message: 'Password reset link sent successfully' });
            }
            catch (error) {
                console.error('Error sending password reset email:', error);
                res.status(500).json((0, error_1.createError)('Error sending password reset email'));
            }
        }
        catch (error) {
            console.error('Request password reset error:', error);
            res.status(500).json((0, error_1.createError)('Error processing password reset request'));
        }
    }),
    resetPassword: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { token } = req.params;
            const { password } = req.body;
            if (!password) {
                return res.status(400).json((0, error_1.createError)('New password is required'));
            }
            // Find user with valid reset token and token not expired
            const user = yield User_1.User.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() }
            });
            if (!user) {
                return res.status(400).json((0, error_1.createError)('Password reset token is invalid or has expired'));
            }
            // Update password and clear reset token
            user.password = password;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            yield user.save();
            // Send confirmation email
            try {
                yield (0, email_1.sendPasswordResetConfirmationEmail)(user.email, user.fullName);
            }
            catch (error) {
                console.error('Error sending password reset confirmation email:', error);
                // Don't block the password reset if email fails
            }
            res.json({ message: 'Password has been reset successfully' });
        }
        catch (error) {
            console.error('Reset password error:', error);
            res.status(500).json((0, error_1.createError)('Error resetting password'));
        }
    })
};
