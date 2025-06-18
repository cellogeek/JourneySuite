
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/hooks/use-toast";
import { Plus, Minus, Edit, Save, Trash2, Package, Users, ArrowUp, GripVertical, FilePenLine } from 'lucide-react';
import { cn } from '@/lib/utils';

// Helper function to format camelCase item keys into readable names
const formatItemName = (camelCaseString: string): string => {
  if (!camelCaseString) return '';
  return camelCaseString
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize the first letter
    .trim();
};

// Helper to convert a string name into a camelCase key for state.
const convertNameToKey = (name: string): string => {
  if (!name) return '';
  return name.replace(/\s(.)/g, function(_match, p1) {
    return p1.toUpperCase();
  }).replace(/\s/g, '').replace(/^(.)/, function(_match, p1) {
    return p1.toLowerCase();
  });
};

// Common units for selection
const UNITS = [
  'lbs', 'gallons', 'sleeves', 'bottles', 'canisters', 'rolls', 'boxes', 'packs',
  'dozen', 'units', 'sets', 'bags', 'tubs', 'sheets', 'reams', 'oz', 'ml', 'grams', 'each'
];

interface InventoryItemData {
  whole: number;
  partial: number;
  unit: string;
  vendor: string;
}

interface SubLocationInventory {
  [itemKey: string]: InventoryItemData;
}

interface InventoryState {
  foh: SubLocationInventory;
  boh: SubLocationInventory;
  container: SubLocationInventory;
}

interface AddItemModalProps {
  inventory: InventoryState;
  onClose: () => void;
  onAddItem: (newItem: { name: string; sublocation: string; unit: string; whole: number; partial: number; vendor: string }) => void;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ inventory, onClose, onAddItem }) => {
  const [itemName, setItemName] = useState('');
  const [sublocation, setSublocation] = useState('foh');
  const [unit, setUnit] = useState('lbs');
  const [wholeQuantity, setWholeQuantity] = useState(0);
  const [partialQuantity, setPartialQuantity] = useState(0);
  const [duplicateWarning, setDuplicateWarning] = useState<{ sublocation: string; itemKey: string } | null>(null);
  const { toast } = useToast();

  const handleWholeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setWholeQuantity(isNaN(value) || value < 0 ? 0 : value);
  };

  const handleWholeAdjustment = (delta: number) => {
    setWholeQuantity(prev => Math.max(0, prev + delta));
  };

  const findDuplicateItem = (name: string) => {
    const normalizedNewName = name.trim().toLowerCase();
    for (const subKey in inventory) {
      for (const itemKey in inventory[subKey as keyof InventoryState]) {
        const existingItemName = formatItemName(itemKey).toLowerCase();
        if (existingItemName === normalizedNewName) {
          return { sublocation: subKey, itemKey: itemKey };
        }
      }
    }
    return null;
  };

  const handleSubmit = (forceAdd = false) => {
    if (!itemName.trim()) {
      toast({ title: "Validation Error", description: "Item Name cannot be empty.", variant: "destructive" });
      return;
    }
    const duplicate = findDuplicateItem(itemName);
    if (duplicate && !forceAdd) {
      setDuplicateWarning(duplicate);
      return;
    }
    const newItem = {
      name: itemName.trim(),
      sublocation: sublocation,
      unit: unit,
      whole: wholeQuantity,
      partial: partialQuantity,
      vendor: 'N/A',
    };
    onAddItem(newItem);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Inventory Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="addItemName">Item Name:</Label>
            <Input
              id="addItemName"
              value={itemName}
              onChange={(e) => { setItemName(e.target.value); setDuplicateWarning(null); }}
              placeholder="e.g., Espresso Beans"
            />
            {duplicateWarning && (
              <p className="text-red-500 text-xs italic mt-2">
                An item named "{itemName}" already exists in {duplicateWarning.sublocation.toUpperCase()}.
                Do you want to add it anyway or modify the existing one?
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="addSublocation">Sublocation:</Label>
            <Select value={sublocation} onValueChange={setSublocation}>
              <SelectTrigger id="addSublocation"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="foh">Front of House (FOH)</SelectItem>
                <SelectItem value="boh">Back of House (BOH)</SelectItem>
                <SelectItem value="container">Container</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="addUnit">Unit:</Label>
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger id="addUnit"><SelectValue /></SelectTrigger>
              <SelectContent>
                {UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="addWholeQuantity" className="flex-shrink-0">Whole Qty:</Label>
            <div className="flex items-center border border-input rounded-md overflow-hidden flex-grow">
              <Button variant="outline" size="icon" onClick={() => handleWholeAdjustment(-1)} aria-label="Decrease whole quantity" className="rounded-r-none h-10 w-10"> <Minus className="h-4 w-4"/> </Button>
              <Input
                type="number"
                id="addWholeQuantity"
                value={wholeQuantity === 0 ? '' : wholeQuantity}
                onChange={handleWholeChange}
                className="w-full text-center h-10 rounded-none border-y-0"
                min="0"
                aria-label="Current whole quantity"
              />
              <Button variant="outline" size="icon" onClick={() => handleWholeAdjustment(1)} aria-label="Increase whole quantity" className="rounded-l-none h-10 w-10"> <Plus className="h-4 w-4"/> </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="addPartialQuantity-slider">Partial Qty: ({partialQuantity}%)</Label>
            <Slider
              id="addPartialQuantity-slider"
              min={0} max={100} step={10}
              value={[partialQuantity]}
              onValueChange={(value) => setPartialQuantity(value[0])}
              aria-label="Partial quantity slider"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          {duplicateWarning ? (
            <Button onClick={() => handleSubmit(true)} variant="destructive">Add Anyway</Button>
          ) : (
            <Button onClick={() => handleSubmit()}>Add Item</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface EditItemModalProps {
  item: InventoryItemData;
  sublocationKey: keyof InventoryState;
  itemKey: string;
  vendors: string[];
  onClose: () => void;
  onUpdateItem: (updatedItemData: {
    originalSublocationKey: keyof InventoryState;
    originalItemKey: string;
    newSublocationKey: keyof InventoryState;
    newItemName: string;
    unit: string;
    whole: number;
    partial: number;
    vendor: string;
  }) => void;
  onAddVendor: (newVendorName: string) => void;
}

const EditItemModal: React.FC<EditItemModalProps> = ({ item, sublocationKey, itemKey, vendors, onClose, onUpdateItem, onAddVendor }) => {
  const [currentName, setCurrentName] = useState(formatItemName(itemKey));
  const [currentSublocation, setCurrentSublocation] = useState<keyof InventoryState>(sublocationKey);
  const [currentUnit, setCurrentUnit] = useState(item.unit);
  const [currentWholeQuantity, setCurrentWholeQuantity] = useState(item.whole);
  const [currentPartialQuantity, setCurrentPartialQuantity] = useState(item.partial);
  const [selectedVendor, setSelectedVendor] = useState(item.vendor || 'N/A');
  const [newVendorName, setNewVendorName] = useState('');
  const { toast } = useToast();

  const handleVendorChange = (value: string) => {
    setSelectedVendor(value);
    if (value !== 'addNew') {
      setNewVendorName('');
    }
  };

  const handleSubmit = () => {
    if (!currentName.trim()) {
      toast({ title: "Validation Error", description: "Item Name cannot be empty.", variant: "destructive" });
      return;
    }
    let finalVendor = selectedVendor;
    if (selectedVendor === 'addNew') {
      if (newVendorName.trim()) {
        finalVendor = newVendorName.trim();
        onAddVendor(finalVendor);
      } else {
        toast({ title: "Validation Error", description: "Please enter a name for the new vendor or select an existing one.", variant: "destructive" });
        return;
      }
    }
    const updatedItemData = {
      originalSublocationKey: sublocationKey,
      originalItemKey: itemKey,
      newSublocationKey: currentSublocation,
      newItemName: currentName.trim(),
      unit: currentUnit,
      whole: currentWholeQuantity,
      partial: currentPartialQuantity,
      vendor: finalVendor,
    };
    onUpdateItem(updatedItemData);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Item: {formatItemName(itemKey)}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="editItemName">Item Name:</Label>
            <Input id="editItemName" value={currentName} onChange={(e) => setCurrentName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="editSublocation">Sublocation:</Label>
            <Select value={currentSublocation} onValueChange={(value) => setCurrentSublocation(value as keyof InventoryState)}>
              <SelectTrigger id="editSublocation"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="foh">Front of House (FOH)</SelectItem>
                <SelectItem value="boh">Back of House (BOH)</SelectItem>
                <SelectItem value="container">Container</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="editUnit">Unit:</Label>
            <Select value={currentUnit} onValueChange={setCurrentUnit}>
              <SelectTrigger id="editUnit"><SelectValue /></SelectTrigger>
              <SelectContent>
                {UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Label className="flex-shrink-0">Whole Qty:</Label>
             <div className="flex items-center border border-input rounded-md overflow-hidden flex-grow">
                <Button variant="outline" size="icon" onClick={() => setCurrentWholeQuantity(prev => Math.max(0, prev - 1))} aria-label="Decrease whole quantity" className="rounded-r-none h-10 w-10"> <Minus className="h-4 w-4"/> </Button>
                <Input
                    type="number"
                    value={currentWholeQuantity === 0 ? '' : currentWholeQuantity}
                    onChange={(e) => { const val = parseInt(e.target.value, 10); setCurrentWholeQuantity(isNaN(val) || val < 0 ? 0 : val); }}
                    className="w-full text-center h-10 rounded-none border-y-0"
                    min="0"
                    aria-label="Current whole quantity"
                />
                <Button variant="outline" size="icon" onClick={() => setCurrentWholeQuantity(prev => prev + 1)} aria-label="Increase whole quantity" className="rounded-l-none h-10 w-10"> <Plus className="h-4 w-4"/> </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="editPartialQuantity-slider">Partial Qty: ({currentPartialQuantity}%)</Label>
            <Slider
              id="editPartialQuantity-slider"
              min={0} max={100} step={10}
              value={[currentPartialQuantity]}
              onValueChange={(value) => setCurrentPartialQuantity(value[0])}
              aria-label="Partial quantity slider"
            />
          </div>
          <div>
            <Label htmlFor="itemVendor">Vendor:</Label>
            <Select value={selectedVendor} onValueChange={handleVendorChange}>
              <SelectTrigger id="itemVendor"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="N/A">N/A</SelectItem>
                {vendors.map(v => (<SelectItem key={v} value={v}>{v}</SelectItem>))}
                <SelectItem value="addNew">-- Add New Vendor... --</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {selectedVendor === 'addNew' && (
            <div>
              <Label htmlFor="newVendorName">New Vendor Name:</Label>
              <Input id="newVendorName" value={newVendorName} onChange={(e) => setNewVendorName(e.target.value)} placeholder="e.g., Fresh Brew Suppliers" />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}><Save className="mr-2 h-4 w-4" />Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


interface OrderedItem extends InventoryItemData {
  id: string;
  sublocationKey: keyof InventoryState;
  itemKey: string;
  name: string;
}

interface EditOrderModalProps {
  inventory: InventoryState;
  onClose: () => void;
  onSave: (newOrder: InventoryState) => void;
}

const EditOrderModal: React.FC<EditOrderModalProps> = ({ inventory, onClose, onSave }) => {
  const [orderedItems, setOrderedItems] = useState<OrderedItem[]>([]);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [isDraggingTouch, setIsDraggingTouch] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);
  const [dragItemOffset, setDragItemOffset] = useState(0);
  const [currentHoverIndex, setCurrentHoverIndex] = useState<number | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const flatItems: OrderedItem[] = [];
    (Object.keys(inventory) as Array<keyof InventoryState>).forEach(sublocationKey => {
      if (inventory[sublocationKey] && typeof inventory[sublocationKey] === 'object') {
        Object.keys(inventory[sublocationKey]).forEach(itemKey => {
          flatItems.push({
            id: `${sublocationKey}-${itemKey}`,
            sublocationKey,
            itemKey,
            ...inventory[sublocationKey][itemKey],
            name: formatItemName(itemKey)
          });
        });
      }
    });
    setOrderedItems(flatItems);
  }, [inventory]);

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, orderedItems.length);
  }, [orderedItems]);

  const performReorder = (draggedIdx: number, targetIdx: number) => {
    if (draggedIdx === null || draggedIdx === targetIdx) return;
    setOrderedItems(prevItems => {
        const newOrderedItems = [...prevItems];
        const [removed] = newOrderedItems.splice(draggedIdx, 1);
        newOrderedItems.splice(targetIdx, 0, removed);
        return newOrderedItems;
    });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (isDraggingTouch) return;
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (isDraggingTouch) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    if (isDraggingTouch) return;
    e.preventDefault();
    const draggedIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
    performReorder(draggedIdx, targetIndex);
    setDraggedItemIndex(null);
  };

  const handleDragEnd = () => {
    if (isDraggingTouch) return;
    setDraggedItemIndex(null);
  };

  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    setIsDraggingTouch(true);
    setDraggedItemIndex(index);
    setTouchStartY(e.touches[0].clientY);
    if (itemRefs.current[index]) {
      const rect = itemRefs.current[index]!.getBoundingClientRect();
      setDragItemOffset(e.touches[0].clientY - rect.top);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingTouch || draggedItemIndex === null) return;
    const currentTouchY = e.touches[0].clientY;
    const newOffset = currentTouchY - touchStartY;
    if (itemRefs.current[draggedItemIndex]) {
        itemRefs.current[draggedItemIndex]!.style.transform = `translateY(${newOffset}px)`;
    }

    let hoverIdx = draggedItemIndex;
    for (let i = 0; i < orderedItems.length; i++) {
      if (!itemRefs.current[i] || i === draggedItemIndex) continue;
      const itemRect = itemRefs.current[i]!.getBoundingClientRect();
      const itemMidpoint = itemRect.top + itemRect.height / 2;
      const draggedItemVisualCenterY = currentTouchY - dragItemOffset + (itemRefs.current[draggedItemIndex]?.offsetHeight || 0) / 2;

      if (draggedItemIndex < i && draggedItemVisualCenterY > itemMidpoint) {
        hoverIdx = i;
      } else if (draggedItemIndex > i && draggedItemVisualCenterY < itemMidpoint) {
        hoverIdx = i;
      }
    }
    if (hoverIdx !== currentHoverIndex) {
        setCurrentHoverIndex(hoverIdx);
    }
  };

  const handleTouchEnd = () => {
    if (!isDraggingTouch || draggedItemIndex === null) return;
    if (itemRefs.current[draggedItemIndex]) {
      itemRefs.current[draggedItemIndex]!.style.transform = 'none';
    }
    setIsDraggingTouch(false);
    setTouchStartY(0);
    setDragItemOffset(0);

    if (currentHoverIndex !== null && currentHoverIndex !== draggedItemIndex) {
        performReorder(draggedItemIndex, currentHoverIndex);
    }
    setDraggedItemIndex(null);
    setCurrentHoverIndex(null);
  };


  const handleSave = () => {
    const newInventoryState: InventoryState = { foh: {}, boh: {}, container: {} };
    orderedItems.forEach(item => {
      if (!newInventoryState[item.sublocationKey]) {
        newInventoryState[item.sublocationKey] = {};
      }
      newInventoryState[item.sublocationKey][item.itemKey] = {
        whole: item.whole, partial: item.partial, unit: item.unit, vendor: item.vendor || 'N/A',
      };
    });
    onSave(newInventoryState);
    onClose();
  };

  return (
     <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto flex flex-col">
        <DialogHeader><DialogTitle>Edit Item Order</DialogTitle></DialogHeader>
        <div className="flex-grow overflow-y-auto pr-2 -mr-2 py-4">
          {orderedItems.map((item, index) => (
            <div
              key={item.id}
              ref={el => itemRefs.current[index] = el}
              draggable="true"
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              onTouchStart={(e) => handleTouchStart(e, index)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
              className={cn(
                "relative p-3 bg-slate-50 border border-slate-200 rounded-lg mb-2 flex items-center justify-between shadow-sm cursor-grab transition-all duration-200 ease-in-out",
                draggedItemIndex === index && "opacity-50 border-sky-500 ring-2 ring-sky-500",
                draggedItemIndex !== null && currentHoverIndex === index && draggedItemIndex !== index && !isDraggingTouch && "bg-sky-100",
                isDraggingTouch && draggedItemIndex === index && "absolute z-50 shadow-lg border-purple-500 bg-white"
              )}
              style={{
                touchAction: 'none', // Important for preventing default scroll on touch devices
                ...(isDraggingTouch && draggedItemIndex === index && {
                    // Position is handled by transform
                    width: itemRefs.current[draggedItemIndex]?.offsetWidth ? `${itemRefs.current[draggedItemIndex]?.offsetWidth}px` : 'auto',
                    pointerEvents: 'none' as 'none', // Disable pointer events on the original item while dragging its clone
                })
              }}
            >
              <span className="text-sm text-slate-700 font-medium">
                {item.name} ({item.unit}) - <span className="font-semibold text-sky-600">{item.sublocationKey.toUpperCase()}</span>
              </span>
              <GripVertical className="w-5 h-5 text-slate-400 cursor-grab" />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" />Save Order</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface VendorManagementProps {
  vendors: string[];
}
const VendorManagement: React.FC<VendorManagementProps> = ({ vendors }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5 text-sky-600"/>All Vendors</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-disc list-inside space-y-2 pl-5">
          {vendors.length > 0 ? (
            vendors.map((vendor, index) => (
              <li key={index} className="text-slate-700">
                {vendor}
              </li>
            ))
          ) : (
            <p className="text-slate-500 italic">No vendors added yet.</p>
          )}
        </ul>
      </CardContent>
    </Card>
  );
};


const WeeklyInventoryPage = ({ pageId }: { pageId: string }) => {
  const [inventory, setInventory] = useState<InventoryState>({
    foh: {
      espressoBeans: { whole: 5, partial: 0, unit: 'lbs', vendor: 'Coffee Roasters Inc.' },
      dripCoffeeBeans: { whole: 8, partial: 0, unit: 'lbs', vendor: 'Coffee Roasters Inc.' },
      paperCups12oz: { whole: 10, partial: 0, unit: 'sleeves', vendor: 'Paper Goods Co.' },
      paperCups16oz: { whole: 12, partial: 0, unit: 'sleeves', vendor: 'Paper Goods Co.' },
      cupLids: { whole: 15, partial: 0, unit: 'rolls', vendor: 'Paper Goods Co.' },
      stirSticks: { whole: 20, partial: 0, unit: 'boxes', vendor: 'Office Supplies Co.' },
      sugarPackets: { whole: 30, partial: 0, unit: 'boxes', vendor: 'Food Services LLC' },
      splendaPackets: { whole: 25, partial: 0, unit: 'boxes', vendor: 'Food Services LLC' },
      sweetnLowPackets: { whole: 22, partial: 0, unit: 'boxes', vendor: 'Food Services LLC' },
      napkins: { whole: 18, partial: 0, unit: 'packs', vendor: 'Cleaning Supply Co.' },
      pastryBags: { whole: 7, partial: 0, unit: 'boxes', vendor: 'Paper Goods Co.' },
      sandwichWraps: { whole: 9, partial: 0, unit: 'rolls', vendor: 'Paper Goods Co.' },
      coldCups20oz: { whole: 10, partial: 0, unit: 'sleeves', vendor: 'Paper Goods Co.' },
      coldCupLids: { whole: 15, partial: 0, unit: 'rolls', vendor: 'Paper Goods Co.' },
      coffeeStirrerStraws: { whole: 20, partial: 0, unit: 'boxes', vendor: 'Office Supplies Co.' },
    },
    boh: {
      milkGallons: { whole: 20, partial: 0, unit: 'gallons', vendor: 'Dairy Delights' },
      almondMilkCartons: { whole: 15, partial: 0, unit: 'cartons', vendor: 'Vegan Milk Co.' },
      oatMilkCartons: { whole: 18, partial: 0, unit: 'cartons', vendor: 'Vegan Milk Co.' },
      vanillaSyrup: { whole: 15, partial: 0, unit: 'bottles', vendor: 'Flavor Syrups Inc.' },
      caramelSyrup: { whole: 12, partial: 0, unit: 'bottles', vendor: 'Flavor Syrups Inc.' },
      chocolateSyrup: { whole: 10, partial: 0, unit: 'bottles', vendor: 'Flavor Syrups Inc.' },
      chaiConcentrate: { whole: 8, partial: 0, unit: 'gallons', vendor: 'Beverage Blends' },
      matchaPowder: { whole: 6, partial: 0, unit: 'bags', vendor: 'Green Tea Co.' },
      whippedCreamCanisters: { whole: 10, partial: 0, unit: 'canisters', vendor: 'Dairy Delights' },
      creamCheese: { whole: 5, partial: 0, unit: 'tubs', vendor: 'Dairy Delights' },
      butterPacks: { whole: 12, partial: 0, unit: 'packs', vendor: 'Dairy Delights' },
      bagels: { whole: 30, partial: 0, unit: 'dozen', vendor: 'Local Bakery' },
      muffins: { whole: 24, partial: 0, unit: 'units', vendor: 'Local Bakery' },
      croissants: { whole: 18, partial: 0, unit: 'units', vendor: 'Local Bakery' },
      pastryDough: { whole: 5, partial: 0, unit: 'sheets', vendor: 'Dough Distributors' },
      iceCreamPints: { whole: 10, partial: 0, unit: 'pints', vendor: 'Frozen Treats Ltd.' },
    },
    container: {
      unroastedCoffeeBeansEthiopia: { whole: 3, partial: 0, unit: 'bags', vendor: 'Specialty Coffee Importers' },
      unroastedCoffeeBeansColombia: { whole: 4, partial: 0, unit: 'bags', vendor: 'Specialty Coffee Importers' },
      cleaningSolution: { whole: 7, partial: 0, unit: 'gallons', vendor: 'Cleaning Supply Co.' },
      disinfectantWipes: { whole: 10, partial: 0, unit: 'canisters', vendor: 'Cleaning Supply Co.' },
      floorCleaner: { whole: 2, partial: 0, unit: 'gallons', vendor: 'Cleaning Supply Co.' },
      paperTowelRolls: { whole: 12, partial: 0, unit: 'rolls', vendor: 'Paper Goods Co.' },
      trashBagsLarge: { whole: 5, partial: 0, unit: 'boxes', vendor: 'Office Supplies Co.' },
      trashBagsSmall: { whole: 8, partial: 0, unit: 'boxes', vendor: 'Office Supplies Co.' },
      lightBulbs: { whole: 15, partial: 0, unit: 'units', vendor: 'Hardware Store Inc.' },
      spareEspressoMachineParts: { whole: 1, partial: 0, unit: 'box', vendor: 'Espresso Tech Solutions' },
      extraUniforms: { whole: 5, partial: 0, unit: 'sets', vendor: 'Uniforms R Us' },
      promotionalFlyers: { whole: 100, partial: 0, unit: 'units', vendor: 'Local Print Shop' },
      seasonalDecorations: { whole: 1, partial: 0, unit: 'box', vendor: 'N/A' },
      storageBins: { whole: 8, partial: 0, unit: 'units', vendor: 'Hardware Store Inc.' },
      spareFilters: { whole: 3, partial: 0, unit: 'units', vendor: 'Water Filter Co.' },
    },
  });

  const [vendors, setVendors] = useState<string[]>([
    'N/A', 'Coffee Roasters Inc.', 'Dairy Delights', 'Paper Goods Co.', 'Food Services LLC',
    'Office Supplies Co.', 'Vegan Milk Co.', 'Flavor Syrups Inc.', 'Beverage Blends',
    'Green Tea Co.', 'Local Bakery', 'Specialty Coffee Importers', 'Cleaning Supply Co.',
    'Hardware Store Inc.', 'Espresso Tech Solutions', 'Uniforms R Us', 'Local Print Shop',
    'Dough Distributors', 'Frozen Treats Ltd.', 'Water Filter Co.'
  ].sort());

  const [showEditOrderModal, setShowEditOrderModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<{ sublocationKey: keyof InventoryState; itemKey: string; itemData: InventoryItemData } | null>(null);
  const [activeTab, setActiveTab] = useState<keyof InventoryState>('foh');
  const [activeView, setActiveView] = useState<'inventory' | 'vendors'>('inventory');
  const [isEditMode, setIsEditMode] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  // Firebase related comments from original code are preserved but not active for this stub.

  useEffect(() => {
    const handleScroll = () => setShowScrollToTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleAddItem = (newItem: { name: string; sublocation: string; unit: string; whole: number; partial: number; vendor: string }) => {
    setInventory(prevInventory => {
      const newInventory = { ...prevInventory };
      const itemKey = convertNameToKey(newItem.name);
      const subKey = newItem.sublocation as keyof InventoryState;

      if (!newInventory[subKey]) newInventory[subKey] = {};
      newInventory[subKey][itemKey] = {
        whole: newItem.whole, partial: newItem.partial, unit: newItem.unit, vendor: newItem.vendor,
      };
      return newInventory;
    });
    setActiveTab(newItem.sublocation as keyof InventoryState);
  };

  const handleUpdateItem = (updatedItemData: { originalSublocationKey: keyof InventoryState; originalItemKey: string; newSublocationKey: keyof InventoryState; newItemName: string; unit: string; whole: number; partial: number; vendor: string }) => {
    setInventory(prevInventory => {
      const newInventory = JSON.parse(JSON.stringify(prevInventory)); // Deep copy
      const { originalSublocationKey, originalItemKey, newSublocationKey, newItemName, unit, whole, partial, vendor } = updatedItemData;
      const newItemKey = convertNameToKey(newItemName);

      if (originalSublocationKey !== newSublocationKey || originalItemKey !== newItemKey) {
        if (newInventory[originalSublocationKey] && newInventory[originalSublocationKey][originalItemKey]) {
          delete newInventory[originalSublocationKey][originalItemKey];
        }
      }
      if (!newInventory[newSublocationKey]) newInventory[newSublocationKey] = {};
      newInventory[newSublocationKey][newItemKey] = { whole, partial, unit, vendor };
      return newInventory;
    });
    setActiveTab(updatedItemData.newSublocationKey);
  };

  const addNewVendorToState = (newVendorName: string) => {
    setVendors(prevVendors => {
      const updatedVendors = [...prevVendors];
      if (!updatedVendors.includes(newVendorName)) {
        updatedVendors.push(newVendorName);
        updatedVendors.sort();
      }
      return updatedVendors;
    });
  };

  const handleItemWholeChange = (sublocationKey: keyof InventoryState, itemKey: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    const newWhole = isNaN(value) || value < 0 ? 0 : value;
     setInventory(prev => ({ ...prev, [sublocationKey]: { ...prev[sublocationKey], [itemKey]: { ...prev[sublocationKey][itemKey], whole: newWhole } } }));
  };

  const handleItemWholeAdjustment = (sublocationKey: keyof InventoryState, itemKey: string, delta: number) => {
    setInventory(prev => {
      const currentWhole = prev[sublocationKey][itemKey].whole;
      const newWhole = Math.max(0, currentWhole + delta);
      return { ...prev, [sublocationKey]: { ...prev[sublocationKey], [itemKey]: { ...prev[sublocationKey][itemKey], whole: newWhole } } };
    });
  };

  const handleItemPartialChange = (sublocationKey: keyof InventoryState, itemKey: string, value: number[]) => {
     setInventory(prev => ({ ...prev, [sublocationKey]: { ...prev[sublocationKey], [itemKey]: { ...prev[sublocationKey][itemKey], partial: value[0] } } }));
  };

  const renderInventoryItem = (sublocationKey: keyof InventoryState, itemKey: string, itemData: InventoryItemData) => (
    <Card key={`${sublocationKey}-${itemKey}`} className="mb-3 sm:mb-4">
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="flex-1 mb-3 sm:mb-0">
                <h4 className="font-semibold text-slate-800 text-md">{formatItemName(itemKey)} ({itemData.unit})</h4>
                <p className="text-slate-600 text-xs">Vendor: {itemData.vendor || 'N/A'}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                <div className="flex items-center border border-input rounded-md overflow-hidden w-full sm:w-auto">
                    <Button variant="outline" size="icon" onClick={() => handleItemWholeAdjustment(sublocationKey, itemKey, -1)} aria-label={`Decrease ${formatItemName(itemKey)} whole quantity`} className="rounded-r-none h-10 w-10"> <Minus className="h-4 w-4"/> </Button>
                    <Input
                        type="number"
                        value={itemData.whole === 0 ? '' : itemData.whole}
                        onChange={(e) => handleItemWholeChange(sublocationKey, itemKey, e)}
                        className="w-full sm:w-16 text-center h-10 rounded-none border-y-0"
                        min="0"
                        aria-label={`Current ${formatItemName(itemKey)} whole quantity`}
                    />
                    <Button variant="outline" size="icon" onClick={() => handleItemWholeAdjustment(sublocationKey, itemKey, 1)} aria-label={`Increase ${formatItemName(itemKey)} whole quantity`} className="rounded-l-none h-10 w-10"> <Plus className="h-4 w-4"/> </Button>
                </div>
                <div className="flex flex-col items-center w-full sm:w-40">
                    <Label htmlFor={`${itemKey}-partial-slider`} className="text-xs font-medium text-slate-600 mb-1">Partial: ({itemData.partial}%)</Label>
                    <Slider
                        id={`${itemKey}-partial-slider`}
                        min={0} max={100} step={10}
                        value={[itemData.partial]}
                        onValueChange={(value) => handleItemPartialChange(sublocationKey, itemKey, value)}
                        aria-label={`${formatItemName(itemKey)} partial quantity slider`}
                    />
                </div>
                {isEditMode && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setItemToEdit({ sublocationKey, itemKey, itemData }); setShowEditItemModal(true); }}
                        aria-label={`Edit ${formatItemName(itemKey)}`}
                        className="mt-2 sm:mt-0 sm:ml-2"
                    >
                        <FilePenLine className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <Card className="w-full max-w-5xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Weekly Inventory Count</CardTitle>
          <CardDescription className="text-lg text-slate-500 pt-1">Journey Canyon LLC - Canyon Location</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center mb-6 sm:mb-8 space-x-2 sm:space-x-4">
            {(['inventory', 'vendors'] as const).map(view => (
              <Button
                key={view}
                onClick={() => setActiveView(view)}
                variant={activeView === view ? 'default' : 'outline'}
                size="lg"
              >
                {view === 'inventory' ? 'Inventory Count' : 'Vendor Management'}
              </Button>
            ))}
          </div>

          {activeView === 'inventory' ? (
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as keyof InventoryState)} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 sm:mb-8">
                <TabsTrigger value="foh">Front of House</TabsTrigger>
                <TabsTrigger value="boh">Back of House</TabsTrigger>
                <TabsTrigger value="container">Container</TabsTrigger>
              </TabsList>
              <div className="flex flex-col sm:flex-row justify-end gap-3 mb-4 sm:mb-6">
                <Button onClick={() => setShowAddItemModal(true)} variant="default" size="action">
                  <Plus className="mr-2 h-5 w-5"/>Add Item
                </Button>
                <Button onClick={() => setShowEditOrderModal(true)} variant="outline" size="action">
                  <Edit className="mr-2 h-5 w-5"/>Edit Display Order
                </Button>
                <Button
                  onClick={() => setIsEditMode(prev => !prev)}
                  variant={isEditMode ? 'destructive' : 'secondary'}
                  size="action"
                >
                  {isEditMode ? 'Exit Edit Mode' : <><FilePenLine className="mr-2 h-5 w-5"/>Toggle Item Edit</>}
                </Button>
              </div>

              {(['foh', 'boh', 'container'] as const).map(subKey => (
                <TabsContent key={subKey} value={subKey}>
                  <Card className="bg-slate-100/50">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold text-slate-700">
                        {subKey === 'foh' ? 'Front of House (FOH)' : subKey === 'boh' ? 'Back of House (BOH)' : 'Container'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {Object.keys(inventory[subKey] || {}).length > 0 ? (
                        Object.keys(inventory[subKey]).map(itemKey =>
                          renderInventoryItem(subKey, itemKey, inventory[subKey][itemKey])
                        )
                      ) : (
                        <p className="text-slate-500 text-center py-4">No items in this sublocation yet.</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <VendorManagement vendors={vendors} />
          )}
        </CardContent>
      </Card>

      {showAddItemModal && <AddItemModal inventory={inventory} onClose={() => setShowAddItemModal(false)} onAddItem={handleAddItem} />}
      {showEditItemModal && itemToEdit && <EditItemModal {...itemToEdit} vendors={vendors} onClose={() => setShowEditItemModal(false)} onUpdateItem={handleUpdateItem} onAddVendor={addNewVendorToState} />}
      {showEditOrderModal && <EditOrderModal inventory={inventory} onClose={() => setShowEditOrderModal(false)} onSave={(newOrder) => { setInventory(newOrder); setShowEditOrderModal(false); }} />}

      {showScrollToTop && (
        <Button
          onClick={scrollToTop}
          variant="default"
          size="icon"
          className="fixed bottom-6 right-6 rounded-full h-12 w-12 shadow-lg z-40"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};

export default WeeklyInventoryPage;


    