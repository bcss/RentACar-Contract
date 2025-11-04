import html2canvas from 'html2canvas';
import { apiRequest } from '@/lib/queryClient';

/**
 * Captures a screenshot of the entire document
 * @returns Base64-encoded screenshot or null if capture fails
 */
async function captureScreenshot(): Promise<string | null> {
  try {
    const canvas = await html2canvas(document.body, {
      backgroundColor: null,
      scale: 1, // Lower scale for smaller file size
      logging: false,
      useCORS: true,
      allowTaint: true,
      width: window.innerWidth,
      height: window.innerHeight,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
    });

    // Compress to JPEG with quality 0.6 for smaller file size
    const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
    return dataUrl;
  } catch (error) {
    console.error('Failed to capture screenshot:', error);
    return null;
  }
}

/**
 * Logs an error to the system with automatic screenshot capture
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
    // Capture screenshot automatically
    const screenshot = await captureScreenshot();

    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorType = error instanceof Error ? error.constructor.name : 'ClientError';

    // Prepare error data
    const errorData = {
      errorType,
      errorMessage,
      errorStack,
      endpoint: context?.endpoint || window.location.pathname,
      method: context?.method || 'CLIENT',
      userAgent: navigator.userAgent,
      additionalData: context?.additionalData ? JSON.stringify(context.additionalData) : undefined,
      screenshot, // Automatically captured screenshot
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
