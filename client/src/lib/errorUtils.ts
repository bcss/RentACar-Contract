/**
 * Extract a user-friendly error message from various error formats
 */
export function getErrorMessage(error: unknown): string {
  // If it's a string, return it
  if (typeof error === 'string') {
    return parseErrorString(error);
  }

  // If it's an Error object
  if (error instanceof Error) {
    return parseErrorString(error.message);
  }

  // If it's an object with a message property
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as any).message;
    if (typeof message === 'string') {
      return parseErrorString(message);
    }
  }

  // Default fallback
  return 'An unexpected error occurred';
}

/**
 * Parse error string that might contain JSON or status codes
 * Examples:
 * - "401: {"message":"Invalid username or password"}" -> "Invalid username or password"
 * - "500: Internal Server Error" -> "Internal Server Error"
 * - "422: {"errors": ["Field is required"]}" -> "Field is required"
 * - "400: {"detail": "Bad request"}" -> "Bad request"
 * - "Network error" -> "Network error"
 */
function parseErrorString(errorString: string): string {
  // Remove leading status code if present (e.g., "401: " or "500: ")
  const withoutStatus = errorString.replace(/^\d{3}:\s*/, '');

  // Try to parse as JSON
  try {
    const parsed = JSON.parse(withoutStatus);
    
    if (parsed && typeof parsed === 'object') {
      // Check for common error message properties in order of priority
      if ('message' in parsed && parsed.message) {
        return parsed.message;
      }
      
      if ('detail' in parsed && parsed.detail) {
        return parsed.detail;
      }
      
      if ('error' in parsed && parsed.error) {
        return typeof parsed.error === 'string' ? parsed.error : JSON.stringify(parsed.error);
      }
      
      // Handle errors array (e.g., validation errors)
      if ('errors' in parsed && Array.isArray(parsed.errors)) {
        if (parsed.errors.length > 0) {
          // Return first error if it's a string
          if (typeof parsed.errors[0] === 'string') {
            return parsed.errors[0];
          }
          // If errors are objects with messages, extract them
          if (parsed.errors[0] && typeof parsed.errors[0] === 'object' && 'message' in parsed.errors[0]) {
            return parsed.errors[0].message;
          }
        }
      }
    }
    
    // If it's a string after parsing, use that
    if (typeof parsed === 'string') {
      return parsed;
    }
  } catch (e) {
    // Not JSON, return the string without status code
    return withoutStatus;
  }

  return withoutStatus;
}

/**
 * Get user-friendly error title based on status code or error type
 */
export function getErrorTitle(error: unknown): string {
  if (typeof error === 'string') {
    // Check if it starts with a status code
    const statusMatch = error.match(/^(\d{3}):/);
    if (statusMatch) {
      return getStatusTitle(parseInt(statusMatch[1]));
    }
  }

  if (error instanceof Error && error.message) {
    const statusMatch = error.message.match(/^(\d{3}):/);
    if (statusMatch) {
      return getStatusTitle(parseInt(statusMatch[1]));
    }
  }

  return 'Error';
}

/**
 * Get user-friendly title for HTTP status codes
 */
function getStatusTitle(status: number): string {
  switch (status) {
    case 400:
      return 'Invalid Request';
    case 401:
      return 'Authentication Failed';
    case 403:
      return 'Access Denied';
    case 404:
      return 'Not Found';
    case 409:
      return 'Conflict';
    case 422:
      return 'Validation Error';
    case 429:
      return 'Too Many Requests';
    case 500:
      return 'Server Error';
    case 503:
      return 'Service Unavailable';
    default:
      if (status >= 400 && status < 500) {
        return 'Request Error';
      } else if (status >= 500) {
        return 'Server Error';
      }
      return 'Error';
  }
}
