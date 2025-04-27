import { Response } from 'express';
import mongoose from 'mongoose';

export const handleError = (res: Response, error: any) => {
  console.error('Error:', error);
  
  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      message: 'Validation Error',
      errors: Object.values(error.errors).map((err: any) => err.message),
    });
  }

  if (error.code === 11000) {
    return res.status(400).json({
      message: 'Duplicate key error',
      field: Object.keys(error.keyPattern)[0],
    });
  }

  return res.status(500).json({
    message: 'Internal server error',
    error: error.message,
  });
}; 