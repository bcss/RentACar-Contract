import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PDFPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdfBlob: Blob | null;
  title: string;
  filename: string;
}

export function PDFPreviewModal({
  open,
  onOpenChange,
  pdfBlob,
  title,
  filename,
}: PDFPreviewModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Create object URL when blob changes
  useEffect(() => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      
      // Cleanup function to revoke object URL
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPdfUrl(null);
    }
  }, [pdfBlob]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const handlePrint = () => {
    if (!pdfUrl) return;

    // Open PDF in new window for printing
    const printWindow = window.open(pdfUrl, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    } else {
      toast({
        title: t('common.error'),
        description: t('pdf.printError'),
        variant: "destructive",
      });
    }
  };

  const handleSave = () => {
    if (!pdfBlob) return;

    try {
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: t('common.success'),
        description: t('pdf.saveSuccess'),
      });
    } catch (error) {
      console.error('Error saving PDF:', error);
      toast({
        title: t('common.error'),
        description: t('pdf.saveError'),
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="material-icons">picture_as_pdf</span>
            <span>{title}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden rounded-md border bg-muted">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full"
              title={title}
              data-testid="pdf-preview-iframe"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <span className="material-icons text-4xl text-muted-foreground">
                  description
                </span>
                <p className="text-muted-foreground">{t('pdf.noPdfLoaded')}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-row justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-close-pdf"
          >
            <span className="material-icons text-sm">close</span>
            <span>{t('common.close')}</span>
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            disabled={!pdfUrl}
            data-testid="button-print-pdf"
          >
            <span className="material-icons text-sm">print</span>
            <span>{t('common.print')}</span>
          </Button>
          <Button
            onClick={handleSave}
            disabled={!pdfUrl}
            data-testid="button-save-pdf"
          >
            <span className="material-icons text-sm">download</span>
            <span>{t('pdf.saveAsPDF')}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
