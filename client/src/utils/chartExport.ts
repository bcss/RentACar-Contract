import html2canvas from 'html2canvas';

export interface ChartImage {
  name: string;
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Captures a chart element as a base64 image
 * @param elementId - The DOM element ID containing the chart
 * @param chartName - A descriptive name for the chart
 * @returns Promise with chart image data or null if capture fails
 */
export async function captureChart(
  elementId: string,
  chartName: string
): Promise<ChartImage | null> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      console.warn(`Chart element not found: ${elementId} - skipping`);
      return null;
    }

    // Check if element is visible
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      console.warn(`Chart element ${elementId} is not visible - skipping`);
      return null;
    }

    // Wait a bit for chart animations to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale: 1.5, // Reduced from 2 to lower file size
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    const dataUrl = canvas.toDataURL('image/png', 0.8); // Add compression
    
    return {
      name: chartName,
      dataUrl,
      width: canvas.width,
      height: canvas.height,
    };
  } catch (error) {
    console.error(`Failed to capture chart ${chartName}:`, error);
    return null;
  }
}

/**
 * Captures multiple charts sequentially
 * @param charts - Array of {elementId, chartName} objects
 * @returns Promise with array of captured chart images
 */
export async function captureMultipleCharts(
  charts: Array<{ elementId: string; chartName: string }>
): Promise<ChartImage[]> {
  const results: ChartImage[] = [];
  
  for (const chart of charts) {
    const image = await captureChart(chart.elementId, chart.chartName);
    if (image) {
      results.push(image);
    }
  }
  
  return results;
}
