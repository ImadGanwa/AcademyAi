import mongoose, { Schema, Document } from 'mongoose';
import { ContentItem, LessonContent, QuizContent } from '../types/course';

// Content item schema
const contentItemSchema = new Schema({
  type: {
    type: String,
    enum: ['text', 'media'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  duration: Number
});

// Lesson schema
const lessonSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['lesson'],
    required: true,
    default: 'lesson'
  },
  contentItems: [contentItemSchema],
  preview: {
    type: Boolean,
    default: false
  },
  duration: {
    type: Number,
    default: 0
  }
});

// Quiz option schema
const quizOptionSchema = new Schema({
  id: String,
  text: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  }
});

// Quiz question schema
const quizQuestionSchema = new Schema({
  question: {
    type: String,
    required: true
  },
  context: {
    type: String,
    required: true
  },
  isMultipleChoice: {
    type: Boolean,
    required: true
  },
  options: [quizOptionSchema]
});

// Content section schema
const contentSectionSchema = new Schema({
  type: {
    type: String,
    enum: ['lesson', 'quiz'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: Schema.Types.Mixed,
    required: true,
    validate: {
      validator: function(this: any, content: LessonContent | QuizContent) {
        const contentType = this.type;
        if (contentType === 'lesson') {
          return (content as LessonContent).type === 'lesson' && Array.isArray((content as LessonContent).contentItems);
        } else {
          return (content as QuizContent).type === 'quiz' && Array.isArray((content as QuizContent).questions);
        }
      },
      message: 'Invalid content structure for the given type'
    }
  }
});

// Course section schema
const courseSectionSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  contents: [contentSectionSchema]
});

// Course schema
export interface ICourse extends Document {
  title: string;
  subtitle: string;
  description: string;
  instructor: mongoose.Types.ObjectId;
  originalPrice: number;
  currentPrice: number;
  thumbnail: string;
  previewVideo?: string;
  categories: string[];
  learningPoints: string[];
  requirements: string[];
  courseContent: {
    sections: {
      title: string;
      contents: Array<{
        type: 'lesson' | 'quiz';
        title: string;
        content: LessonContent | QuizContent;
      }>;
    }[];
  };
  duration: number;
  users: mongoose.Types.ObjectId[];
  rating: number;
  reviews: {
    user: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
    createdAt: Date;
  }[];
  status: 'draft' | 'review' | 'published' | 'archived';
  badge?: {
    name: string;
    colorKey: 'primary' | 'secondary';
  };
  certificateTemplateUrl?: string;
  certificateTemplateConfig?: {
    showUserName: boolean;
    showCourseName: boolean;
    showCertificateId: boolean;
    namePosition?: { x: number; y: number };
    coursePosition?: { x: number; y: number };
    idPosition?: { x: number; y: number };
  };
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  subtitle: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  instructor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  originalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  currentPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  previewVideo: {
    type: String,
  },
  categories: [{
    type: String,
    required: true,
  }],
  learningPoints: [{
    type: String,
    required: true,
  }],
  requirements: [{
    type: String,
    required: true,
  }],
  courseContent: {
    sections: [courseSectionSchema]
  },
  duration: {
    type: Number,
    default: 0,
  },
  users: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  rating: {
    type: Number,
    default: 0,
  },
  reviews: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  status: {
    type: String,
    enum: ['draft', 'review', 'published', 'archived'],
    default: 'draft',
  },
  badge: {
    name: String,
    colorKey: {
      type: String,
      enum: ['primary', 'secondary']
    }
  },
  certificateTemplateUrl: {
    type: String,
    default: undefined,
    description: 'URL of the course-specific certificate template image in Cloudinary'
  },
  certificateTemplateConfig: {
    showUserName: {
      type: Boolean,
      default: true
    },
    showCourseName: {
      type: Boolean,
      default: false,
      description: 'Set to false if the course name is pre-printed on the template'
    },
    showCertificateId: {
      type: Boolean,
      default: true
    },
    namePosition: {
      x: {
        type: Number,
        default: 0.5,
        description: 'X position of the name as a percentage of page width (0-1)'
      },
      y: {
        type: Number,
        default: 0.52,
        description: 'Y position of the name as a percentage of page height (0-1)'
      }
    },
    coursePosition: {
      x: {
        type: Number,
        default: 0.5,
        description: 'X position of the course name as a percentage of page width (0-1)'
      },
      y: {
        type: Number,
        default: 0.72,
        description: 'Y position of the course name as a percentage of page height (0-1)'
      }
    },
    idPosition: {
      x: {
        type: Number,
        default: 0.5,
        description: 'X position of the certificate ID as a percentage of page width (0-1)'
      },
      y: {
        type: Number,
        default: 0.95,
        description: 'Y position of the certificate ID as a percentage of page height (0-1)'
      }
    }
  }
}, {
  timestamps: true,
  versionKey: false
});

export const Course = mongoose.model<ICourse>('Course', courseSchema);
