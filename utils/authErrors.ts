export const getAuthErrorMessage = (error: any): string => {
  // Extract the error code from Firebase error
  const errorCode = error.code || '';

  // Map Firebase error codes to user-friendly messages
  switch (errorCode) {
    // Email errors
    case 'auth/invalid-email':
      return 'Please enter a valid email address';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email';
    
    // Password errors
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters';
    
    // Network errors
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection';
    
    // Too many requests
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later';
    
    // Operation not allowed
    case 'auth/operation-not-allowed':
      return 'Operation not allowed. Please contact support';
    
    // Invalid action code
    case 'auth/invalid-action-code':
      return 'The action code is invalid. Please try again';
    
    // Default error message
    default:
      // If we can't identify the error code, return a generic message
      return 'An error occurred. Please try again';
  }
}; 