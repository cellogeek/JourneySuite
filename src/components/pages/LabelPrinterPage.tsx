
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Printer, Tags, User } from 'lucide-react'; // Added Tags icon
import { useToast } from "@/hooks/use-toast";

const LabelPrinterPage = ({ pageId }: { pageId: string }) => {
  const [labelText, setLabelText] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

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
      htmlContent += '@page { size: 6in 4in; margin: 0; }'; // 6x4 inch label size
      htmlContent += 'body { margin: 0; padding: 0; width: 6in; height: 4in; display: flex; align-items: center; justify-content: center; overflow: hidden; }';
      // Increased font size significantly for a label, adjust as needed
      htmlContent += ".label-text-container { font-family: 'Verdana', Arial, sans-serif; font-weight: bold; font-size: 2.5rem; text-align: center; line-height: 1.2; max-width: 90%; word-break: break-word; }";
      htmlContent += '</style></head><body>';
      htmlContent += '<div class="label-text-container">' + escapeHtml(labelText.trim()) + '</div>';
      htmlContent += '<script>';
      htmlContent += 'window.onload = function() {';
      htmlContent += '  window.print();';
      htmlContent += '  var printed = false;';
      htmlContent += '  window.onafterprint = function() { printed = true; window.close(); };';
      // Close window after a delay if onafterprint doesn't fire (e.g., if print dialog is cancelled)
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
          <Button onClick={generateLabelPrint} size="action" className="w-full md:w-auto" disabled={!labelText.trim()}>
            <Printer size={18} className="mr-2"/> Print Label
          </Button>

          {showPreview && labelText.trim() && (
             <div className="mt-6 p-4 border-2 border-dashed border-sky-300 rounded-lg bg-sky-50/50">
              <h3 className="text-lg font-semibold text-sky-700 mb-3 text-center">Label Preview (6" x 4")</h3>
              <div
                className="relative w-full bg-white border border-slate-400 shadow-md mx-auto max-w-md p-2 flex items-center justify-center" // max-w-md for reasonable preview size
                style={{ aspectRatio: '6 / 4' }} // 6x4 aspect ratio
              >
                <div
                  className="text-center truncate" // truncate to prevent overflow in preview
                  style={{
                    fontFamily: "'Verdana', Arial, sans-serif",
                    fontWeight: 'bold',
                    // Scaled font size for preview, adjust this factor as needed for visual accuracy
                    fontSize: `calc(2.5rem * 0.25)`, // Example: 25% of actual for preview
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
