export const validateProfileUpdate = (data: any) => {
  const { fullName } = data;
  
  if (!fullName) {
    return 'Full name is required';
  }
  
  if (fullName.length < 2 || fullName.length > 50) {
    return 'Full name must be between 2 and 50 characters';
  }
  
  return null;
}; 