import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

export async function generateReceiptPDF(
  element: HTMLElement,
  invoiceNo: string,
  paperWidth: '58mm' | '80mm' | 'normal' = '80mm'
): Promise<{ file: File; blobUrl: string }> {
  // Capture the receipt DOM as high-resolution canvas with oklch support
  const canvas = await html2canvas(element, {
    scale: 2.5,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  // Determine width based on paperWidth option
  const pdfWidthMm = paperWidth === '58mm' ? 58 : paperWidth === '80mm' ? 80 : 120;
  const pdfHeightMm = (imgHeight * pdfWidthMm) / imgWidth;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [pdfWidthMm, Math.max(pdfHeightMm, 70)],
  });

  pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidthMm, pdfHeightMm);

  const pdfBlob = pdf.output('blob');
  const filename = `Nota_${invoiceNo.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
  const file = new File([pdfBlob], filename, { type: 'application/pdf' });
  const blobUrl = URL.createObjectURL(pdfBlob);

  return { file, blobUrl };
}
