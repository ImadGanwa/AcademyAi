"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables before any other imports
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const courses_1 = __importDefault(require("./routes/courses"));
const auth_1 = __importDefault(require("./routes/auth"));
const user_1 = __importDefault(require("./routes/user"));
const admin_1 = __importDefault(require("./routes/admin"));
const trainerRoutes_1 = __importDefault(require("./routes/trainerRoutes"));
const mentorRoutes_1 = __importDefault(require("./routes/mentorRoutes"));
const certificate_1 = __importDefault(require("./routes/certificate"));
const certificateSettings_1 = __importDefault(require("./routes/certificateSettings"));
const errorHandler_1 = require("./middleware/errorHandler");
const newsletterRoutes_1 = require("./routes/newsletterRoutes");
const messages_1 = __importDefault(require("./routes/messages"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const organizationRoutes_1 = __importDefault(require("./routes/organizationRoutes"));
const transcriptionRoutes_1 = __importDefault(require("./routes/transcriptionRoutes"));
const summaryRoutes_1 = __importDefault(require("./routes/summaryRoutes"));
const mindMapRoutes_1 = __importDefault(require("./routes/mindMapRoutes"));
const bookingRoutes_1 = __importDefault(require("./routes/bookingRoutes"));
const app = (0, express_1.default)();
if (!process.env.ALLOWED_ORIGINS) {
    throw new Error('ALLOWED_ORIGINS environment variable is not defined');
}
// CORS configuration
const corsOptions = {
    origin: (_a = process.env.ALLOWED_ORIGINS) === null || _a === void 0 ? void 0 : _a.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};
// Apply CORS middleware
app.use((0, cors_1.default)(corsOptions));
// Configure body parser for different content types
// TODO: Move hardcoded request size limits to environment variables or configuration
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
// Add request logging middleware
app.use((req, res, next) => {
    next();
});
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/admin', admin_1.default);
app.use('/api/courses', courses_1.default);
app.use('/api/trainer', trainerRoutes_1.default);
app.use('/api/mentor', mentorRoutes_1.default);
app.use('/api/user', user_1.default);
app.use('/api/certificates', certificate_1.default);
app.use('/api/certificate-settings', certificateSettings_1.default);
app.use('/api/newsletter', newsletterRoutes_1.newsletterRoutes);
app.use('/api/messages', messages_1.default);
app.use('/api/notifications', notifications_1.default);
app.use('/api/organizations', organizationRoutes_1.default);
app.use('/api/transcriptions', transcriptionRoutes_1.default);
app.use('/api/summaries', summaryRoutes_1.default);
app.use('/api/mindmaps', mindMapRoutes_1.default);
app.use('/api/bookings', bookingRoutes_1.default);
// Connect to MongoDB
// TODO: Move hardcoded MongoDB connection string to environment variables
if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined');
}
mongoose_1.default.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
// Error handling middleware
app.use(errorHandler_1.errorHandler);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
exports.default = app;
