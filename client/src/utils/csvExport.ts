/**
 * CSV Export Utility
 * Provides RFC 4180 compliant CSV generation with proper escaping
 */

/**
 * Escapes a CSV field value according to RFC 4180
 * - Wraps in quotes if value contains comma, quote, or newline
 * - Doubles any quotes within the value
 * - Handles null/undefined by returning empty string
 */
function escapeCSVField(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  const stringValue = String(value);
  
  // Check if value needs quoting (contains comma, quote, or newline)
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\r')) {
    // Escape quotes by doubling them and wrap in quotes
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

/**
 * Converts a 2D array into RFC 4180 compliant CSV string
 */
export function generateCSV(data: any[][]): string {
  return data
    .map(row => row.map(escapeCSVField).join(','))
    .join('\n');
}

/**
 * Downloads CSV data as a file
 * Properly handles blob cleanup to prevent memory leaks
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  
  // Clean up blob URL to prevent memory leaks
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Helper to safely format numbers with fallback
 */
export function safeToFixed(value: number | null | undefined, decimals: number = 2): string {
  return (value ?? 0).toFixed(decimals);
}
