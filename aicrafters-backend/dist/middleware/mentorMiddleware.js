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
exports.hasMentorApplication = exports.isApprovedMentor = exports.isMentor = void 0;
const User_1 = require("../models/User");
/**
 * Middleware to check if the user is a mentor
 */
const isMentor = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'User not authenticated' });
            return;
        }
        // Check if user has mentor role
        if (req.user.role !== 'mentor') {
            res.status(403).json({ success: false, error: 'Access denied. User is not a mentor' });
            return;
        }
        next();
    }
    catch (error) {
        console.error('Error in mentor middleware:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});
exports.isMentor = isMentor;
/**
 * Middleware to check if the user has an approved mentor profile
 */
const isApprovedMentor = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'User not authenticated' });
            return;
        }
        const userId = req.user.id;
        const user = yield User_1.User.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }
        // Check if user has mentor role
        if (user.role !== 'mentor') {
            res.status(403).json({ success: false, error: 'Access denied. User is not a mentor' });
            return;
        }
        // Check if mentor profile is approved
        if (!((_a = user.mentorProfile) === null || _a === void 0 ? void 0 : _a.isVerified) || !((_b = user.mentorProfile) === null || _b === void 0 ? void 0 : _b.approvedAt)) {
            res.status(403).json({ success: false, error: 'Access denied. Mentor profile not approved' });
            return;
        }
        next();
    }
    catch (error) {
        console.error('Error in mentor middleware:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});
exports.isApprovedMentor = isApprovedMentor;
/**
 * Middleware to check if the user has applied to be a mentor
 */
const hasMentorApplication = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: 'User not authenticated' });
            return;
        }
        const userId = req.user.id;
        const user = yield User_1.User.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }
        // Check if user has a mentor profile with an application date
        if (!((_a = user.mentorProfile) === null || _a === void 0 ? void 0 : _a.appliedAt)) {
            res.status(403).json({ success: false, error: 'User has not applied to be a mentor' });
            return;
        }
        next();
    }
    catch (error) {
        console.error('Error in mentor middleware:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});
exports.hasMentorApplication = hasMentorApplication;
