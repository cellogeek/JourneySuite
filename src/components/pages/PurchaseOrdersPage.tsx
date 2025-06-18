
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, ShoppingCart, PackageCheck, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PurchaseOrderItem {
  id: string;
  name: string;
  sku?: string; // Stock Keeping Unit
  quantity: number;
  unit: string;
  isOrdered: boolean;
}

interface PurchaseOrder {
  id: string;
  vendorName: string;
  orderDate: string;
  status: 'Draft' | 'Pending Ordering' | 'Partially Ordered' | 'Order Placed' | 'Cycle Complete';
  items: PurchaseOrderItem[];
}

// Sample data for a single purchase order
const initialPurchaseOrderData: PurchaseOrder = {
  id: 'po-001',
  vendorName: 'Artisan Coffee Roasters',
  orderDate: new Date().toISOString().split('T')[0],
  status: 'Pending Ordering',
  items: [
    { id: 'item-101', name: 'Espresso Beans (Dark Roast)', sku: 'CR-DR-1KG', quantity: 5, unit: 'kg', isOrdered: false },
    { id: 'item-102', name: 'Colombian Supremo (Medium Roast)', sku: 'CR-CS-1KG', quantity: 3, unit: 'kg', isOrdered: false },
    { id: 'item-103', name: 'Decaf Blend', sku: 'CR-DC-500G', quantity: 2, unit: '500g bags', isOrdered: false },
    { id: 'item-104', name: 'Single Origin Ethiopian Yirgacheffe', sku: 'CR-ET-1KG', quantity: 2, unit: 'kg', isOrdered: true }, // Example of one already ordered
  ],
};

const PurchaseOrdersPage = ({ pageId }: { pageId: string }) => {
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder>(initialPurchaseOrderData);

  const handleItemOrderedToggle = (itemId: string) => {
    setPurchaseOrder(prevOrder => {
      const updatedItems = prevOrder.items.map(item =>
        item.id === itemId ? { ...item, isOrdered: !item.isOrdered } : item
      );
      const allOrdered = updatedItems.every(item => item.isOrdered);
      const someOrdered = updatedItems.some(item => item.isOrdered);
      let newStatus: PurchaseOrder['status'] = prevOrder.status;

      if (prevOrder.status !== 'Order Placed' && prevOrder.status !== 'Cycle Complete') {
        if (allOrdered) {
          newStatus = 'Pending Ordering'; // Still pending overall placement, but items are ready
        } else if (someOrdered) {
          newStatus = 'Partially Ordered';
        } else {
          newStatus = 'Pending Ordering';
        }
      }
      return { ...prevOrder, items: updatedItems, status: newStatus };
    });
  };

  const handleMarkAllOrdered = () => {
    setPurchaseOrder(prevOrder => {
      if (prevOrder.status === 'Order Placed' || prevOrder.status === 'Cycle Complete') return prevOrder;
      const updatedItems = prevOrder.items.map(item => ({ ...item, isOrdered: true }));
      return { ...prevOrder, items: updatedItems, status: 'Pending Ordering' };
    });
  };
  
  const handlePlaceOrder = () => {
    // In a real app, this would trigger API calls, send emails, etc.
    // For now, just update status and log.
    const allItemsChecked = purchaseOrder.items.every(item => item.isOrdered);
    if (!allItemsChecked && purchaseOrder.status !== 'Partially Ordered') {
        if (!window.confirm("Not all items are marked as ordered. Do you want to proceed with placing the order for the marked items only?")) {
            return;
        }
    } else if (!allItemsChecked && purchaseOrder.status === 'Partially Ordered') {
         if (!window.confirm("This is a partial order. Are you sure you want to place it now?")) {
            return;
        }
    }

    console.log(`Placing order for ${purchaseOrder.vendorName}`, purchaseOrder);
    setPurchaseOrder(prevOrder => ({ ...prevOrder, status: 'Order Placed' }));
    alert(`Order for ${purchaseOrder.vendorName} has been marked as Placed!`);
  };

  const handleCompleteCycle = () => {
     if (purchaseOrder.status !== 'Order Placed') {
      alert("Please ensure the order is marked as 'Order Placed' before completing the cycle.");
      return;
    }
    setPurchaseOrder(prevOrder => ({ ...prevOrder, status: 'Cycle Complete' }));
    alert(`Order cycle for ${purchaseOrder.vendorName} marked as Complete.`);
  };
  
  const handleResetOrderCycle = () => {
    // Resets item ordered status and PO status for a new cycle
    setPurchaseOrder(prevOrder => ({
      ...prevOrder,
      status: 'Pending Ordering',
      orderDate: new Date().toISOString().split('T')[0], // Update to current date
      items: prevOrder.items.map(item => ({ ...item, isOrdered: false })),
    }));
    alert(`Order for ${purchaseOrder.vendorName} has been reset for a new ordering cycle.`);
  };

  const getStatusBadgeVariant = (status: PurchaseOrder['status']): "default" | "secondary" | "destructive" | "outline" | "success" => {
    switch (status) {
      case 'Draft': return 'outline';
      case 'Pending Ordering': return 'secondary';
      case 'Partially Ordered': return 'default'; // Sky blue/Primary
      case 'Order Placed': return 'success';
      case 'Cycle Complete': return 'default'; // Could be a different color if needed, e.g. darker blue or grey
      default: return 'outline';
    }
  };
  
  const allItemsMarked = purchaseOrder.items.every(item => item.isOrdered);
  const noItemsMarked = purchaseOrder.items.every(item => !item.isOrdered);

  return (
    <div className="space-y-8">
      <Card className="content-fade-in-up">
        <CardHeader>
          <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Purchase Order Management</CardTitle>
          <CardDescription className="text-lg text-slate-500 pt-1">
            Track and manage your vendor purchase orders.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Displaying a single, hardcoded PO for now */}
      <Card className="content-fade-in-up" style={{animationDelay: '150ms'}}>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <CardTitle className="text-2xl font-bold text-slate-800">{purchaseOrder.vendorName}</CardTitle>
              <CardDescription className="text-sm text-slate-500">
                Order Date: {purchaseOrder.orderDate}
              </CardDescription>
            </div>
            <Badge variant={getStatusBadgeVariant(purchaseOrder.status)} className="text-sm px-3 py-1">
              Status: {purchaseOrder.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-wrap gap-3">
            <Button 
                onClick={handleMarkAllOrdered} 
                variant="outline" 
                size="action"
                disabled={allItemsMarked || purchaseOrder.status === 'Order Placed' || purchaseOrder.status === 'Cycle Complete'}
            >
              <CheckCircle2 size={18} className="mr-2" /> Mark All Items Ordered
            </Button>
            <Button 
                onClick={handlePlaceOrder} 
                variant="default" 
                size="action"
                disabled={noItemsMarked || purchaseOrder.status === 'Order Placed' || purchaseOrder.status === 'Cycle Complete'}
            >
              <ShoppingCart size={18} className="mr-2" /> Place Order with Vendor
            </Button>
             <Button 
                onClick={handleCompleteCycle} 
                variant="secondary" 
                size="action"
                disabled={purchaseOrder.status !== 'Order Placed'}
              >
              <PackageCheck size={18} className="mr-2" /> Complete Order Cycle
            </Button>
            <Button 
                onClick={handleResetOrderCycle} 
                variant="outline" 
                size="action"
                className="border-amber-500 text-amber-600 hover:bg-amber-500/10 hover:text-amber-700"
                disabled={purchaseOrder.status !== 'Cycle Complete'}
            >
              <RotateCcw size={18} className="mr-2" /> Start New Cycle
            </Button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-brand-slate-200/80">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-100/50">
                  <TableHead className="w-[60px] text-center">Ordered</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseOrder.items.map((item) => (
                  <TableRow key={item.id} className={cn(item.isOrdered && "bg-emerald-50/50 hover:bg-emerald-100/60")}>
                    <TableCell className="text-center">
                      <Checkbox
                        id={`item-${item.id}`}
                        checked={item.isOrdered}
                        onCheckedChange={() => handleItemOrderedToggle(item.id)}
                        aria-label={`Mark ${item.name} as ordered`}
                        disabled={purchaseOrder.status === 'Order Placed' || purchaseOrder.status === 'Cycle Complete'}
                      />
                    </TableCell>
                    <TableCell className={cn("font-medium", item.isOrdered ? "text-slate-500 line-through" : "text-slate-700")}>
                      {item.name}
                    </TableCell>
                    <TableCell className={cn(item.isOrdered ? "text-slate-400 line-through" : "text-slate-500")}>
                      {item.sku || 'N/A'}
                    </TableCell>
                    <TableCell className={cn("text-right", item.isOrdered ? "text-slate-400 line-through" : "text-slate-600")}>
                      {item.quantity}
                    </TableCell>
                    <TableCell className={cn(item.isOrdered ? "text-slate-400 line-through" : "text-slate-600")}>
                      {item.unit}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {/* TODO: Add functionality to create new POs, select vendors, add/remove items from a PO */}
    </div>
  );
};

export default PurchaseOrdersPage;
