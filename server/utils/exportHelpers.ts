import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

export interface CompanyInfo {
  nameEn: string;
  nameAr: string;
  phone?: string;
  email?: string;
  address?: string;
}

// PDF Export Helpers
export function createPDF(title: string, companyInfo: CompanyInfo, isRTL: boolean = false) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Add company header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  const companyName = isRTL ? companyInfo.nameAr : companyInfo.nameEn;
  doc.text(companyName, 105, 15, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (companyInfo.phone) {
    doc.text(`Tel: ${companyInfo.phone}`, 105, 22, { align: 'center' });
  }
  if (companyInfo.email) {
    doc.text(`Email: ${companyInfo.email}`, 105, 27, { align: 'center' });
  }

  // Add report title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 105, 40, { align: 'center' });

  // Add generation date
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${format(new Date(), 'PPpp')}`, 105, 47, { align: 'center' });

  return doc;
}

export function addPDFTable(
  doc: jsPDF,
  headers: string[],
  data: any[][],
  startY: number = 55
) {
  autoTable(doc, {
    head: [headers],
    body: data,
    startY: startY,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [33, 150, 243],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { left: 10, right: 10 },
  });

  return doc;
}

export function addPDFSummarySection(
  doc: jsPDF,
  title: string,
  items: Array<{ label: string; value: string }>,
  startY: number
) {
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, startY);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  let currentY = startY + 7;

  items.forEach(item => {
    doc.text(`${item.label}:`, 14, currentY);
    doc.setFont('helvetica', 'bold');
    doc.text(item.value, 80, currentY);
    doc.setFont('helvetica', 'normal');
    currentY += 6;
  });

  return currentY + 5;
}

// Excel Export Helpers
export function createExcelWorkbook() {
  return XLSX.utils.book_new();
}

export function addExcelSheet(
  workbook: XLSX.WorkBook,
  sheetName: string,
  data: any[],
  headers?: string[]
) {
  let worksheet;
  
  if (headers && data.length > 0) {
    // Create worksheet with headers
    worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
  } else {
    worksheet = XLSX.utils.json_to_sheet(data);
  }

  // Auto-size columns
  const cols = headers || Object.keys(data[0] || {});
  const colWidths = cols.map(col => ({
    wch: Math.max(
      col.length,
      ...data.map(row => String(row[col] || '').length)
    ) + 2
  }));
  worksheet['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  return workbook;
}

export function exportExcelToBuffer(workbook: XLSX.WorkBook): Buffer {
  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return Buffer.from(excelBuffer);
}

export function formatCurrency(amount: number, currency: string = 'AED'): string {
  return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'MMM d, yyyy');
  } catch {
    return 'N/A';
  }
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

// Chart Image Interface
export interface ChartImage {
  name: string;
  dataUrl: string;
  width: number;
  height: number;
}

// Add chart images to PDF
export function addPDFChartImages(
  doc: jsPDF,
  charts: ChartImage[],
  startY: number
): number {
  let currentY = startY;
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 10;
  const maxWidth = pageWidth - (margin * 2);
  
  charts.forEach((chart, index) => {
    if (!chart.dataUrl) return;
    
    // Calculate dimensions to fit within page width
    const imgWidth = Math.min(maxWidth, 180); // Max 180mm width
    const aspectRatio = chart.height / chart.width;
    const imgHeight = imgWidth * aspectRatio;
    
    // Check if we need a new page
    if (currentY + imgHeight + 20 > pageHeight - margin) {
      doc.addPage();
      currentY = margin + 10;
    }
    
    // Add chart title
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(chart.name, pageWidth / 2, currentY, { align: 'center' });
    currentY += 7;
    
    // Add image
    try {
      doc.addImage(
        chart.dataUrl,
        'PNG',
        (pageWidth - imgWidth) / 2, // Center horizontally
        currentY,
        imgWidth,
        imgHeight
      );
      currentY += imgHeight + 15;
    } catch (error) {
      console.error(`Failed to add chart ${chart.name} to PDF:`, error);
      currentY += 10;
    }
  });
  
  return currentY;
}

// Add chart images to Excel workbook
export function addExcelChartSheet(
  workbook: XLSX.WorkBook,
  charts: ChartImage[]
): XLSX.WorkBook {
  // Create a simple sheet listing the charts
  const chartData = charts.map(chart => ({
    'Chart Name': chart.name,
    'Status': 'Image captured',
    'Note': 'Chart images are available in PDF export'
  }));
  
  if (chartData.length > 0) {
    const worksheet = XLSX.utils.json_to_sheet(chartData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Charts');
  }
  
  return workbook;
}
