
"use client";

import React, { useState, useEffect, useMemo } from 'react';
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
import {
  Landmark, Edit, Trash2, PlusCircle, FileDown, Calculator, UploadCloud, FileArchive, CalendarIcon, Search
} from 'lucide-react';

// TODO: Consider using react-hook-form for more robust form handling in the future.

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
  // Calculated fields (stubs for now)
  remainingBalance: number;
  assumedPayoffDate?: string;
  statements?: Statement[]; // Array of associated statements
}

interface Statement {
  id: string;
  fileName: string;
  uploadDate: string;
  statementDate: string; // Date of the statement period
  // TODO: Add file storage URL or reference once backend is implemented
}

const initialDebts: DebtEntry[] = [
  {
    id: 'debt1', name: 'Commercial Mortgage - Main St', type: 'Mortgage', securityType: 'Secured',
    startingBalance: 500000, startingDate: '2020-01-15', currentBalance: 450000, dueDate: '2050-01-15',
    paymentAmount: 2800, paymentFrequency: 'Monthly', interestRate: 3.5, termMonths: 360,
    remainingBalance: 450000, assumedPayoffDate: '2050-01-15', statements: []
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


const DebtTrackerPage = ({ pageId }: { pageId: string }) => {
  const { toast } = useToast();
  const [debts, setDebts] = useState<DebtEntry[]>(initialDebts);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingDebt, setEditingDebt] = useState<DebtEntry | null>(null);
  const [formData, setFormData] = useState<Omit<DebtEntry, 'id' | 'remainingBalance' | 'statements'>>(defaultNewDebtEntry);
  const [selectedDebtsForPackage, setSelectedDebtsForPackage] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Statement upload states
  const [showStatementUploadDialog, setShowStatementUploadDialog] = useState(false);
  const [statementFile, setStatementFile] = useState<File | null>(null);
  const [statementDate, setStatementDate] = useState<Date | undefined>(new Date());
  const [debtForStatement, setDebtForStatement] = useState<string>('');


  useEffect(() => {
    if (editingDebt) {
      setFormData({
        name: editingDebt.name,
        type: editingDebt.type,
        securityType: editingDebt.securityType,
        startingBalance: editingDebt.startingBalance,
        startingDate: editingDebt.startingDate,
        currentBalance: editingDebt.currentBalance,
        dueDate: editingDebt.dueDate,
        paymentAmount: editingDebt.paymentAmount,
        paymentFrequency: editingDebt.paymentFrequency,
        interestRate: editingDebt.interestRate,
        termMonths: editingDebt.termMonths,
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: string, date?: Date) => {
    if (date) {
      setFormData(prev => ({ ...prev, [name]: format(date, "yyyy-MM-dd") }));
    }
  };

  const handleSaveDebt = () => {
    // TODO: Add validation
    if (!formData.name) {
        toast({ title: "Validation Error", description: "Debt name is required.", variant: "destructive" });
        return;
    }

    // TODO: Implement actual remaining balance and payoff date calculation
    const calculatedRemainingBalance = formData.currentBalance; // Stub
    const calculatedPayoffDate = formData.dueDate; // Stub

    if (editingDebt) {
      setDebts(debts.map(d => d.id === editingDebt.id ? { ...editingDebt, ...formData, remainingBalance: calculatedRemainingBalance, assumedPayoffDate: calculatedPayoffDate } : d));
      toast({ title: "Debt Updated", description: `Successfully updated ${formData.name}.` });
    } else {
      const newDebt: DebtEntry = {
        id: `debt${Date.now()}`, // Simple unique ID for mockup
        ...formData,
        remainingBalance: calculatedRemainingBalance,
        assumedPayoffDate: calculatedPayoffDate,
        statements: []
      };
      setDebts([...debts, newDebt]);
      toast({ title: "Debt Added", description: `Successfully added ${newDebt.name}.` });
    }
    setShowFormDialog(false);
    setEditingDebt(null);
    setFormData(defaultNewDebtEntry);
  };

  const handleEditDebt = (debt: DebtEntry) => {
    setEditingDebt(debt);
    setShowFormDialog(true);
  };

  const handleDeleteDebt = (debtId: string) => {
    if (window.confirm("Are you sure you want to delete this debt entry?")) {
      setDebts(debts.filter(d => d.id !== debtId));
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
    // TODO: Implement actual ZIP file generation and download
    console.log("Download Accounting Package for:", packageDebts.map(d => d.name));
    toast({ title: "Package Download Started (Stub)", description: `Preparing package for ${selectedIds.length} debt(s).` });
  };

  const handleUploadStatement = () => {
    if (!statementFile || !debtForStatement || !statementDate) {
      toast({ title: "Missing Information", description: "Please select a debt, provide a statement file, and set the statement date.", variant: "destructive" });
      return;
    }
    // TODO: Implement actual file upload to server/cloud storage
    // TODO: Update the specific debt entry with the new statement metadata
    setDebts(prevDebts => prevDebts.map(debt => {
        if (debt.id === debtForStatement) {
            const newStatement: Statement = {
                id: `stmt-${Date.now()}`,
                fileName: statementFile.name,
                uploadDate: format(new Date(), "yyyy-MM-dd"),
                statementDate: format(statementDate, "yyyy-MM-dd"),
            };
            return { ...debt, statements: [...(debt.statements || []), newStatement] };
        }
        return debt;
    }));

    console.log("Upload Statement:", { debtId: debtForStatement, fileName: statementFile.name, statementDate: format(statementDate, "yyyy-MM-dd") });
    toast({ title: "Statement Uploaded (Stub)", description: `${statementFile.name} associated with selected debt.` });
    setShowStatementUploadDialog(false);
    setStatementFile(null);
    setDebtForStatement('');
  };

  const filteredDebts = useMemo(() => {
    if (!searchTerm) return debts;
    return debts.filter(debt =>
      debt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      debt.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [debts, searchTerm]);


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
                    <Input
                        type="search"
                        placeholder="Search debts..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-brand-slate-200/80">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]"><Checkbox 
                    checked={filteredDebts.length > 0 && filteredDebts.every(d => selectedDebtsForPackage[d.id])}
                    onCheckedChange={(checked) => {
                        const newSelection: Record<string, boolean> = {};
                        if (checked) {
                            filteredDebts.forEach(d => newSelection[d.id] = true);
                        }
                        setSelectedDebtsForPackage(newSelection);
                    }}
                    aria-label="Select all debts for package"
                  /></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Current Balance</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Rate (%)</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDebts.length > 0 ? filteredDebts.map((debt) => (
                  <TableRow key={debt.id} data-state={selectedDebtsForPackage[debt.id] ? "selected" : ""}>
                    <TableCell>
                      <Checkbox
                        checked={selectedDebtsForPackage[debt.id] || false}
                        onCheckedChange={(checked) => handlePackageSelection(debt.id, checked)}
                        aria-label={`Select ${debt.name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-slate-700">{debt.name}</TableCell>
                    <TableCell>{debt.type}</TableCell>
                    <TableCell>${debt.currentBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                    <TableCell>${debt.paymentAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                    <TableCell>{debt.paymentFrequency}</TableCell>
                    <TableCell>{debt.interestRate ? debt.interestRate.toFixed(2) : 'N/A'}</TableCell>
                    <TableCell>{debt.dueDate || 'N/A'}</TableCell>
                    <TableCell className="space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEditDebt(debt)} aria-label={`Edit ${debt.name}`} className="h-8 w-8"><Edit className="h-4 w-4 text-sky-600" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteDebt(debt.id)} aria-label={`Delete ${debt.name}`} className="h-8 w-8"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={9} className="text-center h-24">No debts match your search criteria, or no debts added yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Debt Actions & Calculations Section (Placeholder for specific debt) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-800">Debt Tools & Actions</CardTitle>
          <CardDescription>Actions for a selected debt. Select a debt from the table above.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" size="action" disabled={!Object.values(selectedDebtsForPackage).some(v => v)} onClick={() => console.log("Download Payoff Stub for:", Object.keys(selectedDebtsForPackage).filter(id => selectedDebtsForPackage[id]))}>
                <FileDown size={18} className="mr-2" /> Download Payoff Schedule (PDF/CSV)
            </Button>
            <Button variant="outline" size="action" disabled={!Object.values(selectedDebtsForPackage).some(v => v)} onClick={() => console.log("Download Amortization Stub for:", Object.keys(selectedDebtsForPackage).filter(id => selectedDebtsForPackage[id]))}>
                <FileDown size={18} className="mr-2" /> Download Amortization Table (PDF/CSV)
            </Button>
          </div>
          <Card className="bg-slate-50/50 p-4">
            <CardTitle className="text-md font-semibold text-slate-700 mb-2 flex items-center"><Calculator size={18} className="mr-2 text-slate-500"/>Principal & Interest Calculation</CardTitle>
            {/* TODO: Date range pickers and P&I display logic */}
            <p className="text-sm text-slate-500">Date range selection and P&I display will be implemented here.</p>
          </Card>
        </CardContent>
      </Card>

       {/* Statement Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-800">Manage Statements</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowStatementUploadDialog(true)} size="action" variant="outline">
            <UploadCloud size={18} className="mr-2" /> Upload New Statement
          </Button>
           {/* TODO: Display list of uploaded statements for selected debt, allow download/delete */}
           <p className="text-sm text-slate-500 mt-4">List of uploaded statements for the selected debt will appear here.</p>
        </CardContent>
      </Card>


      {/* Download Accounting Package Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-800">Accounting Package</CardTitle>
          <CardDescription>Download selected statements and schedules for one or more accounts.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleDownloadPackage} size="action" variant="default" disabled={Object.values(selectedDebtsForPackage).filter(v => v).length === 0}>
            <FileArchive size={18} className="mr-2" /> Download Package
          </Button>
          <p className="text-xs text-slate-500 mt-2">Select debts from the table above to include them in the package.</p>
        </CardContent>
      </Card>


      {/* Add/Edit Debt Dialog */}
      <Dialog open={showFormDialog} onOpenChange={(open) => { if (!open) { setShowFormDialog(false); setEditingDebt(null); setFormData(defaultNewDebtEntry); } else { setShowFormDialog(true); }}}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingDebt ? 'Edit Debt Entry' : 'Add New Debt Entry'}</DialogTitle>
            <DialogDescription>
              {editingDebt ? `Update details for ${editingDebt.name}.` : 'Enter the details for the new debt.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div><Label htmlFor="name">Debt Name/Description</Label><Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g., Main St Building Mortgage" /></div>
            <div><Label htmlFor="type">Type of Debt</Label>
              <Select name="type" value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mortgage">Mortgage</SelectItem><SelectItem value="Line of Credit">Line of Credit</SelectItem>
                  <SelectItem value="Term Loan">Term Loan</SelectItem><SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label htmlFor="securityType">Security Type</Label>
              <Select name="securityType" value={formData.securityType} onValueChange={(value) => handleSelectChange('securityType', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Secured">Secured</SelectItem><SelectItem value="Unsecured">Unsecured</SelectItem>
                  <SelectItem value="Partially Secured">Partially Secured</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label htmlFor="startingBalance">Starting Balance ($)</Label><Input id="startingBalance" name="startingBalance" type="number" value={formData.startingBalance} onChange={handleInputChange} placeholder="e.g., 500000" /></div>
            <div><Label htmlFor="startingDate">Starting Date</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.startingDate && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" /> {formData.startingDate ? format(new Date(formData.startingDate + 'T00:00:00'), "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={new Date(formData.startingDate + 'T00:00:00')} onSelect={(date) => handleDateChange('startingDate', date)} initialFocus /></PopoverContent>
                </Popover>
            </div>
            <div><Label htmlFor="currentBalance">Current Balance ($)</Label><Input id="currentBalance" name="currentBalance" type="number" value={formData.currentBalance} onChange={handleInputChange} placeholder="e.g., 450000" /></div>
            <div><Label htmlFor="interestRate">Interest Rate (Annual %)</Label><Input id="interestRate" name="interestRate" type="number" value={formData.interestRate || ''} onChange={handleInputChange} placeholder="e.g., 3.5" step="0.01"/></div>
            <div><Label htmlFor="paymentAmount">Payment Amount ($)</Label><Input id="paymentAmount" name="paymentAmount" type="number" value={formData.paymentAmount} onChange={handleInputChange} placeholder="e.g., 2800" /></div>
            <div><Label htmlFor="paymentFrequency">Payment Frequency</Label>
              <Select name="paymentFrequency" value={formData.paymentFrequency} onValueChange={(value) => handleSelectChange('paymentFrequency', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monthly">Monthly</SelectItem><SelectItem value="Bi-Weekly">Bi-Weekly</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem><SelectItem value="Annually">Annually</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label htmlFor="termMonths">Loan Term (Months)</Label><Input id="termMonths" name="termMonths" type="number" value={formData.termMonths || ''} onChange={handleInputChange} placeholder="e.g., 360 for 30yr mortgage"/></div>
            <div><Label htmlFor="dueDate">Due Date / Maturity Date</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.dueDate && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" /> {formData.dueDate ? format(new Date(formData.dueDate + 'T00:00:00'), "PPP") : <span>Pick a date (optional)</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.dueDate ? new Date(formData.dueDate + 'T00:00:00') : undefined} onSelect={(date) => handleDateChange('dueDate', date)} initialFocus/></PopoverContent>
                </Popover>
            </div>
            {/* TODO: Add fields for Assumed Payoff Date (could be auto-calculated or manual override) */}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
            <Button type="button" onClick={handleSaveDebt}>{editingDebt ? 'Save Changes' : 'Add Debt'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Statement Dialog */}
      <Dialog open={showStatementUploadDialog} onOpenChange={setShowStatementUploadDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Statement</DialogTitle>
            <DialogDescription>Upload a statement and associate it with a debt account and period.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
                <Label htmlFor="debtForStatement">Associate with Debt Account</Label>
                <Select value={debtForStatement} onValueChange={setDebtForStatement}>
                    <SelectTrigger id="debtForStatement"><SelectValue placeholder="Select debt account..." /></SelectTrigger>
                    <SelectContent>
                        {debts.map(debt => (<SelectItem key={debt.id} value={debt.id}>{debt.name}</SelectItem>))}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="statementDateUpload">Statement Date / Period End Date</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !statementDate && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />{statementDate ? format(statementDate, "PPP") : <span>Pick statement date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={statementDate} onSelect={setStatementDate} initialFocus /></PopoverContent>
                </Popover>
            </div>
            <div>
                <Label htmlFor="statementFile">Statement File (PDF, CSV, etc.)</Label>
                <Input id="statementFile" type="file" onChange={(e) => setStatementFile(e.target.files ? e.target.files[0] : null)} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
            <Button type="button" onClick={handleUploadStatement}>Upload and Associate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default DebtTrackerPage;

