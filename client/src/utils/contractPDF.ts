import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Generates a PDF from a contract DOM element
 * @param elementId - The ID of the contract element to convert to PDF
 * @param filename - Suggested filename for the PDF
 * @returns Promise with PDF Blob or null if generation fails
 */
export async function generateContractPDF(
  elementId: string,
  filename: string
): Promise<Blob | null> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Contract element not found: ${elementId}`);
      return null;
    }

    // Ensure element has dimensions before capturing
    const elementWidth = element.scrollWidth || element.offsetWidth || element.clientWidth;
    const elementHeight = element.scrollHeight || element.offsetHeight || element.clientHeight;
    
    if (!elementWidth || !elementHeight || elementWidth <= 0 || elementHeight <= 0) {
      console.error('Element has no dimensions:', { elementWidth, elementHeight });
      return null;
    }

    // Capture the contract as a canvas
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
      windowWidth: elementWidth,
      windowHeight: elementHeight,
    });

    // Validate canvas dimensions
    if (!canvas || !canvas.width || !canvas.height || canvas.width <= 0 || canvas.height <= 0) {
      console.error('Invalid canvas dimensions:', { canvasWidth: canvas?.width, canvasHeight: canvas?.height });
      return null;
    }

    // Calculate PDF dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Validate calculated dimensions
    if (!imgHeight || isNaN(imgHeight) || !isFinite(imgHeight) || imgHeight <= 0) {
      console.error('Invalid calculated image height:', { imgHeight, canvasWidth: canvas.width, canvasHeight: canvas.height });
      return null;
    }
    
    let heightLeft = imgHeight;
    let position = 0;

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // Add image to PDF (handle multi-page if needed)
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if content is longer than one page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Return PDF as Blob
    return pdf.output('blob');
  } catch (error) {
    console.error('Failed to generate contract PDF:', error);
    return null;
  }
}

/**
 * Generates PDF from HTML content directly (for reports)
 * @param htmlContent - The HTML content to convert to PDF
 * @param filename - Suggested filename for the PDF
 * @returns Promise with PDF Blob
 */
export async function generatePDFFromHTML(
  htmlContent: string,
  filename: string
): Promise<Blob | null> {
  try {
    // Create temporary container
    const container = document.createElement('div');
    container.innerHTML = htmlContent;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '210mm'; // A4 width
    document.body.appendChild(container);

    // Capture as canvas
    const canvas = await html2canvas(container, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    // Remove temporary container
    document.body.removeChild(container);

    // Calculate PDF dimensions
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);

    // Return PDF as Blob
    return pdf.output('blob');
  } catch (error) {
    console.error('Failed to generate PDF from HTML:', error);
    return null;
  }
}
