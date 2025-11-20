/**
 * Validation utilities for contract management
 */

/**
 * Validates search query for security and length
 * @param query - The search query to validate
 * @returns Validation result with sanitized query
 */
export function validateSearchQuery(query: string): { valid: boolean; sanitized?: string; error?: string; message?: string } {
  if (!query || typeof query !== 'string') {
    return { valid: true, sanitized: '' };
  }

  const trimmed = query.trim().replace(/\s+/g, ' '); // Normalize whitespace
  
  if (trimmed.length > 200) {
    return { 
      valid: false, 
      error: 'Search query must not exceed 200 characters',
      message: 'Search query must not exceed 200 characters'
    };
  }

  return { valid: true, sanitized: trimmed };
}

/**
 * Validates edit reason for contract modifications
 * @param reason - The edit reason provided by the user
 * @returns Validation result with error message if invalid
 */
export function validateEditReason(reason: string): { valid: boolean; error?: string; message?: string; wordCount?: number } {
  if (!reason || typeof reason !== 'string') {
    return { valid: false, error: 'Edit reason is required', message: 'Edit reason is required', wordCount: 0 };
  }

  const trimmedReason = reason.trim();
  
  if (trimmedReason === '') {
    return { valid: false, error: 'Edit reason cannot be empty', message: 'Edit reason cannot be empty', wordCount: 0 };
  }

  // Split by whitespace and filter words with 3+ characters
  const words = trimmedReason.split(/\s+/).filter(word => word.length >= 3);
  
  if (words.length < 10) {
    const msg = `Reason must contain at least 10 meaningful words (3+ characters each). Currently: ${words.length} valid word${words.length === 1 ? '' : 's'}.`;
    return { 
      valid: false, 
      error: msg,
      message: msg,
      wordCount: words.length
    };
  }

  // Detect repeated short words (bypass attempts)
  const uniqueWords = new Set(words);
  if (uniqueWords.size < 5) {
    const msg = 'Reason must contain meaningful, varied words. Detected repetitive content.';
    return { 
      valid: false, 
      error: msg,
      message: msg,
      wordCount: words.length
    };
  }

  return { valid: true, wordCount: words.length };
}

/**
 * Validates pagination parameters
 * @param limit - Maximum records to return
 * @param offset - Number of records to skip
 * @returns Validation result with normalized values
 */
export function validatePaginationParams(limit: number | string, offset: number | string): {
  valid: boolean;
  limit?: number;
  offset?: number;
  error?: string;
  message?: string;
} {
  const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : limit;
  const parsedOffset = typeof offset === 'string' ? parseInt(offset, 10) : offset;

  if (isNaN(parsedLimit) || isNaN(parsedOffset)) {
    const msg = 'Limit and offset must be valid numbers';
    return { valid: false, error: msg, message: msg };
  }

  if (parsedLimit < 1 || parsedLimit > 1000) {
    const msg = 'Limit must be between 1 and 1000';
    return { valid: false, error: msg, message: msg };
  }

  if (parsedOffset < 0) {
    const msg = 'Offset must be non-negative';
    return { valid: false, error: msg, message: msg };
  }

  return {
    valid: true,
    limit: parsedLimit,
    offset: parsedOffset,
  };
}

/**
 * Validates financial input to prevent NaN propagation
 * @param value - The value to validate
 * @param fieldName - Name of the field for error messages
 * @returns The validated number
 * @throws Error if value is NaN or Infinity
 */
export function validateFinancialInput(value: any, fieldName: string): number {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (typeof num !== 'number' || isNaN(num) || !isFinite(num)) {
    throw new Error(`Invalid ${fieldName}: must be a valid number`);
  }

  return num;
}
