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
exports.trainerController = void 0;
const Course_1 = require("../models/Course");
const User_1 = require("../models/User");
const trainerService_1 = require("../services/trainerService");
exports.trainerController = {
    getUsers: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user || req.user.role !== 'trainer') {
                return res.status(403).json({ message: 'Not authorized' });
            }
            // Get all courses by this trainer with their users array
            const trainerCourses = yield Course_1.Course.find({ instructor: req.user._id });
            const courseIds = trainerCourses.map(course => course._id);
            // Calculate total users (including those who may have deleted their accounts)
            const totalUsers = trainerCourses.reduce((total, course) => {
                var _a;
                return total + (((_a = course.users) === null || _a === void 0 ? void 0 : _a.length) || 0);
            }, 0);
            // Get currently active users enrolled in any of these courses
            const users = yield User_1.User.aggregate([
                {
                    $match: {
                        role: 'user',
                        'courses.courseId': { $in: courseIds },
                        'courses.status': { $in: ['in progress', 'completed'] }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        fullName: 1,
                        email: 1,
                        status: 1,
                        lastActive: 1,
                        courses: {
                            $filter: {
                                input: '$courses',
                                as: 'course',
                                cond: {
                                    $and: [
                                        { $in: ['$$course.courseId', courseIds] },
                                        { $in: ['$$course.status', ['in progress', 'completed']] }
                                    ]
                                }
                            }
                        }
                    }
                }
            ]);
            const activeUsers = users.filter(user => user.status === 'active').length;
            let totalProgress = 0;
            let totalCompletions = 0;
            // Transform user data and calculate progress
            const transformedUsers = users.map(user => {
                const userTrainerCourses = user.courses.filter(course => courseIds.find((id) => course.courseId.toString() === id.toString()) &&
                    ['in progress', 'completed'].includes(course.status));
                const completedTrainerCourses = userTrainerCourses.filter(course => course.status === 'completed').length;
                const totalTrainerCourses = trainerCourses.length;
                const progress = userTrainerCourses.length > 0
                    ? (completedTrainerCourses / userTrainerCourses.length) * 100
                    : 0;
                totalProgress += progress;
                totalCompletions += completedTrainerCourses;
                return {
                    id: user._id,
                    name: user.fullName,
                    email: user.email,
                    status: user.status,
                    enrolledCourses: `${completedTrainerCourses}/${totalTrainerCourses}`,
                    completedCourses: completedTrainerCourses,
                    progress: Math.round(progress),
                    lastActive: user.lastActive
                };
            });
            res.json({
                stats: {
                    totalUsers, // Now using the total count from course.users arrays
                    activeUsers,
                    averageProgress: users.length > 0 ? Math.round(totalProgress / users.length) : 0,
                    courseCompletions: totalCompletions
                },
                users: transformedUsers
            });
        }
        catch (error) {
            console.error('Get users error:', error);
            if (error instanceof Error) {
                return res.status(500).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error fetching users' });
        }
    }),
    /**
     * Chat with the Trainer Coach
     * @route GET /api/trainer/chat
     */
    chat: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { courseId, videoUrl, message, threadId } = req.query;
            const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 'anonymous';
            // Validate required parameters
            if (!courseId || !videoUrl || !message) {
                res.status(400).json({
                    success: false,
                    error: 'Missing required parameters: courseId, videoUrl, and message are required'
                });
                return;
            }
            // Chat with the trainer
            const response = yield (0, trainerService_1.chatWithTrainer)(userId, courseId, videoUrl, message, threadId);
            // Return the response
            res.status(200).json({
                success: true,
                data: response
            });
        }
        catch (error) {
            console.error('Error in trainer chat controller:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'An error occurred while chatting with the trainer'
            });
        }
    })
};
