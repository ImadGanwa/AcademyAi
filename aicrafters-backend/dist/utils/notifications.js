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
exports.createNotification = void 0;
const Notification_1 = require("../models/Notification");
const mongoose_1 = __importDefault(require("mongoose"));
const createNotification = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notification = new Notification_1.Notification({
            recipient: new mongoose_1.default.Types.ObjectId(data.recipient),
            type: data.type,
            title: data.title,
            message: data.message,
            action: data.action,
            relatedId: data.relatedId ? new mongoose_1.default.Types.ObjectId(data.relatedId) : undefined,
            read: false,
            createdAt: new Date()
        });
        yield notification.save();
    }
    catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
});
exports.createNotification = createNotification;
