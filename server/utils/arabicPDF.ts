/**
 * Arabic Font Support for jsPDF
 * 
 * IMPORTANT PRODUCTION NOTE:
 * =========================
 * This utility provides BASIC Arabic text support using built-in PDF fonts.
 * 
 * CURRENT LIMITATIONS:
 * - Uses Courier font which has LIMITED Arabic glyph support
 * - Complex Arabic text (diacritics, ligatures) may not render correctly
 * - Bidirectional text (mixed Arabic/English) requires manual handling
 * 
 * RECOMMENDED FOR PRODUCTION:
 * ===========================
 * For full Arabic support, implement custom font embedding:
 * 
 * 1. Download Arabic font (Cairo or Amiri .ttf file)
 * 2. Convert to base64: `cat font.ttf | base64 > font.txt`
 * 3. Add to jsPDF:
 *    const fontBase64 = '...'; // Load from file or embed
 *    doc.addFileToVFS('Cairo.ttf', fontBase64);
 *    doc.addFont('Cairo.ttf', 'Cairo', 'normal');
 *    doc.setFont('Cairo');
 * 
 * 4. For bidirectional text, install: npm install arabic-reshaper bidi-js
 *    import { reshapeArabic } from 'arabic-reshaper';
 *    import { bidiFactory } from 'bidi-js';
 *    const bidi = bidiFactory();
 *    const reshaped = reshapeArabic(arabicText);
 *    const bidiText = bidi.textToParagraphBoundaries(reshaped, 1);
 * 
 * ALTERNATIVE APPROACH (Currently Used for Contracts):
 * ====================================================
 * The contractPDF.ts uses html2canvas to capture rendered HTML as images.
 * This works perfectly for Arabic because browsers render Arabic correctly.
 * Consider this approach for invoices/receipts if full Arabic support is needed.
 */

import { jsPDF } from 'jspdf';

/**
 * Configures a jsPDF instance with Arabic font support
 * @param doc - jsPDF document instance
 * @param language - 'ar' for Arabic, 'en' for English
 * @returns Configured jsPDF instance
 */
export function setupArabicFont(doc: jsPDF, language: 'ar' | 'en' = 'en'): jsPDF {
  // For now, use built-in fonts with better Unicode support
  // TODO: Add custom Arabic font embedding
  
  if (language === 'ar') {
    // jsPDF's courier has better Unicode support than helvetica
    doc.setFont('courier', 'normal');
  } else {
    doc.setFont('helvetica', 'normal');
  }
  
  return doc;
}

/**
 * Adds text to PDF with Arabic support
 * @param doc - jsPDF document
 * @param text - Text to add (can be Arabic or English)
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param options - Text options
 * @param language - Language of the text
 */
export function addBilingualText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  options: {
    align?: 'left' | 'center' | 'right';
    maxWidth?: number;
  } = {},
  language: 'ar' | 'en' = 'en'
): void {
  setupArabicFont(doc, language);
  
  // For Arabic, reverse text alignment
  const align = language === 'ar' 
    ? (options.align === 'left' ? 'right' : options.align === 'right' ? 'left' : options.align)
    : options.align;
  
  if (options.maxWidth) {
    // Split text if it exceeds max width
    const lines = doc.splitTextToSize(text, options.maxWidth);
    doc.text(lines, x, y, { align });
  } else {
    doc.text(text, x, y, { align });
  }
}

/**
 * Creates a bilingual header for invoices/receipts
 * @param doc - jsPDF document
 * @param titleEn - English title
 * @param titleAr - Arabic title
 * @param companyInfo - Company information
 * @param language - Primary language
 */
export function addBilingualHeader(
  doc: jsPDF,
  titleEn: string,
  titleAr: string,
  companyInfo: {
    nameEn: string;
    nameAr: string;
    phone?: string;
    email?: string;
  },
  language: 'ar' | 'en' = 'en'
): number {
  const pageWidth = doc.internal.pageSize.width;
  let currentY = 15;
  
  // Setup font for the selected language
  setupArabicFont(doc, language);
  
  // Company Name (Bilingual)
  doc.setFontSize(16);
  doc.setFont(language === 'ar' ? 'courier' : 'helvetica', 'bold');
  const companyName = language === 'ar' ? companyInfo.nameAr : companyInfo.nameEn;
  doc.text(companyName, pageWidth / 2, currentY, { align: 'center' });
  currentY += 8;
  
  // Company Details
  doc.setFontSize(9);
  doc.setFont(language === 'ar' ? 'courier' : 'helvetica', 'normal');
  if (companyInfo.phone) {
    doc.text(`Tel: ${companyInfo.phone}`, pageWidth / 2, currentY, { align: 'center' });
    currentY += 5;
  }
  if (companyInfo.email) {
    doc.text(`Email: ${companyInfo.email}`, pageWidth / 2, currentY, { align: 'center' });
    currentY += 5;
  }
  
  currentY += 5;
  
  // Document Title (Bilingual)
  doc.setFontSize(14);
  doc.setFont(language === 'ar' ? 'courier' : 'helvetica', 'bold');
  const title = language === 'ar' ? titleAr : titleEn;
  doc.text(title, pageWidth / 2, currentY, { align: 'center' });
  currentY += 10;
  
  // Divider line
  doc.setLineWidth(0.5);
  doc.line(15, currentY, pageWidth - 15, currentY);
  currentY += 8;
  
  return currentY;
}

/**
 * Adds a bilingual footer to the PDF
 * @param doc - jsPDF document
 * @param footerTextEn - English footer text
 * @param footerTextAr - Arabic footer text
 * @param language - Primary language
 */
export function addBilingualFooter(
  doc: jsPDF,
  footerTextEn: string,
  footerTextAr: string,
  language: 'ar' | 'en' = 'en'
): void {
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const footerY = pageHeight - 15;
  
  // Divider line
  doc.setLineWidth(0.3);
  doc.line(15, footerY - 5, pageWidth - 15, footerY - 5);
  
  // Setup font for the selected language
  setupArabicFont(doc, language);
  
  // Footer text
  doc.setFontSize(8);
  doc.setFont(language === 'ar' ? 'courier' : 'helvetica', 'normal');
  const footerText = language === 'ar' ? footerTextAr : footerTextEn;
  doc.text(footerText, pageWidth / 2, footerY, { align: 'center' });
}

/**
 * Format currency with bilingual support
 * @param amount - Amount to format
 * @param currency - Currency code (AED, USD, etc.)
 * @param language - Language for formatting
 */
export function formatCurrencyBilingual(
  amount: number,
  currency: string = 'AED',
  language: 'ar' | 'en' = 'en'
): string {
  const formatted = amount.toLocaleString(language === 'ar' ? 'ar-AE' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return language === 'ar' 
    ? `${formatted} ${currency}` 
    : `${currency} ${formatted}`;
}

/**
 * Format date with bilingual support
 * @param date - Date to format
 * @param language - Language for formatting
 */
export function formatDateBilingual(
  date: Date | string,
  language: 'ar' | 'en' = 'en'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString(
    language === 'ar' ? 'ar-AE' : 'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
  );
}

/**
 * Reverses Arabic text for correct RTL rendering in PDF
 * Note: This is a simplified implementation. For complex Arabic text with diacritics,
 * consider using a proper bidirectional text library.
 * 
 * @param text - Arabic text to reverse
 * @returns Reversed text for PDF rendering
 */
export function reverseArabicText(text: string): string {
  // Check if text contains Arabic characters
  const hasArabic = /[\u0600-\u06FF]/.test(text);
  
  if (!hasArabic) {
    return text;
  }
  
  // Simple reversal for basic Arabic text
  // For production, use a library like `arabic-reshaper` + `bidi-js`
  return text.split('').reverse().join('');
}

/**
 * Adds a table with bilingual headers
 * @param doc - jsPDF document
 * @param headersEn - English headers
 * @param headersAr - Arabic headers
 * @param data - Table data
 * @param startY - Starting Y position
 * @param language - Primary language
 */
export function addBilingualTable(
  doc: jsPDF,
  headersEn: string[],
  headersAr: string[],
  data: any[][],
  startY: number,
  language: 'ar' | 'en' = 'en'
): jsPDF {
  const autoTable = require('jspdf-autotable');
  const headers = language === 'ar' ? headersAr : headersEn;
  
  autoTable(doc, {
    head: [headers],
    body: data,
    startY: startY,
    styles: {
      fontSize: 10,
      cellPadding: 4,
      font: language === 'ar' ? 'courier' : 'helvetica',
      halign: language === 'ar' ? 'right' : 'left',
    },
    headStyles: {
      fillColor: [8, 145, 178], // Primary color
      textColor: 255,
      fontStyle: 'bold',
      halign: language === 'ar' ? 'right' : 'left',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { left: 15, right: 15 },
  });
  
  return doc;
}

/**
 * IMPORTANT PRODUCTION NOTES:
 * 
 * Current implementation uses built-in PDF fonts (helvetica, courier) which have
 * LIMITED Arabic support. This provides basic functionality but may not render
 * all Arabic characters correctly.
 * 
 * For FULL Arabic support in production:
 * 
 * 1. Add custom Arabic font:
 *    - Download Cairo or Amiri font (.ttf file)
 *    - Convert to base64 or load from file system
 *    - Add to jsPDF: doc.addFileToVFS('Cairo.ttf', base64Font)
 *    - Register font: doc.addFont('Cairo.ttf', 'Cairo', 'normal')
 *    - Use font: doc.setFont('Cairo')
 * 
 * 2. Handle bidirectional text:
 *    - Install: npm install arabic-reshaper bidi-js
 *    - Reshape Arabic text before adding to PDF
 *    - Apply bidirectional algorithm for mixed Arabic/English
 * 
 * 3. Test thoroughly:
 *    - Test with complex Arabic text (diacritics, ligatures)
 *    - Test mixed Arabic/English content
 *    - Verify RTL layout correctness
 * 
 * Example production setup:
 * 
 * ```typescript
 * import { reshapeArabic } from 'arabic-reshaper';
 * import { bidiFactory } from 'bidi-js';
 * 
 * const bidi = bidiFactory();
 * 
 * function addArabicText(doc: jsPDF, text: string) {
 *   const reshaped = reshapeArabic(text);
 *   const bidiText = bidi.textToParagraphBoundaries(reshaped, 1);
 *   doc.text(bidiText, x, y);
 * }
 * ```
 */

export default {
  setupArabicFont,
  addBilingualText,
  addBilingualHeader,
  addBilingualFooter,
  formatCurrencyBilingual,
  formatDateBilingual,
  reverseArabicText,
  addBilingualTable,
};
