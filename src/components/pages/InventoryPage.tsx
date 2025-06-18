
"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, FileText, Send, Search, ListPlus } from 'lucide-react'; // Added ListPlus
import { useAppContext } from '@/context/AppContext'; // Import context

// Sample data - consider moving to a shared location or fetching from Firestore
export const sampleInventoryData = [
  { id: 'inv-item-1', itemName: 'Espresso Beans (Dark Roast)', category: 'Coffee Beans', inStock: 25, unit: 'kg', parLevel: 10, primaryVendor: 'Artisan Coffee Roasters', sku: 'CR-DR-1KG' },
  { id: 'inv-item-2', itemName: '12oz Paper Cups', category: 'Disposables', inStock: 1500, unit: 'pcs', parLevel: 500, primaryVendor: 'EcoPack Supplies', sku: 'DP-PC-12OZ' },
  { id: 'inv-item-3', itemName: 'Oat Milk (Barista Edition)', category: 'Dairy Alternatives', inStock: 30, unit: 'liters', parLevel: 15, primaryVendor: 'PlantFirst Milks', sku: 'DA-OM-1L' },
  { id: 'inv-item-4', itemName: 'Croissants (Butter)', category: 'Pastries', inStock: 45, unit: 'pcs', parLevel: 20, primaryVendor: 'Local Bakery Co.', sku: 'PS-BC-UNIT' },
  { id: 'inv-item-5', itemName: 'Cleaning Solution (All Purpose)', category: 'Supplies', inStock: 5, unit: 'liters', parLevel: 2, primaryVendor: 'CleanPro Inc.', sku: 'SP-CL-1L' },
  { id: 'inv-item-6', itemName: 'Whole Milk', category: 'Dairy', inStock: 20, unit: 'gallons', parLevel: 10, primaryVendor: 'FarmFresh Dairy', sku: 'DR-WM-1G' },
  { id: 'inv-item-7', itemName: 'Colombian Supremo (Medium Roast)', category: 'Coffee Beans', unit: 'kg', sku: 'CR-CS-1KG', inStock: 15, parLevel: 8, primaryVendor: 'Artisan Coffee Roasters' },
  { id: 'inv-item-8', itemName: 'Decaf Blend', category: 'Coffee Beans', unit: '500g bags', sku: 'CR-DC-500G', inStock: 10, parLevel: 5, primaryVendor: 'Artisan Coffee Roasters' },
  { id: 'inv-item-9', itemName: 'Single Origin Ethiopian Yirgacheffe', category: 'Coffee Beans', unit: 'kg', sku: 'CR-ET-1KG', inStock: 7, parLevel: 4, primaryVendor: 'Artisan Coffee Roasters' },
];


const InventoryPage = ({ pageId }: { pageId: string }) => {
  const { setActivePageId } = useAppContext();

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <CardTitle className="text-2xl font-bold text-slate-900">Inventory Management</CardTitle>
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search inventory items..."
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          <Button
            variant="default"
            size="action"
            onClick={() => { /* TODO: Call Firebase function to create new item */ console.log("Add New Item"); }}
          >
            <PlusCircle size={18} className="mr-2" /> Add New Item
          </Button>
          <Button
            variant="outline"
            className="text-sm rounded-lg py-2 px-4"
            onClick={() => setActivePageId('create_purchase_order')} // Navigate to Create PO page
          >
            <ListPlus size={16} className="mr-2 text-slate-400" /> Create Purchase Order
          </Button>
          <Button variant="outline" className="text-sm rounded-lg py-2 px-4">
            <Send size={16} className="mr-2 text-slate-400" /> Transfer Stock
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-brand-slate-200/80">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-100/50">
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>In Stock</TableHead>
                <TableHead>Par Level</TableHead>
                <TableHead>Primary Vendor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleInventoryData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-slate-700">{item.itemName}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.inStock} {item.unit}</TableCell>
                  <TableCell>{item.parLevel} {item.unit}</TableCell>
                  <TableCell>{item.primaryVendor}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryPage;
