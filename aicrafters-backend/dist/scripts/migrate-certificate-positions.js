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
const mongoose_1 = __importDefault(require("mongoose"));
const Course_1 = require("../models/Course");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
function migrateCertificatePositions() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Connect to MongoDB
            yield mongoose_1.default.connect(process.env.MONGODB_URI, {});
            console.log('Connected to MongoDB');
            // Find all courses with certificate templates that might need migration
            const courses = yield Course_1.Course.find({
                certificateTemplateUrl: { $exists: true, $ne: null }
            });
            console.log(`Found ${courses.length} courses with certificate templates`);
            let migratedCount = 0;
            for (const course of courses) {
                let needsUpdate = false;
                const config = (course.certificateTemplateConfig || {});
                // Create a new config with proper types for saving
                const newConfig = {
                    showUserName: !!config.showUserName, // Convert to boolean
                    showCourseName: !!config.showCourseName, // Convert to boolean
                    showCertificateId: !!config.showCertificateId, // Convert to boolean
                };
                // Check if namePosition exists but lacks x-coordinate
                if (config.namePosition && typeof config.namePosition === 'object') {
                    if (!('x' in config.namePosition)) {
                        newConfig.namePosition = {
                            x: 0.5,
                            y: config.namePosition.y || 0.52
                        };
                        needsUpdate = true;
                    }
                    else {
                        newConfig.namePosition = {
                            x: config.namePosition.x,
                            y: config.namePosition.y
                        };
                    }
                }
                // Check if coursePosition exists but lacks x-coordinate
                if (config.coursePosition && typeof config.coursePosition === 'object') {
                    if (!('x' in config.coursePosition)) {
                        newConfig.coursePosition = {
                            x: 0.5,
                            y: config.coursePosition.y || 0.72
                        };
                        needsUpdate = true;
                    }
                    else {
                        newConfig.coursePosition = {
                            x: config.coursePosition.x,
                            y: config.coursePosition.y
                        };
                    }
                }
                // Check if idPosition exists but lacks x-coordinate
                if (config.idPosition && typeof config.idPosition === 'object') {
                    if (!('x' in config.idPosition)) {
                        newConfig.idPosition = {
                            x: 0.5,
                            y: config.idPosition.y || 0.95
                        };
                        needsUpdate = true;
                    }
                    else {
                        newConfig.idPosition = {
                            x: config.idPosition.x,
                            y: config.idPosition.y
                        };
                    }
                }
                // Save updated course if changes were made
                if (needsUpdate) {
                    course.certificateTemplateConfig = newConfig;
                    yield course.save();
                    migratedCount++;
                    console.log(`Migrated certificate config for course ${course._id} - ${course.title}`);
                }
            }
            console.log(`Migration complete. ${migratedCount} courses updated.`);
        }
        catch (error) {
            console.error('Error during migration:', error);
        }
        finally {
            yield mongoose_1.default.disconnect();
            console.log('Disconnected from MongoDB');
        }
    });
}
// Run the migration
migrateCertificatePositions().catch(console.error);
