"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseExcelUsers = void 0;
const XLSX = __importStar(require("xlsx"));
const parseExcelUsers = (buffer) => {
    var _a, _b;
    try {
        // Read the Excel file
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        // Get the first worksheet
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        // Get the range of the worksheet
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
        // Find the header row (row 6)
        const headerRow = 6;
        const headers = {};
        // Get the headers from row 6
        for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: headerRow - 1, c: col });
            const cell = worksheet[cellAddress];
            if (cell && cell.v) {
                headers[col] = cell.v.toString();
            }
        }
        const users = [];
        // Start reading from row 7
        for (let row = headerRow; row <= range.e.r; row++) {
            const userData = {};
            // Read each column for this row
            for (let col = range.s.c; col <= range.e.c; col++) {
                const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                const cell = worksheet[cellAddress];
                if (cell && headers[col]) {
                    userData[headers[col]] = ((_a = cell.v) === null || _a === void 0 ? void 0 : _a.toString().trim()) || '';
                }
            }
            // Skip empty rows
            if (!userData.Nom && !userData.Prénom && !userData.Email && !userData.Gsm) {
                continue;
            }
            // Validate required fields
            if (!userData.Nom || !userData.Prénom || !userData.Email) {
                throw new Error(`Row ${row + 1}: Missing required fields. Need Nom, Prénom, and Email`);
            }
            // Validate email format
            if (!userData.Email.includes('@') || !((_b = userData.Email.split('@')[1]) === null || _b === void 0 ? void 0 : _b.includes('.'))) {
                throw new Error(`Row ${row + 1}: Invalid email format - ${userData.Email}`);
            }
            users.push({
                fullName: `${userData.Prénom} ${userData.Nom}`.trim(),
                phone: userData.Gsm || '',
                email: userData.Email.toLowerCase()
            });
        }
        return users;
    }
    catch (error) {
        console.error('Excel parsing error:', error);
        throw error;
    }
};
exports.parseExcelUsers = parseExcelUsers;
