"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ClipboardList, ArrowRightLeft, Settings, ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react';

// ================================================================= //
// MOCK DATA LAYER
// This simulates data that might come from a backend.
// ================================================================= //
const mockInventoryItems = [
    { id: 'item-1', name: 'Whole Milk', unit: 'Gallon' },
    { id: 'item-2', name: 'Espresso Beans', unit: 'lbs' },
    { id: 'item-3', name: 'Vanilla Syrup', unit: 'Bottle (750ml)' },
    { id: 'item-4', name: '12oz Hot Cups', unit: 'Case (1000)' },
    { id: 'item-5', name: 'Croissants', unit: 'Each' },
    { id: 'item-6', name: 'Cleaning Spray', unit: 'Bottle' },
];

const mockLocations = [
    { id: 'loc-1', name: 'Canyon Cafe - Downtown' },
    { id: 'loc-2', name: 'The Grind - University' },
    { id: 'loc-3', name: 'Journey Roastery & HQ' },
];

// Mock API functions for simulation purposes
const api = {
  getInventoryItems: async () => new Promise(resolve => setTimeout(() => resolve(mockInventoryItems), 500)),
  getLocations: async () => new Promise(resolve => setTimeout(() => resolve(mockLocations), 500)),
  submitInventoryCount: async (countData: any) => new Promise(resolve => setTimeout(() => { console.log("Submitted inventory count:", countData); resolve(true); }, 1000)),
  submitInventoryTransfer: async (transferData: any) => new Promise(resolve => setTimeout(() => { console.log("Submitted inventory transfer:", transferData); resolve(true); }, 1000)),
};


// ================================================================= //
// INVENTORY COMPONENTS (Refactored for this project)
// ================================================================= //

function InventoryDashboard({ setActiveView }: { setActiveView: (view: string) => void }) {
  const overviewCards = [
    { view: 'count', title: 'Start Inventory Count', description: 'Perform a full or partial "shelf-to-sheet" count.', icon: ClipboardList },
    { view: 'transfer', title: 'Create a Transfer', description: 'Move inventory between your locations.', icon: ArrowRightLeft },
    { view: 'manage_items', title: 'Manage Items', description: 'Add or edit ingredients, packaging, and consumables.', icon: Settings },
  ];
  const futureCards = [
    { title: "Suggested Orders", description: "AI-powered suggestions for vendor purchase orders."},
    { title: "Log Waste & Production", description: "Track spoilage and yields to get a true COGS." },
    { title: "Perishables Watchlist", description: "Manage near-expiration items and log events." },
  ];

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {overviewCards.map((card, index) => (
                <Card 
                    key={card.view}
                    className="cursor-pointer group transition-all duration-300 hover:scale-105 hover:shadow-sky-500/20"
                    onClick={() => setActiveView(card.view)}
                >
                    <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                        <div className="bg-gradient-to-br from-sky-100 to-blue-200 p-3 rounded-full">
                            <card.icon className="w-6 h-6 text-sky-700" />
                        </div>
                        <CardTitle className="text-xl">{card.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-600 text-base">{card.description}</p>
                    </CardContent>
                </Card>
            ))}
            {futureCards.map((card, index) => (
               <Card key={card.title} className="opacity-60">
                 <CardHeader>
                    <CardTitle className="text-xl">{card.title}</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <p className="text-slate-500">{card.description}</p>
                    <span className="inline-block mt-3 bg-slate-200 text-slate-600 text-xs font-semibold px-2 py-1 rounded-full">Coming Soon</span>
                 </CardContent>
               </Card>
            ))}
        </div>
    </div>
  );
}

function InventoryCountSheet({ setActiveView }: { setActiveView: (view: string) => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const inventoryItems: any = await api.getInventoryItems();
        setItems(inventoryItems);
        setCounts(inventoryItems.reduce((acc: any, item: any) => ({ ...acc, [item.id]: '' }), {}));
      } catch (err) {
        toast({ title: 'Error', description: 'Failed to load inventory items.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [toast]);

  const handleCountChange = (itemId: string, value: string) => {
    setCounts(prev => ({ ...prev, [itemId]: value }));
  };

  const handleSubmit = async () => {
    const finalCounts = Object.entries(counts)
      .filter(([_, value]) => value !== '' && !isNaN(parseFloat(value)))
      .map(([itemId, value]) => ({ itemId, quantity: parseFloat(value) }));

    if (finalCounts.length === 0) {
      toast({ title: 'Input Needed', description: 'Please enter at least one count.', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      await api.submitInventoryCount({ date: new Date().toISOString(), counts: finalCounts });
      toast({ title: 'Success', description: 'Inventory count submitted successfully.' });
      setActiveView('overview');
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to submit inventory count.', variant: 'destructive' });
      setSubmitting(false);
    }
  };
  
  if (loading) return <div className="text-center p-8 text-slate-500 flex items-center justify-center"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Loading inventory...</div>;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl">Inventory Count</CardTitle>
        <CardDescription>Enter the physical count for each item. Leave fields blank if you are not counting them.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, index) => (
          <div key={item.id} className="grid grid-cols-5 gap-4 items-center border-b border-slate-200/80 pb-4">
            <Label htmlFor={`item-${item.id}`} className="font-semibold text-slate-800 col-span-5 sm:col-span-2">{item.name}</Label>
            <div className="col-span-3 sm:col-span-2">
                <Input id={`item-${item.id}`} type="number" value={counts[item.id] || ''} onChange={(e) => handleCountChange(item.id, e.target.value)} placeholder="Enter count"/>
            </div>
            <span className="text-slate-500 text-right sm:text-left col-span-2 sm:col-span-1">{item.unit}</span>
          </div>
        ))}
        <div className="mt-8 flex justify-end">
          <Button onClick={handleSubmit} disabled={submitting} size="lg">
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitting ? 'Submitting...' : 'Submit Count'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function InventoryTransferForm({ setActiveView }: { setActiveView: (view: string) => void }) {
    const [items, setItems] = useState<any[]>([]);
    const [locations, setLocations] = useState<any[]>([]);
    const [transferItems, setTransferItems] = useState([{ id: 1, itemId: '', quantity: '' }]);
    const [fromLocation, setFromLocation] = useState('');
    const [toLocation, setToLocation] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [inventoryItems, companyLocations]: [any, any] = await Promise.all([api.getInventoryItems(), api.getLocations()]);
                setItems(inventoryItems);
                setLocations(companyLocations);
                if (companyLocations.length > 0) setFromLocation(companyLocations[0].id);
            } catch (err) {
                toast({ title: 'Error', description: 'Failed to load initial data.', variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [toast]);

    const handleItemChange = (transferId: number, field: string, value: string) => {
        setTransferItems(prev => prev.map(item => item.id === transferId ? { ...item, [field]: value } : item));
    };

    const addTransferItem = () => setTransferItems(prev => [...prev, { id: Date.now(), itemId: '', quantity: '' }]);
    const removeTransferItem = (transferId: number) => setTransferItems(prev => prev.filter(item => item.id !== transferId));

    const handleSubmit = async () => {
        if (!fromLocation || !toLocation) return toast({ title: "Validation Error", description: "Please select 'from' and 'to' locations.", variant: "destructive" });
        if (fromLocation === toLocation) return toast({ title: "Validation Error", description: "'From' and 'to' locations cannot be the same.", variant: "destructive" });
        
        const validItems = transferItems.filter(item => item.itemId && item.quantity && parseFloat(item.quantity) > 0).map(item => ({...item, quantity: parseFloat(item.quantity)}));
        if (validItems.length === 0) return toast({ title: "Validation Error", description: "Please add at least one item with a valid quantity.", variant: "destructive" });

        setSubmitting(true);
        try {
            await api.submitInventoryTransfer({ fromLocationId: fromLocation, toLocationId: toLocation, items: validItems, date: new Date().toISOString() });
            toast({ title: 'Success', description: 'Inventory transfer submitted.' });
            setActiveView('overview');
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to submit inventory transfer.', variant: 'destructive' });
            setSubmitting(false);
        }
    };

    const availableToLocations = useMemo(() => locations.filter(loc => loc.id !== fromLocation), [locations, fromLocation]);

    if (loading) return <div className="text-center p-8 text-slate-500 flex items-center justify-center"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Loading data...</div>;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-3xl">Create Inventory Transfer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <fieldset className="border p-4 rounded-xl space-y-4">
                    <legend className="text-lg font-semibold px-2">Locations</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label htmlFor="fromLocation">From Location</Label>
                            <Select value={fromLocation} onValueChange={setFromLocation}><SelectTrigger id="fromLocation"><SelectValue /></SelectTrigger><SelectContent>{locations.map(loc => <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>)}</SelectContent></Select>
                        </div>
                        <div>
                            <Label htmlFor="toLocation">To Location</Label>
                            <Select value={toLocation} onValueChange={setToLocation}><SelectTrigger id="toLocation"><SelectValue placeholder="Select destination..." /></SelectTrigger><SelectContent><SelectItem value="">Select destination...</SelectItem>{availableToLocations.map(loc => <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>)}</SelectContent></Select>
                        </div>
                    </div>
                </fieldset>
                
                <fieldset className="border p-4 rounded-xl space-y-4">
                    <legend className="text-lg font-semibold px-2">Items to Transfer</legend>
                    {transferItems.map((item, index) => (
                        <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-50/50 p-4 rounded-lg">
                            <div className="md:col-span-6"><Select value={item.itemId} onValueChange={value => handleItemChange(item.id, 'itemId', value)}><SelectTrigger><SelectValue placeholder="Select an item..." /></SelectTrigger><SelectContent><SelectItem value="">Select an item...</SelectItem>{items.map(invItem => <SelectItem key={invItem.id} value={invItem.id}>{invItem.name}</SelectItem>)}</SelectContent></Select></div>
                            <div className="md:col-span-4"><Input type="number" min="0" value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', e.target.value)} placeholder="0" /></div>
                            <div className="md:col-span-2 flex justify-end">{transferItems.length > 1 && <Button variant="ghost" size="icon" onClick={() => removeTransferItem(item.id)} className="text-red-500 hover:text-red-700 hover:bg-red-100"><Trash2 /></Button>}</div>
                        </div>
                    ))}
                    <Button onClick={addTransferItem} variant="outline" size="sm"><Plus className="mr-2 h-4 w-4"/>Add Another Item</Button>
                </fieldset>

                <div className="mt-8 flex justify-end">
                    <Button onClick={handleSubmit} disabled={submitting} size="lg">{submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {submitting ? 'Submitting...' : 'Submit Transfer'}</Button>
                </div>
            </CardContent>
        </Card>
    );
}

function InventoryItemManager({ setActiveView }: { setActiveView: (view: string) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl">Item Library Management</CardTitle>
        <CardDescription>This feature is a work in progress.</CardDescription>
      </CardHeader>
      <CardContent>
          <p className="text-slate-600 mb-6">This feature is currently under development and will be available in a future update.</p>
          <div className="opacity-70 border-t pt-6">
            <h3 className="font-semibold text-slate-800">Planned Features:</h3>
            <ul className="list-disc list-inside mt-2 text-slate-600 space-y-1">
              <li>Add new inventory items (food, packaging, consumables).</li>
              <li>Define item categories (e.g., "Dairy," "Dry Goods," "Cleaning Supplies").</li>
              <li>Set default units of measure (e.g., lbs, oz, case, each).</li>
              <li>Link items to vendors and track purchase prices.</li>
            </ul>
          </div>
      </CardContent>
    </Card>
  );
}

// Main component for the sandbox page
export default function InventorySandboxPage({ pageId }: { pageId: string }) {
  const [activeView, setActiveView] = useState('overview');

  const renderActiveView = () => {
    switch (activeView) {
      case 'count': return <InventoryCountSheet setActiveView={setActiveView} />;
      case 'transfer': return <InventoryTransferForm setActiveView={setActiveView} />;
      case 'manage_items': return <InventoryItemManager setActiveView={setActiveView} />;
      default: return <InventoryDashboard setActiveView={setActiveView} />;
    }
  };

  const BackButton = () => (
    <Button onClick={() => setActiveView('overview')} variant="ghost" className="mb-6"><ArrowLeft className="mr-2 h-4 w-4" />Back to Inventory Overview</Button>
  );

  return (
    <div className="space-y-8">
      <div className="content-fade-in-up">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">Inventory Co-Pilot</h1>
        <p className="text-slate-500 mt-2 text-lg">Your central hub for managing inventory at Journey Canyon LLC.</p>
      </div>
      <div className="content-fade-in-up" style={{ animationDelay: '150ms' }}>
        {activeView !== 'overview' && <BackButton />}
        {renderActiveView()}
      </div>
    </div>
  );
}
