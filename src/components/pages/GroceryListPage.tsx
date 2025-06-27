"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Trash2, Beaker, RotateCcw, ClipboardList } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface SandboxItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

const initialSandboxItems: SandboxItem[] = [
  { id: 'sb-1', name: 'Coffee Filters', quantity: 2, unit: 'packs' },
  { id: 'sb-2', name: 'Paper Towels', quantity: 6, unit: 'rolls' },
  { id: 'sb-3', name: 'Trash Bags', quantity: 1, unit: 'box' },
];

const GroceryListPage = ({ pageId }: { pageId: string }) => {
  const { toast } = useToast();
  const [items, setItems] = useState<SandboxItem[]>(initialSandboxItems);
  const [newItem, setNewItem] = useState({ name: '', quantity: '0', unit: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
  };

  const handleQuantityChange = (id: string, newQuantity: number) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity: Math.max(0, newQuantity) } : item
      )
    );
  };

  const handleAddItem = () => {
    if (!newItem.name.trim() || !newItem.unit.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a name and unit for the new item.",
        variant: "destructive",
      });
      return;
    }
    const newSandboxItem: SandboxItem = {
      id: `sb-${Date.now()}`,
      name: newItem.name.trim(),
      quantity: parseInt(newItem.quantity, 10) || 0,
      unit: newItem.unit.trim(),
    };
    setItems(prev => [...prev, newSandboxItem]);
    setNewItem({ name: '', quantity: '0', unit: '' });
    toast({
      title: "Item Added",
      description: `"${newSandboxItem.name}" has been added to the grocery list.`,
    });
  };

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleResetList = () => {
    setItems(initialSandboxItems);
    toast({
      title: "List Reset",
      description: "The grocery list has been reset to its initial state.",
    });
  };

  return (
    <div className="space-y-8">
      <Card className="content-fade-in-up">
        <CardHeader>
          <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 flex items-center">
            <ClipboardList size={32} className="mr-3 text-purple-600" /> Grocery List
          </CardTitle>
          <CardDescription className="text-lg text-slate-500 pt-1">
            A temporary list for groceries and other items.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={handleResetList} variant="outline" size="sm">
                <RotateCcw className="mr-2 h-4 w-4" /> Reset List
            </Button>
        </CardContent>
      </Card>

      <Card className="content-fade-in-up" style={{ animationDelay: '150ms' }}>
        <CardHeader>
          <CardTitle>Add New Item</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2">
              <Label htmlFor="newItemName">Item Name</Label>
              <Input id="newItemName" name="name" value={newItem.name} onChange={handleInputChange} placeholder="e.g., Cold Brew Concentrate" />
            </div>
            <div>
              <Label htmlFor="newItemQuantity">Quantity</Label>
              <Input id="newItemQuantity" name="quantity" type="number" value={newItem.quantity} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="newItemUnit">Unit</Label>
              <Input id="newItemUnit" name="unit" value={newItem.unit} onChange={handleInputChange} placeholder="e.g., gallons" />
            </div>
          </div>
          <Button onClick={handleAddItem} className="mt-4">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Item
          </Button>
        </CardContent>
      </Card>

      <Card className="content-fade-in-up" style={{ animationDelay: '300ms' }}>
        <CardHeader>
          <CardTitle>Current Grocery List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-brand-slate-200/80">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead className="w-[150px]">Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length > 0 ? items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value, 10) || 0)}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:bg-red-100">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center h-24 text-slate-500">
                            The list is empty. Add an item to get started.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GroceryListPage;
