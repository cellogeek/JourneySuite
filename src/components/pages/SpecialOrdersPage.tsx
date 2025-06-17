
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Minus, Trash2, Package, UserPlus, Library, Users, Edit, Save, Search } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";


interface SportLifeItem {
  id: string;
  itemName: string;
  quantity: number;
  wholesaleCost: number;
}

interface SportLifeCustomerOrder {
  id: string;
  customerName: string;
  items: SportLifeItem[];
  processingFeePercent: number;
}

interface SportLifeCatalogItem {
  id: string;
  itemName: string;
  wholesaleCost: number;
}


const SpecialOrdersPage = ({ pageId }: { pageId: string }) => {
  const { currentUser } = useAppContext();
  const { toast } = useToast();

  // --- Six Car Coffee State ---
  const [sixCarQuantity, setSixCarQuantity] = useState(1);

  // --- Canyon Country Church State ---
  const [canyonCountryChurchQuantity, setCanyonCountryChurchQuantity] = useState(1);

  // --- SportLife Nutrition State ---
  const [currentSLCCustomerName, setCurrentSLCCustomerName] = useState('');
  const [currentSLCItems, setCurrentSLCItems] = useState<SportLifeItem[]>([]);
  const [currentSLCProcessingFee, setCurrentSLCProcessingFee] = useState(2);
  const [sportLifeBatchOrders, setSportLifeBatchOrders] = useState<SportLifeCustomerOrder[]>([]);

  const [newSLItemName, setNewSLItemName] = useState('');
  const [newSLItemQuantity, setNewSLItemQuantity] = useState(1);
  const [newSLItemWholesaleCost, setNewSLItemWholesaleCost] = useState(0);

  // Catalog State
  const [sportLifeCatalog, setSportLifeCatalog] = useState<SportLifeCatalogItem[]>([
    { id: 'cat1', itemName: 'Premium Protein Powder', wholesaleCost: 25.99 },
    { id: 'cat2', itemName: 'Energy Bars (Box of 12)', wholesaleCost: 15.50 },
    { id: 'cat3', itemName: 'BCAA Capsules', wholesaleCost: 19.75 },
    { id: 'cat4', itemName: 'Creatine Monohydrate', wholesaleCost: 22.00 },
    { id: 'cat5', itemName: 'Multivitamin Gummies', wholesaleCost: 12.99 },
  ]);
  const [filteredCatalogItems, setFilteredCatalogItems] = useState<SportLifeCatalogItem[]>([]);
  const [showCatalogSuggestions, setShowCatalogSuggestions] = useState(false);
  const [editingCatalogItem, setEditingCatalogItem] = useState<SportLifeCatalogItem | null>(null);
  const [editCatalogItemName, setEditCatalogItemName] = useState('');
  const [editCatalogItemCost, setEditCatalogItemCost] = useState(0);
  const [catalogSearchTerm, setCatalogSearchTerm] = useState('');


  // --- Six Car Coffee Handlers ---
  const handleSixCarQuantityChange = (amount: number) => {
    setSixCarQuantity(prev => Math.max(1, prev + amount));
  };

  const handleSixCarOrder = () => {
    if (!currentUser) {
      alert("Please log in to place an order.");
      return;
    }
    // TODO: Implement actual workflow: Inventory reduction, Vendor request, Task creation
    console.log(`Six Car Order: ${sixCarQuantity} bags. User: ${currentUser.uid}, Timestamp: ${new Date().toISOString()}`);
    alert(`(Stub) Ordered ${sixCarQuantity} bags for Six Car Coffee.`);
    setSixCarQuantity(1);
  };

  // --- Canyon Country Church Handlers ---
  const handleCanyonCountryChurchQuantityChange = (amount: number) => {
    setCanyonCountryChurchQuantity(prev => Math.max(1, prev + amount));
  };

  const handleCanyonCountryChurchOrder = () => {
    if (!currentUser) {
      alert("Please log in to place an order.");
      return;
    }
    // TODO: Implement actual workflow (similar to Six Car but for Canyon Country Church)
    console.log(`Canyon Country Church Order: ${canyonCountryChurchQuantity} bags. User: ${currentUser.uid}, Timestamp: ${new Date().toISOString()}`);
    alert(`(Stub) Ordered ${canyonCountryChurchQuantity} bags for Canyon Country Church.`);
    setCanyonCountryChurchQuantity(1);
  };


  // --- SportLife Nutrition Catalog Logic ---
  useEffect(() => {
    if (newSLItemName.trim() === '') {
      setFilteredCatalogItems([]);
      setShowCatalogSuggestions(false);
      return;
    }
    const suggestions = sportLifeCatalog.filter(item =>
      item.itemName.toLowerCase().includes(newSLItemName.toLowerCase())
    );
    setFilteredCatalogItems(suggestions);
    setShowCatalogSuggestions(suggestions.length > 0);
  }, [newSLItemName, sportLifeCatalog]);

  const handleSelectCatalogSuggestion = (item: SportLifeCatalogItem) => {
    setNewSLItemName(item.itemName);
    setNewSLItemWholesaleCost(item.wholesaleCost);
    setShowCatalogSuggestions(false);
  };

  const handleSaveNewItemToCatalog = () => {
    if (!newSLItemName.trim()) {
      alert("Please enter an item name.");
      return;
    }
    if (newSLItemWholesaleCost < 0) {
      alert("Wholesale cost cannot be negative.");
      return;
    }

    setSportLifeCatalog(prevCatalog => {
      const existingItemIndex = prevCatalog.findIndex(item => item.itemName.toLowerCase() === newSLItemName.trim().toLowerCase());
      if (existingItemIndex > -1) {
        const existingCatalogItem = prevCatalog[existingItemIndex];
        if (existingCatalogItem.wholesaleCost === newSLItemWholesaleCost) {
            alert(`"${newSLItemName.trim()}" already in catalog at $${newSLItemWholesaleCost.toFixed(2)}. No change made.`);
            return prevCatalog;
        } else if (newSLItemWholesaleCost < existingCatalogItem.wholesaleCost) {
            toast({
                title: "Lower Price Warning",
                description: `"${newSLItemName.trim()}" price ($${newSLItemWholesaleCost.toFixed(2)}) is less than catalog ($${existingCatalogItem.wholesaleCost.toFixed(2)}). Catalog updated.`,
                variant: "destructive",
            });
        } else {
             alert(`Catalog price for "${newSLItemName.trim()}" updated to $${newSLItemWholesaleCost.toFixed(2)}.`);
        }
        const updatedCatalog = [...prevCatalog];
        updatedCatalog[existingItemIndex] = { ...updatedCatalog[existingItemIndex], wholesaleCost: newSLItemWholesaleCost };
        return updatedCatalog;
      } else {
        // Add new item
        const newCatalogItem: SportLifeCatalogItem = {
          id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
          itemName: newSLItemName.trim(),
          wholesaleCost: newSLItemWholesaleCost,
        };
        alert(`Item "${newCatalogItem.itemName}" added to catalog with cost $${newSLItemWholesaleCost.toFixed(2)}.`);
        return [...prevCatalog, newCatalogItem];
      }
    });
  };

  const handleSaveItemFromOrderToCatalog = (itemToSave: SportLifeItem) => {
    setSportLifeCatalog(prevCatalog => {
      const existingItemIndex = prevCatalog.findIndex(catItem => catItem.itemName.toLowerCase() === itemToSave.itemName.toLowerCase());

      if (existingItemIndex > -1) {
        const existingCatalogItem = prevCatalog[existingItemIndex];
        if (itemToSave.wholesaleCost === existingCatalogItem.wholesaleCost) {
          alert(`"${itemToSave.itemName}" is already in catalog at $${itemToSave.wholesaleCost.toFixed(2)}. No change made.`);
          return prevCatalog;
        } else if (itemToSave.wholesaleCost < existingCatalogItem.wholesaleCost) {
          toast({
            title: "Lower Price Warning",
            description: `"${itemToSave.itemName}" price ($${itemToSave.wholesaleCost.toFixed(2)}) is less than catalog ($${existingCatalogItem.wholesaleCost.toFixed(2)}). Catalog updated.`,
            variant: "destructive",
          });
          const updatedCatalog = [...prevCatalog];
          updatedCatalog[existingItemIndex] = { ...updatedCatalog[existingItemIndex], wholesaleCost: itemToSave.wholesaleCost };
          return updatedCatalog;
        } else { // Price is higher
          const updatedCatalog = [...prevCatalog];
          updatedCatalog[existingItemIndex] = { ...updatedCatalog[existingItemIndex], wholesaleCost: itemToSave.wholesaleCost };
          alert(`Catalog price for "${itemToSave.itemName}" updated to $${itemToSave.wholesaleCost.toFixed(2)}.`);
          return updatedCatalog;
        }
      } else {
        // Item doesn't exist, add new
        const newCatalogItem: SportLifeCatalogItem = {
          id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
          itemName: itemToSave.itemName,
          wholesaleCost: itemToSave.wholesaleCost,
        };
        alert(`Item "${newCatalogItem.itemName}" added to catalog. Cost: $${newCatalogItem.wholesaleCost.toFixed(2)}.`);
        return [...prevCatalog, newCatalogItem];
      }
    });
  };


  // --- SportLife Nutrition Order Handlers ---
  const handleAddSLItemToCurrentCustomer = () => {
    if (!newSLItemName.trim() || newSLItemQuantity <= 0 || newSLItemWholesaleCost < 0) {
      alert("Please provide valid item name, quantity (positive), and wholesale cost (non-negative).");
      return;
    }
    const newItem: SportLifeItem = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      itemName: newSLItemName.trim(),
      quantity: newSLItemQuantity,
      wholesaleCost: newSLItemWholesaleCost,
    };
    setCurrentSLCItems(prev => [...prev, newItem]);

    // Update catalog if item exists and cost changed
    setSportLifeCatalog(prevCatalog => {
      const existingItemIndex = prevCatalog.findIndex(catItem => catItem.itemName.toLowerCase() === newItem.itemName.toLowerCase());
      if (existingItemIndex > -1 && prevCatalog[existingItemIndex].wholesaleCost !== newItem.wholesaleCost) {
        const existingCatalogItem = prevCatalog[existingItemIndex];
        const updatedCatalog = [...prevCatalog];

        if (newItem.wholesaleCost < existingCatalogItem.wholesaleCost) {
            console.log(`Catalog item "${newItem.itemName}" updated to a LOWER price $${newItem.wholesaleCost.toFixed(2)} from $${existingCatalogItem.wholesaleCost.toFixed(2)} (triggered when adding to order).`);
        } else {
            console.log(`Catalog item "${newItem.itemName}" price updated to $${newItem.wholesaleCost.toFixed(2)} because it was changed when added to order.`);
        }
        updatedCatalog[existingItemIndex] = { ...updatedCatalog[existingItemIndex], wholesaleCost: newItem.wholesaleCost };
        return updatedCatalog;
      }
      return prevCatalog;
    });

    setNewSLItemName('');
    setNewSLItemQuantity(1);
    setNewSLItemWholesaleCost(0);
    setShowCatalogSuggestions(false);
  };

  const handleRemoveSLItemFromCurrentCustomer = (itemId: string) => {
    setCurrentSLCItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleAddCustomerOrderToBatch = () => {
    if (!currentSLCCustomerName.trim() || currentSLCItems.length === 0) {
      alert("Please provide customer name and add at least one item for this customer.");
      return;
    }
    const newCustomerOrder: SportLifeCustomerOrder = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      customerName: currentSLCCustomerName.trim(),
      items: [...currentSLCItems],
      processingFeePercent: currentSLCProcessingFee,
    };
    setSportLifeBatchOrders(prev => [...prev, newCustomerOrder]);
    setCurrentSLCCustomerName('');
    setCurrentSLCItems([]);
    setCurrentSLCProcessingFee(2);
    setNewSLItemName('');
    setNewSLItemQuantity(1);
    setNewSLItemWholesaleCost(0);
  };

  const handleRemoveCustomerOrderFromBatch = (customerOrderId: string) => {
    setSportLifeBatchOrders(prev => prev.filter(order => order.id !== customerOrderId));
  };

  const handleSportLifeSubmitBatchOrder = () => {
    if (!currentUser) {
      alert("Please log in to submit an order.");
      return;
    }
    if (sportLifeBatchOrders.length === 0) {
      alert("Please add at least one customer order to the batch.");
      return;
    }
    // TODO: Implement actual workflow: CRM integration, Invoicing, Inventory, Task creation
    console.log({
      message: "SportLife Batch Order Submitted",
      batchOrders: sportLifeBatchOrders,
      user: currentUser.uid,
      timestamp: new Date().toISOString()
    });
    alert(`(Stub) Batch order for SportLife submitted with ${sportLifeBatchOrders.length} customer(s).`);
    setSportLifeBatchOrders([]);
  };

  const calculateItemTotal = (item: SportLifeItem) => item.quantity * item.wholesaleCost;

  const calculateCustomerOrderSubtotal = (order: SportLifeCustomerOrder) =>
    order.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);

  const calculateCustomerOrderTotal = (order: SportLifeCustomerOrder) => {
    const subtotal = calculateCustomerOrderSubtotal(order);
    return subtotal * (1 + order.processingFeePercent / 100);
  };

  const totalBatchWholesaleCost = useMemo(() => {
    return sportLifeBatchOrders.reduce((batchSum, order) => batchSum + calculateCustomerOrderSubtotal(order), 0);
  }, [sportLifeBatchOrders]);

  const totalBatchFinalAmount = useMemo(() => {
     return sportLifeBatchOrders.reduce((batchSum, order) => batchSum + calculateCustomerOrderTotal(order), 0);
  }, [sportLifeBatchOrders]);

  // Catalog Management Functions
  const handleOpenEditCatalogItemModal = (item: SportLifeCatalogItem) => {
    setEditingCatalogItem(item);
    setEditCatalogItemName(item.itemName);
    setEditCatalogItemCost(item.wholesaleCost);
  };

  const handleCloseEditCatalogItemModal = () => {
    setEditingCatalogItem(null);
    setEditCatalogItemName('');
    setEditCatalogItemCost(0);
  };

  const handleSaveEditedCatalogItem = () => {
    if (!editingCatalogItem) return;
    if (!editCatalogItemName.trim()) {
        alert("Item name cannot be empty.");
        return;
    }
    if (editCatalogItemCost < 0) {
        alert("Wholesale cost cannot be negative.");
        return;
    }
    setSportLifeCatalog(prevCatalog =>
      prevCatalog.map(item =>
        item.id === editingCatalogItem.id
        ? { ...item, itemName: editCatalogItemName.trim(), wholesaleCost: editCatalogItemCost }
        : item
      )
    );
    alert(`Catalog item "${editCatalogItemName.trim()}" updated.`);
    handleCloseEditCatalogItemModal();
  };

  const handleDeleteCatalogItem = (itemId: string) => {
    if (window.confirm("Are you sure you want to delete this item from the catalog?")) {
      setSportLifeCatalog(prevCatalog => prevCatalog.filter(item => item.id !== itemId));
      alert("Item deleted from catalog.");
    }
  };

  const displayedCatalogItems = useMemo(() => {
    if (!catalogSearchTerm.trim()) return sportLifeCatalog;
    return sportLifeCatalog.filter(item =>
      item.itemName.toLowerCase().includes(catalogSearchTerm.toLowerCase())
    );
  }, [sportLifeCatalog, catalogSearchTerm]);


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

      {/* Section: Canyon Country Church Coffee Orders */}
      <Card className="content-fade-in-up" style={{ animationDelay: '225ms' }}>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-900 flex items-center">
            <Package size={28} className="mr-3 text-emerald-600" /> Canyon Country Church Supply
          </CardTitle>
          <CardDescription>Order coffee bag supply for Canyon Country Church.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <Label htmlFor="canyonCountryChurchQuantity" className="text-lg font-semibold text-slate-700">
            Quantity of Coffee Bags:
          </Label>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="icon" onClick={() => handleCanyonCountryChurchQuantityChange(-1)} aria-label="Decrease quantity">
              <Minus size={20} />
            </Button>
            <Input
              id="canyonCountryChurchQuantity"
              type="number"
              value={canyonCountryChurchQuantity}
              onChange={(e) => setCanyonCountryChurchQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-24 text-center text-xl font-bold"
              min="1"
            />
            <Button variant="outline" size="icon" onClick={() => handleCanyonCountryChurchQuantityChange(1)} aria-label="Increase quantity">
              <Plus size={20} />
            </Button>
          </div>
          <Button onClick={handleCanyonCountryChurchOrder} size="action" className="w-full max-w-xs bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-soft-green">
            Place Order
          </Button>
        </CardContent>
      </Card>


      {/* Section B: SportLife Nutrition Orders */}
      <Card className="content-fade-in-up" style={{ animationDelay: '300ms' }}>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-900 flex items-center">
             <Package size={28} className="mr-3 text-orange-500" /> SportLife Nutrition Batch Order
          </CardTitle>
          <CardDescription>Create and manage batched orders for SportLife Nutrition customers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Form to add a new customer order to the batch */}
          <Card className="bg-slate-50/30">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-slate-800 flex items-center">
                <UserPlus size={22} className="mr-2 text-orange-600" /> Add Customer to Batch
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentSLCCustomerName" className="font-semibold">Customer Name</Label>
                <Input
                  id="currentSLCCustomerName"
                  value={currentSLCCustomerName}
                  onChange={(e) => setCurrentSLCCustomerName(e.target.value)}
                  placeholder="e.g., Jane Doe"
                />
              </div>

              {/* Item Entry for Current Customer */}
              <Card className="bg-white/50">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-slate-700">Add Item to {currentSLCCustomerName || "Current Customer"}'s Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                    <div className="relative">
                      <Label htmlFor="newSLItemName">Item Name</Label>
                      <Input
                        id="newSLItemName"
                        value={newSLItemName}
                        onChange={e => { setNewSLItemName(e.target.value); }}
                        onFocus={() => newSLItemName && filteredCatalogItems.length > 0 && setShowCatalogSuggestions(true)}
                        placeholder="e.g., Protein Powder X"
                      />
                      {showCatalogSuggestions && filteredCatalogItems.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                          {filteredCatalogItems.map(item => (
                            <div
                              key={item.id}
                              className="p-2 hover:bg-sky-100 cursor-pointer text-sm"
                              onClick={() => handleSelectCatalogSuggestion(item)}
                            >
                              {item.itemName} (${item.wholesaleCost.toFixed(2)})
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="newSLItemQuantity">Quantity</Label>
                      <Input id="newSLItemQuantity" type="number" value={newSLItemQuantity} onChange={e => setNewSLItemQuantity(Math.max(1, parseInt(e.target.value) || 1))} min="1"/>
                    </div>
                    <div>
                      <Label htmlFor="newSLItemWholesaleCost">Wholesale Cost ($)</Label>
                      <Input id="newSLItemWholesaleCost" type="number" value={newSLItemWholesaleCost} onChange={e => setNewSLItemWholesaleCost(parseFloat(e.target.value) || 0)} min="0" step="0.01"/>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={handleAddSLItemToCurrentCustomer} variant="outline" size="sm">
                      <Plus size={16} className="mr-1"/> Add Item
                    </Button>
                    <Button onClick={handleSaveNewItemToCatalog} variant="outline" size="sm" disabled={!newSLItemName.trim()}>
                      <Library size={16} className="mr-1"/> Save to Catalog
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {currentSLCItems.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-md font-semibold text-slate-700">Items for {currentSLCCustomerName || "Current Customer"}:</h4>
                  <div className="space-y-1 rounded-md border p-2 bg-white/60 max-h-48 overflow-y-auto">
                    {currentSLCItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-1.5 bg-white/80 rounded shadow-sm text-sm">
                        <div className="flex-grow">
                          <p className="font-medium text-slate-800">{item.itemName}</p>
                          <p className="text-xs text-slate-500">Qty: {item.quantity}, Cost: ${item.wholesaleCost.toFixed(2)} each, Total: ${calculateItemTotal(item).toFixed(2)}</p>
                        </div>
                        <div className="flex items-center flex-shrink-0">
                           <Button variant="ghost" size="icon" onClick={() => handleSaveItemFromOrderToCatalog(item)} aria-label="Save item to catalog" className="h-7 w-7 text-sky-600 hover:bg-sky-100">
                            <Library size={14} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveSLItemFromCurrentCustomer(item.id)} aria-label="Remove item" className="h-7 w-7 text-red-500 hover:bg-red-100">
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="currentSLCProcessingFee" className="font-semibold">Processing Fee for this Customer (%)</Label>
                <Input
                  id="currentSLCProcessingFee"
                  type="number"
                  value={currentSLCProcessingFee}
                  onChange={(e) => setCurrentSLCProcessingFee(parseFloat(e.target.value) || 0)}
                  min="0"
                />
              </div>
              <Button onClick={handleAddCustomerOrderToBatch} variant="default" size="action" className="w-full">
                Add {currentSLCCustomerName || "Customer"} to Batch
              </Button>
            </CardContent>
          </Card>

          <Separator className="my-6"/>

          {/* Display Current Batch */}
          {sportLifeBatchOrders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-slate-800 flex items-center">
                  <Users size={22} className="mr-2 text-orange-600"/> Current Batch for SportLife ({sportLifeBatchOrders.length} Customer(s))
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sportLifeBatchOrders.map(order => (
                  <Card key={order.id} className="bg-white/70 shadow-md">
                    <CardHeader className="pb-3 pt-4 px-4">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg font-medium text-orange-700">{order.customerName}</CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveCustomerOrderFromBatch(order.id)} aria-label={`Remove ${order.customerName} from batch`} className="h-8 w-8">
                          <Trash2 size={16} className="text-red-500" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 space-y-1 text-sm">
                      {order.items.map(item => (
                        <div key={item.id} className="flex justify-between">
                          <span className="text-slate-600">{item.itemName} (x{item.quantity})</span>
                          <span className="text-slate-700">${calculateItemTotal(item).toFixed(2)}</span>
                        </div>
                      ))}
                      <Separator className="my-1.5"/>
                      <div className="flex justify-between font-medium">
                        <span className="text-slate-600">Subtotal:</span>
                        <span className="text-slate-800">${calculateCustomerOrderSubtotal(order).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Processing Fee ({order.processingFeePercent}%):</span>
                        <span className="text-slate-700">${(calculateCustomerOrderSubtotal(order) * order.processingFeePercent / 100).toFixed(2)}</span>
                      </div>
                       <div className="flex justify-between font-bold text-md pt-1">
                        <span className="text-orange-700">Customer Total:</span>
                        <span className="text-orange-800">${calculateCustomerOrderTotal(order).toFixed(2)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Separator className="my-4" />
                <div className="text-right space-y-1 pr-2">
                    <p className="text-md font-semibold text-slate-700">
                        Total Batch Wholesale Cost: <span className="text-slate-900">${totalBatchWholesaleCost.toFixed(2)}</span>
                    </p>
                    <p className="text-lg font-bold text-orange-700">
                        Total Batch Final Amount (incl. all fees): <span className="text-orange-800">${totalBatchFinalAmount.toFixed(2)}</span>
                    </p>
                </div>
                <Button onClick={handleSportLifeSubmitBatchOrder} size="action" className="w-full mt-4">
                  Submit Entire Batch to SportLife
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Section B.1: SportLife Item Catalog Management */}
      <Card className="content-fade-in-up" style={{ animationDelay: '450ms' }}>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-900 flex items-center">
            <Library size={28} className="mr-3 text-indigo-500" /> SportLife Item Catalog
          </CardTitle>
          <CardDescription>Manage frequently ordered items and their wholesale costs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search catalog..."
              className="pl-10"
              value={catalogSearchTerm}
              onChange={(e) => setCatalogSearchTerm(e.target.value)}
            />
          </div>
          {displayedCatalogItems.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {displayedCatalogItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-white/60 border border-brand-slate-200/50 rounded-lg shadow-sm">
                  <div>
                    <p className="font-semibold text-slate-800">{item.itemName}</p>
                    <p className="text-sm text-slate-500">Wholesale: ${item.wholesaleCost.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEditCatalogItemModal(item)} className="text-sky-600 hover:bg-sky-100 h-8 w-8">
                      <Edit size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteCatalogItem(item.id)} className="text-red-500 hover:bg-red-100 h-8 w-8">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-4">
              {catalogSearchTerm ? "No items match your search." : "Catalog is empty. Add items using the 'Save to Catalog' button above."}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Edit Catalog Item Dialog */}
      {editingCatalogItem && (
        <Dialog open={!!editingCatalogItem} onOpenChange={(isOpen) => !isOpen && handleCloseEditCatalogItemModal()}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Catalog Item</DialogTitle>
              <DialogDescription>
                Update the details for "{editingCatalogItem.itemName}".
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="editCatalogItemName">Item Name</Label>
                <Input id="editCatalogItemName" value={editCatalogItemName} onChange={(e) => setEditCatalogItemName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="editCatalogItemCost">Wholesale Cost ($)</Label>
                <Input id="editCatalogItemCost" type="number" value={editCatalogItemCost} onChange={(e) => setEditCatalogItemCost(parseFloat(e.target.value) || 0)} min="0" step="0.01" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="button" onClick={handleSaveEditedCatalogItem}>
                <Save size={16} className="mr-2" /> Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}


      {/* Section C: Bee's Fundraising Orders */}
      <Card className="content-fade-in-up" style={{ animationDelay: '600ms' }}>
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
        </CardContent>
      </Card>

      {/* Section D: Shay n Chell Scoops Orders */}
      <Card className="content-fade-in-up" style={{ animationDelay: '750ms' }}>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-900 flex items-center">
            <Package size={28} className="mr-3 text-pink-500" /> Shay n Chell Scoops Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">
            This section is a placeholder for Shay n Chell Scoops orders.
            Functionality for this module will be implemented in a future update.
          </p>
        </CardContent>
      </Card>

    </div>
  );
};

export default SpecialOrdersPage;
