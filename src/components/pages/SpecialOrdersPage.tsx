
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // Placeholder if needed
import { Plus, Minus, Trash2, Package } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

interface SportLifeItem {
  id: string;
  itemName: string;
  quantity: number;
  wholesaleCost: number;
}

const SpecialOrdersPage = ({ pageId }: { pageId: string }) => {
  const { currentUser } = useAppContext(); // For potential user-specific actions later

  // --- Six Car Coffee State ---
  const [sixCarQuantity, setSixCarQuantity] = useState(1);

  // --- SportLife Nutrition State ---
  const [sportLifeCustomerName, setSportLifeCustomerName] = useState('');
  const [sportLifeItems, setSportLifeItems] = useState<SportLifeItem[]>([]);
  const [sportLifeProcessingFee, setSportLifeProcessingFee] = useState(2);

  // State for new SportLife item input
  const [newSportLifeItemName, setNewSportLifeItemName] = useState('');
  const [newSportLifeItemQuantity, setNewSportLifeItemQuantity] = useState(1);
  const [newSportLifeItemWholesaleCost, setNewSportLifeItemWholesaleCost] = useState(0);


  // --- Six Car Coffee Handlers ---
  const handleSixCarQuantityChange = (amount: number) => {
    setSixCarQuantity(prev => Math.max(1, prev + amount));
  };

  const handleSixCarOrder = () => {
    if (!currentUser) {
      alert("Please log in to place an order."); // Basic auth check
      return;
    }
    // Placeholder for Six Car order workflow
    console.log(`Six Car Order: ${sixCarQuantity} bags. User: ${currentUser.uid}, Timestamp: ${new Date().toISOString()}`);
    // TODO: Inventory Integration - Reduce Six Car Coffee SKU quantity
    // TODO: Vendor Integration - Log replenishment request for USRoast
    // TODO: Task Manager Integration - Create task for Noah: "Deliver [X] bags of coffee to Six Car."
    alert(`(Stub) Ordered ${sixCarQuantity} bags for Six Car Coffee.`);
    setSixCarQuantity(1); // Reset quantity
  };

  // --- SportLife Nutrition Handlers ---
  const handleAddSportLifeItem = () => {
    if (!newSportLifeItemName || newSportLifeItemQuantity <= 0 || newSportLifeItemWholesaleCost < 0) {
      alert("Please provide valid item name, quantity, and wholesale cost.");
      return;
    }
    const newItem: SportLifeItem = {
      id: Date.now().toString(), // Simple unique ID for client-side list
      itemName: newSportLifeItemName,
      quantity: newSportLifeItemQuantity,
      wholesaleCost: newSportLifeItemWholesaleCost,
    };
    setSportLifeItems(prev => [...prev, newItem]);
    // Reset new item inputs
    setNewSportLifeItemName('');
    setNewSportLifeItemQuantity(1);
    setNewSportLifeItemWholesaleCost(0);
  };

  const handleRemoveSportLifeItem = (itemId: string) => {
    setSportLifeItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleSaveNewItemToCatalog = () => {
    // Placeholder for saving a new item to a master catalog
    if(!newSportLifeItemName) {
        alert("Please enter an item name to save to catalog.");
        return;
    }
    console.log(`(Stub) Saving item to catalog: ${newSportLifeItemName}`);
    // TODO: Firestore - Add newSportLifeItemName (and potentially other details) to a global item catalog
    alert(`(Stub) Item "${newSportLifeItemName}" would be saved to catalog.`);
  };
  
  const handleSportLifeSubmitOrder = () => {
    if (!currentUser) {
      alert("Please log in to submit an order.");
      return;
    }
    if (!sportLifeCustomerName || sportLifeItems.length === 0) {
      alert("Please provide customer name and add at least one item.");
      return;
    }
    // Placeholder for SportLife order workflow
    console.log({
      message: "SportLife Order Submitted",
      customerName: sportLifeCustomerName,
      items: sportLifeItems,
      processingFee: sportLifeProcessingFee,
      user: currentUser.uid,
      timestamp: new Date().toISOString()
    });
    // TODO: CRM Integration - Check/create customer, log order.
    // TODO: Invoicing Integration - Generate invoice.
    // TODO: Inventory Integration - Update levels, flag reorders. (New items could be added to master inventory from here too)
    // TODO: Task Manager Integration - Create two tasks for Noah: "1. Order items for [Customer Name]" and "2. Deliver order to [Customer Name]".
    alert(`(Stub) Order for ${sportLifeCustomerName} submitted.`);
    // Reset form
    setSportLifeCustomerName('');
    setSportLifeItems([]);
    setSportLifeProcessingFee(2);
    setNewSportLifeItemName('');
    setNewSportLifeItemQuantity(1);
    setNewSportLifeItemWholesaleCost(0);
  };


  return (
    <div className="space-y-8">
      <Card className="content-fade-in-up">
        <CardHeader>
          <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Special Orders Management</CardTitle>
          <CardDescription className="text-lg text-slate-500 pt-1">
            Manage unique, recurring, and custom orders for key clients.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Section A: Six Car Coffee Orders */}
      <Card className="content-fade-in-up" style={{ animationDelay: '150ms' }}>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-900 flex items-center">
            <Package size={28} className="mr-3 text-sky-600" /> Six Car Coffee Supply
          </CardTitle>
          <CardDescription>Order weekly coffee bag supply for Six Car.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <Label htmlFor="sixCarQuantity" className="text-lg font-semibold text-slate-700">
            Quantity of Coffee Bags:
          </Label>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="icon" onClick={() => handleSixCarQuantityChange(-1)} aria-label="Decrease quantity">
              <Minus size={20} />
            </Button>
            <Input
              id="sixCarQuantity"
              type="number"
              value={sixCarQuantity}
              onChange={(e) => setSixCarQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-24 text-center text-xl font-bold"
              min="1"
            />
            <Button variant="outline" size="icon" onClick={() => handleSixCarQuantityChange(1)} aria-label="Increase quantity">
              <Plus size={20} />
            </Button>
          </div>
          <Button onClick={handleSixCarOrder} size="action" className="w-full max-w-xs">
            Place Order
          </Button>
        </CardContent>
      </Card>

      {/* Section B: SportLife Nutrition Orders */}
      <Card className="content-fade-in-up" style={{ animationDelay: '300ms' }}>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-900 flex items-center">
             <Package size={28} className="mr-3 text-orange-500" /> SportLife Nutrition Orders
          </CardTitle>
          <CardDescription>Create and manage custom orders for SportLife Nutrition.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="sportLifeCustomerName" className="font-semibold">Customer Name</Label>
            <Input
              id="sportLifeCustomerName"
              value={sportLifeCustomerName}
              onChange={(e) => setSportLifeCustomerName(e.target.value)}
              placeholder="e.g., SportLife Nutrition (Main Account)"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Add Item to Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <Label htmlFor="newItemName">Item Name</Label>
                  <Input id="newItemName" value={newSportLifeItemName} onChange={e => setNewSportLifeItemName(e.target.value)} placeholder="e.g., Protein Powder X"/>
                </div>
                <div>
                  <Label htmlFor="newItemQuantity">Quantity</Label>
                  <Input id="newItemQuantity" type="number" value={newSportLifeItemQuantity} onChange={e => setNewSportLifeItemQuantity(Math.max(1, parseInt(e.target.value) || 1))} min="1"/>
                </div>
                <div>
                  <Label htmlFor="newItemWholesaleCost">Wholesale Cost ($)</Label>
                  <Input id="newItemWholesaleCost" type="number" value={newSportLifeItemWholesaleCost} onChange={e => setNewSportLifeItemWholesaleCost(parseFloat(e.target.value) || 0)} min="0" step="0.01"/>
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleAddSportLifeItem} variant="outline">Add Item to Current Order</Button>
                <Button onClick={handleSaveNewItemToCatalog} variant="outline" disabled={!newSportLifeItemName}>Save New Item to Catalog</Button>
              </div>
            </CardContent>
          </Card>
            
          {sportLifeItems.length > 0 && (
            <div>
              <h4 className="text-md font-semibold mb-2 text-slate-700">Current Order Items:</h4>
              <div className="space-y-2 rounded-md border p-3 bg-slate-50/50">
                {sportLifeItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-white/70 rounded shadow-sm">
                    <div>
                      <p className="font-medium text-slate-800">{item.itemName}</p>
                      <p className="text-xs text-slate-500">Qty: {item.quantity}, Cost: ${item.wholesaleCost.toFixed(2)} each</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveSportLifeItem(item.id)} aria-label="Remove item">
                      <Trash2 size={16} className="text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="sportLifeProcessingFee" className="font-semibold">Processing Fee (%)</Label>
            <Input
              id="sportLifeProcessingFee"
              type="number"
              value={sportLifeProcessingFee}
              onChange={(e) => setSportLifeProcessingFee(parseFloat(e.target.value) || 0)}
              min="0"
            />
          </div>

          <Button onClick={handleSportLifeSubmitOrder} size="action" className="w-full">
            Submit SportLife Order
          </Button>
        </CardContent>
      </Card>

      {/* Section C: Bee's Fundraising Orders */}
      <Card className="content-fade-in-up" style={{ animationDelay: '450ms' }}>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-900 flex items-center">
            <Package size={28} className="mr-3 text-amber-500" /> Bee's Fundraising Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">
            This section is a placeholder for Bee's Fundraising orders.
            Functionality for this module will be implemented in a future update, following a similar integration pattern.
          </p>
          {/* TODO: Implement UI and workflow for Bee's Fundraising */}
        </CardContent>
      </Card>
    </div>
  );
};

export default SpecialOrdersPage;

    