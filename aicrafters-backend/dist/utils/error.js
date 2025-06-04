"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createError = void 0;
const createError = (message, error) => {
    return Object.assign({ message }, (error && { error: error.message || error }));
};
exports.createError = createError;
