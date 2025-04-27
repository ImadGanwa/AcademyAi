import { Router } from 'express';
import {
  createOrganization,
  getOrganizations,
  getOrganization,
  updateOrganization,
  deleteOrganization,
  addUsersToOrganization,
  removeUsersFromOrganization,
  updateOrganizationCourses,
  getOrganizationCourses,
} from '../controllers/organizationController';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/adminMiddleware';

const router = Router();

// All routes require authentication and admin privileges
router.use(authMiddleware, adminMiddleware);

router.post('/', createOrganization);
router.get('/', getOrganizations);
router.get('/:id', getOrganization);
router.put('/:id', updateOrganization);
router.delete('/:id', deleteOrganization);
router.post('/:id/users', addUsersToOrganization);
router.delete('/:id/users', removeUsersFromOrganization);

// Course management routes
router.put('/:id/courses', updateOrganizationCourses);
router.get('/:id/courses', getOrganizationCourses);

export default router; 