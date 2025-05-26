import { Request, Response } from 'express';
import { Course, ICourse } from '../models/Course';
import { Category } from '../models/Category';
import mongoose, { Document } from 'mongoose';
import { 
  ContentItem, 
  LessonContent, 
  QuizContent, 
  TransformedLesson,
  TransformedCourse,
  QuizQuestion 
} from '../types/course';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/fileUpload';
import { User, IUser } from '../models/User';
import redisClient from '../config/redis';
import { createNotification } from '../utils/notifications';
import { sendCourseSubmissionEmail, sendPurchaseConfirmationEmail, sendCourseInvitationEmail } from '../utils/email';
import { Organization, IOrganization } from '../models/Organization';

interface ValidationError extends Error {
  name: string;
  errors: {
    [key: string]: {
      message: string;
    };
  };
}

interface UpdateLessonInput {
  title: string;
  type?: 'video' | 'text' | 'quiz';
  content?: string;
  duration?: number;
  preview?: boolean;
}

interface TransformedSection {
  id: string;
  title: string;
  lessons: TransformedLesson[];
}

interface CreateCourseSection {
  title: string;
  lessons?: {
    title: string;
    type?: 'video' | 'text' | 'quiz';
    content?: string;
    duration?: number;
    preview?: boolean;
  }[];
}

interface CoursePopulated {
  _id: mongoose.Types.ObjectId;
  title: string;
  instructor: {
    _id: mongoose.Types.ObjectId;
    fullName: string;
  };
  updatedAt: Date;
  duration?: number;
  thumbnail?: string;
}

interface UserCoursePopulated {
  courseId: CoursePopulated;
  status: 'in progress' | 'saved' | 'completed';
  progress?: {
    timeSpent: number;
    percentage: number;
  };
}

interface UserPopulated extends Omit<IUser, 'courses'> {
  courses: UserCoursePopulated[];
}

interface PopulatedCourse extends Omit<ICourse, 'instructor'> {
  _id: mongoose.Types.ObjectId;
  instructor: {
    _id: mongoose.Types.ObjectId;
    fullName: string;
  };
}

interface CourseWithInstructor extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  instructor: {
    _id: mongoose.Types.ObjectId;
    fullName: string;
  };
  users: mongoose.Types.ObjectId[];
}

interface CourseContent {
  _id?: mongoose.Types.ObjectId;
  title: string;
  type: 'lesson' | 'quiz';
  content: {
    id?: string;
    type: 'lesson' | 'quiz';
    title?: string;
    contentItems?: any[];
    questions?: any[];
    preview?: boolean;
  };
}

interface CourseSection {
  _id?: mongoose.Types.ObjectId;
  title: string;
  contents: CourseContent[];
}

const getVimeoVideoId = (url: string): string | null => {
  const match = url.match(/(?:\/|groups\/[^/]+\/videos\/)(\d+)/);
  return match ? match[1] : null;
};

const calculateContentReadingTime = (content: string): number => {
  // Remove HTML tags but keep the text
  const text = content.replace(/<[^>]*>/g, '');
  const words = text.trim().split(/\s+/).length;
  // Reading speed: 150 words per minute
  const readingTime = words / 150;
  
  // Count images (img tags)
  const imageMatches = content.match(/<img[^>]*>/g);
  const imageCount = imageMatches ? imageMatches.length : 0;
  // 15 seconds (0.25 minutes) per image
  const imageTime = imageCount * 0.25;
  
  // Return total time in minutes, rounded up
  return Math.ceil(readingTime + imageTime);
};

const fetchVimeoDuration = async (videoId: string): Promise<number> => {
  try {
    const response = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`);
    const data = await response.json();
    const minutes = data.duration / 60;
    return Math.ceil(minutes);
  } catch (error) {
    console.error('Error fetching Vimeo duration:', error);
    return 0;
  }
};

// Update the Request type definition
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        _id: string; // Add this for backward compatibility
      };
    }
  }
}

// Helper function to get ID from a document
const getDocumentId = (doc: any): string => {
  if (!doc) return '';
  if (doc._id) return doc._id.toString();
  if (doc.id) return doc.id;
  return '';
};

export const courseController = {
  getAllCourses: async (req: Request, res: Response) => {
    try {
      // Try to get data from cache first
      const cacheKey = 'all-courses';
      const cachedData = await redisClient.get(cacheKey);
      
      if (cachedData) {
        // Handle both string and object responses from Redis
        const parsedData = typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;
        return res.json(parsedData);
      }

      const courses = await Course.find()
        .populate('instructor', 'fullName email')
        .sort({ createdAt: -1 });

      const transformedCourses: TransformedCourse[] = courses.map(course => {
        const courseObj = course.toObject() as ICourse & { _id: mongoose.Types.ObjectId };
        
        const courseData: TransformedCourse = {
          id: courseObj._id.toString(),
          title: courseObj.title,
          subtitle: courseObj.subtitle,
          description: courseObj.description,
          instructor: courseObj.instructor,
          thumbnail: courseObj.thumbnail,
          previewVideo: courseObj.previewVideo,
          originalPrice: courseObj.originalPrice,
          currentPrice: courseObj.currentPrice,
          categories: courseObj.categories,
          learningPoints: courseObj.learningPoints,
          requirements: courseObj.requirements,
          status: courseObj.status,
          rating: courseObj.rating,
          usersCount: courseObj.users?.length || 0,
          createdAt: courseObj.createdAt,
          updatedAt: courseObj.updatedAt
        };

        if (courseObj.courseContent && courseObj.courseContent.sections) {
          courseData.courseContent = {
            sections: courseObj.courseContent.sections.map(section => ({
              id: getDocumentId(section),
              title: section.title,
              lessons: section.contents.map(content => {
                const contentData: TransformedLesson = {
                  id: getDocumentId(content),
                  title: content.title,
                  type: content.type,
                  preview: false,
                  duration: 0,
                  contentItems: [],
                  questions: []
                };

                if (content.type === 'lesson') {
                  const lessonContent = content.content as LessonContent;
                  contentData.preview = lessonContent.preview || false;
                  contentData.duration = lessonContent.duration || 0;
                  contentData.contentItems = lessonContent.contentItems || [];
                } else if (content.type === 'quiz') {
                  const quizContent = content.content as QuizContent;
                  contentData.preview = quizContent.preview || false;
                  contentData.questions = quizContent.questions || [];
                  contentData.duration = quizContent.questions?.length * 2 || 0;
                }

                return contentData;
              })
            }))
          };
        }

        return courseData;
      });

      // Cache the results for 5 minutes
      await redisClient.setEx(cacheKey, 300, JSON.stringify(transformedCourses));

      res.json(transformedCourses);
    } catch (error) {
      console.error('Get all courses error:', error);
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error fetching courses' });
    }
  },

  getCourseById: async (req: Request, res: Response) => {
    try {
      const courseId = req.params.id;
      
      // Try to get data from cache first
      const cacheKey = `course:${courseId}`;
      const cachedData = await redisClient.get(cacheKey);
      
      if (cachedData) {
        // Handle both string and object responses from Redis
        const parsedData = typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;
        return res.json(parsedData);
      }

      const course = await Course.findById(courseId)
        .populate({
          path: 'instructor',
          select: 'fullName email profileImage title bio rating reviewsCount usersCount coursesCount'
        })
        .populate('users', 'fullName email');

      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      const courseObj = course.toObject() as ICourse & { _id: mongoose.Types.ObjectId };
      
      const transformedCourse: TransformedCourse = {
        id: courseObj._id.toString(),
        title: courseObj.title,
        subtitle: courseObj.subtitle,
        description: courseObj.description,
        instructor: courseObj.instructor,
        thumbnail: courseObj.thumbnail,
        previewVideo: courseObj.previewVideo,
        originalPrice: courseObj.originalPrice,
        currentPrice: courseObj.currentPrice,
        categories: courseObj.categories,
        learningPoints: courseObj.learningPoints,
        requirements: courseObj.requirements,
        status: courseObj.status,
        rating: courseObj.rating,
        usersCount: courseObj.users?.length || 0,
        createdAt: courseObj.createdAt,
        updatedAt: courseObj.updatedAt
      };

      if (courseObj.courseContent && courseObj.courseContent.sections) {
        transformedCourse.courseContent = {
          sections: courseObj.courseContent.sections.map(section => ({
            id: getDocumentId(section),
            title: section.title,
            lessons: section.contents.map(content => {
              const contentData: TransformedLesson = {
                id: getDocumentId(content),
                title: content.title,
                type: content.type,
                preview: false,
                duration: 0,
                contentItems: [],
                questions: []
              };

              if (content.type === 'lesson') {
                const lessonContent = content.content as LessonContent;
                contentData.preview = lessonContent.preview || false;
                contentData.duration = lessonContent.duration || 0;
                contentData.contentItems = lessonContent.contentItems || [];
              } else if (content.type === 'quiz') {
                const quizContent = content.content as QuizContent;
                contentData.preview = quizContent.preview || false;
                contentData.questions = quizContent.questions || [];
                contentData.duration = quizContent.questions?.length * 2 || 0;
              }

              return contentData;
            })
          }))
        };
      }

      // Cache the results for 5 minutes
      await redisClient.setEx(cacheKey, 300, JSON.stringify(transformedCourse));

      res.json(transformedCourse);
    } catch (error) {
      console.error('Get course by id error:', error);
      if (error instanceof Error) {
        if (error instanceof mongoose.Error.CastError) {
          return res.status(400).json({ message: 'Invalid course ID' });
        }
        return res.status(500).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error fetching course' });
    }
  },

  getTrainerCourses: async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      if (req.user.role !== 'trainer') {
        return res.status(403).json({ message: 'Only trainers can access their courses' });
      }

      const courses = await Course.find({ instructor: req.user.id })
        .populate('instructor', 'fullName email')
        .sort({ createdAt: -1 });

      // Transform the response to include all course information
      const transformedCourses: TransformedCourse[] = courses.map(course => {
        const courseObj = course.toObject() as ICourse & { _id: mongoose.Types.ObjectId };
        
        // Include course metadata
        const courseData: TransformedCourse = {
          id: courseObj._id.toString(),
          title: courseObj.title,
          subtitle: courseObj.subtitle,
          description: courseObj.description,
          instructor: courseObj.instructor,
          thumbnail: courseObj.thumbnail,
          previewVideo: courseObj.previewVideo,
          originalPrice: courseObj.originalPrice,
          currentPrice: courseObj.currentPrice,
          categories: courseObj.categories,
          learningPoints: courseObj.learningPoints,
          requirements: courseObj.requirements,
          status: courseObj.status,
          rating: courseObj.rating,
          usersCount: courseObj.users?.length || 0,
          createdAt: courseObj.createdAt,
          updatedAt: courseObj.updatedAt
        };

        // Include full section and lesson information including content
        if (courseObj.courseContent && courseObj.courseContent.sections) {
          courseData.courseContent = {
            sections: courseObj.courseContent.sections.map(section => ({
              id: getDocumentId(section),
              title: section.title,
              lessons: section.contents.map(content => {
                const contentData: TransformedLesson = {
                  id: getDocumentId(content),
                  title: content.title,
                  type: content.type,
                  preview: false,
                  duration: 0,
                  contentItems: [],
                  questions: []
                };

                if (content.type === 'lesson') {
                  const lessonContent = content.content as LessonContent;
                  contentData.duration = lessonContent.duration || 0;
                  contentData.preview = lessonContent.preview || false;
                  contentData.contentItems = lessonContent.contentItems?.map((item: { type: 'text' | 'media', content: string, duration?: number }) => ({
                    type: item.type,
                    content: item.content,
                    duration: item.duration
                  })) || [];
                } else if (content.type === 'quiz') {
                  const quizContent = content.content as QuizContent;
                  contentData.preview = quizContent.preview || false;
                  contentData.questions = quizContent.questions || [];
                  contentData.duration = quizContent.questions?.length * 2 || 0;
                  contentData.contentItems = [];
                }

                return contentData;
              })
            }))
          };
        }

        return courseData;
      });

      res.json(transformedCourses);
    } catch (error) {
      console.error('Get trainer courses error:', error);
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error fetching trainer courses' });
    }
  },

  createCourse: async (req: Request, res: Response) => {
    try {

      // First, handle the file upload
      let thumbnailUrl = '';
      if (req.file) {
        try {
          thumbnailUrl = await uploadToCloudinary(req.file, 'course-thumbnails');
        } catch (error) {
          console.error('Error uploading thumbnail:', error);
          return res.status(500).json({ error: 'Error uploading thumbnail' });
        }
      } else {
        return res.status(400).json({ error: 'Thumbnail is required' });
      }

      const {
        title,
        subtitle,
        description,
        originalPrice,
        currentPrice,
        vimeoLink,
        categoriesStr,
        learningPointsStr,
        requirementsStr,
        courseContentStr,
        duration,
      } = req.body;

      let categories, learningPoints, requirements, courseContent;

      try {
        // Parse all JSON strings
        categories = JSON.parse(categoriesStr || '[]');
        learningPoints = JSON.parse(learningPointsStr || '[]');
        requirements = JSON.parse(requirementsStr || '[]');
        courseContent = JSON.parse(courseContentStr || '{"sections":[]}');

        // Validate arrays
        if (!Array.isArray(categories)) {
          throw new Error('Categories must be an array');
        }
        if (!Array.isArray(learningPoints)) {
          throw new Error('Learning Points must be an array');
        }
        if (!Array.isArray(requirements)) {
          throw new Error('Requirements must be an array');
        }

        // Validate course content structure
        if (!courseContent.sections || !Array.isArray(courseContent.sections)) {
          throw new Error('Invalid course content structure');
        }

        // Transform sections to match the database structure
        courseContent.sections = courseContent.sections.map((section: { title: string; contents: any[] }) => {
          if (!section.title || !section.contents || !Array.isArray(section.contents)) {
            throw new Error('Invalid section structure');
          }

          return {
            title: section.title,
            contents: section.contents.map((content: any) => {
            if (!content.type || !content.title || !content.content) {
              throw new Error('Invalid content structure');
            }

            if (content.type === 'lesson') {
                const lessonContent = content.content;
              if (!Array.isArray(lessonContent.contentItems)) {
                throw new Error('Invalid lesson content structure - contentItems must be an array');
              }

                return {
                  title: content.title,
                  type: 'lesson',
                  content: {
                    type: 'lesson',
                    contentItems: lessonContent.contentItems.map((item: any) => ({
                      type: item.type,
                      content: item.content,
                      duration: item.duration
                    })),
                    preview: lessonContent.preview || false,
                    duration: lessonContent.duration || 0
                  }
                };
            } else if (content.type === 'quiz') {
                const quizContent = content.content;
                
                const transformedQuiz = {
                  title: content.title,
                  type: 'quiz',
                  content: {
                    id: quizContent.id,
                    title: quizContent.title,
                    type: 'quiz',
                    questions: quizContent.questions || [],
                    preview: quizContent.preview || false
                  }
                };
                
                return transformedQuiz;
            }

              throw new Error('Invalid content type');
            })
          };
        });

      } catch (error: any) {
        console.error('=== DEBUG: JSON Parse Error ===');
        console.error('Error:', error);
        console.error('Categories String:', categoriesStr);
        console.error('Learning Points String:', learningPointsStr);
        console.error('Requirements String:', requirementsStr);
        console.error('Course Content String:', courseContentStr);
        return res.status(400).json({ 
          error: 'Invalid JSON data provided', 
          details: error instanceof Error ? error.message : 'Unknown error occurred'
        });
      }

      const course = new Course({
        title,
        subtitle,
        description,
        instructor: req.user?._id,
        originalPrice: Number(originalPrice),
        currentPrice: Number(currentPrice),
        thumbnail: thumbnailUrl,
        previewVideo: vimeoLink,
        categories,
        learningPoints,
        requirements,
        courseContent,
        status: 'draft',
        duration: Number(duration) || 0
      });

      await course.save();

      // Transform the course data before sending response
      const courseObj = course.toObject() as ICourse & { _id: mongoose.Types.ObjectId };
      const transformedCourse: TransformedCourse = {
        id: courseObj._id.toString(),
        title: courseObj.title,
        subtitle: courseObj.subtitle,
        description: courseObj.description,
        instructor: courseObj.instructor,
        thumbnail: courseObj.thumbnail,
        previewVideo: courseObj.previewVideo,
        originalPrice: courseObj.originalPrice,
        currentPrice: courseObj.currentPrice,
        categories: courseObj.categories,
        learningPoints: courseObj.learningPoints,
        requirements: courseObj.requirements,
        status: courseObj.status,
        rating: courseObj.rating,
        usersCount: courseObj.users?.length || 0,
        createdAt: courseObj.createdAt,
        updatedAt: courseObj.updatedAt,
        courseContent: courseObj.courseContent && {
          sections: courseObj.courseContent.sections.map(section => ({
            id: getDocumentId(section),
            title: section.title,
            lessons: section.contents.map(content => {
              const contentData: TransformedLesson = {
                id: getDocumentId(content),
                title: content.title,
                type: content.type,
                preview: false,
                duration: 0,
                contentItems: [],
                questions: []
              };

              if (content.type === 'lesson') {
                const lessonContent = content.content as LessonContent;
                contentData.duration = lessonContent.duration || 0;
                contentData.preview = lessonContent.preview || false;
                contentData.contentItems = lessonContent.contentItems?.map((item: { type: 'text' | 'media', content: string, duration?: number }) => ({
                  type: item.type,
                  content: item.content,
                  duration: item.duration
                })) || [];
              } else if (content.type === 'quiz') {
                const quizContent = content.content as QuizContent;
                contentData.preview = quizContent.preview || false;
                contentData.questions = quizContent.questions || [];
                contentData.duration = quizContent.questions?.length * 2 || 0;
                contentData.contentItems = [];
              }

              return contentData;
            })
          }))
        }
      };

      // Invalidate the all-courses cache
      await redisClient.setEx('all-courses', 1, '');

      res.status(201).json({
        course: transformedCourse,
        redirectTo: `/[lang]/dashboard/courses`
      });
    } catch (error: any) {
      console.error('Error creating course:', error);
      res.status(500).json({ 
        error: 'Error creating course', 
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  },

  uploadThumbnail: async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      if (req.user.role !== 'trainer') {
        return res.status(403).json({ message: 'Only trainers can upload course thumbnails' });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const thumbnailUrl = await uploadToCloudinary(req.file, 'course-thumbnails');
      
      res.json({ 
        message: 'Thumbnail uploaded successfully',
        path: thumbnailUrl
      });
    } catch (error) {
      console.error('Upload thumbnail error:', error);
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error uploading thumbnail' });
    }
  },

  getCategories: async (req: Request, res: Response) => {
    try {
      const categories = await Category.find().sort({ name: 1 });
      res.json(categories.map(cat => cat.name));
    } catch (error) {
      console.error('Get categories error:', error);
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error fetching categories' });
    }
  },

  addCategory: async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      if (req.user.role !== 'trainer') {
        return res.status(403).json({ message: 'Only trainers can add categories' });
      }

      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ message: 'Category name is required' });
      }

      const existingCategory = await Category.findOne({ name: name.trim() });
      if (existingCategory) {
        return res.status(400).json({ message: 'Category already exists' });
      }

      const category = new Category({
        name: name.trim(),
        createdBy: req.user.id
      });
      await category.save();

      const categories = await Category.find().sort({ name: 1 });
      res.status(201).json({ 
        message: 'Category added successfully', 
        categories: categories.map(cat => cat.name) 
      });
    } catch (error) {
      console.error('Add category error:', error);
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error adding category' });
    }
  },

  updateCategory: async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      if (req.user.role !== 'trainer') {
        return res.status(403).json({ message: 'Only trainers can update categories' });
      }

      const { oldName, newName } = req.body;

      if (!oldName || !newName) {
        return res.status(400).json({ message: 'Both old and new category names are required' });
      }

      const category = await Category.findOne({ name: oldName });
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }

      // Check if user is the creator of the category
      if (category.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ message: 'You can only update categories you created' });
      }

      const existingCategory = await Category.findOne({ 
        name: newName.trim(),
        _id: { $ne: category._id }
      });
      if (existingCategory) {
        return res.status(400).json({ message: 'New category name already exists' });
      }

      category.name = newName.trim();
      await category.save();

      const categories = await Category.find().sort({ name: 1 });
      res.json({ 
        message: 'Category updated successfully', 
        categories: categories.map(cat => cat.name) 
      });
    } catch (error) {
      console.error('Update category error:', error);
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error updating category' });
    }
  },

  deleteCategory: async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      if (req.user.role !== 'trainer') {
        return res.status(403).json({ message: 'Only trainers can delete categories' });
      }

      const categoryName = req.params.name;

      if (!categoryName) {
        return res.status(400).json({ message: 'Category name is required' });
      }

      const category = await Category.findOne({ name: categoryName });
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }

      // Check if user is the creator of the category
      if (category.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ message: 'You can only delete categories you created' });
      }

      await Category.deleteOne({ _id: category._id });

      const categories = await Category.find().sort({ name: 1 });
      res.json({ 
        message: 'Category deleted successfully', 
        categories: categories.map(cat => cat.name) 
      });
    } catch (error) {
      console.error('Delete category error:', error);
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error deleting category' });
    }
  },

  updateCourseSection: async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      if (req.user.role !== 'trainer') {
        return res.status(403).json({ message: 'Only trainers can update course sections' });
      }

      const courseId = req.params.courseId;
      const sectionId = req.params.sectionId;
      const { title, contents } = req.body as { 
        title?: string; 
        contents?: Array<{
          title: string;
          type: 'lesson' | 'quiz';
          content: LessonContent | QuizContent;
        }>;
      };

      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Verify the course belongs to the trainer
      if (course.instructor.toString() !== req.user.id) {
        return res.status(403).json({ message: 'You can only update your own courses' });
      }

      // Find the section to update
      const sectionIndex = course.courseContent.sections.findIndex(
        section => getDocumentId(section) === sectionId
      );

      if (sectionIndex === -1) {
        return res.status(404).json({ message: 'Section not found' });
      }

      // Update section
      const currentSection = course.courseContent.sections[sectionIndex];
      course.courseContent.sections[sectionIndex] = {
        ...currentSection,
        title: title || currentSection.title,
        contents: contents || currentSection.contents
      };

      await course.save();
      res.json(course);
    } catch (error) {
      console.error('Update course section error:', error);
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error updating course section' });
    }
  },

  updateCourseStatus: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const course = await Course.findOne({ _id: id, instructor: userId })
        .populate('instructor', 'fullName email')
        .lean();

      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Trainers can send courses for review or change published courses to draft
      if (req.user?.role !== 'admin') {
        if (status !== 'review' && status !== 'draft') {
          return res.status(403).json({ message: 'Trainers can only send courses for review or change to draft' });
        }
        
        // Only allow draft courses to be sent for review
        if (status === 'review' && course.status !== 'draft') {
          return res.status(400).json({ message: 'Only draft courses can be sent for review' });
        }

        // Only allow published or review courses to be changed to draft
        if (status === 'draft' && !['published', 'review'].includes(course.status)) {
          return res.status(400).json({ message: 'Only published or review courses can be changed to draft' });
        }

        // If course is being sent for review
        if (status === 'review') {
          try {
            // Find all admin users
            const admins = await User.find({ role: 'admin' });
            
            // Send email and create notification for each admin
            for (const admin of admins) {
              // Send email to admin
              await sendCourseSubmissionEmail(
                admin.email,
                admin.fullName,
                course.title
              );

              // Create notification for admin
              await createNotification({
                recipient: admin._id.toString(),
                type: 'course',
                title: 'New Course Review Request',
                message: `${(course.instructor as any).fullName} has submitted "${course.title}" for review.`,
                relatedId: course._id.toString()
              });
            }
          } catch (error) {
            console.error('Error sending course review notifications:', error);
            // Don't fail the request if notifications fail
          }
        }
      }

      // Update the course status
      await Course.findByIdAndUpdate(id, { status });

      res.json({ message: 'Course status updated successfully', status });
    } catch (error) {
      console.error('Update course status error:', error);
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error updating course status' });
    }
  },

  deleteCourse: async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const { id } = req.params;

      const course = await Course.findById(id);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Verify that the user is the course instructor
      if (course.instructor.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to delete this course' });
      }

      // Delete the course
      await Course.findByIdAndDelete(id);

      // Invalidate both the specific course cache and all-courses cache
      await redisClient.setEx(`course:${id}`, 1, '');
      await redisClient.setEx('all-courses', 1, '');

      res.json({ message: 'Course deleted successfully' });
    } catch (error) {
      console.error('Delete course error:', error);
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error deleting course' });
    }
  },

  getMyCourses: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { search } = req.query;
      const query: any = { instructor: userId };

      if (search) {
        query.title = { $regex: search, $options: 'i' };
      }

      const courses = await Course.find(query).sort({ updatedAt: -1 });

      const transformedCourses = courses.map(course => ({
        id: course._id,
        title: course.title,
        subtitle: course.subtitle,
        thumbnail: course.thumbnail,
        status: course.status,
        usersCount: course.users?.length || 0,
        rating: course.rating || 0,
        duration: course.duration || 0,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt
      }));

      res.json(transformedCourses);
    } catch (error) {
      console.error('Get my courses error:', error);
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error fetching courses' });
    }
  },

  // Update course
  updateCourse: async (req: Request, res: Response) => {
    try {
      const courseId = req.params.id;

      // First find the course to verify ownership and get existing content
      const existingCourse = await Course.findOne({ _id: courseId, instructor: req.user?.id });
      if (!existingCourse) {
        return res.status(404).json({ error: 'Course not found or unauthorized' });
      }

      // Create a map of existing lesson IDs
      const existingLessonIds = new Map();
      existingCourse.courseContent?.sections.forEach((section) => {
        section.contents.forEach((content: CourseContent) => {
          // Store the exact ID from the content
          const contentId = content._id?.toString();
          if (contentId) {
            existingLessonIds.set(content.title, contentId);
          }
        });
      });

      // Handle thumbnail upload first if a new file is provided
      let thumbnailUrl;
      if (req.file) {
        try {
          thumbnailUrl = await uploadToCloudinary(req.file, 'course-thumbnails');
        } catch (error) {
          console.error('Error uploading thumbnail:', error);
          return res.status(500).json({ error: 'Error uploading thumbnail' });
        }
      }

      const {
        title,
        subtitle,
        description,
        originalPrice,
        currentPrice,
        vimeoLink,
        categoriesStr,
        learningPointsStr,
        requirementsStr,
        courseContentStr,
        status
      } = req.body;

      let categories, learningPoints, requirements, courseContent;

      try {
        // Parse JSON strings
        categories = JSON.parse(categoriesStr);
        learningPoints = JSON.parse(learningPointsStr);
        requirements = JSON.parse(requirementsStr);
        courseContent = JSON.parse(courseContentStr);

        // Validate course content structure
        if (courseContent) {
          if (!Array.isArray(courseContent.sections)) {
            throw new Error('Invalid course content structure: sections must be an array');
          }

          courseContent.sections = courseContent.sections.map((section: { title: string; contents: any[] }) => {
            if (!section.title || !section.contents || !Array.isArray(section.contents)) {
              throw new Error('Invalid section structure');
            }

            return {
              title: section.title,
              contents: section.contents.map((content: any) => {
                if (!content.type || !content.title || !content.content) {
                  throw new Error('Invalid content structure');
                }

                // Try to find existing lesson ID
                const existingId = existingLessonIds.get(content.title);
                const contentId = existingId ? new mongoose.Types.ObjectId(existingId) : new mongoose.Types.ObjectId();

                if (content.type === 'lesson') {
                  return {
                    _id: contentId,
                    title: content.title,
                    type: 'lesson',
                    content: {
                      type: 'lesson',
                      contentItems: content.content.contentItems || [],
                      preview: content.content.preview || false,
                      duration: content.content.duration || 0
                    }
                  };
                } else if (content.type === 'quiz') {
                  const quizContent = content.content as QuizContent;
                  
                  return {
                    _id: contentId,
                    title: content.title,
                    type: 'quiz',
                    content: {
                      type: 'quiz',
                      title: quizContent.title || content.title,
                      questions: quizContent.questions || [],
                      preview: quizContent.preview || false,
                      duration: (quizContent.questions?.length || 0) * 2
                    }
                  };
                }

                throw new Error('Invalid content type');
              })
            };
          });
        }
      } catch (error: any) {
        console.error('=== DEBUG: JSON Parse Error ===');
        console.error('Error:', error);
        return res.status(400).json({ 
          error: 'Invalid JSON data provided',
          details: error instanceof Error ? error.message : 'Unknown error occurred'
        });
      }

      // Build update object with all fields
      const updateData: any = {
        title,
        subtitle,
        description,
        originalPrice: Number(originalPrice),
        currentPrice: Number(currentPrice),
        categories,
        learningPoints,
        requirements,
        status,
        duration: Number(req.body.duration) || 0
      };

      // Only include courseContent if it was provided
      if (courseContent) {
        updateData.courseContent = courseContent;
      }

      // Only update thumbnail if a new one was uploaded
      if (thumbnailUrl) {
        updateData.thumbnail = thumbnailUrl;
      }

      // Update preview video if provided
      if (vimeoLink) {
        updateData.previewVideo = vimeoLink;
      }

      // Then update the course with the new data
      const course = await Course.findOneAndUpdate(
        { _id: courseId },
        updateData,
        { new: true }
      ).populate('instructor', 'fullName email');

      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      // Invalidate all relevant caches
      await Promise.all([
        redisClient.setEx(`course:${courseId}`, 1, ''),
        redisClient.setEx('all-courses', 1, ''),
        redisClient.setEx(`instructor:${req.user?.id}:courses`, 1, '')
      ]);

      // Calculate total lessons in the updated course
      let totalLessons = 0;
      const newLessonIds = new Set();
      course.courseContent.sections.forEach(section => {
        section.contents.forEach((content: any) => {
          totalLessons++;
          if (content._id) {
            newLessonIds.add(content._id.toString());
          }
        });
      });

      // Find all users who have this course and update their progress
      const users = await User.find({ 'courses.courseId': courseId });
      
      for (const user of users) {
        const userCourse = user.courses.find(c => c.courseId.toString() === courseId);
        if (userCourse && userCourse.progress) {
          // Filter out completed lessons that no longer exist in the course
          const validCompletedLessons = userCourse.progress.completedLessons.filter(
            lessonId => newLessonIds.has(lessonId.toString())
          );

          // Calculate new progress percentage based on valid completed lessons
          const completedLessonsCount = validCompletedLessons.length;
          const newPercentage = totalLessons > 0 ? (completedLessonsCount / totalLessons) * 100 : 0;

          // Update the user's course progress
          await User.findOneAndUpdate(
            { 
              _id: user._id,
              'courses.courseId': courseId 
            },
            {
              $set: {
                'courses.$.progress.completedLessons': validCompletedLessons,
                'courses.$.progress.percentage': newPercentage,
                'courses.$.status': newPercentage === 100 ? 'completed' : 'in progress'
              }
            }
          );
        }
      }

      // Transform the course data before sending response
      const courseObj = course.toObject();
      const transformedCourse = {
        id: courseObj._id?.toString() || courseId,
        title: courseObj.title,
        subtitle: courseObj.subtitle,
        description: courseObj.description,
        instructor: courseObj.instructor,
        thumbnail: courseObj.thumbnail,
        previewVideo: courseObj.previewVideo,
        originalPrice: courseObj.originalPrice,
        currentPrice: courseObj.currentPrice,
        categories: courseObj.categories,
        learningPoints: courseObj.learningPoints,
        requirements: courseObj.requirements,
        status: courseObj.status,
        rating: courseObj.rating,
        usersCount: courseObj.users?.length || 0,
        createdAt: courseObj.createdAt,
        updatedAt: courseObj.updatedAt,
        courseContent: courseObj.courseContent
      };

      res.json(transformedCourse);
    } catch (error: any) {
      console.error('Error updating course:', error);
      res.status(500).json({ 
        error: 'Error updating course',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  },

  purchaseCourse: async (req: Request, res: Response) => {
    try {
      const courseId = req.params.id;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      // Check if user already has this course
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if course exists in user's courses with any status
      const existingCourse = user.courses.find(course => 
        course.courseId.toString() === courseId && 
        (course.status === 'in progress' || course.status === 'completed')
      );

      if (existingCourse) {
        return res.status(400).json({ message: 'You already own this course' });
      }

      // Get course details for email
      const course = await Course.findById(courseId).populate('instructor', 'fullName');
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Add course to user's courses with 'in progress' status
      await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            courses: {
              courseId: courseId,
              status: 'in progress',
              progress: {
                timeSpent: 0,
                percentage: 0,
                completedLessons: []
              }
            }
          }
        }
      );

      // Add user to course's users
      await Course.findByIdAndUpdate(
        courseId,
        { $addToSet: { users: userId } }
      );

      // Send purchase confirmation email
      try {
        await sendPurchaseConfirmationEmail(
          user.email,
          user.fullName,
          course.title,
          courseId,
          (course.instructor as any).fullName
        );
      } catch (error) {
        console.error('Error sending purchase confirmation email:', error);
        // Don't fail the purchase if email fails, but log it
      }

      // Invalidate user courses cache
      await redisClient.setEx(`user-courses:${userId}`, 1, '');

      res.status(200).json({ message: 'Course purchased successfully' });
    } catch (error) {
      console.error('Error purchasing course:', error);
      res.status(500).json({ message: 'Error purchasing course' });
    }
  },

  getUserCourses: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      // Try to get data from cache first
      const cacheKey = `user-courses:${userId}`;
      const cachedData = await redisClient.get(cacheKey);
      
      if (cachedData) {
        // Only parse if it's a string, otherwise return as is
        return res.json(typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData);
      }

      // Get user with their courses and organizations
      const userDoc = await User.findById(userId)
        .populate({
          path: 'courses.courseId',
          model: 'Course',
          populate: {
            path: 'instructor',
            model: 'User',
            select: 'fullName'
          }
        })
        .populate('organizations')
        .lean();

      if (!userDoc) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Get all organization courses
      const organizations = userDoc.organizations || [];
      let organizationCourses: any[] = [];
      
      if (organizations.length > 0) {
        const orgs = await Organization.find({ _id: { $in: organizations } })
          .populate({
            path: 'courses',
            model: 'Course',
            populate: {
              path: 'instructor',
              model: 'User',
              select: 'fullName'
            }
          })
          .lean();

        // Add organization courses to user's courses if not already present
        for (const org of orgs) {
          const orgCourses = org.courses || [];
          for (const course of orgCourses) {
            // Check if user already has this course
            const existingCourse = userDoc.courses?.find(c => 
              c.courseId && c.courseId._id && course && 
              c.courseId._id.toString() === (course as any)?._id?.toString()
            );

            if (!existingCourse) {
              organizationCourses.push({
                courseId: course,
                status: 'in progress',
                organizationId: org._id,
                progress: {
                  timeSpent: 0,
                  percentage: 0,
                  completedLessons: []
                }
              });
            }
          }
        }
      }

      // Combine user's personal courses with organization courses
      const allCourses = [...(userDoc.courses || []), ...organizationCourses];

      const courses = allCourses
        .filter(course => course && course.courseId)
        .map(course => ({
          id: course.courseId._id.toString(),
          title: course.courseId.title,
          instructor: course.courseId.instructor?.fullName || 'Unknown Instructor',
          updatedDate: new Date(course.courseId.updatedAt).toISOString().split('T')[0],
          duration: course.courseId.duration || 0,
          timeDone: course.progress?.timeSpent || 0,
          imageId: course.courseId.thumbnail,
          status: course.status,
          organizationId: course.organizationId?.toString() || null,
          progress: {
            percentage: course.progress?.percentage || 0,
            completedLessons: course.progress?.completedLessons || []
          }
        }));

      // Cache the results for 1 minute instead of 5 minutes
      await redisClient.setEx(cacheKey, 60, JSON.stringify(courses));

      res.json(courses);
    } catch (error) {
      console.error('Error fetching user courses:', error);
      res.status(500).json({ message: 'Error fetching courses' });
    }
  },

  markLessonComplete: async (req: Request, res: Response) => {
    try {
      const { courseId, lessonId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      // Get the course to calculate total lessons
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Calculate total lessons
      let totalLessons = 0;
      course.courseContent.sections.forEach(section => {
        totalLessons += section.contents.length;
      });

      // Update the user document using findOneAndUpdate
      const result = await User.findOneAndUpdate(
        { 
          _id: userId,
          'courses.courseId': courseId 
        },
        {
          $addToSet: { 'courses.$.progress.completedLessons': lessonId },
          $set: {
            'courses.$.status': 'in progress',
            'courses.$.progress.timeSpent': 0 // You can update this with actual time spent if needed
          }
        },
        { new: true }
      );

      if (!result) {
        return res.status(404).json({ message: 'User or course not found' });
      }

      // Find the updated course in user's courses
      const userCourse = result.courses.find(c => c.courseId.toString() === courseId);
      if (!userCourse || !userCourse.progress) {
        return res.status(404).json({ message: 'Course progress not found' });
      }

      // Calculate new progress percentage
      const completedLessonsCount = userCourse.progress.completedLessons.length;
      const percentage = (completedLessonsCount / totalLessons) * 100;

      // If all lessons are completed, update the course status
      if (percentage === 100) {
        await User.findOneAndUpdate(
          { 
            _id: userId,
            'courses.courseId': courseId 
          },
          {
            $set: {
              'courses.$.status': 'completed',
              'courses.$.completedAt': new Date(),
              'courses.$.progress.percentage': percentage,
              'courses.$.certificateId': `CERT-${courseId.slice(-6).toUpperCase()}-${userId.slice(-4).toUpperCase()}-${Date.now()}`
            }
          }
        );
      } else {
        // Update just the progress percentage
        await User.findOneAndUpdate(
          { 
            _id: userId,
            'courses.courseId': courseId 
          },
          {
            $set: {
              'courses.$.progress.percentage': percentage
            }
          }
        );
      }

      // Get the final state after all updates
      const finalUser = await User.findById(userId);
      const finalCourse = finalUser?.courses.find(c => c.courseId.toString() === courseId);

      res.json({
        message: 'Lesson marked as complete',
        progress: {
          percentage,
          completedLessons: userCourse.progress.completedLessons
        },
        status: finalCourse?.status,
        certificateId: finalCourse?.certificateId
      });

    } catch (error) {
      console.error('Error marking lesson as complete:', error);
      res.status(500).json({ message: 'Error marking lesson as complete' });
    }
  },

  saveCourse: async (req: Request, res: Response) => {
    try {
      const courseId = req.params.id;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      // Find the user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if course exists
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Check if course is already saved or in progress
      const existingCourse = user.courses.find(c => c.courseId.toString() === courseId);
      if (existingCourse) {
        if (existingCourse.status === 'saved') {
          // If already saved, remove it (toggle functionality)
          user.courses = user.courses.filter(c => c.courseId.toString() !== courseId);
          await user.save();
          return res.json({ message: 'Course removed from saved', isSaved: false });
        } else {
          return res.status(400).json({ message: 'Course is already in progress or completed' });
        }
      }

      // Add course to user's courses with 'saved' status
      user.courses.push({
        courseId: new mongoose.Types.ObjectId(courseId),
        status: 'saved',
        progress: {
          timeSpent: 0,
          percentage: 0,
          completedLessons: []
        }
      });

      await user.save();

      res.json({ message: 'Course saved successfully', isSaved: true });
    } catch (error) {
      console.error('Error saving course:', error);
      res.status(500).json({ message: 'Error saving course' });
    }
  },

  enrollCourse: async (req: Request, res: Response) => {
    try {
      const courseId = req.params.id;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      // Find the course first
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Add course to user's courses with 'in progress' status
      const user = await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            courses: {
              courseId: courseId,
              status: 'in progress'
            }
          }
        },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Add user to course's users
      course.users = course.users || [];
      course.users.push(new mongoose.Types.ObjectId(userId));
      
      await user.save();
      await course.save();

      res.json({
        message: 'Successfully enrolled in the course',
        courseId: course._id
      });
    } catch (error) {
      console.error('Error enrolling in course:', error);
      res.status(500).json({ message: 'Error enrolling in course' });
    }
  },

  addReview: async (req: Request, res: Response) => {
    try {
      const courseId = req.params.id;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const { rating, comment } = req.body;

      if (!rating) {
        return res.status(400).json({ message: 'Rating is required' });
      }

      // Find the user and update their course data
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Find the course in user's courses
      const userCourse = user.courses.find(c => c.courseId.toString() === courseId);
      if (!userCourse) {
        return res.status(404).json({ message: 'Course not found in user\'s courses' });
      }

      // Add rating and comment to user's course data
      userCourse.rating = rating;
      userCourse.comment = comment;
      await user.save();

      // Update course reviews
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Initialize reviews array if it doesn't exist
      if (!course.reviews) {
        course.reviews = [];
      }

      // Add review to course
      const newReview = {
        user: new mongoose.Types.ObjectId(userId),
        rating,
        comment,
        createdAt: new Date()
      };
      course.reviews.push(newReview);

      // Calculate new average rating
      let totalRating = 0;
      course.reviews.forEach(review => {
        totalRating += review.rating;
      });

      course.rating = totalRating / course.reviews.length;

      await course.save();

      res.json({
        message: 'Review added successfully',
        review: {
          user: userId,
          rating,
          comment,
          createdAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error adding review:', error);
      res.status(500).json({ message: 'Error adding review' });
    }
  },

  checkCourseAccess: async (req: Request, res: Response) => {
    try {
      const courseId = req.params.id;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      // Check if user has purchased the course
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const hasAccess = user.courses.some(course => 
        course.courseId.toString() === courseId && (course.status === 'in progress' || course.status === 'completed')
      );

      res.status(200).json({ hasAccess });
    } catch (error) {
      console.error('Error checking course access:', error);
      res.status(500).json({ message: 'Error checking course access' });
    }
  },

  inviteUser: async (req: Request, res: Response) => {
    try {
      const courseId = req.params.id;
      const { email } = req.body;

      // Validate input
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      // Check if the course exists and the user is the instructor
      const course = await Course.findOne({ 
        _id: courseId, 
        instructor: req.user?.id,
        status: 'published' 
      }).populate('instructor', 'fullName') as CourseWithInstructor | null;

      if (!course) {
        return res.status(404).json({ message: 'Course not found or unauthorized' });
      }

      // Find or create the user user
      let user = await User.findOne({ email });
      if (!user) {
        // Create a new user account for the user
        const password = Math.random().toString(36).slice(-8);
        user = new User({
          email,
          password,
          fullName: email.split('@')[0], // Temporary name from email
          role: 'user',
          isEmailVerified: true,
          status: 'active'
        });
        await user.save();
      }

      // Check if user already has access to the course
      const hasAccess = user.courses?.some(c => 
        c.courseId.toString() === courseId && 
        (c.status === 'in progress' || c.status === 'completed')
      );

      if (hasAccess) {
        return res.status(400).json({ message: 'User already has access to this course' });
      }

      // Add course to user's courses
      await User.findByIdAndUpdate(
        user._id,
        {
          $push: {
            courses: {
              courseId: courseId,
              status: 'in progress',
              progress: {
                timeSpent: 0,
                percentage: 0,
                completedLessons: []
              }
            }
          }
        }
      );

      // Add user to course's users
      await Course.findByIdAndUpdate(
        courseId,
        { $addToSet: { users: user._id } }
      );

      // Create notification for the user
      await createNotification({
        recipient: user._id.toString(),
        type: 'course',
        title: 'Course Invitation',
        message: `You have been invited to join the course "${course.title}"`,
        relatedId: course._id.toString()
      });

      // Send invitation email
      try {
        await sendCourseInvitationEmail(
          user.email,
          course.title,
          course._id.toString(),
          course.instructor.fullName
        );
      } catch (error) {
        console.error('Error sending invitation email:', error);
        // Don't fail the invitation if email fails, but log it
      }

      res.status(200).json({ 
        message: 'User invited successfully',
        userEmail: user.email,
        courseName: course.title
      });
    } catch (error) {
      console.error('Error inviting user:', error);
      if (error instanceof Error) {
        res.status(500).json({ 
          message: 'Error inviting user',
          error: error.message
        });
      } else {
        res.status(500).json({ 
          message: 'Error inviting user',
          error: 'Unknown error occurred'
        });
      }
    }
  },

  getPublishedCourses: async (req: Request, res: Response) => {
    try {
      const courses = await Course.find({ status: 'published' })
        .select('_id title thumbnail')
        .sort({ createdAt: -1 });

      const transformedCourses = courses.map(course => ({
        _id: course._id,
        title: course.title,
        thumbnail: course.thumbnail || '/images/placeholder-course.jpg',
        isPublished: true
      }));

      res.json(transformedCourses);
    } catch (error) {
      console.error('Get published courses error:', error);
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error fetching published courses' });
    }
  }
}; 