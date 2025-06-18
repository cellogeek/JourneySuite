
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, ShoppingCart, PackageCheck, RotateCcw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppContext, PurchaseOrder, PurchaseOrderItem } from '@/context/AppContext'; // Import context and types
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const PurchaseOrdersPage = ({ pageId }: { pageId: string }) => {
  const { activePurchaseOrder, setActivePurchaseOrder, setActivePageId } = useAppContext();

  const handleItemOrderedToggle = (itemId: string) => {
    if (!activePurchaseOrder) return;

    const updatedItems = activePurchaseOrder.items.map(item =>
      item.id === itemId ? { ...item, isOrdered: !item.isOrdered } : item
    );
    const allOrdered = updatedItems.every(item => item.isOrdered);
    const someOrdered = updatedItems.some(item => item.isOrdered);
    let newStatus: PurchaseOrder['status'] = activePurchaseOrder.status;

    // Only allow status changes if not already 'Order Placed' or 'Cycle Complete'
    if (activePurchaseOrder.status !== 'Order Placed' && activePurchaseOrder.status !== 'Cycle Complete') {
      if (allOrdered) {
        newStatus = 'Pending Ordering'; // All items checked, ready for PO placement
      } else if (someOrdered) {
        newStatus = 'Partially Ordered';
      } else {
        // If no items are ordered, but it was partially ordered, revert to Pending Ordering
        // Or if it was Draft/Pending Ordering and now nothing is checked, it remains Pending Ordering
        newStatus = 'Pending Ordering';
      }
    }
    setActivePurchaseOrder({ ...activePurchaseOrder, items: updatedItems, status: newStatus });
  };

  const handleMarkAllOrdered = () => {
    if (!activePurchaseOrder || activePurchaseOrder.status === 'Order Placed' || activePurchaseOrder.status === 'Cycle Complete') return;
    const updatedItems = activePurchaseOrder.items.map(item => ({ ...item, isOrdered: true }));
    setActivePurchaseOrder({ ...activePurchaseOrder, items: updatedItems, status: 'Pending Ordering' });
  };

  const handlePlaceOrder = () => {
    if (!activePurchaseOrder) return;
    const allItemsChecked = activePurchaseOrder.items.every(item => item.isOrdered);
    const someItemsChecked = activePurchaseOrder.items.some(item => item.isOrdered);

    if (!someItemsChecked) {
        alert("No items are marked as ordered. Please mark items before placing the order.");
        return;
    }

    if (!allItemsChecked) {
        if (!window.confirm("Not all items are marked as ordered. Do you want to proceed with placing the order for the marked items only? This will be treated as a partial order.")) {
            return;
        }
    }

    console.log(`Placing order for ${activePurchaseOrder.vendorName}`, activePurchaseOrder);
    setActivePurchaseOrder({ ...activePurchaseOrder, status: 'Order Placed' });
    alert(`Order for ${activePurchaseOrder.vendorName} has been marked as Placed!`);
  };

  const handleCompleteCycle = () => {
    if (!activePurchaseOrder || activePurchaseOrder.status !== 'Order Placed') {
      alert("Please ensure the order is marked as 'Order Placed' before completing the cycle.");
      return;
    }
    setActivePurchaseOrder({ ...activePurchaseOrder, status: 'Cycle Complete' });
    alert(`Order cycle for ${activePurchaseOrder.vendorName} marked as Complete.`);
  };

  const handleResetOrderCycle = () => {
    if (!activePurchaseOrder) return;
    setActivePurchaseOrder({
      ...activePurchaseOrder,
      status: 'Pending Ordering',
      orderDate: new Date().toISOString().split('T')[0], // Update to current date
      items: activePurchaseOrder.items.map(item => ({ ...item, isOrdered: false })),
    });
    alert(`Order for ${activePurchaseOrder.vendorName} has been reset for a new ordering cycle.`);
  };

  const getStatusBadgeVariant = (status: PurchaseOrder['status']): "default" | "secondary" | "destructive" | "outline" | "success" => {
    switch (status) {
      case 'Draft': return 'outline';
      case 'Pending Ordering': return 'secondary';
      case 'Partially Ordered': return 'default';
      case 'Order Placed': return 'success';
      case 'Cycle Complete': return 'default';
      default: return 'outline';
    }
  };

  if (!activePurchaseOrder) {
    return (
      <Card className="content-fade-in-up">
        <CardHeader>
          <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Purchase Order Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="default" className="border-sky-500/50 bg-sky-50/70">
            <AlertCircle className="h-5 w-5 text-sky-600" />
            <AlertTitle className="text-sky-700">No Active Purchase Order</AlertTitle>
            <AlertDescription className="text-sky-600">
              There is no purchase order currently being managed. Please create one first.
              <Button variant="link" className="p-0 h-auto ml-1 text-sky-700 hover:text-sky-800" onClick={() => setActivePageId('create_purchase_order')}>
                Create Purchase Order
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const allItemsMarked = activePurchaseOrder.items.every(item => item.isOrdered);
  const noItemsMarked = activePurchaseOrder.items.every(item => !item.isOrdered);

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

      <Card className="content-fade-in-up" style={{animationDelay: '150ms'}}>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <CardTitle className="text-2xl font-bold text-slate-800">{activePurchaseOrder.vendorName}</CardTitle>
              <CardDescription className="text-sm text-slate-500">
                Order Date: {activePurchaseOrder.orderDate}
              </CardDescription>
            </div>
            <Badge variant={getStatusBadgeVariant(activePurchaseOrder.status)} className="text-sm px-3 py-1">
              Status: {activePurchaseOrder.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-wrap gap-3">
            <Button
                onClick={handleMarkAllOrdered}
                variant="outline"
                size="action"
                disabled={allItemsMarked || activePurchaseOrder.status === 'Order Placed' || activePurchaseOrder.status === 'Cycle Complete'}
            >
              <CheckCircle2 size={18} className="mr-2" /> Mark All Items Ordered
            </Button>
            <Button
                onClick={handlePlaceOrder}
                variant="default"
                size="action"
                disabled={noItemsMarked || activePurchaseOrder.status === 'Order Placed' || activePurchaseOrder.status === 'Cycle Complete'}
            >
              <ShoppingCart size={18} className="mr-2" /> Place Order with Vendor
            </Button>
             <Button
                onClick={handleCompleteCycle}
                variant="secondary"
                size="action"
                disabled={activePurchaseOrder.status !== 'Order Placed'}
              >
              <PackageCheck size={18} className="mr-2" /> Complete Order Cycle
            </Button>
            <Button
                onClick={handleResetOrderCycle}
                variant="outline"
                size="action"
                className="border-amber-500 text-amber-600 hover:bg-amber-500/10 hover:text-amber-700"
                disabled={activePurchaseOrder.status !== 'Cycle Complete'}
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
                {activePurchaseOrder.items.map((item) => (
                  <TableRow key={item.id} className={cn(item.isOrdered && "bg-emerald-50/50 hover:bg-emerald-100/60")}>
                    <TableCell className="text-center">
                      <Checkbox
                        id={`item-${item.id}`}
                        checked={item.isOrdered}
                        onCheckedChange={() => handleItemOrderedToggle(item.id)}
                        aria-label={`Mark ${item.name} as ordered`}
                        disabled={activePurchaseOrder.status === 'Order Placed' || activePurchaseOrder.status === 'Cycle Complete'}
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
    </div>
  );
};

export default PurchaseOrdersPage;
