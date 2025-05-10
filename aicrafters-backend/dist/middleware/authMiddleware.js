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
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = yield User_1.User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        if (user.status !== 'active') {
            return res.status(403).json({ message: 'Account is not active' });
        }
        // Update last active timestamp
        user.lastActive = new Date();
        yield user.save();
        // Attach only the required fields to match courseController's expectations
        req.user = {
            id: user._id.toString(),
            _id: user._id.toString(),
            role: user.role
        };
        next();
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
});
exports.authMiddleware = authMiddleware;
