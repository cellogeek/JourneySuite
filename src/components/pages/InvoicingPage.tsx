
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge'; // Badge component will use new styles
import { FilePlus2, Filter } from 'lucide-react';
import { cn } from '@/lib/utils'; // For conditional classes

// TODO: Fetch data from Firestore collection 'invoices'
const sampleInvoiceData = [
  { id: 'INV-2024-001', clientName: 'The Daily Grind Cafe', dateIssued: '2024-07-01', amount: 250.75, status: 'Paid', dataAiHint: "cafe building" },
  { id: 'INV-2024-002', clientName: 'Bean & Brew Co.', dateIssued: '2024-07-05', amount: 180.00, status: 'Unpaid', dataAiHint: "coffee shop interior" },
  { id: 'INV-2024-003', clientName: 'Corporate Catering Inc.', dateIssued: '2024-06-15', amount: 1250.50, status: 'Overdue', dataAiHint: "office catering event" },
  { id: 'INV-2024-004', clientName: 'Java Stop', dateIssued: '2024-07-10', amount: 320.00, status: 'Paid', dataAiHint: "modern cafe design" },
  { id: 'INV-2024-005', clientName: 'Morning Perks', dateIssued: '2024-07-12', amount: 95.20, status: 'Unpaid', dataAiHint: "coffee cup takeout" },
];

// Badge variants are now primarily handled by the Badge component itself based on its variant prop
const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" | "success" => {
  switch (status.toLowerCase()) {
    case 'paid': return 'success';
    case 'unpaid': return 'secondary'; // Using a less prominent color like amber
    case 'overdue': return 'destructive';
    default: return 'outline';
  }
};

const InvoicingPage = ({ pageId }: { pageId: string }) => {
  return (
    <Card> {/* Glassmorphism applied by Card component */}
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4">
        <CardTitle className="text-2xl font-bold text-slate-900">Invoicing</CardTitle>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="text-sm rounded-lg py-2 px-4"> {/* Adjusted secondary button */}
            <Filter size={16} className="mr-2 text-slate-400" /> Filter Invoices
          </Button>
          <Button 
            variant="default" 
            size="action"
            onClick={() => { /* TODO: Call Firebase function to create new invoice */ console.log("Create New Invoice"); }}
          >
            <FilePlus2 size={18} className="mr-2" /> Create New Invoice
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-brand-slate-200/80">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-100/50">
                <TableHead>Invoice #</TableHead>
                <TableHead>Client Name</TableHead>
                <TableHead>Date Issued</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleInvoiceData.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium text-slate-700">{invoice.id}</TableCell>
                  <TableCell>{invoice.clientName}</TableCell>
                  <TableCell>{invoice.dateIssued}</TableCell>
                  <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(invoice.status)} className="capitalize">
                      {invoice.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoicingPage;
