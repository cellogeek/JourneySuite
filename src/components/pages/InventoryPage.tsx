
"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, FileText, Send } from 'lucide-react';

// TODO: Fetch data from Firestore collection 'inventory'
const sampleInventoryData = [
  { id: '1', itemName: 'Espresso Beans (Dark Roast)', category: 'Coffee Beans', inStock: 25, unit: 'kg', parLevel: 10, primaryVendor: 'Artisan Coffee Roasters' },
  { id: '2', itemName: '12oz Paper Cups', category: 'Disposables', inStock: 1500, unit: 'pcs', parLevel: 500, primaryVendor: 'EcoPack Supplies' },
  { id: '3', itemName: 'Oat Milk (Barista Edition)', category: 'Dairy Alternatives', inStock: 30, unit: 'liters', parLevel: 15, primaryVendor: 'PlantFirst Milks' },
  { id: '4', itemName: 'Croissants (Butter)', category: 'Pastries', inStock: 45, unit: 'pcs', parLevel: 20, primaryVendor: 'Local Bakery Co.' },
  { id: '5', itemName: 'Cleaning Solution (All Purpose)', category: 'Supplies', inStock: 5, unit: 'liters', parLevel: 2, primaryVendor: 'CleanPro Inc.' },
  { id: '6', itemName: 'Whole Milk', category: 'Dairy', inStock: 20, unit: 'gallons', parLevel: 10, primaryVendor: 'FarmFresh Dairy' },
];

const InventoryPage = ({ pageId }: { pageId: string }) => {
  return (
    <Card className="shadow-lg bg-card text-card-foreground rounded-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary-text">Inventory Management</CardTitle>
        <div className="flex flex-col md:flex-row gap-4 mt-4 items-center">
          <Input
            type="search"
            placeholder="Search inventory items..."
            className="max-w-sm bg-background border-border placeholder:text-muted-foreground focus:ring-primary rounded-lg"
          />
          <div className="flex gap-2 flex-wrap">
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
              onClick={() => { /* TODO: Call Firebase function to create new item */ console.log("Add New Item"); }}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Item
            </Button>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 rounded-lg">
              <FileText className="mr-2 h-4 w-4" /> Create Purchase Order
            </Button>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 rounded-lg">
              <Send className="mr-2 h-4 w-4" /> Transfer Stock
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-muted/50">
              <TableHead className="text-primary-text">Item Name</TableHead>
              <TableHead className="text-primary-text">Category</TableHead>
              <TableHead className="text-primary-text">In Stock</TableHead>
              <TableHead className="text-primary-text">Par Level</TableHead>
              <TableHead className="text-primary-text">Primary Vendor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sampleInventoryData.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/50 text-primary-text">
                <TableCell>{item.itemName}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.inStock} {item.unit}</TableCell>
                <TableCell>{item.parLevel} {item.unit}</TableCell>
                <TableCell>{item.primaryVendor}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default InventoryPage;
