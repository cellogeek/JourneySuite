
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Printer, Tags, User, FileText } from 'lucide-react'; 
import { useToast } from "@/hooks/use-toast";

const JSPDF_SCRIPT_URL_LP = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';

const LabelPrinterPage = ({ pageId }: { pageId: string }) => {
  const [labelText, setLabelText] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();
  const [isPdfLibReady, setIsPdfLibReady] = useState(false);

  useEffect(() => {
    if ((window as any).jspdf) {
        setIsPdfLibReady(true);
        return;
    }
    // Check if another component might have already added the script
    if (document.querySelector(`script[src="${JSPDF_SCRIPT_URL_LP}"]`)) {
        if ((window as any).jspdf) setIsPdfLibReady(true);
        return;
    }

    const script = document.createElement('script');
    script.src = JSPDF_SCRIPT_URL_LP;
    script.async = true;
    script.onload = () => {
        setIsPdfLibReady(true);
        console.log("jsPDF loaded for LabelPrinterPage");
    };
    script.onerror = () => {
        console.error("Failed to load jsPDF script for LabelPrinterPage.");
        toast({
            title: "PDF Library Error",
            description: "Could not load PDF generation library. Please try again later.",
            variant: "destructive",
        });
    };
    document.body.appendChild(script);
    
  }, [toast]);


  const handleLabelTextChange = (value: string) => {
    setLabelText(value);
    setShowPreview(false);
  };

  const escapeHtml = (unsafe: string) => {
    if (typeof unsafe !== 'string') return '';
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
  };

  const generateLabelPrint = () => {
    if (!labelText.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter text for the label.",
        variant: "destructive",
      });
      return;
    }
    setShowPreview(true);

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      let htmlContent = '<html><head><title>Print Label (6x4)</title>';
      htmlContent += '<style>';
      htmlContent += '@page { size: 6in 4in; margin: 0; }';
      htmlContent += 'body { margin: 0; padding: 0; width: 6in; height: 4in; display: flex; align-items: center; justify-content: center; overflow: hidden; }';
      htmlContent += ".label-text-container { font-family: 'Verdana', Arial, sans-serif; font-weight: bold; font-size: 2.75rem; text-align: center; line-height: 1.2; max-width: 90%; word-break: break-word; }";
      htmlContent += '</style></head><body>';
      htmlContent += '<div class="label-text-container">' + escapeHtml(labelText.trim()) + '</div>';
      htmlContent += '<script>';
      htmlContent += 'window.onload = function() {';
      htmlContent += '  window.print();';
      htmlContent += '  var printed = false;';
      htmlContent += '  window.onafterprint = function() { printed = true; window.close(); };';
      htmlContent += '  setTimeout(function() { if (!printed && !printWindow.closed) { printWindow.close(); } }, 2000);';
      htmlContent += '};';
      htmlContent += '<\/script>';
      htmlContent += '</body></html>';

      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } else {
      toast({
        title: "Print Error",
        description: "Could not open print window. Please check your browser's pop-up settings.",
        variant: "destructive",
      });
    }
  };

  const generatePdfLabel = () => {
    if (!isPdfLibReady || !(window as any).jspdf) {
      toast({
        title: "PDF Library Not Ready",
        description: "The PDF generation library is still loading. Please wait a moment and try again.",
        variant: "destructive",
      });
      return;
    }
    if (!labelText.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter text for the label.",
        variant: "destructive",
      });
      return;
    }
    setShowPreview(true);

    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'in', format: [6, 4] });

    doc.setFont('helvetica', 'bold');
    const text = labelText.trim();
    let fontSize = 60; // Reduced initial font size for adaptive scaling from 72 to 60
    doc.setFontSize(fontSize);
    
    const maxWidthInches = 6 * 0.9;
    const maxHeightInches = 4 * 0.8;

    let textWidth = doc.getStringUnitWidth(text) * fontSize / doc.internal.scaleFactor;
    let textHeight = doc.getTextDimensions(text).h / 72; 

    while ((textWidth > maxWidthInches || textHeight > maxHeightInches) && fontSize > 10) {
        fontSize -= 2;
        doc.setFontSize(fontSize);
        textWidth = doc.getStringUnitWidth(text) * fontSize / doc.internal.scaleFactor;
        textHeight = doc.getTextDimensions(text).h / 72;
    }
    
    const xOffset = (6 - textWidth) / 2;
    const yOffset = (4 + textHeight * 0.35) / 2; 

    doc.text(text, xOffset, yOffset, { align: 'left' }); 

    doc.save(`label-${text.replace(/[^a-zA-Z0-9]/g, '_') || 'generated'}.pdf`);
  };


  return (
    <div className="space-y-8">
      <Card className="content-fade-in-up">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 flex items-center justify-center">
            <Tags size={36} className="mr-3 text-sky-600" /> Label Printer (6" x 4")
          </CardTitle>
          <CardDescription className="text-lg text-slate-500 pt-1">
            Quickly prepare large format labels.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="content-fade-in-up" style={{ animationDelay: '150ms' }}>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-800">Label Content</CardTitle>
          <CardDescription>Enter the text you want to appear on the label.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="labelText" className="flex items-center gap-1 text-sm font-semibold">
              <User size={14} className="text-slate-400" /> Label Text
            </Label>
            <Input
              id="labelText"
              value={labelText}
              onChange={e => handleLabelTextChange(e.target.value)}
              placeholder="e.g., FRAGILE or Conference Room A"
              className="text-lg"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={generateLabelPrint} size="action" className="w-full" disabled={!labelText.trim()}>
              <Printer size={18} className="mr-2"/> Print Label
            </Button>
            <Button 
              onClick={generatePdfLabel} 
              size="action" 
              variant="secondary" 
              className="w-full" 
              disabled={!isPdfLibReady || !labelText.trim()}
            >
              <FileText size={18} className="mr-2"/> {isPdfLibReady ? 'Generate PDF Label' : 'Loading PDF Lib...'}
            </Button>
          </div>

          {showPreview && labelText.trim() && (
             <div className="mt-6 p-4 border-2 border-dashed border-sky-300 rounded-lg bg-sky-50/50">
              <h3 className="text-lg font-semibold text-sky-700 mb-3 text-center">Label Preview (6" x 4")</h3>
              <div
                className="relative w-full bg-white border border-slate-400 shadow-md mx-auto max-w-md p-2 flex items-center justify-center"
                style={{ aspectRatio: '6 / 4' }}
              >
                <div
                  className="text-center truncate"
                  style={{
                    fontFamily: "'Verdana', Arial, sans-serif",
                    fontWeight: 'bold',
                    fontSize: `calc(2.75rem * 0.25)`, 
                    lineHeight: '1.2',
                    maxWidth: '90%',
                  }}
                >
                    {labelText}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LabelPrinterPage;
