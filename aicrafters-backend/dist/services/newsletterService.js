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
exports.newsletterService = void 0;
const Newsletter_1 = require("../models/Newsletter");
exports.newsletterService = {
    subscribe(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingSubscription = yield Newsletter_1.Newsletter.findOne({ email: email.toLowerCase() });
                if (existingSubscription) {
                    throw new Error('This email is already subscribed to the newsletter');
                }
                const subscription = new Newsletter_1.Newsletter({ email: email.toLowerCase() });
                yield subscription.save();
                return { success: true };
            }
            catch (error) {
                if (error.code === 11000) { // MongoDB duplicate key error code
                    throw new Error('This email is already subscribed to the newsletter');
                }
                throw error;
            }
        });
    },
    isSubscribed(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const subscription = yield Newsletter_1.Newsletter.findOne({
                email: email.toLowerCase(),
                isActive: true
            });
            return !!subscription;
        });
    },
    getAllSubscriptions() {
        return __awaiter(this, void 0, void 0, function* () {
            return Newsletter_1.Newsletter.find({ isActive: true })
                .sort({ subscribedAt: -1 })
                .select('email subscribedAt');
        });
    },
    deleteSubscription(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield Newsletter_1.Newsletter.findOneAndUpdate({ email: email.toLowerCase() }, { isActive: false }, { new: true });
            if (!result) {
                throw new Error('Subscription not found');
            }
            return { success: true };
        });
    }
};
