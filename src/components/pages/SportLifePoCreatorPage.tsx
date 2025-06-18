
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from '@/context/AppContext';
import { db } from '@/lib/firebase';
import { collection, doc, getDocs, addDoc, setDoc, updateDoc, onSnapshot, query, where, writeBatch, deleteDoc } from 'firebase/firestore';
import { PlusCircle, Package, ShoppingCart, CheckCircle2, XCircle, Edit, Save, UserPlus, Users, DollarSign, Loader2, Trash2, Truck, CreditCard, History } from 'lucide-react';

interface SportLifeItemDef {
  id: string;
  name: string;
  wholesaleCost: number;
  _deleted?: boolean;
}

interface SportLifeCustomerDef {
  id: string;
  firstName: string;
  lastName: string;
  isDefault?: boolean;
}

interface PoItem {
  itemId: string;
  name: string;
  quantity: number;
  wholesaleCost: number;
}

interface PurchaseOrderDef {
  id: string;
  customerId: string;
  customerName: string;
  items: PoItem[];
  subtotal: number;
  orderDate: string;
  status: 'saved' | 'submitted' | 'deleted';
  processingFeePercentage?: number;
  finalTotal?: number;
  _deleted?: boolean;
  isDelivered?: boolean;
  isPaid?: boolean;
  isCompleted?: boolean;
}

interface FinalPoDraftDef {
  compiledItems: PoItem[];
  subtotal: number;
  processingFee: number;
  grandTotal: number;
  processingFeePercentage: number;
}

const SportLifePoCreatorPage = ({ pageId }: { pageId: string }) => {
  const { currentUser, loadingAuth } = useAppContext();
  const { toast } = useToast();

  const [items, setItems] = useState<SportLifeItemDef[]>([]);
  const [customers, setCustomers] = useState<SportLifeCustomerDef[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderDef[]>([]);
  const [currentOrderQuantities, setCurrentOrderQuantities] = useState<Record<string, number>>({});
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [editingPoId, setEditingPoId] = useState<string | null>(null);
  const [processingFeePercentage, setProcessingFeePercentage] = useState(2);
  const [finalPoDraft, setFinalPoDraft] = useState<FinalPoDraftDef | null>(null);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<SportLifeItemDef | null>(null);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [isEditingItems, setIsEditingItems] = useState(false);
  const [isEditingSavedOrders, setIsEditingSavedOrders] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showAppToast = useCallback((title: string, description: string, variant: 'default' | 'destructive' = 'default') => {
    toast({ title, description, variant, duration: variant === 'destructive' ? 5000 : 3000 });
  }, [toast]);

  const addMockItems = useCallback(async (userId: string) => {
    if (!db) return;
    try {
      const itemsCollectionRef = collection(db, `users/${userId}/sportLifeItems`);
      const mockItems = [
        { name: 'SportLife Protein Powder (Vanilla)', wholesaleCost: 28.50 },
        { name: 'SportLife Energy Bars (Box of 12)', wholesaleCost: 22.00 },
        { name: 'SportLife Resistance Bands Set', wholesaleCost: 32.00 },
      ];
      const batch = writeBatch(db);
      mockItems.forEach(item => {
        const docRef = doc(itemsCollectionRef);
        batch.set(docRef, item);
      });
      await batch.commit();
    } catch (e) { console.error("Error adding mock items: ", e); }
  }, [db]);

  const addMockCustomers = useCallback(async (userId: string) => {
     if (!db) return;
    try {
      const customersCollectionRef = collection(db, `users/${userId}/sportLifeCustomers`);
      const mockCustomers = [
        { firstName: 'Journey', lastName: 'Order', isDefault: true },
        { firstName: 'Jane', lastName: 'Smith' },
      ];
      const batch = writeBatch(db);
      mockCustomers.forEach(customer => {
        const docRef = doc(customersCollectionRef);
        batch.set(docRef, customer);
      });
      await batch.commit();
    } catch (e) { console.error("Error adding mock customers: ", e); }
  }, [db]);

  useEffect(() => {
    if (!currentUser || !db) {
      setIsLoadingData(false);
      return;
    }
    setIsLoadingData(true);
    const userId = currentUser.uid;

    const itemsColRef = collection(db, `users/${userId}/sportLifeItems`);
    const itemsQuery = query(itemsColRef, where("_deleted", "!=", true));
    const unsubscribeItems = onSnapshot(itemsQuery, async (snapshot) => {
      const itemsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SportLifeItemDef));
      setItems(itemsData);
      if (snapshot.docs.length === 0 && itemsData.every(item => item._deleted)) {
         const checkSnap = await getDocs(itemsColRef);
         if(checkSnap.empty) await addMockItems(userId);
      }
    }, error => { console.error("Error fetching items:", error); showAppToast("Error", "Failed to load items.", "destructive");});

    const customersColRef = collection(db, `users/${userId}/sportLifeCustomers`);
    const unsubscribeCustomers = onSnapshot(customersColRef, async (snapshot) => {
      const customersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SportLifeCustomerDef));
      setCustomers(customersData);
      if (snapshot.docs.length === 0) {
        await addMockCustomers(userId);
      }
    }, error => { console.error("Error fetching customers:", error); showAppToast("Error", "Failed to load customers.", "destructive");});

    const poColRef = collection(db, `users/${userId}/sportLifePurchaseOrders`);
    const poQuery = query(poColRef, where("_deleted", "!=", true));
    const unsubscribePOs = onSnapshot(poQuery, (snapshot) => {
      const poData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        isDelivered: doc.data().isDelivered || false,
        isPaid: doc.data().isPaid || false,
        isCompleted: doc.data().isCompleted || false,
      } as PurchaseOrderDef));
      setPurchaseOrders(poData.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()));
    }, error => { console.error("Error fetching purchase orders:", error); showAppToast("Error", "Failed to load saved orders.", "destructive");});

    setIsLoadingData(false);
    return () => { unsubscribeItems(); unsubscribeCustomers(); unsubscribePOs(); };
  }, [currentUser, db, addMockItems, addMockCustomers, showAppToast]);

  const calculateLineTotal = useCallback((item: SportLifeItemDef) => {
    const quantity = currentOrderQuantities[item.id] || 0;
    return (item.wholesaleCost * quantity);
  }, [currentOrderQuantities]);

  const calculateCurrentOrderTotal = useCallback(() => {
    let subtotal = 0;
    for (const itemId in currentOrderQuantities) {
      const item = items.find(i => i.id === itemId);
      if (item) { subtotal += item.wholesaleCost * (currentOrderQuantities[itemId] || 0); }
    }
    return subtotal;
  }, [currentOrderQuantities, items]);

  const calculateAggregatedPOTotal = useCallback(() => {
    let subtotal = 0;
    const compiledItemsMap: Record<string, PoItem> = {};
    purchaseOrders.filter(po => po.status === 'saved' && !po.isCompleted && !po._deleted).forEach(po => {
      po.items.forEach(item => {
        const key = item.itemId; 
        if (compiledItemsMap[key]) {
          compiledItemsMap[key].quantity += item.quantity;
        } else {
          compiledItemsMap[key] = { ...item };
        }
      });
    });
    Object.values(compiledItemsMap).forEach(item => { subtotal += item.wholesaleCost * item.quantity; });
    const processingFeeAmount = subtotal * (processingFeePercentage / 100);
    return { compiledItems: Object.values(compiledItemsMap), subtotal: subtotal, processingFee: processingFeeAmount, grandTotal: (subtotal + processingFeeAmount) };
  }, [purchaseOrders, processingFeePercentage]);

  const handleQuantityChange = (itemId: string, value: string) => {
    const newQuantity = Math.max(0, parseInt(value) || 0);
    setCurrentOrderQuantities(prev => ({ ...prev, [itemId]: newQuantity }));
  };

  const handleAdjustQuantity = (itemId: string, delta: number) => {
    setCurrentOrderQuantities(prev => {
      const currentQty = prev[itemId] || 0;
      const newQty = Math.max(0, currentQty + delta);
      return { ...prev, [itemId]: newQty };
    });
  };

  const handleAddItem = async (newItemData: { name: string, wholesaleCost: number }) => {
    if (!db || !currentUser) return showAppToast("Error", "Database not ready.", "destructive");
    try {
      await addDoc(collection(db, `users/${currentUser.uid}/sportLifeItems`), newItemData);
      showAppToast("Success", "Item added successfully!");
      setShowAddItemModal(false);
    } catch (e) { console.error("Error adding item: ", e); showAppToast("Error", "Failed to add item.", "destructive"); }
  };

  const handleEditItem = async (editedItemData: SportLifeItemDef) => {
    if (!db || !currentUser) return showAppToast("Error", "Database not ready.", "destructive");
    try {
      await setDoc(doc(db, `users/${currentUser.uid}/sportLifeItems`, editedItemData.id), {
        name: editedItemData.name, wholesaleCost: editedItemData.wholesaleCost
      }, { merge: true }); 
      showAppToast("Success", "Item updated successfully!");
      setShowAddItemModal(false); setItemToEdit(null);
    } catch (e) { console.error("Error updating item: ", e); showAppToast("Error", "Failed to update item.", "destructive"); }
  };
  
  const handleDeleteItem = async (itemId: string) => {
    if (!db || !currentUser) return showAppToast("Error", "Database not ready.", "destructive");
    if (!window.confirm("Are you sure you want to delete this item? This cannot be undone.")) return;
    try {
      await updateDoc(doc(db, `users/${currentUser.uid}/sportLifeItems`, itemId), { _deleted: true }); 
      showAppToast("Success", "Item marked as deleted successfully!");
    } catch (e) { console.error("Error deleting item: ", e); showAppToast("Error", "Failed to delete item.", "destructive"); }
  };

  const handleAddCustomer = async (newCustomerData: { firstName: string, lastName: string }) => {
    if (!db || !currentUser) return showAppToast("Error", "Database not ready.", "destructive");
    try {
      const docRef = await addDoc(collection(db, `users/${currentUser.uid}/sportLifeCustomers`), newCustomerData);
      showAppToast("Success", "Customer added successfully!");
      setShowAddCustomerModal(false); setSelectedCustomerId(docRef.id);
    } catch (e) { console.error("Error adding customer: ", e); showAppToast("Error", "Failed to add customer.", "destructive"); }
  };

  const handleSaveOrder = async () => {
    if (!db || !currentUser) return showAppToast("Error", "Database not ready.", "destructive");
    if (!selectedCustomerId) return showAppToast("Validation Error", "Please select a customer for the order.", "destructive");

    const orderItems: PoItem[] = Object.keys(currentOrderQuantities)
      .filter(itemId => currentOrderQuantities[itemId] > 0)
      .map(itemId => {
        const item = items.find(i => i.id === itemId)!;
        return { itemId: item.id, name: item.name, quantity: currentOrderQuantities[itemId], wholesaleCost: item.wholesaleCost };
      });

    if (orderItems.length === 0) return showAppToast("Validation Error", "Please add items and quantities to the order.", "destructive");

    const customer = customers.find(c => c.id === selectedCustomerId)!;
    const subtotal = calculateCurrentOrderTotal();

    const poData: Omit<PurchaseOrderDef, 'id'> = {
      customerId: selectedCustomerId, customerName: `${customer.firstName} ${customer.lastName}`,
      items: orderItems, subtotal: subtotal, orderDate: new Date().toISOString(), status: 'saved',
      isDelivered: false, isPaid: false, isCompleted: false, _deleted: false,
    };

    try {
      if (editingPoId) {
        await setDoc(doc(db, `users/${currentUser.uid}/sportLifePurchaseOrders`, editingPoId), poData, { merge: true });
        showAppToast("Success", "Order updated successfully!");
      } else {
        const q = query(collection(db, `users/${currentUser.uid}/sportLifePurchaseOrders`),
                        where("customerId", "==", selectedCustomerId), where("status", "==", "saved"), where("_deleted", "!=", true), where("isCompleted", "!=", true));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const existingDoc = querySnapshot.docs[0];
            const existingData = existingDoc.data() as PurchaseOrderDef;
            const mergedItemsMap: Record<string, PoItem> = {};
            existingData.items.forEach(item => { mergedItemsMap[item.itemId] = { ...item }; });
            orderItems.forEach(newItem => {
                if (mergedItemsMap[newItem.itemId]) { mergedItemsMap[newItem.itemId].quantity += newItem.quantity; } 
                else { mergedItemsMap[newItem.itemId] = { ...newItem }; }
            });
            let newConsolidatedSubtotal = 0;
            Object.values(mergedItemsMap).forEach(item => {newConsolidatedSubtotal += item.wholesaleCost * item.quantity;});
            const consolidatedPoData = { ...existingData, items: Object.values(mergedItemsMap), subtotal: newConsolidatedSubtotal, orderDate: new Date().toISOString() };
            await updateDoc(doc(db, `users/${currentUser.uid}/sportLifePurchaseOrders`, existingDoc.id), consolidatedPoData);
            showAppToast("Success", "Order consolidated with existing saved order and updated successfully!");
        } else {
            await addDoc(collection(db, `users/${currentUser.uid}/sportLifePurchaseOrders`), poData);
            showAppToast("Success", "Order saved successfully!");
        }
      }
      setCurrentOrderQuantities({}); setSelectedCustomerId(''); setEditingPoId(null);
    } catch (e) { console.error("Error saving/updating order: ", e); showAppToast("Error", "Failed to save order.", "destructive"); }
  };

  const handleEditSavedOrder = (po: PurchaseOrderDef) => {
    setEditingPoId(po.id); setSelectedCustomerId(po.customerId);
    const quantities: Record<string, number> = {};
    po.items.forEach(item => { quantities[item.itemId] = item.quantity; });
    setCurrentOrderQuantities(quantities); setIsEditingSavedOrders(false);
    showAppToast("Info", `Editing order for ${po.customerName}.`);
  };

  const handleDeleteSavedOrder = async (poId: string) => {
    if (!db || !currentUser) return showAppToast("Error", "Database not ready.", "destructive");
    if (!window.confirm("Are you sure you want to delete this order? This cannot be undone.")) return;
    try {
      await updateDoc(doc(db, `users/${currentUser.uid}/sportLifePurchaseOrders`, poId), { status: 'deleted', _deleted: true });
      showAppToast("Success", "Order deleted.");
    } catch (e) { console.error("Error deleting order: ", e); showAppToast("Error", "Failed to delete order.", "destructive"); }
  };

  const handleToggleOrderStatus = async (poId: string, field: 'isDelivered' | 'isPaid' | 'isCompleted', currentValue: boolean) => {
    if (!db || !currentUser) return showAppToast("Error", "Database not ready.", "destructive");
    try {
      await updateDoc(doc(db, `users/${currentUser.uid}/sportLifePurchaseOrders`, poId), { [field]: !currentValue });
      const fieldName = field.replace('is', '');
      showAppToast("Success", `Order marked as ${!currentValue ? fieldName : `not ${fieldName}`}.`);
    } catch (e) {
      console.error(`Error updating ${field}: `, e);
      showAppToast("Error", `Failed to update ${field} status.`, "destructive");
    }
  };

  const handleCreateFinalPoPreview = useCallback(() => {
    const savedOrdersToCompile = purchaseOrders.filter(po => po.status === 'saved' && !po.isCompleted && !po._deleted);
    if (savedOrdersToCompile.length === 0) {
      showAppToast("Info", "No active saved orders to compile.");
      setFinalPoDraft(null); return;
    }
    const { subtotal, processingFee, grandTotal, compiledItems } = calculateAggregatedPOTotal();
    const minOrder = 250;
    if (subtotal < minOrder) {
      showAppToast("Minimum Order Not Met", `Combined wholesale total is $${subtotal.toFixed(2)}. Vendor minimum is $${minOrder.toFixed(2)}. Add more items.`, "destructive");
      setFinalPoDraft(null); return;
    }
    setFinalPoDraft({ compiledItems, subtotal, processingFee, grandTotal, processingFeePercentage });
  }, [purchaseOrders, calculateAggregatedPOTotal, processingFeePercentage, showAppToast]);

  const handleSubmitActualPo = async () => {
    if (!db || !currentUser || !finalPoDraft) return showAppToast("Error", "Cannot submit PO. Draft or database not ready.", "destructive");
    setIsSubmitting(true);
    const savedOrdersToSubmit = purchaseOrders.filter(po => po.status === 'saved' && !po.isCompleted && !po._deleted);
    try {
      const batch = writeBatch(db);
      savedOrdersToSubmit.forEach(order => {
        const individualOrderSubtotal = order.subtotal;
        const individualOrderProcessingFee = individualOrderSubtotal * (processingFeePercentage / 100);
        const individualOrderGrandTotal = individualOrderSubtotal + individualOrderProcessingFee;
        const orderRef = doc(db, `users/${currentUser.uid}/sportLifePurchaseOrders`, order.id);
        batch.update(orderRef, { status: 'submitted', processingFeePercentage: processingFeePercentage, finalTotal: individualOrderGrandTotal });
      });
      await batch.commit();
      console.log("Final Compiled PO Submitted to SportLife (STUB):", finalPoDraft);
      showAppToast("Success", "Purchase Order compiled and orders marked as 'submitted'!");
      setFinalPoDraft(null);
    } catch (e) { console.error("Error submitting final PO: ", e); showAppToast("Error", "Failed to submit final PO.", "destructive");
    } finally { setIsSubmitting(false); }
  };
  
  if (loadingAuth || isLoadingData) {
    return ( <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-sky-600" /><p className="ml-4 text-slate-600">Loading...</p></div> );
  }

  const AddEditItemForm = ({ item, onSubmit }: { item: SportLifeItemDef | null, onSubmit: (data: any) => void }) => {
    const [name, setName] = useState(item?.name || '');
    const [wholesaleCost, setWholesaleCost] = useState(item?.wholesaleCost.toString() || '');
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const cost = parseFloat(wholesaleCost);
      if (!name || isNaN(cost) || cost <= 0) { showAppToast("Validation Error", "Valid name & positive cost required.", "destructive"); return; }
      onSubmit({ ...(item || {}), name, wholesaleCost: cost });
      if (!item) { setName(''); setWholesaleCost(''); } 
    };
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><Label htmlFor="itemNamePoForm">Item Name</Label><Input id="itemNamePoForm" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Protein Powder" required /></div>
        <div><Label htmlFor="wholesaleCostPoForm">Wholesale Cost ($)</Label><Input id="wholesaleCostPoForm" type="number" value={wholesaleCost} onChange={(e) => setWholesaleCost(e.target.value)} placeholder="e.g., 28.50" step="0.01" min="0.01" required /></div>
        <Button type="submit" className="w-full">{item ? <><Save className="mr-2 h-4 w-4" />Save Changes</> : <><PlusCircle className="mr-2 h-4 w-4" />Save Item</>}</Button>
      </form>
    );
  };

  const AddCustomerForm = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
    const [firstName, setFirstName] = useState(''); const [lastName, setLastName] = useState('');
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!firstName || !lastName) { showAppToast("Validation Error", "First and last name required.", "destructive"); return; }
      onSubmit({ firstName, lastName }); setFirstName(''); setLastName('');
    };
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><Label htmlFor="firstNamePoForm">First Name</Label><Input id="firstNamePoForm" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="e.g., John" required /></div>
        <div><Label htmlFor="lastNamePoForm">Last Name</Label><Input id="lastNamePoForm" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="e.g., Doe" required /></div>
        <Button type="submit" className="w-full"><UserPlus className="mr-2 h-4 w-4" />Save Customer</Button>
      </form>
    );
  };
  
  const activeOrders = purchaseOrders.filter(po => !po._deleted && !po.isCompleted);
  const completedOrders = purchaseOrders.filter(po => po.isCompleted && !po._deleted);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 flex items-center justify-center gap-3"><ShoppingCart className="text-indigo-600 w-8 h-8" /> SportLife PO Creator</CardTitle>
          <CardDescription className="text-lg text-slate-500 pt-1">Create, manage, and submit Purchase Orders to SportLife Nutrition.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2"><PlusCircle className="text-sky-600 w-7 h-7" />{editingPoId ? 'Edit Current Order' : 'Create New Order'}</CardTitle>
            <Button onClick={() => setIsEditingItems(!isEditingItems)} variant="outline" size="sm"><Edit className="mr-2 h-4 w-4" /> {isEditingItems ? 'Done Editing Items' : 'Edit Items Catalog'}</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader><TableRow><TableHead>Item Name</TableHead><TableHead>Wholesale Cost</TableHead><TableHead>Quantity</TableHead><TableHead>Line Total</TableHead>{isEditingItems && <TableHead>Actions</TableHead>}</TableRow></TableHeader>
              <TableBody>
                {items.length === 0 ? <TableRow><TableCell colSpan={isEditingItems ? 5 : 4} className="text-center py-8 text-slate-500">No items in catalog. Add items below.</TableCell></TableRow> :
                  items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell><TableCell>${item.wholesaleCost.toFixed(2)}</TableCell>
                      <TableCell><div className="flex items-center gap-1"><Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleAdjustQuantity(item.id, -1)}><Minus className="h-4 w-4" /></Button><Input type="number" value={currentOrderQuantities[item.id] || ''} onChange={(e) => handleQuantityChange(item.id, e.target.value)} onFocus={(e) => e.target.select()} className="w-16 text-center h-7 px-1"/><Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleAdjustQuantity(item.id, 1)}><Plus className="h-4 w-4" /></Button></div></TableCell>
                      <TableCell className="font-semibold">${calculateLineTotal(item).toFixed(2)}</TableCell>
                      {isEditingItems && (<TableCell className="space-x-1"><Button variant="ghost" size="icon" className="h-7 w-7 text-sky-600 hover:bg-sky-100" onClick={() => { setItemToEdit(item); setShowAddItemModal(true); }}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-100" onClick={() => handleDeleteItem(item.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>)}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
          {isEditingItems && <Button onClick={() => { setItemToEdit(null); setShowAddItemModal(true); }} variant="default" size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add New Item to Catalog</Button>}
          <Card className="bg-slate-50/50 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div><Label htmlFor="customerSelectPoForm">Select Customer</Label><div className="flex gap-2">
                <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                  <SelectTrigger id="customerSelectPoForm" className="flex-grow">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* <SelectItem value="">Select customer</SelectItem> <- Removed this line */}
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.firstName} {customer.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={() => setShowAddCustomerModal(true)} aria-label="Add customer"><UserPlus className="h-4 w-4"/></Button></div></div>
              <div className="text-right"><p className="text-md font-semibold text-slate-700">Subtotal: <span className="text-lg text-slate-900">${calculateCurrentOrderTotal().toFixed(2)}</span></p></div>
            </div>
          </Card>
          <div className="flex justify-end"><Button onClick={handleSaveOrder} size="lg" variant="default" disabled={Object.values(currentOrderQuantities).every(qty => qty === 0) || !selectedCustomerId}><Save className="mr-2 h-5 w-5" /> {editingPoId ? 'Update Order' : 'Save Order'}</Button></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Package className="text-teal-600 w-7 h-7" /> Active Orders (Saved & Submitted)</CardTitle>
            {activeOrders.length > 0 && (<Button onClick={() => setIsEditingSavedOrders(!isEditingSavedOrders)} variant="outline" size="sm"><Edit className="mr-2 h-4 w-4" /> {isEditingSavedOrders ? 'Done Editing Orders' : 'Edit Saved Orders'}</Button>)}
          </div>
        </CardHeader>
        <CardContent>
          {activeOrders.length === 0 ? (<p className="text-slate-500 text-center py-4">No active orders.</p>) : (
            <div className="space-y-4">
              {activeOrders.map(po => (
                <Card key={po.id} className={po.status === 'submitted' ? "bg-green-50/70 border-green-200" : "bg-white"}>
                  <CardHeader className="pb-3 pt-4 px-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-semibold text-slate-800">{po.customerName}</CardTitle>
                        <CardDescription className="text-xs text-slate-500">Order Date: {new Date(po.orderDate).toLocaleDateString()}</CardDescription>
                        <p className={`text-sm font-semibold ${po.status === 'submitted' ? 'text-green-700' : 'text-orange-600'}`}>Status: {po.status.charAt(0).toUpperCase() + po.status.slice(1)}</p>
                      </div>
                      {isEditingSavedOrders && po.status === 'saved' && (<div className="flex gap-1"><Button variant="outline" size="sm" onClick={() => handleEditSavedOrder(po)}><Edit className="mr-1 h-3 w-3"/> Edit</Button><Button variant="destructive" size="sm" onClick={() => handleDeleteSavedOrder(po.id)}><Trash2 className="mr-1 h-3 w-3"/> Delete</Button></div>)}
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 text-sm">
                    <ul className="list-disc list-inside space-y-1 pl-1 text-slate-600">
                      {po.items.map((item, idx) => <li key={idx}>{item.name} (Qty: {item.quantity}) - Wholesale: ${(item.wholesaleCost * item.quantity).toFixed(2)}</li>)}
                    </ul>
                    <p className="mt-2 pt-2 border-t text-right font-semibold text-slate-700">Subtotal: ${po.subtotal.toFixed(2)}</p>
                    {po.status === 'submitted' && ( <>
                        {po.finalTotal !== undefined && <p className="text-md font-bold text-teal-700 text-right">Final Total: ${po.finalTotal.toFixed(2)}</p>}
                        <div className="mt-3 pt-3 border-t space-y-2">
                            <div className="flex items-center justify-end space-x-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id={`delivered-${po.id}`} checked={po.isDelivered} onCheckedChange={() => handleToggleOrderStatus(po.id, 'isDelivered', !!po.isDelivered)} disabled={po.isCompleted}/>
                                    <Label htmlFor={`delivered-${po.id}`} className="text-sm font-medium">Delivered</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id={`paid-${po.id}`} checked={po.isPaid} onCheckedChange={() => handleToggleOrderStatus(po.id, 'isPaid', !!po.isPaid)} disabled={po.isCompleted}/>
                                    <Label htmlFor={`paid-${po.id}`} className="text-sm font-medium">Paid</Label>
                                </div>
                            </div>
                            <div className="flex justify-end mt-2">
                                <Button onClick={() => handleToggleOrderStatus(po.id, 'isCompleted', !!po.isCompleted)} size="sm" variant="default" disabled={po.isCompleted}>
                                    <CheckCircle2 className="mr-2 h-4 w-4"/> Mark Order Completed
                                </Button>
                            </div>
                        </div>
                    </>)}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {activeOrders.filter(po => po.status === 'saved').length > 0 && (<div className="mt-6 pt-6 border-t flex justify-end"><Button onClick={handleCreateFinalPoPreview} size="lg" variant="default"><CheckCircle2 className="mr-2 h-5 w-5" /> Compile Saved Orders into PO Draft</Button></div>)}
        </CardContent>
      </Card>

      {finalPoDraft && (
        <Card>
          <CardHeader><CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2"><DollarSign className="text-blue-600 w-7 h-7" /> SportLife PO Draft</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="overflow-x-auto rounded-lg border"><Table><TableHeader><TableRow><TableHead>Item Name</TableHead><TableHead>Total Qty</TableHead><TableHead>Unit Cost</TableHead><TableHead className="text-right">Total Cost</TableHead></TableRow></TableHeader>
              <TableBody>{finalPoDraft.compiledItems.map((item, idx) => (<TableRow key={idx}><TableCell className="font-medium">{item.name}</TableCell><TableCell>{item.quantity}</TableCell><TableCell>${item.wholesaleCost.toFixed(2)}</TableCell><TableCell className="text-right font-semibold">${(item.wholesaleCost * item.quantity).toFixed(2)}</TableCell></TableRow>))}</TableBody></Table>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end p-4 bg-slate-50/50 rounded-lg border">
              <div><Label htmlFor="processingFeePoForm">Global Processing Fee (%)</Label><div className="flex items-center"><Input id="processingFeePoForm" type="number" value={processingFeePercentage} onChange={(e) => setProcessingFeePercentage(Math.max(0, parseFloat(e.target.value) || 0))} className="w-24 text-right" step="0.1" min="0"/><span className="ml-2 text-slate-600">%</span></div></div>
              <div className="text-right space-y-1"><p className="text-md font-semibold text-slate-700">Aggregated Subtotal: <span className="text-lg text-slate-900">${finalPoDraft.subtotal.toFixed(2)}</span></p><p className="text-md font-semibold text-slate-700">Processing Fee ({finalPoDraft.processingFeePercentage}%): <span className="text-lg text-slate-900">${finalPoDraft.processingFee.toFixed(2)}</span></p><p className="text-xl font-bold text-indigo-700">Grand Total: <span className="text-2xl">${finalPoDraft.grandTotal.toFixed(2)}</span></p></div>
            </div>
            <div className="flex justify-end"><Button onClick={handleSubmitActualPo} size="lg" variant="default" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}{isSubmitting ? 'Submitting...' : 'Submit Final PO to SportLife'}</Button></div>
          </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="order-history">
          <AccordionTrigger className="text-xl font-bold text-slate-800 hover:no-underline">
            <div className="flex items-center gap-2">
              <History className="text-blue-600 w-6 h-6" /> Order History ({completedOrders.length})
            </div>
          </AccordionTrigger>
          <AccordionContent>
            {completedOrders.length === 0 ? (<p className="text-slate-500 text-center py-4">No completed orders yet.</p>) : (
            <div className="space-y-3">
              {completedOrders.map(po => (
                <Card key={po.id} className="bg-slate-50/70 border-slate-200">
                  <CardHeader className="pb-2 pt-3 px-4">
                    <CardTitle className="text-md font-semibold text-slate-700">{po.customerName}</CardTitle>
                    <CardDescription className="text-xs text-slate-500">Order Date: {new Date(po.orderDate).toLocaleDateString()} | Final Total: ${po.finalTotal?.toFixed(2) || 'N/A'}</CardDescription>
                  </CardHeader>
                  <CardContent className="px-4 pb-3 text-xs">
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 max-h-20 overflow-y-auto">
                      {po.items.map((item, idx) => <li key={idx}>{item.name} (Qty: {item.quantity})</li>)}
                    </ul>
                    <div className="mt-2 pt-2 border-t border-slate-200/50 flex justify-end space-x-4">
                        <span className={`font-medium text-xs ${po.isDelivered ? 'text-green-600' : 'text-slate-500'}`}>Delivered: {po.isDelivered ? 'Yes' : 'No'}</span>
                        <span className={`font-medium text-xs ${po.isPaid ? 'text-green-600' : 'text-slate-500'}`}>Paid: {po.isPaid ? 'Yes' : 'No'}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Dialog open={showAddItemModal} onOpenChange={(open) => { if(!open) { setShowAddItemModal(false); setItemToEdit(null);}}}>
        <DialogContent><DialogHeader><DialogTitle>{itemToEdit ? 'Edit SportLife Item' : 'Add New SportLife Item'}</DialogTitle></DialogHeader><AddEditItemForm item={itemToEdit} onSubmit={itemToEdit ? handleEditItem : handleAddItem} /></DialogContent>
      </Dialog>
      <Dialog open={showAddCustomerModal} onOpenChange={setShowAddCustomerModal}>
        <DialogContent><DialogHeader><DialogTitle>Add New Customer</DialogTitle></DialogHeader><AddCustomerForm onSubmit={handleAddCustomer} /></DialogContent>
      </Dialog>
    </div>
  );
};

export default SportLifePoCreatorPage;

