import { Request, Response } from 'express';
import { Organization, IOrganization } from '../models/Organization';
import { User } from '../models/User';
import { handleError } from '../utils/errorHandler';
import mongoose from 'mongoose';

interface OrganizationUser {
  fullName: string;
  email: string;
}

interface OrganizationDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  users: OrganizationUser[];
  courses: mongoose.Types.ObjectId[];
}

export const createOrganization = async (req: Request, res: Response) => {
  try {
    const { name, users, courses = [] } = req.body;

    // Create the organization
    const organization = await Organization.create({
      name,
      users: users.map((user: OrganizationUser) => ({
        fullName: user.fullName,
        email: user.email.toLowerCase()
      })),
      courses
    });

    // Update existing users to add this organization and its courses
    const userEmails = users.map((user: OrganizationUser) => user.email.toLowerCase());
    
    // Find all users that should be in this organization
    const existingUsers = await User.find({ email: { $in: userEmails } });
    
    // For each user, add the organization and its courses
    for (const user of existingUsers) {
      const updates: any = {
        $addToSet: { organizations: organization._id }
      };

      // If there are courses, add them to the user's courses
      if (courses.length > 0) {
        const coursesToAdd = courses.map((courseId: string) => ({
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

      await User.findByIdAndUpdate(user._id, updates);
    }

    res.status(201).json(organization);
  } catch (error) {
    handleError(res, error);
  }
};

export const getOrganizations = async (req: Request, res: Response) => {
  try {
    const organizations = await Organization.find().sort({ createdAt: -1 });
    res.json(organizations);
  } catch (error) {
    handleError(res, error);
  }
};

export const getOrganization = async (req: Request, res: Response) => {
  try {
    const organization = await Organization.findById(req.params.id);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    res.json(organization);
  } catch (error) {
    handleError(res, error);
  }
};

export const updateOrganization = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, users } = req.body;

    // Get current organization users before update
    const currentOrg = await Organization.findById(id);
    if (!currentOrg) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    
    const currentEmails = currentOrg.users.map((user: OrganizationUser) => user.email.toLowerCase());

    // Update the organization
    const organization = await Organization.findByIdAndUpdate(
      id,
      {
        name,
        users: users.map((user: OrganizationUser) => ({
          fullName: user.fullName,
          email: user.email.toLowerCase()
        }))
      },
      { new: true }
    );

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Get new user emails
    const newEmails = users.map((user: OrganizationUser) => user.email.toLowerCase());

    // Find all existing users that are new to the organization
    const newUsers = await User.find({ 
      email: { $in: newEmails },
      organizations: { $ne: organization._id }
    });

    // For each new user, add organization and its courses
    for (const user of newUsers) {
      const updates: any = {
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

      await User.findByIdAndUpdate(user._id, updates);
    }

    // Remove organization from users no longer in the organization
    const removedEmails = currentEmails.filter((email: string) => !newEmails.includes(email));
    if (removedEmails.length > 0) {
      await User.updateMany(
        { email: { $in: removedEmails } },
        { 
          $pull: { 
            organizations: organization._id,
            courses: { organizationId: organization._id }
          }
        }
      );
    }

    res.json(organization);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteOrganization = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Remove organization from all users first
    await User.updateMany(
      { organizations: id },
      { $pull: { organizations: id } }
    );

    // Then delete the organization
    await Organization.findByIdAndDelete(id);
    
    res.json({ message: 'Organization deleted successfully' });
  } catch (error) {
    handleError(res, error);
  }
};

export const addUsersToOrganization = async (req: Request, res: Response) => {
  try {
    const { users } = req.body;
    const organization = await Organization.findById(req.params.id);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    
    // Add new users without duplicates
    const uniqueUsers = [...new Set([...organization.users, ...users])];
    organization.users = uniqueUsers;
    await organization.save();
    
    res.json(organization);
  } catch (error) {
    handleError(res, error);
  }
};

export const removeUsersFromOrganization = async (req: Request, res: Response) => {
  try {
    const { users } = req.body;
    const organization = await Organization.findById(req.params.id);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    
    organization.users = organization.users.filter((user: OrganizationUser) => !users.includes(user));
    await organization.save();
    
    res.json(organization);
  } catch (error) {
    handleError(res, error);
  }
};

export const updateOrganizationCourses = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { courses } = req.body;

    // First, get the organization with its current courses and users
    const organization = await Organization.findById(id) as OrganizationDocument;
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Get the list of current courses and new courses
    const currentCourses = organization.courses.map(c => c.toString());
    const newCourses = courses.map((c: string) => c.toString());

    // Find all users in the organization
    const users = await User.find({ 
      email: { 
        $in: organization.users.map(user => user.email.toLowerCase()) 
      }
    });

    // For each user, add new courses that aren't already in their courses list
    for (const user of users) {
      const userCourseIds = user.courses.map(c => c.courseId.toString());
      const coursesToAdd = newCourses.filter((courseId: string) => !userCourseIds.includes(courseId));

      if (coursesToAdd.length > 0) {
        const coursesToPush = coursesToAdd.map((courseId: string) => ({
          courseId,
          status: 'in progress',
          organizationId: organization._id,
          progress: {
            timeSpent: 0,
            percentage: 0,
            completedLessons: []
          }
        }));

        await User.findByIdAndUpdate(
          user._id,
          {
            $push: {
              courses: {
                $each: coursesToPush
              }
            }
          }
        );
      }

      // Remove courses that are no longer in the organization
      const coursesToRemove = currentCourses.filter(courseId => 
        !newCourses.includes(courseId) && 
        user.courses.some(c => 
          c.courseId.toString() === courseId && 
          c.organizationId?.toString() === organization._id.toString()
        )
      );

      if (coursesToRemove.length > 0) {
        await User.findByIdAndUpdate(
          user._id,
          {
            $pull: {
              courses: {
                courseId: { $in: coursesToRemove },
                organizationId: organization._id
              }
            }
          }
        );
      }
    }

    // Update the organization's courses
    const updatedOrganization = await Organization.findByIdAndUpdate(
      id,
      { courses },
      { new: true }
    ).populate('courses', 'title description thumbnail');

    res.json(updatedOrganization);
  } catch (error) {
    handleError(res, error);
  }
};

export const getOrganizationCourses = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const organization = await Organization.findById(id)
      .populate('courses', 'title description thumbnail');

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    res.json(organization.courses);
  } catch (error) {
    handleError(res, error);
  }
}; 