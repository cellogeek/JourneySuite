
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FilePlus2, Filter } from 'lucide-react';

// TODO: Fetch data from Firestore collection 'invoices'
const sampleInvoiceData = [
  { id: 'INV-2024-001', clientName: 'The Daily Grind Cafe', dateIssued: '2024-07-01', amount: 250.75, status: 'Paid', dataAiHint: "cafe building" },
  { id: 'INV-2024-002', clientName: 'Bean & Brew Co.', dateIssued: '2024-07-05', amount: 180.00, status: 'Unpaid', dataAiHint: "coffee shop interior" },
  { id: 'INV-2024-003', clientName: 'Corporate Catering Inc.', dateIssued: '2024-06-15', amount: 1250.50, status: 'Overdue', dataAiHint: "office catering event" },
  { id: 'INV-2024-004', clientName: 'Java Stop', dateIssued: '2024-07-10', amount: 320.00, status: 'Paid', dataAiHint: "modern cafe design" },
  { id: 'INV-2024-005', clientName: 'Morning Perks', dateIssued: '2024-07-12', amount: 95.20, status: 'Unpaid', dataAiHint: "coffee cup takeout" },
];

const getStatusBadgeVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid': return 'default'; // Will use primary color (coffee brown) by default, let's make it success
    case 'unpaid': return 'secondary'; // Or a custom variant
    case 'overdue': return 'destructive';
    default: return 'outline';
  }
};
const getStatusBadgeClasses = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid': return 'bg-success text-success-foreground border-success';
    case 'unpaid': return 'bg-amber-500 text-white border-amber-500'; // Using specific color for unpaid
    case 'overdue': return 'bg-destructive text-destructive-foreground border-destructive';
    default: return 'bg-muted text-muted-foreground border-border';
  }
}


const InvoicingPage = ({ pageId }: { pageId: string }) => {
  return (
    <Card className="shadow-lg bg-card text-card-foreground rounded-lg">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="text-2xl font-headline text-primary-text">Invoicing</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 rounded-lg">
            <Filter className="mr-2 h-4 w-4" /> Filter Invoices
          </Button>
          <Button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
            onClick={() => { /* TODO: Call Firebase function to create new invoice */ console.log("Create New Invoice"); }}
          >
            <FilePlus2 className="mr-2 h-4 w-4" /> Create New Invoice
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-muted/50">
              <TableHead className="text-primary-text">Invoice #</TableHead>
              <TableHead className="text-primary-text">Client Name</TableHead>
              <TableHead className="text-primary-text">Date Issued</TableHead>
              <TableHead className="text-primary-text">Amount</TableHead>
              <TableHead className="text-primary-text">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sampleInvoiceData.map((invoice) => (
              <TableRow key={invoice.id} className="hover:bg-muted/50 text-primary-text">
                <TableCell>{invoice.id}</TableCell>
                <TableCell>{invoice.clientName}</TableCell>
                <TableCell>{invoice.dateIssued}</TableCell>
                <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge className={cn("rounded-md", getStatusBadgeClasses(invoice.status))}>
                    {invoice.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default InvoicingPage;
