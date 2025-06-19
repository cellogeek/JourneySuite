
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarDays, User, DollarSign, MessageSquare, Save, Zap } from 'lucide-react';

// Helper Function to Convert Number to Words
const numberToWords = (num: string | number): string => {
    if (num === null || num === undefined || num === '' || isNaN(parseFloat(String(num)))) return '';
    const s = parseFloat(String(num)).toFixed(2);
    const [dollars, cents] = s.split('.');
    const a = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    
    const toWords = (nStr: string): string => {
        const n = parseInt(nStr, 10);
        if (n === 0) return ''; // Handle case where a part is zero
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
        return 'Number too large'; // Or handle larger numbers if needed
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

const JSPDF_SCRIPT_URL = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';

const CheckWriterPage = ({ pageId }: { pageId: string }) => {
    const [checkData, setCheckData] = useState<CheckData>({
        payee: '',
        amount: '',
        memo: '',
        date: new Date().toISOString().split('T')[0],
    });

    const [recurringPayees, setRecurringPayees] = useState<RecurringPayee[]>([
        { id: 1, payee: 'POLK STREET PARAMOUNT LLC', amount: '3641.51', memo: 'MONTHLY RENT' },
        { id: 2, payee: 'CITY OF AMARILLO', amount: '250.78', memo: 'UTILITIES' },
        { id: 3, payee: 'US FOODS', amount: '', memo: 'WEEKLY INVENTORY' },
    ]);

    const [amountInWords, setAmountInWords] = useState('');
    const [isPdfLibReady, setIsPdfLibReady] = useState(false);

    useEffect(() => {
        if ((window as any).jspdf) {
            setIsPdfLibReady(true);
            return;
        }
        if (document.querySelector(`script[src="${JSPDF_SCRIPT_URL}"]`)) {
            // Script tag already exists, jsPDF might still be loading
            // We can rely on an interval check or assume onload will fire for existing script
            // For simplicity, if tag exists, assume it will handle loading.
            // An alternative is to add a global flag that script.onload sets.
            if ((window as any).jspdf) setIsPdfLibReady(true); // Check again in case it loaded fast
            return;
        }
        const script = document.createElement('script');
        script.src = JSPDF_SCRIPT_URL;
        script.async = true;
        script.onload = () => {
            setIsPdfLibReady(true);
            console.log("jsPDF loaded for CheckWriterPage");
        };
        script.onerror = () => {
            console.error("Failed to load jsPDF script for CheckWriterPage.");
            // Optionally set an error state here to inform the user
        };
        document.body.appendChild(script);
        
        return () => { 
            // It's generally not recommended to remove scripts that might be shared or used by other components
            // unless you have a more sophisticated script loading/management system.
            // If this component is the *only* one loading it, then removal is safer.
            // For now, we'll leave it, as EnvelopePrinter also uses it.
            // if (script.parentNode) script.parentNode.removeChild(script); 
        };
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

    const handleSaveRecurring = () => {
        const newRecurringPayee = {
            id: Date.now(), // Simple ID generation for stub
            payee: checkData.payee,
            amount: checkData.amount,
            memo: checkData.memo,
        };
        // TODO: Call Firebase function to save recurring payee
        setRecurringPayees(prev => [...prev, newRecurringPayee]);
        alert(`(Stubbed) Saved "${checkData.payee}" as a recurring check.`);
    };

    const loadRecurring = (payeeToLoad: RecurringPayee) => {
        setCheckData({
            payee: payeeToLoad.payee,
            amount: payeeToLoad.amount,
            memo: payeeToLoad.memo,
            date: new Date().toISOString().split('T')[0]
        });
    };

    const generatePdf = () => {
        if (!isPdfLibReady || !(window as any).jspdf) {
            alert("PDF library is not ready yet. Please wait a moment and try again.");
            return;
        }
        const { jsPDF } = (window as any).jspdf;
        const doc = new jsPDF({ orientation: 'portrait', unit: 'in', format: 'letter' });
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.setDrawColor(0, 0, 0);

        const threePixels = 0.0414; 
        const payeeX_base = 0.73, payeeY_base = 1.26, amountWordsX_base = 0.73, amountWordsY_base = 1.58, memoX_base = 0.59, memoY_base = 2.63, dateX_base = 7.05, dateLabelX_base = 6.55, dateY_base = 0.725, amountBoxX_base = 7.0, amountTextX_base = 7.25, amountBoxY_base = 1.13, voidX_base = 7.25, voidY_base = 1.85;
        
        const horizontalShift = threePixels;

        const payeeX = payeeX_base + horizontalShift, payeeY = payeeY_base, amountWordsX = amountWordsX_base + horizontalShift, amountWordsY = amountWordsY_base, memoX = memoX_base + horizontalShift, memoY = memoY_base;
        const amountBoxX = amountBoxX_base + horizontalShift, amountTextX = amountTextX_base + horizontalShift, amountBoxY = amountBoxY_base - threePixels, amountBoxHeight = 0.2 + (0.0138 * 2);
        const dateX = dateX_base + horizontalShift, dateY = dateY_base, dateLabelX = dateLabelX_base + horizontalShift;
        const voidX = voidX_base + horizontalShift, voidY = voidY_base;
        
        const memoLineStartX = memoX - (1/3), memoLineEndX = (memoX + 4.5) - (1/3) - (1/4), amountWordsLineEndX = (8.5 - 0.5) - (1/3);

        const inputDate = new Date(checkData.date + 'T00:00:00'); 
        const formattedDate = `${inputDate.getMonth() + 1}/${inputDate.getDate()}/${inputDate.getFullYear()}`;

        doc.setLineWidth(0.015);

        doc.setFontSize(10);
        doc.text('DATE', dateLabelX, dateY);
        doc.text(formattedDate, dateX, dateY);
        doc.line(dateLabelX + doc.getTextWidth('DATE'), dateY + 0.05, dateX + doc.getTextWidth(formattedDate) + (1/3), dateY + 0.05);

        doc.text(checkData.payee.toUpperCase(), payeeX, payeeY);
        doc.line(payeeX, payeeY + 0.05, payeeX + 5.0, payeeY + 0.05); 

        doc.setFontSize(11);
        doc.text(`${parseFloat(checkData.amount || "0").toFixed(2)}`, amountTextX, payeeY);
        doc.setFontSize(10);
        doc.rect(amountBoxX, amountBoxY, 1.2, amountBoxHeight, 'S'); 

        doc.text(amountInWords, amountWordsX, amountWordsY);
        doc.line(amountWordsX, amountWordsY + 0.05, amountWordsLineEndX, amountWordsY + 0.05); 

        doc.text(checkData.memo.toUpperCase(), memoX, memoY);
        doc.line(memoLineStartX, memoY + 0.05, memoLineEndX, memoY + 0.05); 

        doc.setFontSize(8);
        doc.text('VOID AFTER 60 DAYS', voidX, voidY, { align: 'center' });
        
        doc.save(`check-to-${checkData.payee.replace(/[^a-zA-Z0-9]/g, '_') || 'payee'}.pdf`);
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 content-fade-in-up" style={{ animationDelay: '150ms' }}>
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-slate-900">Check Details</CardTitle>
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
                        <div className="flex flex-col md:flex-row gap-4 mt-8">
                            <Button 
                                onClick={generatePdf} 
                                disabled={!checkData.payee || !checkData.amount || !isPdfLibReady}
                                variant="default"
                                size="action"
                                className="w-full"
                            >
                                {isPdfLibReady ? 'Generate Final PDF' : 'Loading PDF Library...'}
                            </Button>
                            <Button 
                                onClick={handleSaveRecurring} 
                                disabled={!checkData.payee}
                                variant="secondary"
                                size="action"
                                className="w-full"
                            >
                                <Save size={18} className="mr-2" /> Save as Recurring
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="content-fade-in-up" style={{ animationDelay: '300ms' }}>
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-slate-900">Recurring Checks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[360px] pr-3">
                            <div className="space-y-3">
                                {recurringPayees.length > 0 ? recurringPayees.map(p => (
                                    <Card key={p.id} className="bg-white/60 backdrop-blur-lg p-4 rounded-xl border shadow-md hover:shadow-sky-500/10 transition-shadow">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex-grow">
                                                <p className="text-base font-bold text-slate-800 truncate" title={p.payee}>{p.payee}</p>
                                                <p className="text-sm font-medium text-slate-500 truncate" title={p.memo}>{p.memo || 'No memo'}</p>
                                            </div>
                                            <Button 
                                                onClick={() => loadRecurring(p)} 
                                                variant="ghost" 
                                                size="icon" 
                                                className="flex-shrink-0 text-sky-600 hover:bg-sky-500/10 h-9 w-9"
                                                aria-label={`Load check for ${p.payee}`}
                                            >
                                                <Zap size={18}/>
                                            </Button>
                                        </div>
                                    </Card>
                                )) : (
                                    <p className="text-slate-500 text-center py-4">No recurring checks saved yet.</p>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default CheckWriterPage;
