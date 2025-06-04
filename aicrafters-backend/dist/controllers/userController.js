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
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const User_1 = require("../models/User");
const fileUpload_1 = require("../utils/fileUpload");
const userValidator_1 = require("../validators/userValidator"); // You'll need to implement this
const email_1 = require("../utils/email");
const passwordGenerator_1 = require("../utils/passwordGenerator");
const errorHandler_1 = require("../utils/errorHandler");
exports.userController = {
    // Get user profile
    getProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // From auth middleware
                const user = yield User_1.User.findById(userId);
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                return res.json({ user: User_1.User.getSafeUser(user) });
            }
            catch (error) {
                console.error('Get profile error:', error);
                return res.status(500).json({ message: 'Internal server error' });
            }
        });
    },
    // Check if user has password set
    hasPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const user = yield User_1.User.findById(userId).select('+password');
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                // Check if user has a password set
                const hasPassword = !!user.password;
                return res.json({ hasPassword });
            }
            catch (error) {
                console.error('Check password status error:', error);
                return res.status(500).json({ message: 'Internal server error' });
            }
        });
    },
    // Set initial password for social login users
    setPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { password } = req.body;
                // Validate input
                if (!password) {
                    return res.status(400).json({ message: 'Password is required' });
                }
                // Password validation
                if (password.length < 8 || password.length > 40) {
                    return res.status(400).json({ message: 'Password must be between 8 and 40 characters' });
                }
                if (!/\d/.test(password)) {
                    return res.status(400).json({ message: 'Password must contain at least one number' });
                }
                if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
                    return res.status(400).json({ message: 'Password must contain both lowercase and uppercase letters' });
                }
                // eslint-disable-next-line no-useless-escape
                if (!/[-!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
                    return res.status(400).json({ message: 'Password must contain at least one special character' });
                }
                const user = yield User_1.User.findById(userId).select('+password');
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                // Check if user already has a password
                if (user.password) {
                    return res.status(400).json({ message: 'User already has a password set' });
                }
                // Set password (will be hashed by pre-save middleware)
                user.password = password;
                yield user.save();
                // Send confirmation email
                try {
                    yield (0, email_1.sendPasswordResetConfirmationEmail)(user.email, user.fullName);
                }
                catch (emailError) {
                    console.error('Failed to send password set confirmation email:', emailError);
                    // Don't block the password set if email fails
                }
                return res.json({
                    message: 'Password set successfully',
                    user: User_1.User.getSafeUser(user)
                });
            }
            catch (error) {
                console.error('Set password error:', error);
                return res.status(500).json({ message: 'Internal server error' });
            }
        });
    },
    // Update user profile
    updateProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { fullName } = req.body;
                // Validate input
                const validationError = (0, userValidator_1.validateProfileUpdate)(req.body);
                if (validationError) {
                    return res.status(400).json({ message: validationError });
                }
                const user = yield User_1.User.findById(userId);
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                // Update fields
                user.fullName = fullName;
                yield user.save();
                return res.json({
                    user: User_1.User.getSafeUser(user),
                    message: 'Profile updated successfully'
                });
            }
            catch (error) {
                console.error('Update profile error:', error);
                return res.status(500).json({ message: 'Internal server error' });
            }
        });
    },
    // Update profile image
    updateProfileImage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const file = req.file;
                if (!file) {
                    return res.status(400).json({ message: 'No image file provided' });
                }
                const user = yield User_1.User.findById(userId);
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                // Delete old profile image from Cloudinary if it exists
                if (user.profileImage) {
                    yield (0, fileUpload_1.deleteFromCloudinary)(user.profileImage);
                }
                // Upload image to Cloudinary
                const imageUrl = yield (0, fileUpload_1.uploadToCloudinary)(file, 'profile-images');
                // Update user profile image URL
                user.profileImage = imageUrl;
                yield user.save();
                return res.json({
                    user: User_1.User.getSafeUser(user),
                    message: 'Profile image updated successfully'
                });
            }
            catch (error) {
                console.error('Update profile image error:', error);
                return res.status(500).json({ message: 'Internal server error' });
            }
        });
    },
    // Update password
    updatePassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { currentPassword, newPassword } = req.body;
                // Validate input
                if (!currentPassword || !newPassword) {
                    return res.status(400).json({ message: 'Current password and new password are required' });
                }
                // Password validation
                if (newPassword.length < 8 || newPassword.length > 40) {
                    return res.status(400).json({ message: 'Password must be between 8 and 40 characters' });
                }
                if (!/\d/.test(newPassword)) {
                    return res.status(400).json({ message: 'Password must contain at least one number' });
                }
                if (!/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword)) {
                    return res.status(400).json({ message: 'Password must contain both lowercase and uppercase letters' });
                }
                // eslint-disable-next-line no-useless-escape
                if (!/[-!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword)) {
                    return res.status(400).json({ message: 'Password must contain at least one special character' });
                }
                const user = yield User_1.User.findById(userId).select('+password');
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                // Verify current password
                const isPasswordValid = yield user.comparePassword(currentPassword);
                if (!isPasswordValid) {
                    return res.status(401).json({ message: 'Current password is incorrect' });
                }
                // Update password
                user.password = newPassword;
                yield user.save();
                // First send success response to client
                const response = {
                    message: 'Password updated successfully',
                    user: User_1.User.getSafeUser(user)
                };
                res.json(response);
                // Then try to send the confirmation email asynchronously
                // This won't block the response and won't cause issues if it fails
                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    try {
                        yield (0, email_1.sendPasswordResetConfirmationEmail)(user.email, user.fullName);
                        console.log(`Password reset confirmation email sent to ${user.email}`);
                    }
                    catch (emailError) {
                        console.error('Failed to send password reset confirmation email:', emailError);
                        // Log more detailed error information for debugging
                        if (emailError instanceof Error) {
                            console.error('Error name:', emailError.name);
                            console.error('Error message:', emailError.message);
                            console.error('Error stack:', emailError.stack);
                        }
                        // Email failure is logged but doesn't affect the password update
                    }
                }), 0);
            }
            catch (error) {
                console.error('Update password error:', error);
                return res.status(500).json({ message: 'Internal server error' });
            }
        });
    },
    // Delete user account
    deleteAccount(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const user = yield User_1.User.findById(userId);
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                // Soft delete or handle related data cleanup
                user.status = 'inactive';
                yield user.save();
                return res.json({ message: 'Account deleted successfully' });
            }
            catch (error) {
                console.error('Delete account error:', error);
                return res.status(500).json({ message: 'Internal server error' });
            }
        });
    },
    createBatchUsers: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { users } = req.body;
            if (!Array.isArray(users)) {
                return res.status(400).json({ message: 'Users must be an array' });
            }
            const createdUsers = [];
            const errors = [];
            for (const userData of users) {
                const { fullName, email, sendEmail } = userData;
                try {
                    // Check if user already exists
                    const existingUser = yield User_1.User.findOne({ email });
                    if (existingUser) {
                        errors.push({ email, error: 'User already exists' });
                        continue;
                    }
                    // Generate random password
                    const password = (0, passwordGenerator_1.generateRandomPassword)();
                    // Create new user
                    const newUser = new User_1.User({
                        fullName,
                        email,
                        password,
                        role: 'user'
                    });
                    yield newUser.save();
                    // Send welcome email with password if requested
                    if (sendEmail) {
                        try {
                            yield (0, email_1.sendWelcomeEmail)(email, fullName, password);
                        }
                        catch (emailError) {
                            console.error('Failed to send welcome email:', emailError);
                            errors.push({ email, error: 'User created but failed to send welcome email' });
                            continue;
                        }
                    }
                    createdUsers.push(User_1.User.getSafeUser(newUser));
                }
                catch (error) {
                    console.error('Error creating user:', error);
                    errors.push({ email, error: 'Failed to create user' });
                }
            }
            return res.json({
                message: 'Batch user creation completed',
                createdUsers,
                errors
            });
        }
        catch (error) {
            (0, errorHandler_1.handleError)(res, error);
        }
    })
};
