import { apiRequest } from '@/lib/queryClient';

/**
 * P0-4 SECURITY FIX: Remove automatic screenshot capture to prevent PII leakage
 * Screenshots contained sensitive customer data, financial info, and PII
 */

/**
 * Sanitizes context data to remove sensitive fields
 * @param context - Context object that may contain sensitive data
 * @returns Sanitized context with sensitive fields redacted
 */
function sanitizeContext(context: Record<string, any>): Record<string, any> {
  const sensitiveFields = [
    'password',
    'token',
    'nationalId',
    'nationalid',
    'phone',
    'email',
    'licenseNumber',
    'licensenumber',
    'vin',
    'passwordHash',
    'passwordhash',
    'secret',
    'apiKey',
    'apikey',
  ];

  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(context)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitiveFields.some(field => lowerKey.includes(field));
    
    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeContext(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Logs an error to the system WITHOUT screenshot capture
 * @param error - The error object or message
 * @param context - Additional context about where the error occurred
 */
export async function logSystemError(
  error: Error | string,
  context?: {
    endpoint?: string;
    method?: string;
    additionalData?: any;
  }
): Promise<void> {
  try {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorType = error instanceof Error ? error.constructor.name : 'ClientError';

    // Sanitize additional data to remove sensitive information
    const sanitizedAdditionalData = context?.additionalData 
      ? sanitizeContext(context.additionalData)
      : undefined;

    // Prepare error data WITHOUT screenshot
    const errorData = {
      errorType,
      errorMessage,
      errorStack,
      endpoint: context?.endpoint || window.location.pathname,
      method: context?.method || 'CLIENT',
      userAgent: navigator.userAgent,
      additionalData: sanitizedAdditionalData ? JSON.stringify(sanitizedAdditionalData) : undefined,
      // P0-4: NO screenshot field - removed for security
    };

    // Send to backend
    await apiRequest('POST', '/api/system-errors/log', errorData);
  } catch (loggingError) {
    // If error logging fails, just console.error to avoid infinite loops
    console.error('Failed to log system error:', loggingError);
    console.error('Original error:', error);
  }
}

/**
 * Global error handler that automatically logs uncaught errors
 */
export function setupGlobalErrorHandler(): void {
  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    logSystemError(event.error || event.message, {
      additionalData: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        type: 'uncaught_error',
      },
    });
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logSystemError(event.reason || 'Unhandled Promise Rejection', {
      additionalData: {
        promise: event.promise?.toString(),
        type: 'unhandled_rejection',
      },
    });
  });
}
