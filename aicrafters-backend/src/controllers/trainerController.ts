import { Request, Response } from 'express';
import { Course } from '../models/Course';
import { User, IUser } from '../models/User';
import mongoose, { Document, Types } from 'mongoose';

interface UserCourse {
  courseId: Types.ObjectId;
  status: 'in progress' | 'saved' | 'completed';
  progress?: {
    timeSpent: number;
    percentage: number;
    completedLessons: string[];
  };
}

interface UserWithCourses extends Omit<IUser, 'courses'> {
  courses: UserCourse[];
}

interface ICourse {
  _id: mongoose.Types.ObjectId;
  instructor: mongoose.Types.ObjectId;
  users?: mongoose.Types.ObjectId[];
}

export const trainerController = {
  getUsers: async (req: Request, res: Response) => {
    try {
      if (!req.user || req.user.role !== 'trainer') {
        return res.status(403).json({ message: 'Not authorized' });
      }

      // Get all courses by this trainer with their users array
      const trainerCourses = await Course.find({ instructor: req.user._id });
      const courseIds = trainerCourses.map(course => course._id);

      // Calculate total users (including those who may have deleted their accounts)
      const totalUsers = trainerCourses.reduce((total, course) => {
        return total + (course.users?.length || 0);
      }, 0);

      // Get currently active users enrolled in any of these courses
      const users = await User.aggregate<UserWithCourses>([
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
        const userTrainerCourses = user.courses.filter(course => 
          courseIds.find((id: any) => course.courseId.toString() === id.toString()) &&
          ['in progress', 'completed'].includes(course.status)
        );
        
        const completedTrainerCourses = userTrainerCourses.filter(
          course => course.status === 'completed'
        ).length;
        
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
          totalUsers,  // Now using the total count from course.users arrays
          activeUsers,
          averageProgress: users.length > 0 ? Math.round(totalProgress / users.length) : 0,
          courseCompletions: totalCompletions
        },
        users: transformedUsers
      });
    } catch (error) {
      console.error('Get users error:', error);
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error fetching users' });
    }
  }
}; 