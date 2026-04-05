export const getFirebaseErrorMessage = (error) => {
  // Check if error has a code property
  const errorCode = error.code || error.message;
  
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please log in.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please try again.';
    case 'auth/weak-password':
      return 'Your password is too weak. Please use at least 6 characters.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/operation-not-allowed':
      return 'This operation is not allowed. Contact support.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Contact support.';
    default:
      // If error is just an object with a generic message or an unmapped firebase error
      return error.message ? error.message.replace('Firebase: ', '') : 'An unexpected error occurred. Please try again.';
  }
};
