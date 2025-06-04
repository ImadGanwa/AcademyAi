"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const organizationController_1 = require("../controllers/organizationController");
const auth_1 = require("../middleware/auth");
const adminMiddleware_1 = require("../middleware/adminMiddleware");
const router = (0, express_1.Router)();
// All routes require authentication and admin privileges
router.use(auth_1.authMiddleware, adminMiddleware_1.adminMiddleware);
router.post('/', organizationController_1.createOrganization);
router.get('/', organizationController_1.getOrganizations);
router.get('/:id', organizationController_1.getOrganization);
router.put('/:id', organizationController_1.updateOrganization);
router.delete('/:id', organizationController_1.deleteOrganization);
router.post('/:id/users', organizationController_1.addUsersToOrganization);
router.delete('/:id/users', organizationController_1.removeUsersFromOrganization);
// Course management routes
router.put('/:id/courses', organizationController_1.updateOrganizationCourses);
router.get('/:id/courses', organizationController_1.getOrganizationCourses);
exports.default = router;
