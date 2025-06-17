
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Printer, Mail, User, Home, MapPin } from 'lucide-react';

interface Address {
  name: string;
  street: string;
  cityStateZip: string; // Combined for simplicity in stub, can be split later
}

const initialAddress: Address = { name: '', street: '', cityStateZip: '' };

const EnvelopePrinterPage = ({ pageId }: { pageId: string }) => {
  const [returnAddress, setReturnAddress] = useState<Address>(initialAddress);
  const [recipientAddress, setRecipientAddress] = useState<Address>(initialAddress);
  const [nameOnly, setNameOnly] = useState('');

  const [showStandardPreview, setShowStandardPreview] = useState(false);
  const [showNameOnlyPreview, setShowNameOnlyPreview] = useState(false);
  
  // For dynamic script loading, e.g., jsPDF, if not already handled globally
  const [isPdfLibReady, setIsPdfLibReady] = useState(false);

  useEffect(() => {
    // Placeholder for jsPDF loading if needed specifically for this page
    // Similar to CheckWriterPage, if jsPDF is needed for actual generation
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
    setShowStandardPreview(false); // Hide preview on input change
  };

  const handleNameOnlyChange = (value: string) => {
    setNameOnly(value);
    setShowNameOnlyPreview(false); // Hide preview on input change
  }

  const generateStandardEnvelope = () => {
    // Stub: Log data and show preview
    console.log("Generating Standard Envelope with data:", { returnAddress, recipientAddress });
    // TODO: Implement actual PDF generation with jsPDF
    if (!isPdfLibReady) {
        alert("PDF library not ready. Please wait a moment.");
        return;
    }
    if(!recipientAddress.name && !recipientAddress.street && !recipientAddress.cityStateZip) {
        alert("Please enter at least recipient information.");
        return;
    }
    setShowStandardPreview(true);
    alert("(Stub) Standard #10 Envelope PDF would be generated here.");
  };

  const generateNameOnlyEnvelope = () => {
    // Stub: Log data and show preview
    console.log("Generating Name-Only Envelope for:", nameOnly);
    // TODO: Implement actual PDF generation with jsPDF
     if (!isPdfLibReady) {
        alert("PDF library not ready. Please wait a moment.");
        return;
    }
    if(!nameOnly.trim()) {
        alert("Please enter a name.");
        return;
    }
    setShowNameOnlyPreview(true);
    alert("(Stub) Name-Only Envelope PDF would be generated here.");
  };

  const getPostnetBarcode = (zip: string) => {
    // Basic check for zip to show placeholder. Real POSTNET is complex.
    const zipDigits = zip.replace(/[^0-9]/g, '');
    if (zipDigits.length >= 5) {
      // Simplified placeholder, actual POSTNET has specific bar heights and spacing
      return "| | | | |  | | | |  | | | |  | | | |  | | | |  | | | | |";
    }
    return "";
  }

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
                {/* Return Address */}
                <fieldset className="space-y-3 border border-brand-slate-200 p-4 rounded-xl">
                  <legend className="text-md font-semibold px-1 text-brand-text-legend">Return Address (Optional)</legend>
                  <div>
                    <Label htmlFor="returnName" className="flex items-center gap-1 text-sm"><User size={14}/>Name</Label>
                    <Input id="returnName" value={returnAddress.name} onChange={e => handleAddressChange('return', 'name', e.target.value)} placeholder="Your Name/Company" />
                  </div>
                  <div>
                    <Label htmlFor="returnStreet" className="flex items-center gap-1 text-sm"><Home size={14}/>Street</Label>
                    <Input id="returnStreet" value={returnAddress.street} onChange={e => handleAddressChange('return', 'street', e.target.value)} placeholder="123 Main St" />
                  </div>
                  <div>
                    <Label htmlFor="returnCityStateZip" className="flex items-center gap-1 text-sm"><MapPin size={14}/>City, State, Zip</Label>
                    <Input id="returnCityStateZip" value={returnAddress.cityStateZip} onChange={e => handleAddressChange('return', 'cityStateZip', e.target.value)} placeholder="Anytown, ST 12345" />
                  </div>
                </fieldset>

                {/* Recipient Address */}
                <fieldset className="space-y-3 border border-brand-slate-200 p-4 rounded-xl">
                  <legend className="text-md font-semibold px-1 text-brand-text-legend">Recipient Address</legend>
                  <div>
                    <Label htmlFor="recipientName" className="flex items-center gap-1 text-sm"><User size={14}/>Name</Label>
                    <Input id="recipientName" value={recipientAddress.name} onChange={e => handleAddressChange('recipient', 'name', e.target.value)} placeholder="Recipient Name/Company" />
                  </div>
                  <div>
                    <Label htmlFor="recipientStreet" className="flex items-center gap-1 text-sm"><Home size={14}/>Street</Label>
                    <Input id="recipientStreet" value={recipientAddress.street} onChange={e => handleAddressChange('recipient', 'street', e.target.value)} placeholder="456 Recipient Ave" />
                  </div>
                  <div>
                    <Label htmlFor="recipientCityStateZip" className="flex items-center gap-1 text-sm"><MapPin size={14}/>City, State, Zip</Label>
                    <Input id="recipientCityStateZip" value={recipientAddress.cityStateZip} onChange={e => handleAddressChange('recipient', 'cityStateZip', e.target.value)} placeholder="Their City, ST 67890" />
                  </div>
                </fieldset>
              </div>
              <Button onClick={generateStandardEnvelope} size="action" className="w-full md:w-auto" disabled={!isPdfLibReady}>
                <Printer size={18} className="mr-2"/> {isPdfLibReady ? "Generate Standard Envelope" : "Loading Tools..."}
              </Button>

              {showStandardPreview && (
                <div className="mt-6 p-4 border-2 border-dashed border-sky-300 rounded-lg bg-sky-50/50">
                  <h3 className="text-lg font-semibold text-sky-700 mb-3 text-center">Envelope Preview (#10)</h3>
                  <div 
                    className="relative w-full aspect-[9.5/4.125] bg-white border border-slate-400 shadow-md mx-auto max-w-2xl p-2 text-xs"
                    style={{ fontFamily: "'Courier New', Courier, monospace" }}
                  >
                    {/* Return Address */}
                    {returnAddress.name && (
                        <div className="absolute top-3 left-3 leading-tight">
                        <div>{returnAddress.name}</div>
                        <div>{returnAddress.street}</div>
                        <div>{returnAddress.cityStateZip}</div>
                        </div>
                    )}

                    {/* Stamp Area */}
                    <div className="absolute top-2 right-2 w-10 h-10 border border-slate-300 flex items-center justify-center text-slate-400 text-[0.6rem]">
                        STAMP
                    </div>

                    {/* Recipient Address */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center leading-relaxed w-1/2">
                        <div className="font-semibold">{recipientAddress.name}</div>
                        <div>{recipientAddress.street}</div>
                        <div>{recipientAddress.cityStateZip}</div>
                    </div>

                    {/* POSTNET Barcode Placeholder */}
                    {getPostnetBarcode(recipientAddress.cityStateZip) && (
                        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 text-center text-sm tracking-[0.15em]">
                        {getPostnetBarcode(recipientAddress.cityStateZip)}
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
              <Button onClick={generateNameOnlyEnvelope} size="action" className="w-full md:w-auto" disabled={!isPdfLibReady}>
                <Printer size={18} className="mr-2"/> {isPdfLibReady ? "Generate Name-Only Envelope" : "Loading Tools..."}
              </Button>

              {showNameOnlyPreview && (
                 <div className="mt-6 p-4 border-2 border-dashed border-sky-300 rounded-lg bg-sky-50/50">
                  <h3 className="text-lg font-semibold text-sky-700 mb-3 text-center">Envelope Preview (Name-Only)</h3>
                  <div 
                    className="relative w-full aspect-[9.5/4.125] bg-white border border-slate-400 shadow-md mx-auto max-w-2xl p-2 flex items-center justify-center"
                    style={{ fontFamily: "'Courier New', Courier, monospace" }}
                  >
                    <div className="text-center text-lg font-semibold">
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

    