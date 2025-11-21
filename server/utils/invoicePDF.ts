/**
 * Invoice PDF Generator with Bilingual Support
 * Generates professional invoices for rental contracts
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  addBilingualHeader,
  addBilingualFooter,
  formatCurrencyBilingual,
  formatDateBilingual,
} from './arabicPDF';

export interface InvoiceData {
  invoiceNumber: string;
  contractNumber: string;
  date: Date;
  dueDate: Date;
  customer: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  company: {
    nameEn: string;
    nameAr: string;
    phone?: string;
    email?: string;
    address?: string;
    taxNumber?: string;
  };
  items: Array<{
    descriptionEn: string;
    descriptionAr: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount?: number;
  total: number;
  currency: string;
  notes?: string;
  language: 'ar' | 'en';
}

/**
 * Generates an invoice PDF
 * @param data - Invoice data
 * @returns jsPDF instance
 */
export function generateInvoicePDF(data: InvoiceData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.width;
  const lang = data.language;
  let currentY = 0;

  // Add Header
  currentY = addBilingualHeader(
    doc,
    'INVOICE',
    'فاتورة',
    data.company,
    lang
  );

  // Invoice Information Section
  const fontFamily = lang === 'ar' ? 'courier' : 'helvetica';
  doc.setFontSize(10);
  doc.setFont(fontFamily, 'normal');
  
  const invoiceInfoY = currentY;
  const leftColumn = 15;
  const rightColumn = pageWidth - 15;

  // Left column - Invoice details
  doc.setFont(fontFamily, 'bold');
  doc.text(lang === 'ar' ? 'رقم الفاتورة:' : 'Invoice #:', leftColumn, currentY);
  doc.setFont(fontFamily, 'normal');
  doc.text(data.invoiceNumber, leftColumn + 35, currentY);
  
  currentY += 6;
  doc.setFont(fontFamily, 'bold');
  doc.text(lang === 'ar' ? 'رقم العقد:' : 'Contract #:', leftColumn, currentY);
  doc.setFont(fontFamily, 'normal');
  doc.text(data.contractNumber, leftColumn + 35, currentY);
  
  currentY += 6;
  doc.setFont(fontFamily, 'bold');
  doc.text(lang === 'ar' ? 'التاريخ:' : 'Date:', leftColumn, currentY);
  doc.setFont(fontFamily, 'normal');
  doc.text(formatDateBilingual(data.date, lang), leftColumn + 35, currentY);
  
  currentY += 6;
  doc.setFont(fontFamily, 'bold');
  doc.text(lang === 'ar' ? 'تاريخ الاستحقاق:' : 'Due Date:', leftColumn, currentY);
  doc.setFont(fontFamily, 'normal');
  doc.text(formatDateBilingual(data.dueDate, lang), leftColumn + 35, currentY);

  // Right column - Customer details
  currentY = invoiceInfoY;
  doc.setFont(fontFamily, 'bold');
  doc.text(lang === 'ar' ? 'العميل:' : 'Bill To:', rightColumn, currentY, { align: 'right' });
  
  currentY += 6;
  doc.setFont(fontFamily, 'normal');
  doc.text(data.customer.name, rightColumn, currentY, { align: 'right' });
  
  if (data.customer.email) {
    currentY += 5;
    doc.text(data.customer.email, rightColumn, currentY, { align: 'right' });
  }
  
  if (data.customer.phone) {
    currentY += 5;
    doc.text(data.customer.phone, rightColumn, currentY, { align: 'right' });
  }
  
  if (data.customer.address) {
    currentY += 5;
    const addressLines = doc.splitTextToSize(data.customer.address, 70);
    doc.text(addressLines, rightColumn, currentY, { align: 'right' });
    currentY += (addressLines.length - 1) * 5;
  }

  currentY = Math.max(currentY, invoiceInfoY + 24) + 10;

  // Items Table
  const headersEn = ['Description', 'Qty', 'Unit Price', 'Total'];
  const headersAr = ['الوصف', 'الكمية', 'سعر الوحدة', 'المجموع'];
  
  const tableData = data.items.map(item => [
    lang === 'ar' ? item.descriptionAr : item.descriptionEn,
    item.quantity.toString(),
    formatCurrencyBilingual(item.unitPrice, data.currency, lang),
    formatCurrencyBilingual(item.total, data.currency, lang),
  ]);

  // Use autoTable directly instead of via arabicPDF (which has circular dependency)
  const headers = lang === 'ar' ? headersAr : headersEn;
  
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: currentY,
    styles: {
      fontSize: 10,
      cellPadding: 4,
      font: lang === 'ar' ? 'courier' : 'helvetica',
      halign: lang === 'ar' ? 'right' : 'left',
    },
    headStyles: {
      fillColor: [8, 145, 178],
      textColor: 255,
      fontStyle: 'bold',
      halign: lang === 'ar' ? 'right' : 'left',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { left: 15, right: 15 },
  });

  // Get Y position after table
  currentY = (doc as any).lastAutoTable.finalY + 10;

  // Totals Section
  const totalsX = pageWidth - 75;
  const totalsLabelX = totalsX - 5;
  const totalsValueX = pageWidth - 15;

  // Subtotal
  doc.setFont(fontFamily, 'normal');
  doc.text(lang === 'ar' ? 'المجموع الفرعي:' : 'Subtotal:', totalsLabelX, currentY, { align: 'right' });
  doc.text(formatCurrencyBilingual(data.subtotal, data.currency, lang), totalsValueX, currentY, { align: 'right' });
  
  currentY += 6;

  // Discount (if any)
  if (data.discount && data.discount > 0) {
    doc.text(lang === 'ar' ? 'الخصم:' : 'Discount:', totalsLabelX, currentY, { align: 'right' });
    doc.text(`-${formatCurrencyBilingual(data.discount, data.currency, lang)}`, totalsValueX, currentY, { align: 'right' });
    currentY += 6;
  }

  // Tax
  doc.text(
    lang === 'ar' 
      ? `ضريبة القيمة المضافة (${data.taxRate}%):` 
      : `VAT (${data.taxRate}%):`,
    totalsLabelX,
    currentY,
    { align: 'right' }
  );
  doc.text(formatCurrencyBilingual(data.taxAmount, data.currency, lang), totalsValueX, currentY, { align: 'right' });
  
  currentY += 8;

  // Total
  doc.setFont(fontFamily, 'bold');
  doc.setFontSize(12);
  doc.text(lang === 'ar' ? 'المجموع الكلي:' : 'TOTAL:', totalsLabelX, currentY, { align: 'right' });
  doc.text(formatCurrencyBilingual(data.total, data.currency, lang), totalsValueX, currentY, { align: 'right' });

  // Notes section (if any)
  if (data.notes) {
    currentY += 15;
    doc.setFontSize(10);
    doc.setFont(fontFamily, 'bold');
    doc.text(lang === 'ar' ? 'ملاحظات:' : 'Notes:', 15, currentY);
    
    currentY += 6;
    doc.setFont(fontFamily, 'normal');
    const noteLines = doc.splitTextToSize(data.notes, pageWidth - 30);
    doc.text(noteLines, 15, currentY);
  }

  // Footer
  const footerTextEn = `Thank you for your business! ${data.company.taxNumber ? `Tax Registration: ${data.company.taxNumber}` : ''}`;
  const footerTextAr = `شكراً لتعاملكم معنا! ${data.company.taxNumber ? `الرقم الضريبي: ${data.company.taxNumber}` : ''}`;
  
  addBilingualFooter(doc, footerTextEn, footerTextAr, lang);

  return doc;
}

/**
 * Example usage:
 * 
 * ```typescript
 * const invoiceData: InvoiceData = {
 *   invoiceNumber: 'INV-2025-001',
 *   contractNumber: 'RC-2025-001',
 *   date: new Date(),
 *   dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
 *   customer: {
 *     name: 'Ahmed Ali',
 *     email: 'ahmed@example.com',
 *     phone: '+971 50 123 4567',
 *   },
 *   company: {
 *     nameEn: 'KarāraOS Rent a Car',
 *     nameAr: 'مرمر لتأجير السيارات',
 *     phone: '+971 4 123 4567',
 *     email: 'info@kararaos.ae',
 *     taxNumber: '123456789012345',
 *   },
 *   items: [
 *     {
 *       descriptionEn: 'Vehicle Rental - Toyota Camry (7 days)',
 *       descriptionAr: 'تأجير مركبة - تويوتا كامري (7 أيام)',
 *       quantity: 1,
 *       unitPrice: 1500,
 *       total: 1500,
 *     },
 *     {
 *       descriptionEn: 'GPS Device',
 *       descriptionAr: 'جهاز GPS',
 *       quantity: 1,
 *       unitPrice: 50,
 *       total: 50,
 *     },
 *   ],
 *   subtotal: 1550,
 *   taxRate: 5,
 *   taxAmount: 77.50,
 *   total: 1627.50,
 *   currency: 'AED',
 *   language: 'en',
 * };
 * 
 * const pdf = generateInvoicePDF(invoiceData);
 * const pdfBlob = pdf.output('blob');
 * // Or: pdf.save('invoice.pdf');
 * ```
 */
