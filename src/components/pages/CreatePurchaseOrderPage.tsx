
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppContext, PurchaseOrder, PurchaseOrderItem } from '@/context/AppContext';
import { ListPlus, ShoppingCart, Package } from 'lucide-react';

// Sample inventory data (can be fetched or managed elsewhere in a real app)
// Duplicating for now, ideally this comes from a shared source or Firestore
const sampleInventoryItems = [
  { id: 'inv-item-1', itemName: 'Espresso Beans (Dark Roast)', category: 'Coffee Beans', unit: 'kg', sku: 'CR-DR-1KG', primaryVendor: 'Artisan Coffee Roasters' },
  { id: 'inv-item-2', itemName: '12oz Paper Cups', category: 'Disposables', unit: 'pcs', sku: 'DP-PC-12OZ', primaryVendor: 'EcoPack Supplies' },
  { id: 'inv-item-3', itemName: 'Oat Milk (Barista Edition)', category: 'Dairy Alternatives', unit: 'liters', sku: 'DA-OM-1L', primaryVendor: 'PlantFirst Milks' },
  { id: 'inv-item-4', itemName: 'Croissants (Butter)', category: 'Pastries', unit: 'pcs', sku: 'PS-BC-UNIT', primaryVendor: 'Local Bakery Co.' },
  { id: 'inv-item-5', itemName: 'Colombian Supremo (Medium Roast)', category: 'Coffee Beans', unit: 'kg', sku: 'CR-CS-1KG', primaryVendor: 'Artisan Coffee Roasters' },
  { id: 'inv-item-6', itemName: 'Decaf Blend', category: 'Coffee Beans', unit: '500g bags', sku: 'CR-DC-500G', primaryVendor: 'Artisan Coffee Roasters' },
  { id: 'inv-item-7', itemName: 'Single Origin Ethiopian Yirgacheffe', category: 'Coffee Beans', unit: 'kg', sku: 'CR-ET-1KG', primaryVendor: 'Artisan Coffee Roasters' },
];

// Sample vendors (can be fetched or managed elsewhere)
const sampleVendors = [
  { id: 'vendor-1', name: 'Artisan Coffee Roasters' },
  { id: 'vendor-2', name: 'EcoPack Supplies' },
  { id: 'vendor-3', name: 'PlantFirst Milks' },
  { id: 'vendor-4', name: 'Local Bakery Co.' },
];

interface OrderItemInput {
  itemId: string;
  quantity: number;
}

const CreatePurchaseOrderPage = ({ pageId }: { pageId: string }) => {
  const { setActivePageId, setActivePurchaseOrder } = useAppContext();
  const [selectedVendor, setSelectedVendor] = useState<string>(sampleVendors[0].id); // Default to first vendor
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});

  const handleQuantityChange = (itemId: string, quantityStr: string) => {
    const quantity = parseInt(quantityStr, 10);
    setItemQuantities(prev => ({
      ...prev,
      [itemId]: isNaN(quantity) || quantity < 0 ? 0 : quantity,
    }));
  };

  const itemsForSelectedVendor = sampleInventoryItems.filter(
    item => item.primaryVendor === sampleVendors.find(v => v.id === selectedVendor)?.name
  );

  const handleGeneratePO = () => {
    const vendor = sampleVendors.find(v => v.id === selectedVendor);
    if (!vendor) {
      alert("Please select a valid vendor.");
      return;
    }

    const poItems: PurchaseOrderItem[] = itemsForSelectedVendor
      .map(invItem => {
        const quantity = itemQuantities[invItem.id] || 0;
        if (quantity > 0) {
          return {
            id: invItem.id, // Use inventory item's ID
            name: invItem.itemName,
            sku: invItem.sku,
            quantity: quantity,
            unit: invItem.unit,
            isOrdered: false,
          };
        }
        return null;
      })
      .filter((item): item is PurchaseOrderItem => item !== null);

    if (poItems.length === 0) {
      alert("Please add at least one item with a quantity greater than 0.");
      return;
    }

    const newPurchaseOrder: PurchaseOrder = {
      id: `po-${Date.now()}`, // Simple unique ID for mockup
      vendorName: vendor.name,
      orderDate: new Date().toISOString().split('T')[0],
      status: 'Draft', // Start as Draft, user can finalize on PO page
      items: poItems,
    };

    setActivePurchaseOrder(newPurchaseOrder);
    setActivePageId('purchase_orders'); // Navigate to the manage POs page
  };

  return (
    <div className="space-y-8">
      <Card className="content-fade-in-up">
        <CardHeader>
          <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 flex items-center">
            <ListPlus size={32} className="mr-3 text-sky-600" /> Create New Purchase Order
          </CardTitle>
          <CardDescription className="text-lg text-slate-500 pt-1">
            Select a vendor and specify item quantities for your new PO.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="content-fade-in-up" style={{animationDelay: '150ms'}}>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-800">Vendor Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="vendorSelect">Select Vendor</Label>
          <Select value={selectedVendor} onValueChange={setSelectedVendor}>
            <SelectTrigger id="vendorSelect" className="w-full md:w-1/2">
              <SelectValue placeholder="Select a vendor" />
            </SelectTrigger>
            <SelectContent>
              {sampleVendors.map(vendor => (
                <SelectItem key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="content-fade-in-up" style={{animationDelay: '300ms'}}>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-800">Add Items to Order</CardTitle>
          <CardDescription>
            Only items associated with "{sampleVendors.find(v => v.id === selectedVendor)?.name || 'Selected Vendor'}" are shown.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {itemsForSelectedVendor.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-brand-slate-200/80">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-100/50">
                    <TableHead>Item Name</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="w-[150px] text-right">Quantity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemsForSelectedVendor.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-slate-700">{item.itemName}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          min="0"
                          value={itemQuantities[item.id] || ''}
                          onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                          className="w-24 text-right ml-auto"
                          placeholder="0"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-slate-500 text-center py-4">
              No items found for this vendor, or please select a vendor first.
            </p>
          )}
          <div className="mt-6 text-right">
            <Button onClick={handleGeneratePO} size="action" disabled={itemsForSelectedVendor.length === 0}>
              <ShoppingCart size={18} className="mr-2" /> Generate Purchase Order
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePurchaseOrderPage;
