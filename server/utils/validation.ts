/**
 * Validation utilities for contract management
 */

/**
 * Validates edit reason for contract modifications
 * @param reason - The edit reason provided by the user
 * @returns Validation result with error message if invalid
 */
export function validateEditReason(reason: string): { valid: boolean; error?: string; wordCount?: number } {
  if (!reason || typeof reason !== 'string') {
    return { valid: false, error: 'Edit reason is required', wordCount: 0 };
  }

  const trimmedReason = reason.trim();
  
  if (trimmedReason === '') {
    return { valid: false, error: 'Edit reason cannot be empty', wordCount: 0 };
  }

  // Split by whitespace and filter words with 3+ characters
  const words = trimmedReason.split(/\s+/).filter(word => word.length >= 3);
  
  if (words.length < 10) {
    return { 
      valid: false, 
      error: `Reason must contain at least 10 meaningful words (3+ characters each). Currently: ${words.length} valid word${words.length === 1 ? '' : 's'}.`,
      wordCount: words.length
    };
  }

  return { valid: true, wordCount: words.length };
}
