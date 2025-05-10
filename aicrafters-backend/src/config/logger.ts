import winston from 'winston';
import path from 'path';

// Determine log level based on NODE_ENV
const level = process.env.NODE_ENV === 'production' ? 'warn' : 'debug';

// Define log format
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }), // Colorize logs for console
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
);

// Define transports (where logs should go)
const transports = [
    // Console transport
    new winston.transports.Console({
        level: level, // Log level for console
        handleExceptions: true, // Log unhandled exceptions
        // format: winston.format.combine(
        //     winston.format.colorize(),
        //     winston.format.simple()
        // )
    }),
    // File transport for all logs
    new winston.transports.File({
        filename: path.join('logs', 'all.log'), // Consider making log path configurable
        level: 'debug', // Log everything to this file
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }),
    // File transport for error logs
    new winston.transports.File({
        filename: path.join('logs', 'error.log'),
        level: 'error', // Log only errors to this file
        handleExceptions: true, // Log unhandled exceptions
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }),
];

// Create the logger instance
const logger = winston.createLogger({
    level: level, // Overall minimum log level
    levels: winston.config.npm.levels, // Use standard npm logging levels
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

export default logger; 