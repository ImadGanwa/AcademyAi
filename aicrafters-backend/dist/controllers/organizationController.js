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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrganizationCourses = exports.updateOrganizationCourses = exports.removeUsersFromOrganization = exports.addUsersToOrganization = exports.deleteOrganization = exports.updateOrganization = exports.getOrganization = exports.getOrganizations = exports.createOrganization = void 0;
const Organization_1 = require("../models/Organization");
const User_1 = require("../models/User");
const errorHandler_1 = require("../utils/errorHandler");
const createOrganization = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, users, courses = [] } = req.body;
        // Create the organization
        const organization = yield Organization_1.Organization.create({
            name,
            users: users.map((user) => ({
                fullName: user.fullName,
                email: user.email.toLowerCase()
            })),
            courses
        });
        // Update existing users to add this organization and its courses
        const userEmails = users.map((user) => user.email.toLowerCase());
        // Find all users that should be in this organization
        const existingUsers = yield User_1.User.find({ email: { $in: userEmails } });
        // For each user, add the organization and its courses
        for (const user of existingUsers) {
            const updates = {
                $addToSet: { organizations: organization._id }
            };
            // If there are courses, add them to the user's courses
            if (courses.length > 0) {
                const coursesToAdd = courses.map((courseId) => ({
                    courseId,
                    status: 'in progress',
                    organizationId: organization._id,
                    progress: {
                        timeSpent: 0,
                        percentage: 0,
                        completedLessons: []
                    }
                }));
                updates.$push = {
                    courses: {
                        $each: coursesToAdd
                    }
                };
            }
            yield User_1.User.findByIdAndUpdate(user._id, updates);
        }
        res.status(201).json(organization);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, error);
    }
});
exports.createOrganization = createOrganization;
const getOrganizations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const organizations = yield Organization_1.Organization.find().sort({ createdAt: -1 });
        res.json(organizations);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, error);
    }
});
exports.getOrganizations = getOrganizations;
const getOrganization = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const organization = yield Organization_1.Organization.findById(req.params.id);
        if (!organization) {
            return res.status(404).json({ message: 'Organization not found' });
        }
        res.json(organization);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, error);
    }
});
exports.getOrganization = getOrganization;
const updateOrganization = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, users } = req.body;
        // Get current organization users before update
        const currentOrg = yield Organization_1.Organization.findById(id);
        if (!currentOrg) {
            return res.status(404).json({ message: 'Organization not found' });
        }
        const currentEmails = currentOrg.users.map((user) => user.email.toLowerCase());
        // Update the organization
        const organization = yield Organization_1.Organization.findByIdAndUpdate(id, {
            name,
            users: users.map((user) => ({
                fullName: user.fullName,
                email: user.email.toLowerCase()
            }))
        }, { new: true });
        if (!organization) {
            return res.status(404).json({ message: 'Organization not found' });
        }
        // Get new user emails
        const newEmails = users.map((user) => user.email.toLowerCase());
        // Find all existing users that are new to the organization
        const newUsers = yield User_1.User.find({
            email: { $in: newEmails },
            organizations: { $ne: organization._id }
        });
        // For each new user, add organization and its courses
        for (const user of newUsers) {
            const updates = {
                $addToSet: { organizations: organization._id }
            };
            // If organization has courses, add them to the user's courses
            if (currentOrg.courses && currentOrg.courses.length > 0) {
                const coursesToAdd = currentOrg.courses.map(courseId => ({
                    courseId,
                    status: 'in progress',
                    organizationId: organization._id,
                    progress: {
                        timeSpent: 0,
                        percentage: 0,
                        completedLessons: []
                    }
                }));
                updates.$push = {
                    courses: {
                        $each: coursesToAdd
                    }
                };
            }
            yield User_1.User.findByIdAndUpdate(user._id, updates);
        }
        // Remove organization from users no longer in the organization
        const removedEmails = currentEmails.filter((email) => !newEmails.includes(email));
        if (removedEmails.length > 0) {
            yield User_1.User.updateMany({ email: { $in: removedEmails } }, {
                $pull: {
                    organizations: organization._id,
                    courses: { organizationId: organization._id }
                }
            });
        }
        res.json(organization);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, error);
    }
});
exports.updateOrganization = updateOrganization;
const deleteOrganization = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Remove organization from all users first
        yield User_1.User.updateMany({ organizations: id }, { $pull: { organizations: id } });
        // Then delete the organization
        yield Organization_1.Organization.findByIdAndDelete(id);
        res.json({ message: 'Organization deleted successfully' });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, error);
    }
});
exports.deleteOrganization = deleteOrganization;
const addUsersToOrganization = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { users } = req.body;
        const organization = yield Organization_1.Organization.findById(req.params.id);
        if (!organization) {
            return res.status(404).json({ message: 'Organization not found' });
        }
        // Add new users without duplicates
        const uniqueUsers = [...new Set([...organization.users, ...users])];
        organization.users = uniqueUsers;
        yield organization.save();
        res.json(organization);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, error);
    }
});
exports.addUsersToOrganization = addUsersToOrganization;
const removeUsersFromOrganization = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { users } = req.body;
        const organization = yield Organization_1.Organization.findById(req.params.id);
        if (!organization) {
            return res.status(404).json({ message: 'Organization not found' });
        }
        organization.users = organization.users.filter((user) => !users.includes(user));
        yield organization.save();
        res.json(organization);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, error);
    }
});
exports.removeUsersFromOrganization = removeUsersFromOrganization;
const updateOrganizationCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { courses } = req.body;
        // First, get the organization with its current courses and users
        const organization = yield Organization_1.Organization.findById(id);
        if (!organization) {
            return res.status(404).json({ message: 'Organization not found' });
        }
        // Get the list of current courses and new courses
        const currentCourses = organization.courses.map(c => c.toString());
        const newCourses = courses.map((c) => c.toString());
        // Find all users in the organization
        const users = yield User_1.User.find({
            email: {
                $in: organization.users.map(user => user.email.toLowerCase())
            }
        });
        // For each user, add new courses that aren't already in their courses list
        for (const user of users) {
            const userCourseIds = user.courses.map(c => c.courseId.toString());
            const coursesToAdd = newCourses.filter((courseId) => !userCourseIds.includes(courseId));
            if (coursesToAdd.length > 0) {
                const coursesToPush = coursesToAdd.map((courseId) => ({
                    courseId,
                    status: 'in progress',
                    organizationId: organization._id,
                    progress: {
                        timeSpent: 0,
                        percentage: 0,
                        completedLessons: []
                    }
                }));
                yield User_1.User.findByIdAndUpdate(user._id, {
                    $push: {
                        courses: {
                            $each: coursesToPush
                        }
                    }
                });
            }
            // Remove courses that are no longer in the organization
            const coursesToRemove = currentCourses.filter(courseId => !newCourses.includes(courseId) &&
                user.courses.some(c => {
                    var _a;
                    return c.courseId.toString() === courseId &&
                        ((_a = c.organizationId) === null || _a === void 0 ? void 0 : _a.toString()) === organization._id.toString();
                }));
            if (coursesToRemove.length > 0) {
                yield User_1.User.findByIdAndUpdate(user._id, {
                    $pull: {
                        courses: {
                            courseId: { $in: coursesToRemove },
                            organizationId: organization._id
                        }
                    }
                });
            }
        }
        // Update the organization's courses
        const updatedOrganization = yield Organization_1.Organization.findByIdAndUpdate(id, { courses }, { new: true }).populate('courses', 'title description thumbnail');
        res.json(updatedOrganization);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, error);
    }
});
exports.updateOrganizationCourses = updateOrganizationCourses;
const getOrganizationCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const organization = yield Organization_1.Organization.findById(id)
            .populate('courses', 'title description thumbnail');
        if (!organization) {
            return res.status(404).json({ message: 'Organization not found' });
        }
        res.json(organization.courses);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, error);
    }
});
exports.getOrganizationCourses = getOrganizationCourses;
