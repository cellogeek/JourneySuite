
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/hooks/use-toast";
import { Plus, Minus, Edit, Save, Trash2, Package, Users, ArrowUp, GripVertical, FilePenLine } from 'lucide-react';
import { cn } from '@/lib/utils';

const formatItemName = (camelCaseString: string): string => {
  if (!camelCaseString) return '';
  return camelCaseString
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

const convertNameToKey = (name: string): string => {
  if (!name) return '';
  return name.replace(/\s(.)/g, function(_match, p1) {
    return p1.toUpperCase();
  }).replace(/\s/g, '').replace(/^(.)/, function(_match, p1) {
    return p1.toLowerCase();
  });
};

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

interface CanyonInventoryStructure {
  foh: SubLocationInventory;
  boh: SubLocationInventory;
  container: SubLocationInventory;
}

interface PolkInventoryStructure {
  foh: SubLocationInventory;
  boh: SubLocationInventory;
}

interface CartInventoryStructure {
  cartItems: SubLocationInventory;
}

type TopLevelLocationKey = 'canyon' | 'polk' | 'cart';

type SubLocationKey<T extends TopLevelLocationKey> =
  T extends 'canyon' ? keyof CanyonInventoryStructure :
  T extends 'polk' ? keyof PolkInventoryStructure :
  T extends 'cart' ? keyof CartInventoryStructure :
  never;


interface AllLocationsInventoryState {
  canyon: CanyonInventoryStructure;
  polk: PolkInventoryStructure;
  cart: CartInventoryStructure;
}

const initialInventoryState: AllLocationsInventoryState = {
  canyon: {
    foh: {
      espressoBeans: { whole: 5, partial: 0, unit: 'lbs', vendor: 'Coffee Roasters Inc.' },
      dripCoffeeBeans: { whole: 8, partial: 0, unit: 'lbs', vendor: 'Coffee Roasters Inc.' },
      paperCups12oz: { whole: 10, partial: 0, unit: 'sleeves', vendor: 'Paper Goods Co.' },
    },
    boh: {
      milkGallons: { whole: 20, partial: 0, unit: 'gallons', vendor: 'Dairy Delights' },
      almondMilkCartons: { whole: 15, partial: 0, unit: 'cartons', vendor: 'Vegan Milk Co.' },
    },
    container: {
      unroastedCoffeeBeansEthiopia: { whole: 3, partial: 0, unit: 'bags', vendor: 'Specialty Coffee Importers' },
      cleaningSolution: { whole: 7, partial: 0, unit: 'gallons', vendor: 'Cleaning Supply Co.' },
    },
  },
  polk: {
    foh: {
      polkEspresso: { whole: 3, partial: 0, unit: 'lbs', vendor: 'Polk Coffee Supply' },
      polkCups: { whole: 5, partial: 0, unit: 'sleeves', vendor: 'Polk Paper Co.'}
    },
    boh: {
      polkMilk: { whole: 10, partial: 0, unit: 'gallons', vendor: 'Polk Dairy' },
    },
  },
  cart: {
    cartItems: {
      bottledWater: { whole: 24, partial: 0, unit: 'bottles', vendor: 'Cart Beverages' },
      energyBars: { whole: 12, partial: 0, unit: 'units', vendor: 'Cart Snacks' },
    },
  },
};


interface AddItemModalProps {
  activeTopLevelLocation: TopLevelLocationKey;
  allInventory: AllLocationsInventoryState;
  onClose: () => void;
  onAddItem: (newItem: {
    name: string;
    topLevelLocation: TopLevelLocationKey;
    subLocation: string;
    unit: string;
    whole: number;
    partial: number;
    vendor: string;
  }) => void;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ activeTopLevelLocation, allInventory, onClose, onAddItem }) => {
  const [itemName, setItemName] = useState('');
  const [sublocation, setSublocation] = useState<string>(Object.keys(allInventory[activeTopLevelLocation])[0] || '');
  const [unit, setUnit] = useState('lbs');
  const [wholeQuantity, setWholeQuantity] = useState(0);
  const [partialQuantity, setPartialQuantity] = useState(0);
  const [duplicateWarning, setDuplicateWarning] = useState<{ topLevel: string; subLocation: string; itemKey: string } | null>(null);
  const { toast } = useToast();

  const subLocationOptions = Object.keys(allInventory[activeTopLevelLocation]).map(key => ({
    value: key,
    label: formatItemName(key) === key ? key.toUpperCase() : formatItemName(key)
  }));

  useEffect(() => {
    if (activeTopLevelLocation && allInventory[activeTopLevelLocation]) {
      const firstSubKey = Object.keys(allInventory[activeTopLevelLocation])[0];
      if (firstSubKey) setSublocation(firstSubKey);
    }
  }, [activeTopLevelLocation, allInventory]);

  const handleWholeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setWholeQuantity(isNaN(value) || value < 0 ? 0 : value);
  };

  const handleWholeAdjustment = (delta: number) => {
    setWholeQuantity(prev => Math.max(0, prev + delta));
  };

  const findDuplicateItem = (name: string) => {
    const normalizedNewName = name.trim().toLowerCase();
    for (const locKey in allInventory) {
      const topLoc = allInventory[locKey as TopLevelLocationKey];
      for (const subKey in topLoc) {
        const subLocInventory = (topLoc as any)[subKey] as SubLocationInventory;
        for (const itemKey in subLocInventory) {
          const existingItemName = formatItemName(itemKey).toLowerCase();
          if (existingItemName === normalizedNewName) {
            return { topLevel: locKey, subLocation: subKey, itemKey: itemKey };
          }
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
      topLevelLocation: activeTopLevelLocation,
      subLocation: sublocation,
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
          <DialogTitle>Add New Item to {formatItemName(activeTopLevelLocation)}</DialogTitle>
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
                An item named "{itemName}" already exists in {duplicateWarning.topLevel.toUpperCase()} / {formatItemName(duplicateWarning.subLocation)}.
                Do you want to add it anyway or modify the existing one?
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="addSublocation">Sublocation (within {formatItemName(activeTopLevelLocation)}):</Label>
            <Select value={sublocation} onValueChange={setSublocation}>
              <SelectTrigger id="addSublocation"><SelectValue placeholder="Select sublocation" /></SelectTrigger>
              <SelectContent>
                {subLocationOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
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
            <Label htmlFor="addWholeQuantity" className="flex-shrink-0 whitespace-nowrap">Whole Qty:</Label>
            <div className="flex items-center border border-input rounded-md overflow-hidden flex-grow">
              <Button variant="outline" size="icon" onClick={() => handleWholeAdjustment(-1)} aria-label="Decrease whole quantity" className="rounded-r-none h-10 w-10 flex-shrink-0"> <Minus className="h-4 w-4"/> </Button>
              <Input
                type="number"
                id="addWholeQuantity"
                value={wholeQuantity === 0 ? '' : wholeQuantity}
                onChange={handleWholeChange}
                className="w-full text-center h-10 rounded-none border-y-0 px-1"
                min="0"
                aria-label="Current whole quantity"
              />
              <Button variant="outline" size="icon" onClick={() => handleWholeAdjustment(1)} aria-label="Increase whole quantity" className="rounded-l-none h-10 w-10 flex-shrink-0"> <Plus className="h-4 w-4"/> </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="addPartialQuantity-slider" className="block text-center sm:text-left mb-1">Partial Qty: ({partialQuantity}%)</Label>
            <Slider
              id="addPartialQuantity-slider"
              min={0} max={100} step={10}
              value={[partialQuantity]}
              onValueChange={(value) => setPartialQuantity(value[0])}
              aria-label="Partial quantity slider"
            />
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row sm:justify-end sm:space-x-2 pt-4">
          <DialogClose asChild><Button variant="outline" className="w-full sm:w-auto mb-2 sm:mb-0">Cancel</Button></DialogClose>
          {duplicateWarning ? (
            <Button onClick={() => handleSubmit(true)} variant="destructive" className="w-full sm:w-auto">Add Anyway</Button>
          ) : (
            <Button onClick={() => handleSubmit()} className="w-full sm:w-auto">Add Item</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface EditItemModalProps {
  topLevelLocationKey: TopLevelLocationKey;
  subLocationKey: string;
  itemKey: string;
  itemData: InventoryItemData;
  allInventory: AllLocationsInventoryState;
  vendors: string[];
  onClose: () => void;
  onUpdateItem: (updatedItemData: {
    originalTopLevelLocationKey: TopLevelLocationKey;
    originalSubLocationKey: string;
    originalItemKey: string;
    newTopLevelLocationKey: TopLevelLocationKey;
    newSubLocationKey: string;
    newItemName: string;
    unit: string;
    whole: number;
    partial: number;
    vendor: string;
  }) => void;
  onAddVendor: (newVendorName: string) => void;
}

const EditItemModal: React.FC<EditItemModalProps> = ({ topLevelLocationKey, subLocationKey, itemKey, itemData, allInventory, vendors, onClose, onUpdateItem, onAddVendor }) => {
  const [currentName, setCurrentName] = useState(formatItemName(itemKey));
  const [currentSublocation, setCurrentSublocation] = useState<string>(subLocationKey);
  const [currentUnit, setCurrentUnit] = useState(itemData.unit);
  const [currentWholeQuantity, setCurrentWholeQuantity] = useState(itemData.whole);
  const [currentPartialQuantity, setCurrentPartialQuantity] = useState(itemData.partial);
  const [selectedVendor, setSelectedVendor] = useState(itemData.vendor || 'N/A');
  const [newVendorName, setNewVendorName] = useState('');
  const { toast } = useToast();

  const subLocationOptions = Object.keys(allInventory[topLevelLocationKey]).map(key => ({
    value: key,
    label: formatItemName(key) === key ? key.toUpperCase() : formatItemName(key)
  }));

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
      originalTopLevelLocationKey: topLevelLocationKey,
      originalSubLocationKey: subLocationKey,
      originalItemKey: itemKey,
      newTopLevelLocationKey: topLevelLocationKey,
      newSubLocationKey: currentSublocation,
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
          <DialogTitle>Edit Item: {formatItemName(itemKey)} (in {formatItemName(topLevelLocationKey)})</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="editItemName">Item Name:</Label>
            <Input id="editItemName" value={currentName} onChange={(e) => setCurrentName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="editSublocation">Sublocation (within {formatItemName(topLevelLocationKey)}):</Label>
            <Select value={currentSublocation} onValueChange={setCurrentSublocation}>
              <SelectTrigger id="editSublocation"><SelectValue /></SelectTrigger>
              <SelectContent>
                {subLocationOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
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
            <Label className="flex-shrink-0 whitespace-nowrap">Whole Qty:</Label>
             <div className="flex items-center border border-input rounded-md overflow-hidden flex-grow">
                <Button variant="outline" size="icon" onClick={() => setCurrentWholeQuantity(prev => Math.max(0, prev - 1))} aria-label="Decrease whole quantity" className="rounded-r-none h-10 w-10 flex-shrink-0"> <Minus className="h-4 w-4"/> </Button>
                <Input
                    type="number"
                    value={currentWholeQuantity === 0 ? '' : currentWholeQuantity}
                    onChange={(e) => { const val = parseInt(e.target.value, 10); setCurrentWholeQuantity(isNaN(val) || val < 0 ? 0 : val); }}
                    className="w-full text-center h-10 rounded-none border-y-0 px-1"
                    min="0"
                    aria-label="Current whole quantity"
                />
                <Button variant="outline" size="icon" onClick={() => setCurrentWholeQuantity(prev => prev + 1)} aria-label="Increase whole quantity" className="rounded-l-none h-10 w-10 flex-shrink-0"> <Plus className="h-4 w-4"/> </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="editPartialQuantity-slider" className="block text-center sm:text-left mb-1">Partial Qty: ({currentPartialQuantity}%)</Label>
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
        <DialogFooter className="flex-col sm:flex-row sm:justify-end sm:space-x-2 pt-4">
          <DialogClose asChild><Button variant="outline" className="w-full sm:w-auto mb-2 sm:mb-0">Cancel</Button></DialogClose>
          <Button onClick={handleSubmit} className="w-full sm:w-auto"><Save className="mr-2 h-4 w-4" />Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface OrderedInventoryItem extends InventoryItemData {
  id: string;
  topLevelLocationKey: TopLevelLocationKey;
  subLocationKey: string;
  itemKey: string;
  name: string;
}

interface EditOrderModalProps {
  inventory: SubLocationInventory;
  activeTopLevelLocation: TopLevelLocationKey;
  activeSubLocationKey: string;
  onClose: () => void;
  onSave: (newOrder: SubLocationInventory, topLevel: TopLevelLocationKey, subLevel: string) => void;
}

const EditOrderModal: React.FC<EditOrderModalProps> = ({ inventory, activeTopLevelLocation, activeSubLocationKey, onClose, onSave }) => {
  const [orderedItems, setOrderedItems] = useState<OrderedInventoryItem[]>([]);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [isDraggingTouch, setIsDraggingTouch] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);
  const [dragItemOffset, setDragItemOffset] = useState(0);
  const [currentHoverIndex, setCurrentHoverIndex] = useState<number | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const flatItems: OrderedInventoryItem[] = [];
    if (inventory && typeof inventory === 'object') {
      Object.keys(inventory).forEach(itemKey => {
        flatItems.push({
          id: `${activeTopLevelLocation}-${activeSubLocationKey}-${itemKey}`,
          topLevelLocationKey: activeTopLevelLocation,
          subLocationKey: activeSubLocationKey,
          itemKey,
          ...(inventory[itemKey] as InventoryItemData),
          name: formatItemName(itemKey)
        });
      });
    }
    setOrderedItems(flatItems);
  }, [inventory, activeTopLevelLocation, activeSubLocationKey]);


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
    const newSubLocationInventory: SubLocationInventory = {};
    orderedItems.forEach(item => {
      newSubLocationInventory[item.itemKey] = {
        whole: item.whole,
        partial: item.partial,
        unit: item.unit,
        vendor: item.vendor || 'N/A',
      };
    });
    onSave(newSubLocationInventory, activeTopLevelLocation, activeSubLocationKey);
    onClose();
  };

  return (
     <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto flex flex-col">
        <DialogHeader><DialogTitle>Edit Item Order for {formatItemName(activeTopLevelLocation)} / {formatItemName(activeSubLocationKey)}</DialogTitle></DialogHeader>
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
                "relative p-3 bg-slate-50 border border-slate-200 rounded-lg mb-2 flex items-center justify-between shadow-sm cursor-grab transition-all duration-200 ease-in-out text-sm sm:text-base",
                draggedItemIndex === index && "opacity-50 border-sky-500 ring-2 ring-sky-500",
                draggedItemIndex !== null && currentHoverIndex === index && draggedItemIndex !== index && !isDraggingTouch && "bg-sky-100",
                isDraggingTouch && draggedItemIndex === index && "absolute z-50 shadow-lg border-purple-500 bg-white"
              )}
              style={{
                touchAction: 'none', 
                ...(isDraggingTouch && draggedItemIndex === index && {
                    width: itemRefs.current[draggedItemIndex]?.offsetWidth ? `${itemRefs.current[draggedItemIndex]?.offsetWidth}px` : 'auto',
                    pointerEvents: 'none' as 'none', 
                })
              }}
            >
              <span className="text-slate-700 font-medium">
                {item.name} ({item.unit})
              </span>
              <GripVertical className="w-5 h-5 text-slate-400 cursor-grab" />
            </div>
          ))}
        </div>
        <DialogFooter className="flex-col sm:flex-row sm:justify-end sm:space-x-2 pt-4">
          <DialogClose asChild><Button variant="outline" className="w-full sm:w-auto mb-2 sm:mb-0">Cancel</Button></DialogClose>
          <Button onClick={handleSave} className="w-full sm:w-auto"><Save className="mr-2 h-4 w-4" />Save Order</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


const WeeklyInventoryPage = ({ pageId }: { pageId: string }) => {
  const [inventory, setInventory] = useState<AllLocationsInventoryState>(initialInventoryState);

  const [vendors, setVendors] = useState<string[]>([
    'N/A', 'Coffee Roasters Inc.', 'Dairy Delights', 'Paper Goods Co.', 'Food Services LLC',
    'Office Supplies Co.', 'Vegan Milk Co.', 'Flavor Syrups Inc.', 'Beverage Blends',
    'Green Tea Co.', 'Local Bakery', 'Specialty Coffee Importers', 'Cleaning Supply Co.',
    'Hardware Store Inc.', 'Espresso Tech Solutions', 'Uniforms R Us', 'Local Print Shop',
    'Dough Distributors', 'Frozen Treats Ltd.', 'Water Filter Co.', 'Polk Coffee Supply',
    'Polk Paper Co.', 'Polk Dairy', 'Cart Beverages', 'Cart Snacks'
  ].sort());

  const [showEditOrderModal, setShowEditOrderModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<{ topLevelLocationKey: TopLevelLocationKey; subLocationKey: string; itemKey: string; itemData: InventoryItemData } | null>(null);
  
  const [activeTopLevelLocation, setActiveTopLevelLocation] = useState<TopLevelLocationKey>('canyon');
  const [activeSubLocationTab, setActiveSubLocationTab] = useState<string>('foh');

  const [isEditMode, setIsEditMode] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  useEffect(() => {
    if (activeTopLevelLocation && inventory[activeTopLevelLocation]) {
      const firstSubKey = Object.keys(inventory[activeTopLevelLocation])[0];
      if (firstSubKey) {
        setActiveSubLocationTab(firstSubKey);
      } else {
        setActiveSubLocationTab(''); 
      }
    }
  }, [activeTopLevelLocation, inventory]);


  useEffect(() => {
    const handleScroll = () => setShowScrollToTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleAddItem = (newItem: { name: string; topLevelLocation: TopLevelLocationKey; subLocation: string; unit: string; whole: number; partial: number; vendor: string }) => {
    setInventory(prevInventory => {
      const newInventory = JSON.parse(JSON.stringify(prevInventory)); 
      const itemKey = convertNameToKey(newItem.name);
      const { topLevelLocation, subLocation, unit, whole, partial, vendor } = newItem;

      if (!newInventory[topLevelLocation]) newInventory[topLevelLocation] = {} as any; 
      if (!newInventory[topLevelLocation][subLocation as keyof typeof newInventory[TopLevelLocationKey]]) {
        (newInventory[topLevelLocation] as any)[subLocation] = {};
      }
      
      (newInventory[topLevelLocation] as any)[subLocation][itemKey] = { whole, partial, unit, vendor };
      return newInventory;
    });
    setActiveTopLevelLocation(newItem.topLevelLocation);
    setActiveSubLocationTab(newItem.subLocation);
  };

  const handleUpdateItem = (updatedItemData: {
      originalTopLevelLocationKey: TopLevelLocationKey;
      originalSubLocationKey: string;
      originalItemKey: string;
      newTopLevelLocationKey: TopLevelLocationKey;
      newSubLocationKey: string;
      newItemName: string; unit: string; whole: number; partial: number; vendor: string;
    }) => {
    setInventory(prevInventory => {
      const newInventory = JSON.parse(JSON.stringify(prevInventory));
      const { originalTopLevelLocationKey, originalSubLocationKey, originalItemKey,
              newTopLevelLocationKey, newSubLocationKey, newItemName, unit, whole, partial, vendor } = updatedItemData;
      const newItemKey = convertNameToKey(newItemName);

      if (originalTopLevelLocationKey !== newTopLevelLocationKey || originalSubLocationKey !== newSubLocationKey || originalItemKey !== newItemKey) {
        if (newInventory[originalTopLevelLocationKey] && (newInventory[originalTopLevelLocationKey] as any)[originalSubLocationKey] && (newInventory[originalTopLevelLocationKey] as any)[originalSubLocationKey][originalItemKey]) {
          delete (newInventory[originalTopLevelLocationKey] as any)[originalSubLocationKey][originalItemKey];
        }
      }
      
      if (!newInventory[newTopLevelLocationKey]) newInventory[newTopLevelLocationKey] = {} as any;
      if (!(newInventory[newTopLevelLocationKey] as any)[newSubLocationKey]) (newInventory[newTopLevelLocationKey] as any)[newSubLocationKey] = {};

      (newInventory[newTopLevelLocationKey] as any)[newSubLocationKey][newItemKey] = { whole, partial, unit, vendor };
      return newInventory;
    });
    setActiveTopLevelLocation(updatedItemData.newTopLevelLocationKey);
    setActiveSubLocationTab(updatedItemData.newSubLocationKey);
  };
  
  const handleSaveOrderFromModal = (orderedSubLocationInventory: SubLocationInventory, topLevel: TopLevelLocationKey, subLevel: string) => {
    setInventory(prevInventory => {
      const newInventory = { ...prevInventory };
      (newInventory[topLevel] as any)[subLevel] = orderedSubLocationInventory;
      return newInventory;
    });
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

  const handleItemWholeChange = (topLvlKey: TopLevelLocationKey, subLocKey: string, itemKey: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    const newWhole = isNaN(value) || value < 0 ? 0 : value;
    setInventory(prev => ({
      ...prev,
      [topLvlKey]: {
        ...prev[topLvlKey],
        [subLocKey as keyof typeof prev[TopLevelLocationKey]]: { 
          ...(prev[topLvlKey] as any)[subLocKey],
          [itemKey]: { ...(prev[topLvlKey] as any)[subLocKey][itemKey], whole: newWhole }
        }
      }
    }));
  };

  const handleItemWholeAdjustment = (topLvlKey: TopLevelLocationKey, subLocKey: string, itemKey: string, delta: number) => {
    setInventory(prev => {
      const currentWhole = (prev[topLvlKey] as any)[subLocKey][itemKey].whole;
      const newWhole = Math.max(0, currentWhole + delta);
      return {
        ...prev,
        [topLvlKey]: {
          ...prev[topLvlKey],
          [subLocKey as keyof typeof prev[TopLevelLocationKey]]: {
            ...(prev[topLvlKey] as any)[subLocKey],
            [itemKey]: { ...(prev[topLvlKey] as any)[subLocKey][itemKey], whole: newWhole }
          }
        }
      };
    });
  };

  const handleItemPartialChange = (topLvlKey: TopLevelLocationKey, subLocKey: string, itemKey: string, value: number[]) => {
    setInventory(prev => ({
      ...prev,
      [topLvlKey]: {
        ...prev[topLvlKey],
        [subLocKey as keyof typeof prev[TopLevelLocationKey]]: {
          ...(prev[topLvlKey] as any)[subLocKey],
          [itemKey]: { ...(prev[topLvlKey] as any)[subLocKey][itemKey], partial: value[0] }
        }
      }
    }));
  };

  const renderInventoryItem = (topLvlKey: TopLevelLocationKey, subLocKey: string, itemKey: string, itemData: InventoryItemData) => (
    <Card key={`${topLvlKey}-${subLocKey}-${itemKey}`} className="mb-3 sm:mb-4">
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-800 text-sm sm:text-md truncate">{formatItemName(itemKey)} ({itemData.unit})</h4>
                <p className="text-slate-600 text-xs truncate">Vendor: {itemData.vendor || 'N/A'}</p>
            </div>
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 w-full lg:w-auto">
                <div className="flex items-center border border-input rounded-md overflow-hidden w-full lg:w-auto flex-grow lg:flex-grow-0">
                    <Button variant="outline" size="icon" onClick={() => handleItemWholeAdjustment(topLvlKey, subLocKey, itemKey, -1)} aria-label={`Decrease ${formatItemName(itemKey)} whole quantity`} className="rounded-r-none h-10 w-10 flex-shrink-0"> <Minus className="h-4 w-4"/> </Button>
                    <Input
                        type="number"
                        value={itemData.whole === 0 ? '' : itemData.whole}
                        onChange={(e) => handleItemWholeChange(topLvlKey, subLocKey, itemKey, e)}
                        className="w-full min-w-[3rem] lg:w-16 text-center h-10 rounded-none border-y-0 px-1"
                        min="0"
                        aria-label={`Current ${formatItemName(itemKey)} whole quantity`}
                    />
                    <Button variant="outline" size="icon" onClick={() => handleItemWholeAdjustment(topLvlKey, subLocKey, itemKey, 1)} aria-label={`Increase ${formatItemName(itemKey)} whole quantity`} className="rounded-l-none h-10 w-10 flex-shrink-0"> <Plus className="h-4 w-4"/> </Button>
                </div>
                <div className="flex flex-col items-center w-full lg:w-40">
                    <Label htmlFor={`${topLvlKey}-${subLocKey}-${itemKey}-partial-slider`} className="text-xs font-medium text-slate-600 mb-1 text-center lg:text-left">Partial: ({itemData.partial}%)</Label>
                    <Slider
                        id={`${topLvlKey}-${subLocKey}-${itemKey}-partial-slider`}
                        min={0} max={100} step={10}
                        value={[itemData.partial]}
                        onValueChange={(value) => handleItemPartialChange(topLvlKey, subLocKey, itemKey, value)}
                        aria-label={`${formatItemName(itemKey)} partial quantity slider`}
                    />
                </div>
                {isEditMode && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setItemToEdit({ topLevelLocationKey: topLvlKey, subLocationKey: subLocKey, itemKey, itemData }); setShowEditItemModal(true); }}
                        aria-label={`Edit ${formatItemName(itemKey)}`}
                        className="mt-2 lg:mt-0 lg:ml-2 w-full lg:w-auto flex-shrink-0 py-2"
                    >
                        <FilePenLine className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Edit</span>
                    </Button>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  );

  const getCurrentSubLocationKeys = (): string[] => {
    if (activeTopLevelLocation && inventory[activeTopLevelLocation]) {
      return Object.keys(inventory[activeTopLevelLocation]);
    }
    return [];
  };
  
  const getCurrentSubLocationInventory = (): SubLocationInventory | undefined => {
    if (activeTopLevelLocation && activeSubLocationTab && inventory[activeTopLevelLocation]) {
      return (inventory[activeTopLevelLocation] as any)[activeSubLocationTab];
    }
    return undefined;
  };


  return (
    <div className="min-h-screen bg-slate-50 p-2 sm:p-6 lg:p-8 flex flex-col items-center">
      <Card className="w-full max-w-5xl">
        <CardHeader className="text-center px-2 sm:px-6">
          <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Weekly Inventory Count</CardTitle>
          <CardDescription className="text-md sm:text-lg text-slate-500 pt-1">Journey Canyon LLC</CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
            <>
              <Tabs value={activeTopLevelLocation} onValueChange={(value) => setActiveTopLevelLocation(value as TopLevelLocationKey)} className="w-full mb-4">
                <TabsList className="grid w-full grid-cols-3 h-auto">
                  <TabsTrigger value="canyon" className="px-1 text-xs sm:text-sm py-1.5 sm:py-2.5">Canyon</TabsTrigger>
                  <TabsTrigger value="polk" className="px-1 text-xs sm:text-sm py-1.5 sm:py-2.5">Polk</TabsTrigger>
                  <TabsTrigger value="cart" className="px-1 text-xs sm:text-sm py-1.5 sm:py-2.5">Cart</TabsTrigger>
                </TabsList>
              </Tabs>

              <Tabs value={activeSubLocationTab} onValueChange={(value) => setActiveSubLocationTab(value)} className="w-full">
                <TabsList className="grid w-full h-auto" style={{gridTemplateColumns: `repeat(${Math.max(1, getCurrentSubLocationKeys().length)}, minmax(0, 1fr))`}}>
                  {getCurrentSubLocationKeys().map(subKey => (
                    <TabsTrigger key={subKey} value={subKey} className="px-1 text-xs sm:text-sm py-1.5 sm:py-2.5">
                      {formatItemName(subKey) === subKey ? subKey.toUpperCase() : formatItemName(subKey)}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <div className="flex flex-col sm:flex-row justify-end items-center gap-2 sm:gap-3 my-4 sm:my-6">
                    <Button onClick={() => setShowAddItemModal(true)} variant="default" size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
                    <Plus className="mr-1 sm:mr-2 h-4 w-4"/>Add Item
                    </Button>
                    <Button onClick={() => setShowEditOrderModal(true)} variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm" disabled={!activeSubLocationTab || getCurrentSubLocationKeys().length === 0}>
                    <Edit className="mr-1 sm:mr-2 h-4 w-4"/>Edit Display Order
                    </Button>
                    <Button
                    onClick={() => setIsEditMode(prev => !prev)}
                    variant={isEditMode ? 'destructive' : 'secondary'}
                    size="sm" className="w-full sm:w-auto text-xs sm:text-sm"
                    >
                    {isEditMode ? 'Exit Item Edit' : <><FilePenLine className="mr-1 sm:mr-2 h-4 w-4"/>Toggle Item Edit</>}
                    </Button>
                </div>

                {getCurrentSubLocationKeys().map(subKey => (
                  <TabsContent key={`${activeTopLevelLocation}-${subKey}`} value={subKey}>
                    <Card className="bg-slate-100/50">
                      <CardHeader className="p-3 sm:p-4">
                        <CardTitle className="text-lg sm:text-xl font-semibold text-slate-700">
                          {formatItemName(activeTopLevelLocation)} - {formatItemName(subKey) === subKey ? subKey.toUpperCase() : formatItemName(subKey)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-2 sm:p-4">
                        {inventory[activeTopLevelLocation] && (inventory[activeTopLevelLocation] as any)[subKey] && Object.keys((inventory[activeTopLevelLocation] as any)[subKey]).length > 0 ? (
                          Object.keys((inventory[activeTopLevelLocation] as any)[subKey]).map(itemKey =>
                            renderInventoryItem(activeTopLevelLocation, subKey, itemKey, (inventory[activeTopLevelLocation] as any)[subKey][itemKey])
                          )
                        ) : (
                          <p className="text-slate-500 text-center py-4">No items in this sublocation yet.</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </>
        </CardContent>
      </Card>

      {showAddItemModal && activeTopLevelLocation && (
        <AddItemModal
          activeTopLevelLocation={activeTopLevelLocation}
          allInventory={inventory}
          onClose={() => setShowAddItemModal(false)}
          onAddItem={handleAddItem}
        />
      )}
      {showEditItemModal && itemToEdit && (
        <EditItemModal
          topLevelLocationKey={itemToEdit.topLevelLocationKey}
          subLocationKey={itemToEdit.subLocationKey}
          itemKey={itemToEdit.itemKey}
          itemData={itemToEdit.itemData}
          allInventory={inventory}
          vendors={vendors}
          onClose={() => setShowEditItemModal(false)}
          onUpdateItem={handleUpdateItem}
          onAddVendor={addNewVendorToState}
        />
      )}
     {showEditOrderModal && activeTopLevelLocation && activeSubLocationTab && getCurrentSubLocationInventory() && (
        <EditOrderModal
          inventory={getCurrentSubLocationInventory()!}
          activeTopLevelLocation={activeTopLevelLocation}
          activeSubLocationKey={activeSubLocationTab}
          onClose={() => setShowEditOrderModal(false)}
          onSave={handleSaveOrderFromModal}
        />
      )}

      {showScrollToTop && (
        <Button
          onClick={scrollToTop}
          variant="default"
          size="icon"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 rounded-full h-10 w-10 sm:h-12 sm:w-12 shadow-lg z-40"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
      )}
    </div>
  );
};

export default WeeklyInventoryPage;

    
