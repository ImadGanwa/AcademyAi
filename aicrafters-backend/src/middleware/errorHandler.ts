import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(413).json({
      message: 'Request too large! The file size exceeds the 50MB limit. Please reduce the size of your content and try again.'
    });
  }
  
  if (err.name === 'PayloadTooLargeError') {
    return res.status(413).json({
      message: 'Request too large! The file size exceeds the 50MB limit. Please reduce the size of your content and try again.'
    });
  }

  res.status(500).json({ message: 'Something went wrong!' });
}; 