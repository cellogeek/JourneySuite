
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, ListChecks, PackageMinus, FileText, FilePlus, PackagePlus, ListPlus } from 'lucide-react';

// TODO: Fetch data from Firestore for dashboard cards

const DashboardPage = ({ pageId }: { pageId: string }) => {
  const summaryCards = [
    { title: "Today's Events", value: "3", icon: <CalendarDays className="h-6 w-6 text-primary" />, dataAiHint: "calendar schedule" },
    { title: "Pending Tasks", value: "8", icon: <ListChecks className="h-6 w-6 text-primary" />, dataAiHint: "task checklist" },
    { title: "Items Needing Reorder", value: "5", icon: <PackageMinus className="h-6 w-6 text-primary" />, dataAiHint: "inventory boxes" },
    { title: "Open Invoices", value: "12", icon: <FileText className="h-6 w-6 text-primary" />, dataAiHint: "financial documents" },
  ];

  const quickActions = [
    { label: "New Invoice", icon: <FilePlus className="mr-2 h-4 w-4" />, action: () => console.log("New Invoice") },
    { label: "Add Inventory", icon: <PackagePlus className="mr-2 h-4 w-4" />, action: () => console.log("Add Inventory") },
    { label: "New Task", icon: <ListPlus className="mr-2 h-4 w-4" />, action: () => console.log("New Task") },
  ];

  return (
    <div className="space-y-6">
      <Card className="shadow-lg bg-card text-card-foreground rounded-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-primary-text">Welcome to Journey Suite!</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Your central hub for managing all aspects of your coffee business.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-primary-text">
            Navigate through your business modules using the sidebar. Each section is designed to streamline your workflow and provide critical insights.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.title} className="shadow-md hover:shadow-lg transition-shadow bg-card text-card-foreground rounded-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-primary-text">{card.title}</CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{card.value}</div>
              <p className="text-xs text-muted-foreground" data-ai-hint={card.dataAiHint}>
                Updates in real-time
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-lg bg-card text-card-foreground rounded-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline text-primary-text">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          {quickActions.map((action) => (
            <Button key={action.label} onClick={action.action} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg">
              {action.icon}
              {action.label}
            </Button>
          ))}
        </CardContent>
      </Card>
       {/* TODO: Add Firebase onAuthStateChanged listener here in a parent component to check auth status */}
    </div>
  );
};

export default DashboardPage;
