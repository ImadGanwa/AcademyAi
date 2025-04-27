interface ErrorResponse {
  message: string;
  error?: any;
}

export const createError = (message: string, error?: any): ErrorResponse => {
  return {
    message,
    ...(error && { error: error.message || error }),
  };
}; 