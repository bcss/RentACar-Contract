/**
 * Template Renderer Service
 * 
 * Handles rendering of notification templates with dynamic variables:
 * - Variable substitution with {{variableName}} syntax
 * - Bilingual support (English/Arabic)
 * - Format helpers (currency, dates, numbers)
 * - HTML escaping for email templates
 * - Fallback values for missing variables
 */

import { format } from 'date-fns';
import type { NotificationTemplate } from '@shared/schema';

interface RenderOptions {
  language?: 'en' | 'ar';
  escapeHtml?: boolean;
  dateFormat?: string;
  currencyFormat?: 'AED' | 'USD';
}

interface RenderedTemplate {
  subject: string;
  body: string;
  variables: Record<string, any>;
}

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
  const htmlEscapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEscapeMap[char]);
}

/**
 * Format currency with proper AED formatting
 */
function formatCurrency(amount: number | string, currency: string = 'AED'): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return amount.toString();
  
  if (currency === 'AED') {
    return `AED ${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  
  return `${currency} ${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format date with localization support
 */
function formatDate(date: Date | string, dateFormat: string = 'dd/MM/yyyy'): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, dateFormat);
  } catch (error) {
    return date.toString();
  }
}

/**
 * Process variable value with optional formatting
 */
function processVariable(
  value: any,
  variableName: string,
  options: RenderOptions
): string {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return '';
  }
  
  // Currency formatting for amount fields
  if (variableName.toLowerCase().includes('amount') || 
      variableName.toLowerCase().includes('price') ||
      variableName.toLowerCase().includes('cost') ||
      variableName.toLowerCase().includes('total') ||
      variableName.toLowerCase().includes('payment')) {
    return formatCurrency(value, options.currencyFormat || 'AED');
  }
  
  // Date formatting for date fields
  if (variableName.toLowerCase().includes('date') || 
      variableName.toLowerCase().includes('expiry')) {
    if (value instanceof Date || typeof value === 'string') {
      return formatDate(value, options.dateFormat || 'dd/MM/yyyy');
    }
  }
  
  // Convert to string
  let stringValue = String(value);
  
  // HTML escape if needed (for email templates)
  if (options.escapeHtml) {
    stringValue = escapeHtml(stringValue);
  }
  
  return stringValue;
}

/**
 * Replace variables in template text
 */
function replaceVariables(
  text: string,
  variables: Record<string, any>,
  options: RenderOptions
): string {
  // Find all {{variableName}} placeholders
  const variablePattern = /\{\{([^}]+)\}\}/g;
  
  return text.replace(variablePattern, (match, variableName) => {
    const trimmedName = variableName.trim();
    
    // Check if variable exists
    if (trimmedName in variables) {
      return processVariable(variables[trimmedName], trimmedName, options);
    }
    
    // Check for nested properties (e.g., {{customer.name}})
    if (trimmedName.includes('.')) {
      const parts = trimmedName.split('.');
      let value: any = variables;
      
      for (const part of parts) {
        if (value && typeof value === 'object' && part in value) {
          value = value[part];
        } else {
          value = undefined;
          break;
        }
      }
      
      if (value !== undefined) {
        return processVariable(value, trimmedName, options);
      }
    }
    
    // Variable not found - return empty string or keep placeholder
    console.warn(`Template variable not found: ${trimmedName}`);
    return ''; // Could also return match to keep the placeholder
  });
}

/**
 * Render notification template with variables
 */
export function renderTemplate(
  template: NotificationTemplate,
  variables: Record<string, any>,
  options: RenderOptions = {}
): RenderedTemplate {
  // Determine language
  const language = options.language || 'en';
  
  // Select appropriate template content based on language
  const subjectTemplate = language === 'ar' && template.subjectAr 
    ? template.subjectAr 
    : template.subjectEn || '';
  
  const bodyTemplate = language === 'ar' && template.bodyAr 
    ? template.bodyAr 
    : template.bodyEn;
  
  // Add default system variables
  const enhancedVariables = {
    ...variables,
    currentDate: formatDate(new Date(), options.dateFormat || 'dd/MM/yyyy'),
    currentYear: new Date().getFullYear().toString(),
    companyName: 'KarāraOS', // Could be loaded from company settings
  };
  
  // Render subject and body
  const renderedSubject = replaceVariables(subjectTemplate, enhancedVariables, {
    ...options,
    escapeHtml: false, // Never escape HTML in subject
  });
  
  const renderedBody = replaceVariables(bodyTemplate, enhancedVariables, {
    ...options,
    escapeHtml: options.escapeHtml !== undefined ? options.escapeHtml : false, // Default to no escaping for SMS
  });
  
  return {
    subject: renderedSubject,
    body: renderedBody,
    variables: enhancedVariables,
  };
}

/**
 * Render template for SMS (no HTML, character limit awareness)
 */
export function renderSmsTemplate(
  template: NotificationTemplate,
  variables: Record<string, any>,
  options: Omit<RenderOptions, 'escapeHtml'> = {}
): RenderedTemplate {
  const rendered = renderTemplate(template, variables, {
    ...options,
    escapeHtml: false, // SMS never needs HTML escaping
  });
  
  // Warn if message is too long for SMS (160 chars for single, 1530 for concatenated)
  if (rendered.body.length > 1530) {
    console.warn(`SMS message exceeds 1530 characters (${rendered.body.length} chars) - will be split into multiple messages`);
  }
  
  return rendered;
}

/**
 * Render template for Email (HTML escaping enabled by default)
 */
export function renderEmailTemplate(
  template: NotificationTemplate,
  variables: Record<string, any>,
  options: Omit<RenderOptions, 'escapeHtml'> = {}
): RenderedTemplate {
  return renderTemplate(template, variables, {
    ...options,
    escapeHtml: true, // Email defaults to HTML escaping for security
  });
}

/**
 * Validate template has all required variables
 */
export function validateTemplateVariables(
  template: NotificationTemplate,
  variables: Record<string, any>
): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  
  // Extract all variable names from template
  const variablePattern = /\{\{([^}]+)\}\}/g;
  const bodyText = template.bodyEn + (template.bodyAr || '');
  const subjectText = (template.subjectEn || '') + (template.subjectAr || '');
  const allText = bodyText + subjectText;
  
  const foundVariables = new Set<string>();
  let match;
  
  while ((match = variablePattern.exec(allText)) !== null) {
    const variableName = match[1].trim();
    foundVariables.add(variableName);
    
    // Check if variable exists (handle nested properties)
    if (variableName.includes('.')) {
      const parts = variableName.split('.');
      let value: any = variables;
      
      for (const part of parts) {
        if (value && typeof value === 'object' && part in value) {
          value = value[part];
        } else {
          missing.push(variableName);
          break;
        }
      }
    } else if (!(variableName in variables)) {
      missing.push(variableName);
    }
  }
  
  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Preview template with sample variables
 */
export function previewTemplate(
  template: NotificationTemplate,
  sampleVariables: Record<string, any> = {}
): { en: RenderedTemplate; ar: RenderedTemplate } {
  // Default sample variables
  const defaultSamples = {
    customerName: 'John Doe',
    contractId: 'CNT-2024-001',
    amount: '5000',
    date: new Date().toISOString(),
    vehiclePlate: 'ABC-123',
    driverName: 'Ahmed Ali',
  };
  
  const variables = { ...defaultSamples, ...sampleVariables };
  
  return {
    en: renderTemplate(template, variables, { language: 'en' }),
    ar: renderTemplate(template, variables, { language: 'ar' }),
  };
}
