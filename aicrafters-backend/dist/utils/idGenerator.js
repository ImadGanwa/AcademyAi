"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateConsistentId = void 0;
const crypto_1 = __importDefault(require("crypto"));
/**
 * Generates a consistent ID for a given name by creating a hash of the name.
 * This ensures the same name always produces the same ID.
 *
 * @param name The name to generate an ID for
 * @returns A string ID that is consistent for the given name
 */
const generateConsistentId = (name) => {
    // Normalize the name (trim, lowercase)
    const normalizedName = name.trim().toLowerCase();
    // Generate a hash of the name
    const hash = crypto_1.default.createHash('md5').update(normalizedName).digest('hex');
    // Use the first 8 characters of the hash for a shorter ID
    return hash.substring(0, 8);
};
exports.generateConsistentId = generateConsistentId;
