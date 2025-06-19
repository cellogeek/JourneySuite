
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { analyzeStatement, type AnalyzeStatementInput, type AnalyzeStatementOutput } from '@/ai/flows/analyze-statement-flow';
import { Progress } from "@/components/ui/progress";
import {
  Landmark, Edit, Trash2, PlusCircle, FileDown, Calculator, UploadCloud, FileArchive, CalendarIcon, Search, List, Brain, RefreshCw, Sparkles, Check, AlertTriangle, Loader2
} from 'lucide-react';

// TODO: Consider using react-hook-form for more robust form handling in the future.

interface Statement {
  id: string;
  fileName: string;
  uploadDate: string; // YYYY-MM-DD, when it was "uploaded" to the app
  statementDate: string; // YYYY-MM-DD, the actual date on the statement (e.g., period end date)
  // TODO: Add file storage URL or reference once backend is implemented
  aiSuggested?: boolean; // Flag if this statement was associated via AI
}

interface DebtEntry {
  id: string;
  name: string;
  type: 'Mortgage' | 'Line of Credit' | 'Term Loan' | 'Credit Card' | 'Other';
  securityType: 'Secured' | 'Unsecured' | 'Partially Secured';
  startingBalance: number;
  startingDate: string; // YYYY-MM-DD
  currentBalance: number;
  dueDate?: string; // YYYY-MM-DD
  paymentAmount: number;
  paymentFrequency: 'Monthly' | 'Bi-Weekly' | 'Weekly' | 'Annually' | 'Other';
  interestRate?: number; // Annual percentage rate
  termMonths?: number; // For term loans/mortgages
  remainingBalance: number;
  assumedPayoffDate?: string;
  statements?: Statement[];
}

const initialDebts: DebtEntry[] = [
  {
    id: 'debt1', name: 'Commercial Mortgage - Main St', type: 'Mortgage', securityType: 'Secured',
    startingBalance: 500000, startingDate: '2020-01-15', currentBalance: 450000, dueDate: '2050-01-15',
    paymentAmount: 2800, paymentFrequency: 'Monthly', interestRate: 3.5, termMonths: 360,
    remainingBalance: 450000, assumedPayoffDate: '2050-01-15', statements: [
        {id: 'stmt-ex1', fileName: 'Jan2024_Mortgage.pdf', uploadDate: '2024-02-01', statementDate: '2024-01-31'}
    ]
  },
  {
    id: 'debt2', name: 'Equipment Loan - Espresso Machine', type: 'Term Loan', securityType: 'Secured',
    startingBalance: 25000, startingDate: '2022-06-01', currentBalance: 15000, dueDate: '2027-06-01',
    paymentAmount: 450, paymentFrequency: 'Monthly', interestRate: 5.0, termMonths: 60,
    remainingBalance: 15000, assumedPayoffDate: '2027-06-01', statements: []
  },
  {
    id: 'debt3', name: 'Business Line of Credit', type: 'Line of Credit', securityType: 'Unsecured',
    startingBalance: 50000, startingDate: '2021-03-10', currentBalance: 20000,
    paymentAmount: 500, paymentFrequency: 'Monthly', interestRate: 7.25,
    remainingBalance: 20000, statements: []
  },
  {
    id: 'debt4', name: 'Company Credit Card', type: 'Credit Card', securityType: 'Unsecured',
    startingBalance: 0, startingDate: '2019-01-01', currentBalance: 3500,
    paymentAmount: 200, paymentFrequency: 'Monthly', interestRate: 18.9,
    remainingBalance: 3500, statements: []
  },
];

const defaultNewDebtEntry: Omit<DebtEntry, 'id' | 'remainingBalance' | 'statements'> = {
  name: '', type: 'Other', securityType: 'Unsecured', startingBalance: 0,
  startingDate: format(new Date(), "yyyy-MM-dd"), currentBalance: 0, paymentAmount: 0,
  paymentFrequency: 'Monthly', interestRate: 0, termMonths: 0,
};

// Interface for AI-analyzed file data
interface AnalyzedFile {
  file: File;
  originalIndex: number; // To keep track of the file if list reorders
  previewUrl?: string; // For image previews, if applicable
  suggestedDebtId: string | null;
  suggestedStatementDate: string | null;
  ocrTextSnippet?: string;
  confidence?: number;
  // User overrides
  actualDebtId: string;
  actualStatementDate?: Date; // Use Date object for DatePicker
  processingStatus: 'pending' | 'analyzing' | 'analyzed' | 'error' | 'saved';
  errorMessage?: string;
}


const DebtTrackerPage = ({ pageId }: { pageId: string }) => {
  const { toast } = useToast();
  const [debts, setDebts] = useState<DebtEntry[]>(initialDebts);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingDebt, setEditingDebt] = useState<DebtEntry | null>(null);
  const [formData, setFormData] = useState<Omit<DebtEntry, 'id' | 'remainingBalance' | 'statements'>>(defaultNewDebtEntry);
  const [selectedDebtsForPackage, setSelectedDebtsForPackage] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDebtForStatementDisplay, setSelectedDebtForStatementDisplay] = useState<DebtEntry | null>(null);

  // Statement upload dialog & AI processing states
  const [showStatementUploadDialog, setShowStatementUploadDialog] = useState(false);
  const [rawSelectedFiles, setRawSelectedFiles] = useState<FileList | null>(null);
  const [analyzedFiles, setAnalyzedFiles] = useState<AnalyzedFile[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);


  useEffect(() => {
    if (editingDebt) {
      setFormData({
        name: editingDebt.name, type: editingDebt.type, securityType: editingDebt.securityType,
        startingBalance: editingDebt.startingBalance, startingDate: editingDebt.startingDate,
        currentBalance: editingDebt.currentBalance, dueDate: editingDebt.dueDate,
        paymentAmount: editingDebt.paymentAmount, paymentFrequency: editingDebt.paymentFrequency,
        interestRate: editingDebt.interestRate, termMonths: editingDebt.termMonths,
        assumedPayoffDate: editingDebt.assumedPayoffDate
      });
    } else {
      setFormData(defaultNewDebtEntry);
    }
  }, [editingDebt]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let parsedValue: string | number = value;
    if (['startingBalance', 'currentBalance', 'paymentAmount', 'interestRate', 'termMonths'].includes(name)) {
      parsedValue = parseFloat(value) || 0;
    }
    setFormData(prev => ({ ...prev, [name]: parsedValue }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value as any }));
  };

  const handleDateChange = (name: string, date?: Date) => {
    if (date) {
      setFormData(prev => ({ ...prev, [name]: format(date, "yyyy-MM-dd") }));
    }
  };

  const handleSaveDebt = () => {
    if (!formData.name) {
        toast({ title: "Validation Error", description: "Debt name is required.", variant: "destructive" });
        return;
    }
    const calculatedRemainingBalance = formData.currentBalance; 
    const calculatedPayoffDate = formData.dueDate; 

    if (editingDebt) {
      setDebts(debts.map(d => d.id === editingDebt.id ? { ...editingDebt, ...formData, remainingBalance: calculatedRemainingBalance, assumedPayoffDate: calculatedPayoffDate, statements: editingDebt.statements || [] } : d));
      toast({ title: "Debt Updated", description: `Successfully updated ${formData.name}.` });
    } else {
      const newDebt: DebtEntry = {
        id: `debt${Date.now()}`, ...formData,
        remainingBalance: calculatedRemainingBalance, assumedPayoffDate: calculatedPayoffDate, statements: []
      };
      setDebts([...debts, newDebt]);
      toast({ title: "Debt Added", description: `Successfully added ${newDebt.name}.` });
    }
    setShowFormDialog(false); setEditingDebt(null); setFormData(defaultNewDebtEntry);
  };

  const handleEditDebt = (debt: DebtEntry) => {
    setEditingDebt(debt); setSelectedDebtForStatementDisplay(debt); setShowFormDialog(true);
  };

  const handleDeleteDebt = (debtId: string) => {
    if (window.confirm("Are you sure you want to delete this debt entry?")) {
      setDebts(debts.filter(d => d.id !== debtId));
      if (selectedDebtForStatementDisplay?.id === debtId) setSelectedDebtForStatementDisplay(null);
      toast({ title: "Debt Deleted", description: "Debt entry has been removed." });
    }
  };

  const handlePackageSelection = (debtId: string, checked: boolean | 'indeterminate') => {
    setSelectedDebtsForPackage(prev => ({ ...prev, [debtId]: !!checked }));
  };

  const handleDownloadPackage = () => {
    const selectedIds = Object.keys(selectedDebtsForPackage).filter(id => selectedDebtsForPackage[id]);
    if (selectedIds.length === 0) {
      toast({ title: "No Debts Selected", description: "Please select at least one debt to include in the package.", variant: "destructive" });
      return;
    }
    const packageDebts = debts.filter(d => selectedIds.includes(d.id));
    console.log("Download Accounting Package for:", packageDebts.map(d => d.name));
    toast({ title: "Package Download Started (Stub)", description: `Preparing package for ${selectedIds.length} debt(s).` });
  };

  // New handlers for AI-powered batch upload
  const handleFileSelectionForAnalysis = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRawSelectedFiles(event.target.files);
    if (event.target.files) {
      const filesArray = Array.from(event.target.files).map((file, index) => ({
        file,
        originalIndex: index,
        suggestedDebtId: null,
        suggestedStatementDate: null,
        actualDebtId: '',
        actualStatementDate: undefined,
        processingStatus: 'pending' as 'pending',
      }));
      setAnalyzedFiles(filesArray);
      setOverallProgress(0);
    } else {
      setAnalyzedFiles([]);
    }
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleAnalyzeFiles = async () => {
    if (!analyzedFiles.length) {
      toast({ title: "No Files", description: "Please select files to analyze.", variant: "destructive" });
      return;
    }
    setIsAnalyzing(true);
    setOverallProgress(0);

    const debtAccountInfo = debts.map(d => ({ id: d.id, name: d.name }));
    let filesProcessed = 0;

    for (let i = 0; i < analyzedFiles.length; i++) {
      const currentFileItem = analyzedFiles[i];
      setAnalyzedFiles(prev => prev.map(f => f.originalIndex === currentFileItem.originalIndex ? { ...f, processingStatus: 'analyzing' } : f));
      try {
        // TODO: Actual OCR and file processing would happen here.
        // For now, we simulate it. If it were a real image/PDF, we'd convert to data URI.
        // const fileDataUri = await readFileAsDataURL(currentFileItem.file);
        const fileDataUri = "data:text/plain;base64,c3R1YmJvZCBmaWxlIGNvbnRlbnQ="; // Placeholder

        const input: AnalyzeStatementInput = {
          fileDataUri,
          fileName: currentFileItem.file.name,
          existingDebtAccounts: debtAccountInfo,
        };
        // Simulate network delay for AI call
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
        const result: AnalyzeStatementOutput = await analyzeStatement(input); // Call Genkit flow

        setAnalyzedFiles(prev => prev.map(f =>
          f.originalIndex === currentFileItem.originalIndex ? {
            ...f,
            suggestedDebtId: result.suggestedDebtId,
            suggestedStatementDate: result.suggestedStatementDate,
            ocrTextSnippet: result.ocrTextSnippet,
            confidence: result.confidence,
            actualDebtId: result.suggestedDebtId || '',
            actualStatementDate: result.suggestedStatementDate ? new Date(result.suggestedStatementDate + 'T00:00:00') : undefined, // Ensure date object for DatePicker
            processingStatus: 'analyzed',
          } : f
        ));
      } catch (error) {
        console.error("Error analyzing file:", currentFileItem.file.name, error);
        setAnalyzedFiles(prev => prev.map(f => f.originalIndex === currentFileItem.originalIndex ? { ...f, processingStatus: 'error', errorMessage: 'AI analysis failed' } : f));
      }
      filesProcessed++;
      setOverallProgress(Math.round((filesProcessed / analyzedFiles.length) * 100));
    }
    setIsAnalyzing(false);
  };
  
  const handleAnalyzedFileFieldChange = (index: number, field: keyof AnalyzedFile, value: any) => {
    setAnalyzedFiles(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const handleSaveAnalyzedStatements = () => {
    let statementsAddedCount = 0;
    let updatedDebts = [...debts];

    analyzedFiles.forEach(analyzedFile => {
      if (analyzedFile.processingStatus === 'analyzed' && analyzedFile.actualDebtId && analyzedFile.actualStatementDate) {
        updatedDebts = updatedDebts.map(debt => {
          if (debt.id === analyzedFile.actualDebtId) {
            const newStatement: Statement = {
              id: `stmt-${Date.now()}-${analyzedFile.originalIndex}`,
              fileName: analyzedFile.file.name,
              uploadDate: format(new Date(), "yyyy-MM-dd"),
              statementDate: format(analyzedFile.actualStatementDate!, "yyyy-MM-dd"),
              aiSuggested: analyzedFile.suggestedDebtId === analyzedFile.actualDebtId && 
                           analyzedFile.suggestedStatementDate === format(analyzedFile.actualStatementDate!, "yyyy-MM-dd"),
            };
            // TODO: Actual file upload logic to Firebase Storage or other backend
            statementsAddedCount++;
            return { ...debt, statements: [...(debt.statements || []), newStatement] };
          }
          return debt;
        });
      }
    });

    if (statementsAddedCount > 0) {
      setDebts(updatedDebts);
      // Update selectedDebtForStatementDisplay if its statements were modified
      if (selectedDebtForStatementDisplay) {
        const updatedSelectedDebt = updatedDebts.find(d => d.id === selectedDebtForStatementDisplay.id);
        if (updatedSelectedDebt) setSelectedDebtForStatementDisplay(updatedSelectedDebt);
      }
      toast({ title: "Statements Saved", description: `${statementsAddedCount} statement(s) have been associated and (conceptually) uploaded.` });
    } else {
      toast({ title: "No Statements Saved", description: "No statements were ready to be saved. Ensure debt and date are selected for analyzed files.", variant: "destructive" });
    }
    
    // Reset dialog state
    setShowStatementUploadDialog(false);
    setRawSelectedFiles(null);
    setAnalyzedFiles([]);
    setIsAnalyzing(false);
    setOverallProgress(0);
  };


  const filteredDebts = useMemo(() => {
    if (!searchTerm) return debts;
    return debts.filter(debt =>
      debt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      debt.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [debts, searchTerm]);

  const handleSelectDebtForRow = (debt: DebtEntry) => {
    setSelectedDebtForStatementDisplay(debt);
  };


  return (
    <div className="space-y-8 p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <CardTitle className="text-3xl font-bold text-slate-900 flex items-center">
              <Landmark size={32} className="mr-3 text-sky-600" /> Debt Tracker
            </CardTitle>
            <CardDescription className="text-lg text-slate-500 pt-1">
              Manage and monitor all company debts.
            </CardDescription>
          </div>
          <Button onClick={() => { setEditingDebt(null); setFormData(defaultNewDebtEntry); setShowFormDialog(true); }} size="action" className="mt-4 md:mt-0">
            <PlusCircle size={18} className="mr-2" /> Add New Debt
          </Button>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <CardTitle className="text-xl font-semibold text-slate-800">Debt Overview</CardTitle>
                <div className="relative w-full sm:w-auto sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input type="search" placeholder="Search debts..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-brand-slate-200/80">
            <Table>
              <TableHeader><TableRow>
                  <TableHead className="w-[40px]"><Checkbox 
                    checked={filteredDebts.length > 0 && filteredDebts.every(d => selectedDebtsForPackage[d.id])}
                    onCheckedChange={(checked) => {
                        const newSelection: Record<string, boolean> = {};
                        if (checked === true) filteredDebts.forEach(d => newSelection[d.id] = true);
                        setSelectedDebtsForPackage(newSelection);
                    }} aria-label="Select all debts for package"/>
                  </TableHead>
                  <TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Current Balance</TableHead><TableHead>Payment</TableHead>
                  <TableHead>Frequency</TableHead><TableHead>Rate (%)</TableHead><TableHead>Due Date</TableHead><TableHead>Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filteredDebts.length > 0 ? filteredDebts.map((debt) => (
                  <TableRow key={debt.id} data-state={selectedDebtsForPackage[debt.id] ? "selected" : ""} onClick={() => handleSelectDebtForRow(debt)} className="cursor-pointer hover:bg-slate-50">
                    <TableCell onClick={(e) => e.stopPropagation()}><Checkbox checked={selectedDebtsForPackage[debt.id] || false} onCheckedChange={(checked) => handlePackageSelection(debt.id, checked)} aria-label={`Select ${debt.name}`}/></TableCell>
                    <TableCell className="font-medium text-slate-700">{debt.name}</TableCell><TableCell>{debt.type}</TableCell>
                    <TableCell>${debt.currentBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                    <TableCell>${debt.paymentAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                    <TableCell>{debt.paymentFrequency}</TableCell><TableCell>{debt.interestRate ? debt.interestRate.toFixed(2) : 'N/A'}</TableCell>
                    <TableCell>{debt.dueDate || 'N/A'}</TableCell>
                    <TableCell className="space-x-1">
                      <Button variant="ghost" size="icon" onClick={(e) => {e.stopPropagation(); handleEditDebt(debt);}} aria-label={`Edit ${debt.name}`} className="h-8 w-8"><Edit className="h-4 w-4 text-sky-600" /></Button>
                      <Button variant="ghost" size="icon" onClick={(e) => {e.stopPropagation(); handleDeleteDebt(debt.id);}} aria-label={`Delete ${debt.name}`} className="h-8 w-8"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </TableCell>
                  </TableRow>
                )) : (<TableRow><TableCell colSpan={9} className="text-center h-24">No debts match your search criteria, or no debts added yet.</TableCell></TableRow>)}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-800">Debt Tools & Actions</CardTitle>
          <CardDescription>Actions for a selected debt. Select a debt from the table above.
            {selectedDebtForStatementDisplay && <span className="font-semibold text-sky-600 block mt-1">Selected: {selectedDebtForStatementDisplay.name}</span>}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" size="action" disabled={!selectedDebtForStatementDisplay} onClick={() => console.log("Download Payoff Stub for:", selectedDebtForStatementDisplay?.name)}><FileDown size={18} className="mr-2" /> Download Payoff Schedule (PDF/CSV)</Button>
            <Button variant="outline" size="action" disabled={!selectedDebtForStatementDisplay || !['Mortgage', 'Term Loan'].includes(selectedDebtForStatementDisplay?.type || '')} onClick={() => console.log("Download Amortization Stub for:", selectedDebtForStatementDisplay?.name)}><FileDown size={18} className="mr-2" /> Download Amortization Table (PDF/CSV)</Button>
          </div>
          <Card className="bg-slate-50/50 p-4">
            <CardTitle className="text-md font-semibold text-slate-700 mb-2 flex items-center"><Calculator size={18} className="mr-2 text-slate-500"/>Principal & Interest Calculation</CardTitle>
            <p className="text-sm text-slate-500">Date range selection and P&I display will be implemented here. Enable if a debt is selected.</p>
          </Card>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-800">Manage Statements</CardTitle>
           <CardDescription>
            {selectedDebtForStatementDisplay ? `Statements for: ${selectedDebtForStatementDisplay.name}` : "Select a debt from the table to view/manage its statements."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => { setShowStatementUploadDialog(true); setRawSelectedFiles(null); setAnalyzedFiles([]); setOverallProgress(0); }} size="action" variant="outline" className="mb-4">
            <UploadCloud size={18} className="mr-2" /> Upload & Analyze New Statement(s)
          </Button>
            {selectedDebtForStatementDisplay && selectedDebtForStatementDisplay.statements && selectedDebtForStatementDisplay.statements.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto border p-3 rounded-md bg-slate-50/30">
                    {selectedDebtForStatementDisplay.statements.map(stmt => (
                        <div key={stmt.id} className="p-2 border-b border-brand-slate-200/50 text-sm">
                            <p className="font-medium text-slate-700">{stmt.fileName} {stmt.aiSuggested && <Sparkles className="inline h-3 w-3 text-purple-500" title="AI Suggested Association" />}</p>
                            <p className="text-xs text-slate-500">Statement Date: {stmt.statementDate} (Uploaded: {stmt.uploadDate})</p>
                        </div>
                    ))}
                </div>
            ) : selectedDebtForStatementDisplay ? ( <p className="text-sm text-slate-500 mt-4">No statements uploaded for {selectedDebtForStatementDisplay.name} yet.</p>
            ) : ( <p className="text-sm text-slate-500 mt-4">Select a debt from the table to view its statements.</p> )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-xl font-semibold text-slate-800">Accounting Package</CardTitle><CardDescription>Download selected statements and schedules for one or more accounts.</CardDescription></CardHeader>
        <CardContent>
          <Button onClick={handleDownloadPackage} size="action" variant="default" disabled={Object.values(selectedDebtsForPackage).filter(v => v).length === 0}><FileArchive size={18} className="mr-2" /> Download Package</Button>
          <p className="text-xs text-slate-500 mt-2">Select debts from the table above to include them in the package.</p>
        </CardContent>
      </Card>

      <Dialog open={showFormDialog} onOpenChange={(open) => { if (!open) { setShowFormDialog(false); setEditingDebt(null); setFormData(defaultNewDebtEntry); } else { setShowFormDialog(true); }}}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingDebt ? 'Edit Debt Entry' : 'Add New Debt Entry'}</DialogTitle><DialogDescription>{editingDebt ? `Update details for ${editingDebt.name}.` : 'Enter the details for the new debt.'}</DialogDescription></DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div><Label htmlFor="name">Debt Name/Description</Label><Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g., Main St Building Mortgage" /></div>
            <div><Label htmlFor="type">Type of Debt</Label>
              <Select name="type" value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Mortgage">Mortgage</SelectItem><SelectItem value="Line of Credit">Line of Credit</SelectItem><SelectItem value="Term Loan">Term Loan</SelectItem><SelectItem value="Credit Card">Credit Card</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
              </Select></div>
            <div><Label htmlFor="securityType">Security Type</Label>
              <Select name="securityType" value={formData.securityType} onValueChange={(value) => handleSelectChange('securityType', value)}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Secured">Secured</SelectItem><SelectItem value="Unsecured">Unsecured</SelectItem><SelectItem value="Partially Secured">Partially Secured</SelectItem></SelectContent>
              </Select></div>
            <div><Label htmlFor="startingBalance">Starting Balance ($)</Label><Input id="startingBalance" name="startingBalance" type="number" value={formData.startingBalance} onChange={handleInputChange} placeholder="e.g., 500000" /></div>
            <div><Label htmlFor="startingDate">Starting Date</Label>
                <Popover><PopoverTrigger asChild><Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.startingDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" /> {formData.startingDate ? format(new Date(formData.startingDate + 'T00:00:00'), "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.startingDate ? new Date(formData.startingDate + 'T00:00:00') : undefined} onSelect={(date) => handleDateChange('startingDate', date)} initialFocus /></PopoverContent></Popover></div>
            <div><Label htmlFor="currentBalance">Current Balance ($)</Label><Input id="currentBalance" name="currentBalance" type="number" value={formData.currentBalance} onChange={handleInputChange} placeholder="e.g., 450000" /></div>
            <div><Label htmlFor="interestRate">Interest Rate (Annual %)</Label><Input id="interestRate" name="interestRate" type="number" value={formData.interestRate || ''} onChange={handleInputChange} placeholder="e.g., 3.5" step="0.01"/></div>
            <div><Label htmlFor="paymentAmount">Payment Amount ($)</Label><Input id="paymentAmount" name="paymentAmount" type="number" value={formData.paymentAmount} onChange={handleInputChange} placeholder="e.g., 2800" /></div>
            <div><Label htmlFor="paymentFrequency">Payment Frequency</Label>
              <Select name="paymentFrequency" value={formData.paymentFrequency} onValueChange={(value) => handleSelectChange('paymentFrequency', value)}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Monthly">Monthly</SelectItem><SelectItem value="Bi-Weekly">Bi-Weekly</SelectItem><SelectItem value="Weekly">Weekly</SelectItem><SelectItem value="Annually">Annually</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select></div>
            <div><Label htmlFor="termMonths">Loan Term (Months)</Label><Input id="termMonths" name="termMonths" type="number" value={formData.termMonths || ''} onChange={handleInputChange} placeholder="e.g., 360 for 30yr mortgage"/></div>
            <div><Label htmlFor="dueDate">Due Date / Maturity Date</Label>
                <Popover><PopoverTrigger asChild><Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.dueDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" /> {formData.dueDate ? format(new Date(formData.dueDate + 'T00:00:00'), "PPP") : <span>Pick a date (optional)</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.dueDate ? new Date(formData.dueDate + 'T00:00:00') : undefined} onSelect={(date) => handleDateChange('dueDate', date)} initialFocus/></PopoverContent></Popover></div>
          </div>
          <DialogFooter><DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose><Button type="button" onClick={handleSaveDebt}>{editingDebt ? 'Save Changes' : 'Add Debt'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showStatementUploadDialog} onOpenChange={(isOpen) => { if (!isOpen) { setRawSelectedFiles(null); setAnalyzedFiles([]); setOverallProgress(0); setIsAnalyzing(false); } setShowStatementUploadDialog(isOpen);}}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Brain size={24} className="text-purple-500" />AI-Powered Statement Processor</DialogTitle>
            <DialogDescription>Upload statement files (PDF, JPG, PNG). The AI will attempt to associate them with debt accounts and extract statement dates.</DialogDescription>
          </DialogHeader>
          
          {!analyzedFiles.length && (
            <div className="py-4">
              <Label htmlFor="statementBatchFile" className="mb-2 block font-semibold text-slate-700">Select Statement Files (Multiple Allowed)</Label>
              <Input id="statementBatchFile" type="file" multiple onChange={handleFileSelectionForAnalysis} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"/>
            </div>
          )}

          {analyzedFiles.length > 0 && (
            <>
              <div className="flex-grow overflow-y-auto space-y-3 pr-2 -mr-2 my-4">
                {analyzedFiles.map((item, index) => (
                  <Card key={item.originalIndex} className={cn("p-3", item.processingStatus === 'error' && "bg-red-50 border-red-200", item.processingStatus === 'analyzed' && "bg-green-50 border-green-200")}>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 pt-1">
                        {item.processingStatus === 'pending' && <UploadCloud className="h-5 w-5 text-slate-400" />}
                        {item.processingStatus === 'analyzing' && <Loader2 className="h-5 w-5 text-sky-500 animate-spin" />}
                        {item.processingStatus === 'analyzed' && <Check className="h-5 w-5 text-green-600" />}
                        {item.processingStatus === 'error' && <AlertTriangle className="h-5 w-5 text-red-600" />}
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm font-medium text-slate-800 truncate" title={item.file.name}>{item.file.name} <span className="text-xs text-slate-500">({(item.file.size / 1024).toFixed(1)} KB)</span></p>
                        {item.processingStatus === 'analyzing' && <p className="text-xs text-sky-600">AI analyzing...</p>}
                        {item.processingStatus === 'error' && <p className="text-xs text-red-600">{item.errorMessage || "Analysis failed."}</p>}
                        {item.processingStatus === 'analyzed' && (
                          <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                              <div>
                                <Label htmlFor={`debtForFile-${index}`} className="text-xs">Suggested Debt Account</Label>
                                <Select value={item.actualDebtId} onValueChange={(value) => handleAnalyzedFileFieldChange(index, 'actualDebtId', value)}>
                                  <SelectTrigger id={`debtForFile-${index}`} className="h-9 text-xs"><SelectValue placeholder="Select debt..." /></SelectTrigger>
                                  <SelectContent>
                                    {debts.map(debt => (<SelectItem key={debt.id} value={debt.id} className="text-xs">{debt.name}</SelectItem>))}
                                  </SelectContent>
                                </Select>
                                {item.suggestedDebtId && item.suggestedDebtId !== item.actualDebtId && <p className="text-xs text-purple-600 mt-0.5">AI suggested: {debts.find(d=>d.id === item.suggestedDebtId)?.name || 'Unknown'}</p>}
                              </div>
                              <div>
                                <Label htmlFor={`dateForFile-${index}`} className="text-xs">Statement Date</Label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-9 text-xs", !item.actualStatementDate && "text-muted-foreground")}><CalendarIcon className="mr-1.5 h-3.5 w-3.5" /> {item.actualStatementDate ? format(item.actualStatementDate, "PPP") : <span>Pick date</span>}</Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={item.actualStatementDate} onSelect={(date) => handleAnalyzedFileFieldChange(index, 'actualStatementDate', date)} initialFocus /></PopoverContent>
                                </Popover>
                                {item.suggestedStatementDate && format(item.actualStatementDate || new Date(0), "yyyy-MM-dd") !== item.suggestedStatementDate && <p className="text-xs text-purple-600 mt-0.5">AI suggested: {format(new Date(item.suggestedStatementDate + 'T00:00:00'), "PPP")}</p>}
                              </div>
                            </div>
                            {item.ocrTextSnippet && <p className="text-xs text-slate-500 mt-1 truncate" title={item.ocrTextSnippet}>Snippet: "{item.ocrTextSnippet}" (Conf: {((item.confidence || 0) * 100).toFixed(0)}%)</p>}
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              {isAnalyzing && <Progress value={overallProgress} className="w-full h-2 mt-2 mb-1" />}
              <p className="text-xs text-center text-slate-500 mb-2">{isAnalyzing ? `Analyzing file ${analyzedFiles.filter(f=>f.processingStatus === 'analyzing' || f.processingStatus === 'analyzed' || f.processingStatus === 'error').length} of ${analyzedFiles.length}... (${overallProgress}%)` : analyzedFiles.filter(f=>f.processingStatus==='analyzed').length > 0 ? 'Review AI suggestions and confirm.' : 'Ready to analyze.'}</p>
            </>
          )}

          <DialogFooter className="mt-auto pt-4 border-t">
            <DialogClose asChild><Button type="button" variant="outline" disabled={isAnalyzing}>Cancel</Button></DialogClose>
            {analyzedFiles.length > 0 && !isAnalyzing && analyzedFiles.some(f=>f.processingStatus === 'pending') && (
                <Button type="button" onClick={handleAnalyzeFiles} className="bg-purple-600 hover:bg-purple-700 text-white" disabled={isAnalyzing}>
                  <Brain size={18} className="mr-2"/>Analyze Files with AI
                </Button>
            )}
            {analyzedFiles.length > 0 && !isAnalyzing && analyzedFiles.every(f => f.processingStatus === 'analyzed' || f.processingStatus === 'error') && (
              <Button type="button" onClick={handleSaveAnalyzedStatements} disabled={isAnalyzing || analyzedFiles.every(f => f.processingStatus === 'error' || !f.actualDebtId || !f.actualStatementDate)}>
                <Save size={18} className="mr-2" />Save All Processed Statements
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default DebtTrackerPage;

