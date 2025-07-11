
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
    <div className="space-y-8">
      <Card> {/* Glassmorphism applied by Card component */}
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4">
          <CardTitle className="text-2xl font-bold text-slate-900">Event Management</CardTitle>
          <Button onClick={() => setIsModalOpen(true)} variant="default" size="action">
            <PlusCircle size={18} className="mr-2" /> Create New Event
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 p-2 border border-brand-slate-200/80 rounded-xl bg-slate-50/50">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
              <div key={dayName} className="text-center font-semibold text-xs text-slate-500 py-2">{dayName}</div>
            ))}
            {daysInMonth.map(day => {
              const eventOnDay = sampleEvents.find(e => e.day === day);
              return (
                <div key={day} className="h-36 border border-brand-slate-200/60 rounded-lg p-2 text-slate-700 bg-white/50 hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                  <div className="font-semibold text-sm text-slate-800">{day}</div>
                  {eventOnDay && (
                    <div className="mt-1 p-1.5 text-xs bg-sky-500/10 border border-sky-500/20 rounded-md flex-grow flex flex-col justify-center">
                      <p className="font-medium text-sky-700 truncate">{eventOnDay.title}</p>
                      <p className="text-sky-600/80 truncate text-[0.7rem]">{eventOnDay.client}</p>
                      <p className="text-sky-600/80 truncate text-[0.7rem]">{eventOnDay.time}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        {/* DialogContent already has glassmorphism */}
        <DialogContent className="sm:max-w-md"> 
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription className="text-slate-500"> 
              Fill in the details for the new event. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* TODO: Convert to react-hook-form for proper form handling */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clientName" className="text-right">Client Name</Label>
              <Input id="clientName" placeholder="e.g., Acme Corp" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="eventDate" className="text-right">Event Date</Label>
              <Input id="eventDate" type="date" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="guestCount" className="text-right">Guest Count</Label>
              <Input id="guestCount" type="number" placeholder="e.g., 50" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent> {/* SelectContent already has glassmorphism */}
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="rounded-lg">Cancel</Button>
            </DialogClose>
            <Button 
              type="submit" 
              variant="default"
              size="default" /* Use default button sizing here, not full action size */
              className="rounded-lg"
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
