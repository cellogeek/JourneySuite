"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarDays, User, DollarSign, MessageSquare, Save, Zap, Upload, FileText } from 'lucide-react';

// Helper Function to Convert Number to Words (no changes needed here)
const numberToWords = (num: string | number): string => {
    if (num === null || num === undefined || num === '' || isNaN(parseFloat(String(num)))) return '';
    const s = parseFloat(String(num)).toFixed(2);
    const [dollars, cents] = s.split('.');
    const a = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    
    const toWords = (nStr: string): string => {
        const n = parseInt(nStr, 10);
        if (n === 0) return '';
        if (n < 20) return a[n];
        const digit = n % 10;
        const ten = Math.floor(n / 10);
        return `${b[ten]}${digit ? '-' + a[digit] : ''}`;
    };

    const inWords = (nStr: string): string => {
        if (!nStr || nStr === "0") return 'zero';
        let numInt = parseInt(nStr, 10);
        if (numInt < 1000) {
            if (numInt < 100) return toWords(String(numInt));
            const hundredsDigit = Math.floor(numInt / 100);
            const remainder = numInt % 100;
            return `${a[hundredsDigit]} hundred${remainder ? ' ' + toWords(String(remainder)) : ''}`;
        }
        if (numInt < 1000000) {
            const thousandsPart = Math.floor(numInt / 1000);
            const remainder = numInt % 1000;
            return `${inWords(String(thousandsPart))} thousand${remainder ? ' ' + inWords(String(remainder)) : ''}`;
        }
        return 'Number too large';
    };

    const dollarsText = dollars === "0" ? 'zero' : inWords(dollars);
    return `${dollarsText} and ${cents}/100`.toUpperCase();
};


interface CheckData {
    payee: string;
    amount: string;
    memo: string;
    date: string;
}

interface RecurringPayee {
    id: number;
    payee: string;
    amount: string;
    memo: string;
}

// URLs for the PDF libraries
const JSPDF_SCRIPT_URL = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
const PDFJS_SCRIPT_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.min.js';

const CheckWriterPage = ({ pageId }: { pageId: string }) => {
    const [checkData, setCheckData] = useState<CheckData>({
        payee: '',
        amount: '',
        memo: '',
        date: new Date().toISOString().split('T')[0],
    });
    
    // New state to hold the parsed data from the PDF
    const [parsedChecks, setParsedChecks] = useState<CheckData[]>([]);
    const [recurringPayees, setRecurringPayees] = useState<RecurringPayee[]>([]);
    const [amountInWords, setAmountInWords] = useState('');
    const [isPdfLibReady, setIsPdfLibReady] = useState(false);
    const [isParsing, setIsParsing] = useState(false);

    useEffect(() => {
        const loadScripts = async () => {
            if ((window as any).jspdf && (window as any).pdfjsLib) {
                // Ensure worker is set even if libs were loaded previously
                if ((window as any).pdfjsLib.GlobalWorkerOptions && !(window as any).pdfjsLib.GlobalWorkerOptions.workerSrc) {
                     (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js`;
                }
                setIsPdfLibReady(true);
                return;
            }

            const loadScript = (src: string, globalVar: string) => {
                return new Promise((resolve, reject) => {
                    // If the library is already on the window object, we're good.
                    if ((window as any)[globalVar]) {
                        return resolve(true);
                    }

                    const existingScript = document.querySelector(`script[src="${src}"]`);
                    // If script tag exists, but lib is not on window, poll for it.
                    if (existingScript) {
                        const interval = setInterval(() => {
                            if ((window as any)[globalVar]) {
                                clearInterval(interval);
                                resolve(true);
                            }
                        }, 100);
                        // Timeout to prevent an infinite loop
                        setTimeout(() => {
                            clearInterval(interval);
                            // Check one last time before rejecting
                            if (!(window as any)[globalVar]) {
                                reject(new Error(`Timed out waiting for script to be ready: ${src}`));
                            } else {
                                resolve(true);
                            }
                        }, 10000); // 10 second timeout
                        return;
                    }

                    // Otherwise, create and append the script tag
                    const script = document.createElement('script');
                    script.src = src;
                    script.async = true;
                    script.onload = () => resolve(true);
                    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
                    document.body.appendChild(script);
                });
            };

            try {
                await Promise.all([
                    loadScript(JSPDF_SCRIPT_URL, 'jspdf'),
                    loadScript(PDFJS_SCRIPT_URL, 'pdfjsLib'),
                ]);

                // Now that we're sure the scripts are loaded and ready, set the worker
                if ((window as any).pdfjsLib?.GlobalWorkerOptions) {
                    (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js`;
                } else {
                    // This case should ideally not be reached with the new loader
                    console.error("pdf.js loaded, but GlobalWorkerOptions is missing.");
                }
                
                setIsPdfLibReady(true);
                console.log("jsPDF and pdf.js loaded and configured");
            } catch (error) {
                console.error("Error loading PDF scripts:", error);
            }
        };
        loadScripts();
    }, []);

    useEffect(() => {
        setAmountInWords(numberToWords(checkData.amount));
    }, [checkData.amount]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'amount' && value && !/^\d*\.?\d{0,2}$/.test(value)) {
            return;
        }
        setCheckData(prev => ({ ...prev, [name]: value }));
    };

  // New function to parse the text from a single page of the Gusto PDF
  const parseGustoPdf = (pageText: string): CheckData | null => {
    // This updated regex specifically looks for a name (letters and spaces) after "TO"
    const payeeRegex = /TO\s+([A-Za-z\s]+)\n/;
    const amountRegex = /Amount: \$(.+)/;
    const dateRegex = /Date: (.+)/;
    // The memo can be derived from the pay period
    const memoRegex = /Pay period: (.+)/;

    const payeeMatch = pageText.match(payeeRegex);
    const amountMatch = pageText.match(amountRegex);
    const dateMatch = pageText.match(dateRegex);
    const memoMatch = pageText.match(memoRegex);

    // This logic remains the same, but will now work correctly with the improved regex
    if (payeeMatch && amountMatch && dateMatch) {
        return {
            payee: payeeMatch[1].trim(),
            amount: amountMatch[1].trim(),
            date: dateMatch[1].trim(),
            memo: memoMatch ? `Pay Period: ${memoMatch[1].trim()}` : 'Payroll',
        };
    }
    console.warn("Could not parse check data from page. Text content:", pageText);
    return null;
  };

    // New function to handle the uploaded PDF file
    async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsParsing(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const pdfData = new Uint8Array(e.target?.result as ArrayBuffer);
                const pdf = await (window as any).pdfjsLib.getDocument({ data: pdfData }).promise;
                const checks: CheckData[] = [];

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map((item: any) => item.str).join('\n');

                    const parsedData = parseGustoPdf(pageText);
                    if (parsedData) {
                        checks.push(parsedData);
                    }
                }
                setParsedChecks(checks);
            } catch (error) {
                console.error("Error parsing PDF:", error);
                alert("Failed to parse PDF. Please ensure it's a valid Gusto payroll PDF.");
            } finally {
                setIsParsing(false);
            }
        };
        reader.readAsArrayBuffer(file);
    }

    // Refactored function to draw a single check on a jsPDF document
    const drawCheck = (doc: any, data: CheckData) => {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.setDrawColor(0, 0, 0);

        const payeeX = 0.73, payeeY = 1.26;
        const amountWordsX = 0.73, amountWordsY = 1.58;
        const memoX = 0.59, memoY = 2.63;
        const dateX = 7.05, dateY = 0.725;
        const amountBoxX = 7.0, amountTextX = 7.25, amountBoxY = 1.13;
        
        const inputDate = new Date(data.date + 'T00:00:00');
        const formattedDate = `${inputDate.getMonth() + 1}/${inputDate.getDate()}/${inputDate.getFullYear()}`;
        
        doc.setFontSize(10);
        doc.text(formattedDate, dateX, dateY);
        doc.text(data.payee.toUpperCase(), payeeX, payeeY);
        doc.setFontSize(11);
        doc.text(`$${parseFloat(data.amount || "0").toFixed(2)}`, amountTextX, payeeY);
        doc.rect(amountBoxX, amountBoxY, 1.2, 0.25, 'S');
        
        doc.setFontSize(10);
        doc.text(numberToWords(data.amount), amountWordsX, amountWordsY);
        doc.text(data.memo.toUpperCase(), memoX, memoY);
        doc.setFontSize(8);
        doc.text('VOID AFTER 60 DAYS', 7.25, 1.85, { align: 'center' });
    };

    const generateSinglePdf = () => {
        if (!isPdfLibReady || !(window as any).jspdf) {
            alert("PDF library is not ready. Please try again.");
            return;
        }
        const { jsPDF } = (window as any).jspdf;
        const doc = new jsPDF({ orientation: 'portrait', unit: 'in', format: 'letter' });
        
        drawCheck(doc, checkData);
        
        doc.save(`check-to-${checkData.payee.replace(/[^a-zA-Z0-9]/g, '_') || 'payee'}.pdf`);
    };

    // New function to generate a batch PDF from the parsed data
    const generateBatchPdf = () => {
        if (!isPdfLibReady || !(window as any).jspdf) {
            alert("PDF library is not ready. Please try again.");
            return;
        }
        if (parsedChecks.length === 0) {
            alert("No parsed check data to generate a batch PDF.");
            return;
        }

        const { jsPDF } = (window as any).jspdf;
        const doc = new jsPDF({ orientation: 'portrait', unit: 'in', format: 'letter' });

        parsedChecks.forEach((check, index) => {
            if (index > 0) {
                doc.addPage();
            }
            drawCheck(doc, check);
        });

        doc.save('Gusto-Batch-Checks.pdf');
    };

    return (
        <div className="space-y-8">
            <Card className="content-fade-in-up" style={{ animationDelay: '0ms' }}>
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Check Writer</CardTitle>
                    <CardDescription className="text-lg text-slate-500 pt-1">
                        A Journey Canyon LLC Application
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* New Card for PDF Upload */}
            <Card className="content-fade-in-up" style={{ animationDelay: '150ms' }}>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-slate-900">Batch Process from PDF</CardTitle>
                </CardHeader>
                <CardContent>
                    <Label htmlFor="pdf-upload" className="flex items-center gap-2 mb-2 text-sm font-semibold">
                        <Upload size={16} className="text-slate-400" /> Upload Gusto Payroll PDF
                    </Label>
                    <Input type="file" id="pdf-upload" accept=".pdf" onChange={handleFileChange} disabled={!isPdfLibReady || isParsing}/>
                    {isParsing && <p className="text-slate-500 mt-2">Parsing PDF...</p>}
                    
                    {parsedChecks.length > 0 && (
                        <div className="mt-6">
                             <h3 className="text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2"><FileText size={18}/>Parsed Checks</h3>
                            <ScrollArea className="h-[200px] border rounded-md">
                               <div className="p-4 space-y-2">
                                {parsedChecks.map((check, index) => (
                                    <div key={index} className="text-sm p-2 rounded-md bg-slate-50">
                                        <p><strong>Payee:</strong> {check.payee}</p>
                                        <p><strong>Amount:</strong> ${check.amount}</p>
                                        <p><strong>Date:</strong> {check.date}</p>
                                    </div>
                                ))}
                                </div>
                            </ScrollArea>
                             <Button onClick={generateBatchPdf} disabled={!isPdfLibReady} className="w-full mt-4">
                                Generate Batch PDF from Parsed Data
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 content-fade-in-up" style={{ animationDelay: '300ms' }}>
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-slate-900">Single Check Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* The single check form remains the same */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="date" className="flex items-center gap-2 mb-1 text-sm font-semibold">
                                    <CalendarDays size={16} className="text-slate-400" />Date
                                </Label>
                                <Input type="date" name="date" id="date" value={checkData.date} onChange={handleInputChange} />
                            </div>
                            <div>
                                <Label htmlFor="amount" className="flex items-center gap-2 mb-1 text-sm font-semibold">
                                    <DollarSign size={16} className="text-slate-400" />Amount ($)
                                </Label>
                                <Input type="text" name="amount" id="amount" value={checkData.amount} onChange={handleInputChange} placeholder="e.g., 123.45"/>
                            </div>
                            <div className="md:col-span-2">
                                <Label htmlFor="payee" className="flex items-center gap-2 mb-1 text-sm font-semibold">
                                    <User size={16} className="text-slate-400" />Pay to the Order Of
                                </Label>
                                <Input type="text" name="payee" id="payee" value={checkData.payee} onChange={handleInputChange} placeholder="e.g., John Doe"/>
                            </div>
                            <div className="md:col-span-2">
                                <Label htmlFor="memo" className="flex items-center gap-2 mb-1 text-sm font-semibold">
                                    <MessageSquare size={16} className="text-slate-400" />Memo / For
                                </Label>
                                <Input type="text" name="memo" id="memo" value={checkData.memo} onChange={handleInputChange} placeholder="e.g., Invoice #123"/>
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4 mt-8">
                            <Button 
                                onClick={generateSinglePdf} 
                                disabled={!checkData.payee || !checkData.amount || !isPdfLibReady}
                                variant="default"
                                className="w-full"
                            >
                                {isPdfLibReady ? 'Generate Final PDF' : 'Loading PDF Library...'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default CheckWriterPage;

    