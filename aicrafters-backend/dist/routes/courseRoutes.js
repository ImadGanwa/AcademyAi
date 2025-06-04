"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const courseController_1 = require("../controllers/courseController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.get('/published', courseController_1.courseController.getPublishedCourses);
// Protected routes
router.use(auth_1.authMiddleware);
// ... rest of the routes ... 
