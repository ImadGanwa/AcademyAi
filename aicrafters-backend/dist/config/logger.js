"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
// Determine log level based on NODE_ENV
const level = process.env.NODE_ENV === 'production' ? 'warn' : 'debug';
// Define log format
const format = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston_1.default.format.colorize({ all: true }), // Colorize logs for console
winston_1.default.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`));
// Define transports (where logs should go)
const transports = [
    // Console transport
    new winston_1.default.transports.Console({
        level: level, // Log level for console
        handleExceptions: true, // Log unhandled exceptions
        // format: winston.format.combine(
        //     winston.format.colorize(),
        //     winston.format.simple()
        // )
    }),
    // File transport for all logs
    new winston_1.default.transports.File({
        filename: path_1.default.join('logs', 'all.log'), // Consider making log path configurable
        level: 'debug', // Log everything to this file
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }),
    // File transport for error logs
    new winston_1.default.transports.File({
        filename: path_1.default.join('logs', 'error.log'),
        level: 'error', // Log only errors to this file
        handleExceptions: true, // Log unhandled exceptions
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }),
];
// Create the logger instance
const logger = winston_1.default.createLogger({
    level: level, // Overall minimum log level
    levels: winston_1.default.config.npm.levels, // Use standard npm logging levels
    format: format,
    transports: transports,
    exitOnError: false, // Do not exit on handled exceptions
});
// Stream for morgan (HTTP request logging)
// Example usage in app.ts: app.use(morgan('combined', { stream: logger.stream }));
// logger.stream = {
//     write: (message: string): void => {
//         logger.info(message.substring(0, message.lastIndexOf('\n')));
//     },
// };
exports.default = logger;
