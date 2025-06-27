"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarDays, User, DollarSign, MessageSquare, Upload, FileText } from 'lucide-react';

// CDN URLs for the PDF libraries
const JSPDF_SCRIPT_URL = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
const PDFJS_SCRIPT_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.min.js';
const PDFJS_WORKER_URL = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js`;


// Helper Function (Unchanged)
const numberToWords = (num: string | number): string => {
    if (num === null || num === undefined || num === '' || isNaN(parseFloat(String(num)))) return '';
    const s = parseFloat(String(num)).toFixed(2);
    const [dollars, cents] = s.split('.');
    
    const a = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    const inWords = (nStr: string): string => {
        if (!nStr || nStr === "0") return '';
        let numInt = parseInt(nStr, 10);

        if (numInt === 0) return 'zero';

        const toWords = (n: number): string => {
            if (n === 0) return '';
            if (n < 20) return a[n];
            const digit = n % 10;
            const ten = Math.floor(n / 10);
            return `${b[ten]}${digit ? '-' + a[digit] : ''}`;
        };

        let words = '';
        if (numInt >= 1000000000) {
            words += inWords(String(Math.floor(numInt / 1000000000))) + ' billion ';
            numInt %= 1000000000;
        }
        if (numInt >= 1000000) {
            words += inWords(String(Math.floor(numInt / 1000000))) + ' million ';
            numInt %= 1000000;
        }
        if (numInt >= 1000) {
            words += inWords(String(Math.floor(numInt / 1000))) + ' thousand ';
            numInt %= 1000;
        }
        if (numInt >= 100) {
            words += a[Math.floor(numInt / 100)] + ' hundred ';
            numInt %= 100;
        }
        if (numInt > 0) {
            words += toWords(numInt);
        }
        return words.trim();
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

const CheckWriterPage = ({ pageId }: { pageId: string }) => {
    const [checkData, setCheckData] = useState<CheckData>({
        payee: '',
        amount: '',
        memo: '',
        date: new Date().toISOString().split('T')[0],
    });
    
    const [parsedChecks, setParsedChecks] = useState<CheckData[]>([]);
    const [amountInWords, setAmountInWords] = useState('');
    const [isParsing, setIsParsing] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPdfLibReady, setIsPdfLibReady] = useState(false);

    useEffect(() => {
        const loadScript = (src: string) => {
            return new Promise<void>((resolve, reject) => {
                if (document.querySelector(`script[src="${src}"]`)) {
                    return resolve();
                }
                const script = document.createElement('script');
                script.src = src;
                script.async = true;
                script.onload = () => resolve();
                script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
                document.body.appendChild(script);
            });
        };

        Promise.all([loadScript(JSPDF_SCRIPT_URL), loadScript(PDFJS_SCRIPT_URL)])
            .then(() => {
                if ((window as any).pdfjsLib?.GlobalWorkerOptions) {
                    (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
                }
                setIsPdfLibReady(true);
            })
            .catch(error => console.error("Error loading PDF scripts from CDN:", error));
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

    const parseGustoPdf = (textContent: any): CheckData | null => {
        // This function logic is self-contained and remains unchanged.
        const items = textContent.items.map((item: any) => item.str.trim());
        let payee = 'N/A', amount = 'N/A', date = 'N/A', memo = 'N/A';

        try {
            const toIndex = items.findIndex(item => item === 'TO');
            const amountIndex = items.findIndex(item => item === 'Amount:');
            const dateIndex = items.findIndex(item => item === 'Date:');
            const memoLine = items.find(item => item.startsWith('Pay period:'));

            if (toIndex > -1 && items[toIndex + 1]) payee = items[toIndex + 1];
            if (amountIndex > -1 && items[amountIndex + 1]) amount = items[amountIndex + 1].replace('$', '').trim();
            if (dateIndex > -1 && items[dateIndex + 1]) date = items[dateIndex + 1];
            if (memoLine) memo = memoLine;
            
            if (payee !== 'N/A' && amount !== 'N/A' && date !== 'N/A') {
                return { payee, amount, date, memo };
            }
        } catch (e) {
            console.error("Error while parsing text items:", e);
            return null;
        }
        return null;
    };

    async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        // More robust check
        if (!file || !isPdfLibReady || typeof (window as any).pdfjsLib?.getDocument === 'undefined') {
            alert("PDF engine is not ready. Please wait a moment and try again.");
            return;
        }

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
                    const parsedData = parseGustoPdf(textContent);
                    if (parsedData) checks.push(parsedData);
                }
                setParsedChecks(prevChecks => [...prevChecks, ...checks]);
            } catch (error) {
                console.error("Error parsing PDF:", error);
                alert("Failed to parse PDF. Please ensure it's a valid Gusto payroll PDF.");
            } finally {
                setIsParsing(false);
            }
        };
        reader.readAsArrayBuffer(file);
    }

    const drawCheck = (doc: any, data: CheckData) => {
        // Horizontal offset: 1/16 inch = 0.0625
        const xOffset = 0.075;
        // Vertical offset: 1/8 inch = 0.125
        const yOffset = 0.124;
    
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
    
        const inputDate = new Date(data.date + 'T00:00:00');
        const formattedDate = `${inputDate.getMonth() + 1}/${inputDate.getDate()}/${inputDate.getFullYear()}`;
    
        doc.setFontSize(10);
        // Applied both xOffset and yOffset
        doc.text(formattedDate, 7.05 + xOffset, 0.725 + yOffset);
        doc.text(data.payee.toUpperCase(), 0.73 + xOffset, 1.26 + yOffset);
    
        doc.setFontSize(11);
        doc.text(`$${parseFloat(data.amount || "0").toFixed(2)}`, 7.25 + xOffset, 1.26 + yOffset);
    
        doc.setFontSize(10);
        doc.text(numberToWords(data.amount), 0.73 + xOffset, 1.58 + yOffset);
        doc.text(data.memo.toUpperCase(), 0.59 + xOffset, 2.63 + yOffset);
    
        doc.setFontSize(8);
        doc.text('VOID AFTER 60 DAYS', 7.25 + xOffset, 1.85 + yOffset, { align: 'center' });
    };
    
    // --- Defensive PDF Generation Functions ---
    const generateSinglePdf = () => {
        if (!isPdfLibReady || typeof (window as any).jspdf?.jsPDF === 'undefined') {
            alert("PDF engine is not ready. Please wait a moment and try again.");
            return;
        }
        
        setIsGenerating(true);
        try {
            const { jsPDF } = (window as any).jspdf;
            const doc = new jsPDF({ orientation: 'portrait', unit: 'in', format: 'letter' });
            drawCheck(doc, checkData);
            doc.save(`check-to-${checkData.payee.replace(/[^a-zA-Z0-9]/g, '_') || 'payee'}.pdf`);
            alert('Single check PDF generated successfully!');
        } catch (error) {
            console.error("Failed to generate single PDF:", error);
            alert("An error occurred while generating the PDF. Please check the console for details.");
        } finally {
            setIsGenerating(false);
        }
    };

    const generateBatchPdf = () => {
        if (!isPdfLibReady || typeof (window as any).jspdf?.jsPDF === 'undefined') {
            alert("PDF engine is not ready. Please wait a moment and try again.");
            return;
        }
        
        setIsGenerating(true);
        try {
            const { jsPDF } = (window as any).jspdf;
            const doc = new jsPDF({ orientation: 'portrait', unit: 'in', format: 'letter' });

            parsedChecks.forEach((check, index) => {
                if (index > 0) doc.addPage();
                drawCheck(doc, check);
            });

            doc.save('Gusto-Batch-Checks.pdf');
            alert('Batch PDF with ' + parsedChecks.length + ' check(s) generated successfully!');
        } catch (error) {
            console.error("Failed to generate batch PDF:", error);
            alert("An error occurred while generating the batch PDF. Please check the console for details.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    const getButtonText = (baseText: string) => {
        if (!isPdfLibReady) return 'Loading PDF Library...';
        if (isGenerating) return 'Generating...';
        return baseText;
    };

    return (
        <div className="space-y-8">
             {/* JSX is unchanged, but the functions it calls are now safer */}
            <Card className="content-fade-in-up">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Check Writer</CardTitle>
                    <CardDescription className="text-lg text-slate-500 pt-1">A Journey Canyon LLC Application</CardDescription>
                </CardHeader>
            </Card>

            <Card className="content-fade-in-up" style={{ animationDelay: '150ms' }}>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-slate-900">Batch Process from PDF</CardTitle>
                </CardHeader>
                <CardContent>
                    <Label htmlFor="pdf-upload" className="flex items-center gap-2 mb-2 text-sm font-semibold">
                        <Upload size={16} className="text-slate-400" /> Upload Gusto Payroll PDF
                    </Label>
                    <Input type="file" id="pdf-upload" accept=".pdf" onChange={handleFileChange} disabled={!isPdfLibReady || isParsing || isGenerating} />
                    {isParsing && <p className="text-slate-500 mt-2">Parsing PDF...</p>}
                    {!isPdfLibReady && <p className="text-slate-500 mt-2">Initializing PDF engine...</p>}
                    
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
                            <Button onClick={generateBatchPdf} disabled={!isPdfLibReady || isGenerating || isParsing} className="w-full mt-4">
                                {getButtonText(`Generate Batch PDF (${parsedChecks.length} Checks)`)}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-3 content-fade-in-up" style={{ animationDelay: '300ms' }}>
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-slate-900">Single Check Details</CardTitle>
                    </CardHeader>
                    <CardContent>
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
                        <div className="border-t mt-6 pt-4">
                           <p className="text-sm text-slate-600 font-medium">Amount in words:</p>
                           <p className="text-sm text-slate-800 h-10 flex items-center p-2 bg-slate-50 rounded-md">{amountInWords || ' '}</p>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4 mt-8">
                            <Button 
                                onClick={generateSinglePdf} 
                                disabled={!checkData.payee || !checkData.amount || !isPdfLibReady || isGenerating || isParsing}
                                variant="default"
                                className="w-full"
                            >
                                {getButtonText('Generate Final PDF')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default CheckWriterPage;