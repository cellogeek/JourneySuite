
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, ListChecks, PackageMinus, FileText, FilePlus, PackagePlus, ListPlus } from 'lucide-react';

// TODO: Fetch data from Firestore for dashboard cards

// Summary Card component for consistent styling
const SummaryCard = ({ title, value, icon, dataAiHint }: { title: string; value: string; icon: React.ReactNode; dataAiHint?: string }) => (
  <Card className="bg-white/60 backdrop-blur-xl p-4 rounded-xl border shadow-lg hover:shadow-sky-500/20 transition-shadow duration-300">
    <CardHeader className="flex flex-row items-center justify-between pb-2 p-2">
      <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent className="p-2">
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      {dataAiHint && <p className="text-xs text-slate-400 mt-1" data-ai-hint={dataAiHint}>Updates in real-time</p>}
    </CardContent>
  </Card>
);


const DashboardPage = ({ pageId }: { pageId: string }) => {
  const summaryCards = [
    { title: "Today's Events", value: "3", icon: <CalendarDays className="h-5 w-5 text-sky-500" />, dataAiHint: "calendar schedule" },
    { title: "Pending Tasks", value: "8", icon: <ListChecks className="h-5 w-5 text-sky-500" />, dataAiHint: "task checklist" },
    { title: "Items Needing Reorder", value: "5", icon: <PackageMinus className="h-5 w-5 text-orange-500" />, dataAiHint: "inventory boxes" },
    { title: "Open Invoices", value: "12", icon: <FileText className="h-5 w-5 text-sky-500" />, dataAiHint: "financial documents" },
  ];

  const quickActions = [
    { label: "New Invoice", icon: <FilePlus size={18} className="mr-2" />, action: () => console.log("New Invoice"), variant: "default" as "default" | "secondary" },
    { label: "Add Inventory", icon: <PackagePlus size={18} className="mr-2" />, action: () => console.log("Add Inventory"), variant: "default" as "default" | "secondary" },
    { label: "New Task", icon: <ListPlus size={18} className="mr-2" />, action: () => console.log("New Task"), variant: "secondary" as "default" | "secondary" },
  ];

  return (
    <div className="space-y-8">
      <div className="content-fade-in-up" style={{ animationDelay: '150ms' }}>
        <Card> {/* Glassmorphism applied by Card component */}
          <CardHeader>
            <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Welcome to Journey Suite!</CardTitle>
            <CardDescription className="text-lg text-slate-500 pt-1">
              Your central hub for managing all aspects of your coffee business.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">
              Navigate through your business modules using the sidebar. Each section is designed to streamline your workflow and provide critical insights.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 content-fade-in-up" style={{ animationDelay: '300ms' }}>
        {summaryCards.map((card, index) => (
          <SummaryCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            dataAiHint={card.dataAiHint}
          />
        ))}
      </div>

      <div className="content-fade-in-up" style={{ animationDelay: '450ms' }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            {quickActions.map((action) => (
              <Button key={action.label} onClick={action.action} variant={action.variant} size="action">
                {action.icon}
                {action.label}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
       {/* TODO: Add Firebase onAuthStateChanged listener here in a parent component to check auth status */}
    </div>
  );
};

export default DashboardPage;
