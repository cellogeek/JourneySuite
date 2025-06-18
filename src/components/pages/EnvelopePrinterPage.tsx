
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Printer, Mail, User, Home, MapPin, Building, Globe } from 'lucide-react';

interface Address {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
}

const initialAddress: Address = { name: '', street: '', city: '', state: '', zip: '' };

const defaultReturnAddress: Address = {
  name: 'Journey Canyon LLC',
  street: '3406 4th Ave Ste 400',
  city: 'Canyon',
  state: 'TX',
  zip: '79015',
};

const EnvelopePrinterPage = ({ pageId }: { pageId: string }) => {
  const [returnAddress, setReturnAddress] = useState<Address>(defaultReturnAddress);
  const [recipientAddress, setRecipientAddress] = useState<Address>(initialAddress);
  const [nameOnly, setNameOnly] = useState('');

  const [showStandardPreview, setShowStandardPreview] = useState(false);
  const [showNameOnlyPreview, setShowNameOnlyPreview] = useState(false);
  
  const [isPdfLibReady, setIsPdfLibReady] = useState(false); // Kept for potential use by other components like CheckWriter

  useEffect(() => {
    // This useEffect loads jsPDF. It's kept in case other components
    // (like CheckWriterPage if navigated to) might benefit from it being preloaded.
    // However, this page's standard envelope will no longer use it.
    if ((window as any).jspdf) {
        setIsPdfLibReady(true);
        return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.async = true;
    script.onload = () => setIsPdfLibReady(true);
    document.body.appendChild(script);
    return () => { if (script.parentNode) script.parentNode.removeChild(script); };
  }, []);


  const handleAddressChange = (
    type: 'return' | 'recipient',
    field: keyof Address,
    value: string
  ) => {
    const setter = type === 'return' ? setReturnAddress : setRecipientAddress;
    setter(prev => ({ ...prev, [field]: value }));
    setShowStandardPreview(false); 
  };

  const handleNameOnlyChange = (value: string) => {
    setNameOnly(value);
    setShowNameOnlyPreview(false); 
  }

  const generateStandardEnvelope = () => {
     if (!recipientAddress.name && !recipientAddress.street && !recipientAddress.city && !recipientAddress.state && !recipientAddress.zip) {
        alert("Please enter complete recipient information.");
        return;
    }
    setShowStandardPreview(true);

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      let htmlContent = '<html><head><title>Print Standard Envelope</title>';
      htmlContent += '<style>';
      htmlContent += '@page { size: 9.5in 4.125in; margin: 0; }';
      htmlContent += 'body { width: 9.5in; height: 4.125in; margin: 0; padding: 0; font-family: Helvetica, Arial, sans-serif; font-size: 10pt; position: relative; overflow: hidden; }';
      htmlContent += '.return-address { position: absolute; top: 0.5in; left: 0.5in; line-height: 1.4; font-size: 9pt; }';
      htmlContent += '.stamp-area { position: absolute; top: 0.5in; right: 0.5in; width: 1.2in; text-align: center; line-height: 1.2; font-size: 8pt; color: #888; }';
      htmlContent += '.recipient-address { position: absolute; top: 1.9in; left: 4.75in; transform: translateX(-50%); text-align: center; line-height: 1.5; font-size: 11pt; max-width: 4in; }';
      htmlContent += '.postnet-barcode { position: absolute; bottom: 0.4in; left: 4.75in; transform: translateX(-50%); text-align: center; font-family: "Courier New", Courier, monospace; font-size: 12pt; letter-spacing: 0.1em; }';
      htmlContent += '.address-line { margin-bottom: 0.05in; }';
      htmlContent += '</style></head><body>';
      
      htmlContent += '<div class="return-address">';
      if (returnAddress.name) htmlContent += '<div class="address-line">' + escapeHtml(returnAddress.name) + '</div>';
      if (returnAddress.street) htmlContent += '<div class="address-line">' + escapeHtml(returnAddress.street) + '</div>';
      if (returnAddress.city || returnAddress.state || returnAddress.zip) {
        htmlContent += '<div class="address-line">' + escapeHtml(returnAddress.city) + (returnAddress.city && (returnAddress.state || returnAddress.zip) ? ', ' : '') + escapeHtml(returnAddress.state) + ' ' + escapeHtml(returnAddress.zip) + '</div>';
      }
      htmlContent += '</div>';

      htmlContent += '<div class="stamp-area">';
      htmlContent += '<div>PLACE</div><div>STAMP</div><div>HERE</div>';
      htmlContent += '</div>';

      htmlContent += '<div class="recipient-address">';
      if (recipientAddress.name) htmlContent += '<div class="address-line"><strong>' + escapeHtml(recipientAddress.name) + '</strong></div>';
      if (recipientAddress.street) htmlContent += '<div class="address-line">' + escapeHtml(recipientAddress.street) + '</div>';
      if (recipientAddress.city || recipientAddress.state || recipientAddress.zip) {
        htmlContent += '<div class="address-line">' + escapeHtml(recipientAddress.city) + (recipientAddress.city && (recipientAddress.state || recipientAddress.zip) ? ', ' : '') + escapeHtml(recipientAddress.state) + ' ' + escapeHtml(recipientAddress.zip) + '</div>';
      }
      htmlContent += '</div>';
      
      const postnetValue = getPostnetBarcode(recipientAddress.zip);
      if (postnetValue) {
        htmlContent += '<div class="postnet-barcode">' + escapeHtml(postnetValue) + '</div>';
      }

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
      alert("Attempting to print envelope. Note: ZIP+4 lookup and scannable POSTNET barcode generation are not yet implemented. The barcode shown is a visual placeholder.");

    } else {
      alert("Could not open print window. Please check your browser's pop-up settings.");
    }
  };

  const printNameOnlyEnvelope = () => {
    if (!nameOnly.trim()) {
      alert("Please enter a name.");
      return;
    }
    setShowNameOnlyPreview(true);

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      let htmlContent = '<html><head><title>Print Envelope</title>';
      htmlContent += '<style>';
      htmlContent += '@page { size: 9.5in 4.125in; margin: 0; }'; 
      htmlContent += 'body { margin: 0; padding: 0; width: 9.5in; height: 4.125in; display: flex; align-items: center; justify-content: center; overflow: hidden; }';
      htmlContent += ".name-container { font-family: 'Verdana', sans-serif; font-weight: bold; font-size: 1.6875rem; text-align: center; line-height: 1.2; max-width: 90%; word-break: break-word; }";
      htmlContent += '</style></head><body>';
      htmlContent += '<div class="name-container">' + escapeHtml(nameOnly.trim()) + '</div>';
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
      alert("Could not open print window. Please check your browser's pop-up settings.");
    }
  };

  const getPostnetBarcode = (zip: string) => {
    const zipDigits = zip.replace(/[^0-9]/g, '');
    if (zipDigits.length >= 5) {
      return "| | | | |  | | | |  | | | |  | | | |  | | | |  | | | | |"; // Visual Placeholder
    }
    return "";
  }

  const escapeHtml = (unsafe: string) => {
    if (typeof unsafe !== 'string') return '';
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
  }


  const isRecipientAddressFilled = () => {
    return recipientAddress.name.trim() !== '' || 
           recipientAddress.street.trim() !== '' ||
           (recipientAddress.city.trim() !== '' && recipientAddress.state.trim() !== '' && recipientAddress.zip.trim() !== '');
  };

  return (
    <div className="space-y-8">
      <Card className="content-fade-in-up">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 flex items-center justify-center">
            <Mail size={36} className="mr-3 text-sky-600" /> Envelope Printer
          </CardTitle>
          <CardDescription className="text-lg text-slate-500 pt-1">
            Quickly prepare envelopes for mailing or internal distribution.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="standard" className="w-full content-fade-in-up" style={{ animationDelay: '150ms' }}>
        <TabsList className="grid w-full grid-cols-2 md:w-1/2 md:mx-auto">
          <TabsTrigger value="standard">Standard #10 Envelope</TabsTrigger>
          <TabsTrigger value="nameOnly">Name-Only Envelope</TabsTrigger>
        </TabsList>

        <TabsContent value="standard" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-800">Standard #10 Envelope Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <fieldset className="space-y-3 border border-brand-slate-200 p-4 rounded-xl">
                  <legend className="text-md font-semibold px-1 text-brand-text-legend">Return Address</legend>
                  <div>
                    <Label htmlFor="returnName" className="flex items-center gap-1 text-sm"><Building size={14}/>Name/Company</Label>
                    <Input id="returnName" value={returnAddress.name} onChange={e => handleAddressChange('return', 'name', e.target.value)} placeholder="Your Name/Company" />
                  </div>
                  <div>
                    <Label htmlFor="returnStreet" className="flex items-center gap-1 text-sm"><Home size={14}/>Street</Label>
                    <Input id="returnStreet" value={returnAddress.street} onChange={e => handleAddressChange('return', 'street', e.target.value)} placeholder="123 Main St" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                        <Label htmlFor="returnCity" className="flex items-center gap-1 text-sm"><MapPin size={14}/>City</Label>
                        <Input id="returnCity" value={returnAddress.city} onChange={e => handleAddressChange('return', 'city', e.target.value)} placeholder="Anytown" />
                    </div>
                    <div>
                        <Label htmlFor="returnState" className="flex items-center gap-1 text-sm"><Globe size={14}/>State</Label>
                        <Input id="returnState" value={returnAddress.state} onChange={e => handleAddressChange('return', 'state', e.target.value)} placeholder="ST" maxLength={2} />
                    </div>
                    <div>
                        <Label htmlFor="returnZip" className="flex items-center gap-1 text-sm">Zip</Label>
                        <Input id="returnZip" value={returnAddress.zip} onChange={e => handleAddressChange('return', 'zip', e.target.value)} placeholder="12345" />
                    </div>
                  </div>
                </fieldset>

                <fieldset className="space-y-3 border border-brand-slate-200 p-4 rounded-xl">
                  <legend className="text-md font-semibold px-1 text-brand-text-legend">Recipient Address</legend>
                  <div>
                    <Label htmlFor="recipientName" className="flex items-center gap-1 text-sm"><User size={14}/>Name/Company</Label>
                    <Input id="recipientName" value={recipientAddress.name} onChange={e => handleAddressChange('recipient', 'name', e.target.value)} placeholder="Recipient Name/Company" />
                  </div>
                  <div>
                    <Label htmlFor="recipientStreet" className="flex items-center gap-1 text-sm"><Home size={14}/>Street</Label>
                    <Input id="recipientStreet" value={recipientAddress.street} onChange={e => handleAddressChange('recipient', 'street', e.target.value)} placeholder="456 Recipient Ave" />
                  </div>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                        <Label htmlFor="recipientCity" className="flex items-center gap-1 text-sm"><MapPin size={14}/>City</Label>
                        <Input id="recipientCity" value={recipientAddress.city} onChange={e => handleAddressChange('recipient', 'city', e.target.value)} placeholder="Their City" />
                    </div>
                    <div>
                        <Label htmlFor="recipientState" className="flex items-center gap-1 text-sm"><Globe size={14}/>State</Label>
                        <Input id="recipientState" value={recipientAddress.state} onChange={e => handleAddressChange('recipient', 'state', e.target.value)} placeholder="ST" maxLength={2} />
                    </div>
                    <div>
                        <Label htmlFor="recipientZip" className="flex items-center gap-1 text-sm">Zip</Label>
                        <Input id="recipientZip" value={recipientAddress.zip} onChange={e => handleAddressChange('recipient', 'zip', e.target.value)} placeholder="67890" />
                    </div>
                  </div>
                </fieldset>
              </div>
              <Button 
                onClick={generateStandardEnvelope} 
                size="action" 
                className="w-full md:w-auto" 
                disabled={!isRecipientAddressFilled()}
              >
                <Printer size={18} className="mr-2"/> Print Standard Envelope
              </Button>

              {showStandardPreview && (
                <div className="mt-6 p-4 border-2 border-dashed border-sky-300 rounded-lg bg-sky-50/50">
                  <h3 className="text-lg font-semibold text-sky-700 mb-3 text-center">Envelope Preview (#10)</h3>
                  <div 
                    className="relative w-full bg-white border border-slate-400 shadow-md mx-auto max-w-2xl text-[10px]" 
                    style={{ aspectRatio: '9.5 / 4.125', fontFamily: "'Helvetica', Arial, sans-serif" }}
                  >
                    {/* Return Address Preview */}
                    <div className="absolute text-[9pt] leading-tight" style={{ top: '0.5in', left: '0.5in', transform: 'scale(0.104)', transformOrigin: 'top left' }}>
                      <div>{returnAddress.name}</div>
                      <div>{returnAddress.street}</div>
                      <div>{`${returnAddress.city}${returnAddress.city ? ', ' : ''}${returnAddress.state} ${returnAddress.zip}`}</div>
                    </div>
                    
                    {/* Stamp Preview Text (Center-aligned) */}
                    <div 
                        className="absolute text-center leading-tight text-slate-400 text-[8pt]" 
                        style={{ 
                            top: '0.5in', 
                            right: '0.5in',
                            width: '1.2in', // Matching CSS
                            transform: 'scale(0.104)', 
                            transformOrigin: 'top right',
                        }}
                    >
                        <div>PLACE</div>
                        <div>STAMP</div>
                        <div>HERE</div>
                    </div>

                    {/* Recipient Address Preview */}
                    <div className="absolute text-center leading-normal text-[11pt]" style={{ top: '1.9in', left: '4.75in', transform: 'translateX(-50%) scale(0.104)', transformOrigin: 'top center', maxWidth: '4in' }}>
                        <div className="font-semibold">{recipientAddress.name}</div>
                        <div>{recipientAddress.street}</div>
                        <div>{`${recipientAddress.city}${recipientAddress.city ? ', ' : ''}${recipientAddress.state} ${recipientAddress.zip}`}</div>
                    </div>

                    {/* POSTNET Barcode Preview */}
                    {getPostnetBarcode(recipientAddress.zip) && (
                        <div className="absolute text-center text-[12pt] tracking-[0.1em]" style={{ bottom: '0.4in', left: '4.75in', transform: 'translateX(-50%) scale(0.104)', transformOrigin: 'bottom center', fontFamily: "'Courier New', Courier, monospace" }}>
                          {getPostnetBarcode(recipientAddress.zip)}
                        </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nameOnly" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-800">Name-Only Envelope</CardTitle>
              <CardDescription>For internal document distribution.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="nameOnlyName" className="flex items-center gap-1 text-sm"><User size={14}/>Person's Name</Label>
                <Input id="nameOnlyName" value={nameOnly} onChange={e => handleNameOnlyChange(e.target.value)} placeholder="e.g., John Doe" />
              </div>
              <Button onClick={printNameOnlyEnvelope} size="action" className="w-full md:w-auto">
                <Printer size={18} className="mr-2"/> Print Name-Only Envelope
              </Button>

              {showNameOnlyPreview && (
                 <div className="mt-6 p-4 border-2 border-dashed border-sky-300 rounded-lg bg-sky-50/50">
                  <h3 className="text-lg font-semibold text-sky-700 mb-3 text-center">Envelope Preview (Name-Only)</h3>
                  <div 
                    className="relative w-full aspect-[9.5/4.125] bg-white border border-slate-400 shadow-md mx-auto max-w-2xl p-2 flex items-center justify-center"
                  >
                    <div 
                      className="text-center"
                      style={{ 
                        fontFamily: "'Verdana', sans-serif", 
                        fontWeight: 'bold', 
                        fontSize: '1.6875rem'
                      }}
                    >
                        {nameOnly}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnvelopePrinterPage;
    
