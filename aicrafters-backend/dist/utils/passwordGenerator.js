"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomPassword = void 0;
const generateRandomPassword = (length = 12) => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const special = '!@#$%^&*';
    // Get one character from each required category
    const getLowercase = lowercase[Math.floor(Math.random() * lowercase.length)];
    const getUppercase = uppercase[Math.floor(Math.random() * uppercase.length)];
    const getNumber = numbers[Math.floor(Math.random() * numbers.length)];
    const getSpecial = special[Math.floor(Math.random() * special.length)];
    // Start with required characters
    let password = getLowercase + getUppercase + getNumber + getSpecial;
    // Create full character set for remaining characters
    const allChars = lowercase + uppercase + numbers + special;
    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * allChars.length);
        password += allChars[randomIndex];
    }
    // Shuffle the password to make it more random
    return password
        .split('')
        .sort(() => Math.random() - 0.5)
        .join('');
};
exports.generateRandomPassword = generateRandomPassword;
