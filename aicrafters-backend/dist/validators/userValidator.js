"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateProfileUpdate = void 0;
const validateProfileUpdate = (data) => {
    const { fullName } = data;
    if (!fullName) {
        return 'Full name is required';
    }
    if (fullName.length < 2 || fullName.length > 50) {
        return 'Full name must be between 2 and 50 characters';
    }
    return null;
};
exports.validateProfileUpdate = validateProfileUpdate;
