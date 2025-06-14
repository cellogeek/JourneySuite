
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DollarSign, AlertCircle } from 'lucide-react';

const parseCurrency = (value: string | number): number => {
    if (typeof value !== 'string') {
        value = String(value);
    }
    return parseFloat(value.replace(/,/g, '')) || 0;
};

interface LocationData {
    name: string;
    totalTexasSales: number;
    taxableSales: number;
    taxablePurchases: number;
}

interface CalculatedData {
    totalGrossSales: string;
    totalTaxableSales: string;
    totalTaxDue: string;
    locations: LocationData[];
}

const SalesTaxRunnerPage = ({ pageId }: { pageId: string }) => {
    const [canyonNetSales, setCanyonNetSales] = useState('');
    const [canyonSalesTax, setCanyonSalesTax] = useState('');
    const [polkNetSales, setPolkNetSales] = useState('');
    const [polkSalesTax, setPolkSalesTax] = useState('');
    const [calculatedData, setCalculatedData] = useState<CalculatedData | null>(null);
    const [error, setError] = useState('');

    // Client-side state for animation triggering
    const [showResults, setShowResults] = useState(false);
    const [showError, setShowError] = useState(false);

    useEffect(() => {
      if (calculatedData) {
        setShowResults(true);
        setShowError(false);
      }
    }, [calculatedData]);

    useEffect(() => {
      if (error) {
        setShowError(true);
        setShowResults(false);
      }
    }, [error]);


    const handleCalculate = () => {
        setError('');
        setCalculatedData(null);
        setShowResults(false);
        setShowError(false);

        // Simulate async operation for animation
        setTimeout(() => {
            const locationsInput = {
                "Canyon": { netSales: parseCurrency(canyonNetSales), salesTax: parseCurrency(canyonSalesTax) },
                "Polk": { netSales: parseCurrency(polkNetSales), salesTax: parseCurrency(polkSalesTax) }
            };

            if (Object.values(locationsInput).every(loc => loc.netSales === 0 && loc.salesTax === 0)) {
                setError("Please enter values in at least one field for at least one location.");
                return;
            }

            try {
                let totalGrossSales = 0, totalTaxableSales = 0, totalTaxDue = 0;
                const locationDetails: LocationData[] = Object.keys(locationsInput).map(name => {
                    const loc = locationsInput[name as keyof typeof locationsInput];
                    if (loc.netSales === 0 && loc.salesTax === 0 && (name === "Canyon" ? (canyonNetSales === '' && canyonSalesTax === '') : (polkNetSales === '' && polkSalesTax === ''))) {
                        // Skip if all fields for this location are truly empty and not just zeroed out by parseCurrency
                        if((name === "Canyon" && (canyonNetSales !== '' || canyonSalesTax !== '')) || (name === "Polk" && (polkNetSales !== '' || polkSalesTax !== ''))) {
                            // If some fields were entered but resulted in 0, it might be an error or intentional.
                            // For now, we proceed, but this logic could be refined.
                        } else {
                            return null;
                        }
                    }

                    const roundedTotalTexasSales = Math.round(loc.netSales);
                    const taxableSales = loc.salesTax / 0.0825;
                    const roundedTaxableSales = Math.round(taxableSales);

                    if (loc.netSales > 0 && roundedTaxableSales > roundedTotalTexasSales) {
                         throw new Error(`For ${name}, calculated taxable sales ($${roundedTaxableSales.toFixed(0)}) cannot exceed net sales ($${roundedTotalTexasSales.toFixed(0)}). Please check your sales tax input.`);
                    }
                    if (loc.salesTax > 0 && loc.netSales === 0) {
                        throw new Error(`For ${name}, sales tax was entered, but net sales are zero. Please verify your inputs.`);
                    }


                    totalGrossSales += roundedTotalTexasSales;
                    totalTaxableSales += roundedTaxableSales;
                    totalTaxDue += loc.salesTax;
                    return { name, totalTexasSales: roundedTotalTexasSales, taxableSales: roundedTaxableSales, taxablePurchases: 0 };
                }).filter(Boolean) as LocationData[];

                if (locationDetails.length === 0 && !(Object.values(locationsInput).every(loc => loc.netSales === 0 && loc.salesTax === 0))) {
                    // This case implies inputs were made but filtered out, likely an issue with zero values not being explicitly handled if needed.
                    // However, the initial check for all zeros should catch empty form.
                }


                setCalculatedData({
                    totalGrossSales: totalGrossSales.toFixed(2),
                    totalTaxableSales: totalTaxableSales.toFixed(2),
                    totalTaxDue: totalTaxDue.toFixed(2),
                    locations: locationDetails
                });
            } catch (e: any) {
                setError(e.message || "An unexpected error occurred during calculation.");
                console.error(e);
            }
        }, 100); // Short delay
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Sales Tax Runner</CardTitle>
                    <CardDescription className="text-lg text-slate-500 pt-1">
                        A financial tool for Journey Coffee.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <Button
                        variant="secondary"
                        size="action"
                        asChild
                        className="py-3 px-6 text-lg"
                    >
                        <a href="https://salestax.app.cpa.state.tx.us/?&taxType=26&taxpayerId=32067646128&taxSubType=10" target="_blank" rel="noopener noreferrer">
                            Go to TX Webfile
                        </a>
                    </Button>
                </CardContent>
            </Card>

            <Card className="content-fade-in-up" style={{ animationDelay: '150ms' }}>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-slate-900">1. Enter Sales Figures</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <fieldset className="border border-brand-slate-200 p-4 rounded-xl">
                            <legend className="text-lg font-semibold px-2 text-brand-text-legend">Canyon</legend>
                            <div className="space-y-4 mt-2">
                                <div>
                                    <Label htmlFor="canyonNetSales" className="flex items-center mb-1">
                                        <DollarSign size={16} className="mr-2 text-slate-400" /> Net Sales
                                    </Label>
                                    <Input type="number" id="canyonNetSales" value={canyonNetSales} onChange={(e) => setCanyonNetSales(e.target.value)} placeholder="e.g., 47680.79" />
                                </div>
                                <div>
                                    <Label htmlFor="canyonSalesTax" className="flex items-center mb-1">
                                        <DollarSign size={16} className="mr-2 text-slate-400" /> Sales Tax Collected
                                    </Label>
                                    <Input type="number" id="canyonSalesTax" value={canyonSalesTax} onChange={(e) => setCanyonSalesTax(e.target.value)} placeholder="e.g., 3719.35" />
                                </div>
                            </div>
                        </fieldset>
                        <fieldset className="border border-brand-slate-200 p-4 rounded-xl">
                            <legend className="text-lg font-semibold px-2 text-brand-text-legend">Polk</legend>
                            <div className="space-y-4 mt-2">
                                <div>
                                    <Label htmlFor="polkNetSales" className="flex items-center mb-1">
                                        <DollarSign size={16} className="mr-2 text-slate-400" /> Net Sales
                                    </Label>
                                    <Input type="number" id="polkNetSales" value={polkNetSales} onChange={(e) => setPolkNetSales(e.target.value)} placeholder="e.g., 11337.54" />
                                </div>
                                <div>
                                    <Label htmlFor="polkSalesTax" className="flex items-center mb-1">
                                        <DollarSign size={16} className="mr-2 text-slate-400" /> Sales Tax Collected
                                    </Label>
                                    <Input type="number" id="polkSalesTax" value={polkSalesTax} onChange={(e) => setPolkSalesTax(e.target.value)} placeholder="e.g., 888.54" />
                                </div>
                            </div>
                        </fieldset>
                    </div>
                    <div className="text-center mt-8">
                        <Button onClick={handleCalculate} size="action">
                            Calculate
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {showError && error && (
                <Alert variant="destructive" className="content-fade-in-up">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {showResults && calculatedData && (
                <div className="content-fade-in-up" style={{ animationDelay: '300ms' }}>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold text-slate-900">2. Copy Your Results</CardTitle>
                    </CardHeader>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <Card className="bg-white/60 backdrop-blur-xl p-4 rounded-xl border shadow-lg text-center">
                            <Label className="text-sm font-medium text-slate-500 block">Total Sales (All Locations)</Label>
                            <p className="text-2xl font-bold text-slate-900 mt-1">${calculatedData.totalGrossSales}</p>
                        </Card>
                        <Card className="bg-white/60 backdrop-blur-xl p-4 rounded-xl border shadow-lg text-center">
                            <Label className="text-sm font-medium text-slate-500 block">Total Taxable Sales (All Locations)</Label>
                            <p className="text-2xl font-bold text-slate-900 mt-1">${calculatedData.totalTaxableSales}</p>
                        </Card>
                        <Card className="bg-white/60 backdrop-blur-xl p-4 rounded-xl border shadow-lg text-center">
                            <Label className="text-sm font-medium text-slate-500 block">Total Tax Due (All Locations)</Label>
                            <p className="text-2xl font-bold text-slate-900 mt-1">${calculatedData.totalTaxDue}</p>
                        </Card>
                    </div>
                    <Card className="content-fade-in-up" style={{ animationDelay: '450ms' }}>
                        <CardContent className="p-0 sm:p-2">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Location</TableHead>
                                            <TableHead className="text-center">Total Texas Sales (Rounded)</TableHead>
                                            <TableHead className="text-center">Taxable Sales (Rounded)</TableHead>
                                            <TableHead className="text-center">Taxable Purchases</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {calculatedData.locations.map((loc) => (
                                            <TableRow key={loc.name}>
                                                <TableCell className="font-semibold text-slate-800">{loc.name}</TableCell>
                                                <TableCell><Input type="text" value={loc.totalTexasSales.toFixed(0)} readOnly className="text-center bg-slate-100/70 border-slate-300/70" /></TableCell>
                                                <TableCell><Input type="text" value={loc.taxableSales.toFixed(0)} readOnly className="text-center bg-slate-100/70 border-slate-300/70" /></TableCell>
                                                <TableCell><Input type="text" value={loc.taxablePurchases.toFixed(0)} readOnly className="text-center bg-slate-100/70 border-slate-300/70" /></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default SalesTaxRunnerPage;

    