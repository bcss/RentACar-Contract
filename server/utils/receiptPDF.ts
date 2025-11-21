/**
 * Receipt PDF Generator with Bilingual Support
 * Generates professional payment receipts
 */

import { jsPDF } from 'jspdf';
import {
  addBilingualHeader,
  addBilingualFooter,
  formatCurrencyBilingual,
  formatDateBilingual,
} from './arabicPDF';

export interface ReceiptData {
  receiptNumber: string;
  contractNumber: string;
  invoiceNumber?: string;
  date: Date;
  customer: {
    name: string;
    email?: string;
    phone?: string;
  };
  company: {
    nameEn: string;
    nameAr: string;
    phone?: string;
    email?: string;
    address?: string;
    taxNumber?: string;
  };
  payment: {
    method: string; // cash, card, bank_transfer, etc.
    methodAr: string;
    referenceNumber?: string;
    amount: number;
  };
  totalDue?: number;
  previousBalance?: number;
  remainingBalance: number;
  currency: string;
  notes?: string;
  language: 'ar' | 'en';
}

/**
 * Generates a payment receipt PDF
 * @param data - Receipt data
 * @returns jsPDF instance
 */
export function generateReceiptPDF(data: ReceiptData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.width;
  const lang = data.language;
  const fontFamily = lang === 'ar' ? 'courier' : 'helvetica';
  let currentY = 0;

  // Add Header
  currentY = addBilingualHeader(
    doc,
    'PAYMENT RECEIPT',
    'إيصال دفع',
    data.company,
    lang
  );

  // Receipt Information Box
  doc.setLineWidth(0.5);
  doc.setDrawColor(200, 200, 200);
  const boxX = 15;
  const boxWidth = pageWidth - 30;
  const boxY = currentY;
  const boxHeight = 55;
  
  doc.rect(boxX, boxY, boxWidth, boxHeight);
  
  // Left column - Receipt details
  currentY += 8;
  const leftColumn = boxX + 5;
  const rightColumn = pageWidth / 2 + 5;

  doc.setFontSize(10);
  doc.setFont(fontFamily, 'bold');
  doc.text(lang === 'ar' ? 'رقم الإيصال:' : 'Receipt #:', leftColumn, currentY);
  doc.setFont(fontFamily, 'normal');
  doc.text(data.receiptNumber, leftColumn + 30, currentY);

  currentY += 6;
  doc.setFont(fontFamily, 'bold');
  doc.text(lang === 'ar' ? 'التاريخ:' : 'Date:', leftColumn, currentY);
  doc.setFont(fontFamily, 'normal');
  doc.text(formatDateBilingual(data.date, lang), leftColumn + 30, currentY);

  currentY += 6;
  doc.setFont(fontFamily, 'bold');
  doc.text(lang === 'ar' ? 'رقم العقد:' : 'Contract #:', leftColumn, currentY);
  doc.setFont(fontFamily, 'normal');
  doc.text(data.contractNumber, leftColumn + 30, currentY);

  if (data.invoiceNumber) {
    currentY += 6;
    doc.setFont(fontFamily, 'bold');
    doc.text(lang === 'ar' ? 'رقم الفاتورة:' : 'Invoice #:', leftColumn, currentY);
    doc.setFont(fontFamily, 'normal');
    doc.text(data.invoiceNumber, leftColumn + 30, currentY);
  }

  // Right column - Customer details
  currentY = boxY + 8;
  doc.setFont(fontFamily, 'bold');
  doc.text(lang === 'ar' ? 'العميل:' : 'Received From:', rightColumn, currentY);
  
  currentY += 6;
  doc.setFont(fontFamily, 'normal');
  doc.text(data.customer.name, rightColumn, currentY);
  
  if (data.customer.phone) {
    currentY += 5;
    doc.text(data.customer.phone, rightColumn, currentY);
  }
  
  if (data.customer.email) {
    currentY += 5;
    doc.text(data.customer.email, rightColumn, currentY);
  }

  currentY = boxY + boxHeight + 15;

  // Payment Details Section
  doc.setFontSize(12);
  doc.setFont(fontFamily, 'bold');
  doc.text(lang === 'ar' ? 'تفاصيل الدفع' : 'Payment Details', 15, currentY);
  
  currentY += 10;
  doc.setLineWidth(0.3);
  doc.line(15, currentY, pageWidth - 15, currentY);
  currentY += 10;

  // Payment information table
  const rowHeight = 8;
  doc.setFontSize(10);

  // Payment Method
  doc.setFont(fontFamily, 'bold');
  doc.text(lang === 'ar' ? 'طريقة الدفع:' : 'Payment Method:', 15, currentY);
  doc.setFont(fontFamily, 'normal');
  doc.text(lang === 'ar' ? data.payment.methodAr : data.payment.method, 80, currentY);
  currentY += rowHeight;

  // Reference Number (if any)
  if (data.payment.referenceNumber) {
    doc.setFont(fontFamily, 'bold');
    doc.text(lang === 'ar' ? 'رقم المرجع:' : 'Reference #:', 15, currentY);
    doc.setFont(fontFamily, 'normal');
    doc.text(data.payment.referenceNumber, 80, currentY);
    currentY += rowHeight;
  }

  // Previous Balance (if any)
  if (data.previousBalance !== undefined) {
    doc.setFont(fontFamily, 'bold');
    doc.text(lang === 'ar' ? 'الرصيد السابق:' : 'Previous Balance:', 15, currentY);
    doc.setFont(fontFamily, 'normal');
    doc.text(formatCurrencyBilingual(data.previousBalance, data.currency, lang), 80, currentY);
    currentY += rowHeight;
  }

  // Amount Paid - Highlighted
  currentY += 3;
  doc.setFillColor(240, 248, 255);
  doc.rect(15, currentY - 6, pageWidth - 30, rowHeight + 2, 'F');
  
  doc.setFont(fontFamily, 'bold');
  doc.setFontSize(12);
  doc.text(lang === 'ar' ? 'المبلغ المدفوع:' : 'Amount Paid:', 15, currentY);
  doc.setTextColor(0, 128, 0); // Green color
  doc.text(formatCurrencyBilingual(data.payment.amount, data.currency, lang), 80, currentY);
  doc.setTextColor(0, 0, 0); // Reset to black
  
  currentY += rowHeight + 5;
  doc.setFontSize(10);

  // Remaining Balance
  doc.setFont(fontFamily, 'bold');
  doc.text(lang === 'ar' ? 'الرصيد المتبقي:' : 'Remaining Balance:', 15, currentY);
  doc.setFont(fontFamily, 'normal');
  if (data.remainingBalance > 0) {
    doc.setTextColor(255, 0, 0); // Red color
  } else {
    doc.setTextColor(0, 128, 0); // Green color
  }
  doc.text(formatCurrencyBilingual(data.remainingBalance, data.currency, lang), 80, currentY);
  doc.setTextColor(0, 0, 0); // Reset to black
  
  currentY += 12;

  // Status message
  if (data.remainingBalance === 0) {
    doc.setFillColor(240, 255, 240);
    doc.rect(15, currentY - 5, pageWidth - 30, 10, 'F');
    doc.setFont(fontFamily, 'bold');
    doc.setTextColor(0, 128, 0);
    doc.text(
      lang === 'ar' ? 'تم الدفع بالكامل ✓' : 'PAID IN FULL ✓',
      pageWidth / 2,
      currentY,
      { align: 'center' }
    );
    doc.setTextColor(0, 0, 0);
    currentY += 12;
  }

  // Notes section (if any)
  if (data.notes) {
    currentY += 5;
    doc.setFontSize(10);
    doc.setFont(fontFamily, 'bold');
    doc.text(lang === 'ar' ? 'ملاحظات:' : 'Notes:', 15, currentY);
    
    currentY += 6;
    doc.setFont(fontFamily, 'normal');
    const noteLines = doc.splitTextToSize(data.notes, pageWidth - 30);
    doc.text(noteLines, 15, currentY);
    currentY += noteLines.length * 5;
  }

  // Signature section
  currentY = Math.max(currentY + 20, 220); // Ensure minimum Y position
  const signatureY = currentY;
  const signatureWidth = 60;
  
  // Left signature - Received by
  doc.setLineWidth(0.5);
  doc.line(15, signatureY, 15 + signatureWidth, signatureY);
  doc.setFontSize(9);
  doc.text(lang === 'ar' ? 'استلم بواسطة' : 'Received by', 15, signatureY + 5);

  // Right signature - Customer
  doc.line(pageWidth - 15 - signatureWidth, signatureY, pageWidth - 15, signatureY);
  doc.text(lang === 'ar' ? 'توقيع العميل' : 'Customer Signature', pageWidth - 15 - signatureWidth, signatureY + 5);

  // Footer
  const footerTextEn = `This is a computer-generated receipt. ${data.company.taxNumber ? `Tax ID: ${data.company.taxNumber}` : ''}`;
  const footerTextAr = `هذا إيصال منشأ إلكترونياً. ${data.company.taxNumber ? `الرقم الضريبي: ${data.company.taxNumber}` : ''}`;
  
  addBilingualFooter(doc, footerTextEn, footerTextAr, lang);

  return doc;
}

/**
 * Example usage:
 * 
 * ```typescript
 * const receiptData: ReceiptData = {
 *   receiptNumber: 'REC-2025-001',
 *   contractNumber: 'RC-2025-001',
 *   invoiceNumber: 'INV-2025-001',
 *   date: new Date(),
 *   customer: {
 *     name: 'Ahmed Ali',
 *     phone: '+971 50 123 4567',
 *     email: 'ahmed@example.com',
 *   },
 *   company: {
 *     nameEn: 'KarāraOS Rent a Car',
 *     nameAr: 'مرمر لتأجير السيارات',
 *     phone: '+971 4 123 4567',
 *     email: 'info@kararaos.ae',
 *     taxNumber: '123456789012345',
 *   },
 *   payment: {
 *     method: 'Credit Card',
 *     methodAr: 'بطاقة ائتمان',
 *     referenceNumber: 'TXN-123456789',
 *     amount: 1627.50,
 *   },
 *   previousBalance: 3255.00,
 *   remainingBalance: 1627.50,
 *   currency: 'AED',
 *   language: 'en',
 * };
 * 
 * const pdf = generateReceiptPDF(receiptData);
 * const pdfBlob = pdf.output('blob');
 * // Or: pdf.save('receipt.pdf');
 * ```
 */
