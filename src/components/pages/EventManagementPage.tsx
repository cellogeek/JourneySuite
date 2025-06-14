
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Calendar, Users, Coffee } from 'lucide-react';

// TODO: Fetch data from Firestore collection 'events'
const sampleEvents = [
  { id: 'evt1', day: 3, title: 'Coffee Tasting Workshop', client: 'Public Event', time: '2 PM - 4 PM', dataAiHint: "coffee beans tasting" },
  { id: 'evt2', day: 10, title: 'Private Party - Sarah B.', client: 'Sarah Birchwood', time: '6 PM - 9 PM', dataAiHint: "birthday party celebration" },
  { id: 'evt3', day: 15, title: 'Barista Training Level 2', client: 'Staff Training', time: '10 AM - 1 PM', dataAiHint: "barista training class" },
  { id: 'evt4', day: 22, title: 'Local Art Exhibit Opening', client: 'Community Arts', time: '5 PM - 8 PM', dataAiHint: "art gallery exhibit" },
];

const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1); // Simple 30-day month

const EventManagementPage = ({ pageId }: { pageId: string }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // TODO: Form state for new event

  return (
    <div className="space-y-6">
      <Card className="shadow-lg bg-card text-card-foreground rounded-lg">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-2xl font-headline text-primary-text">Event Management</CardTitle>
          <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Event
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 p-1 border border-border rounded-lg bg-background">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
              <div key={dayName} className="text-center font-medium text-sm text-muted-foreground py-2">{dayName}</div>
            ))}
            {daysInMonth.map(day => {
              const eventOnDay = sampleEvents.find(e => e.day === day);
              return (
                <div key={day} className="h-32 border border-border rounded-md p-2 text-primary-text bg-card hover:shadow-md transition-shadow overflow-hidden">
                  <div className="font-semibold text-sm">{day}</div>
                  {eventOnDay && (
                    <Card className="mt-1 p-1.5 text-xs bg-primary/10 border-primary/30 rounded-md">
                      <p className="font-medium text-primary truncate">{eventOnDay.title}</p>
                      <p className="text-primary/80 truncate">{eventOnDay.client}</p>
                      <p className="text-primary/80 truncate">{eventOnDay.time}</p>
                    </Card>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground border-border rounded-lg shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-primary-text font-headline">Create New Event</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Fill in the details for the new event. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* TODO: Convert to react-hook-form for proper form handling */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clientName" className="text-right text-primary-text">Client Name</Label>
              <Input id="clientName" placeholder="e.g., Acme Corp" className="col-span-3 bg-background border-border rounded-lg" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="eventDate" className="text-right text-primary-text">Event Date</Label>
              <Input id="eventDate" type="date" className="col-span-3 bg-background border-border rounded-lg" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="guestCount" className="text-right text-primary-text">Guest Count</Label>
              <Input id="guestCount" type="number" placeholder="e.g., 50" className="col-span-3 bg-background border-border rounded-lg" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right text-primary-text">Status</Label>
              <Select>
                <SelectTrigger className="col-span-3 bg-background border-border rounded-lg">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground border-border rounded-lg">
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="border-border text-primary-text hover:bg-muted/50 rounded-lg">Cancel</Button>
            </DialogClose>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
              onClick={() => { /* TODO: Call Firebase function to create new event */ setIsModalOpen(false); console.log("Save Event"); }}
            >
              Save Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventManagementPage;
