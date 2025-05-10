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
exports.newsletterRoutes = void 0;
const express_1 = require("express");
const newsletterService_1 = require("../services/newsletterService");
const authMiddleware_1 = require("../middleware/authMiddleware");
const adminMiddleware_1 = require("../middleware/adminMiddleware");
const router = (0, express_1.Router)();
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
router.post('/subscribe', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email || !validateEmail(email)) {
            return res.status(400).json({ error: 'Invalid email address' });
        }
        yield newsletterService_1.newsletterService.subscribe(email);
        res.status(200).json({
            success: true,
            message: 'Successfully subscribed to the newsletter'
        });
    }
    catch (error) {
        if (error.message === 'This email is already subscribed to the newsletter') {
            return res.status(409).json({ error: error.message });
        }
        console.error('Newsletter subscription error:', error);
        res.status(500).json({ error: 'Failed to subscribe to newsletter' });
    }
}));
// New route to get all subscriptions (admin only)
router.get('/subscriptions', authMiddleware_1.authMiddleware, adminMiddleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const subscriptions = yield newsletterService_1.newsletterService.getAllSubscriptions();
        res.status(200).json(subscriptions);
    }
    catch (error) {
        console.error('Error fetching newsletter subscriptions:', error);
        res.status(500).json({ error: 'Failed to fetch newsletter subscriptions' });
    }
}));
// Delete subscription route (admin only)
router.delete('/subscriptions/:email', authMiddleware_1.authMiddleware, adminMiddleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.params;
        yield newsletterService_1.newsletterService.deleteSubscription(email);
        res.status(200).json({ message: 'Subscription deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting newsletter subscription:', error);
        res.status(500).json({ error: 'Failed to delete newsletter subscription' });
    }
}));
exports.newsletterRoutes = router;
