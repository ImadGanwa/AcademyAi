"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const handleError = (res, error) => {
    console.error('Error:', error);
    if (error instanceof mongoose_1.default.Error.ValidationError) {
        return res.status(400).json({
            message: 'Validation Error',
            errors: Object.values(error.errors).map((err) => err.message),
        });
    }
    if (error.code === 11000) {
        return res.status(400).json({
            message: 'Duplicate key error',
            field: Object.keys(error.keyPattern)[0],
        });
    }
    return res.status(500).json({
        message: 'Internal server error',
        error: error.message,
    });
};
exports.handleError = handleError;
