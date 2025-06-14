
"use client";

import React, { useState, useMemo } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  ReceiptText,
  UserPlus2,
  Presentation,
  BriefcaseBusiness,
  ListTodo,
  PackageSearch,
  Building,
  TrendingUp,
  Landmark,
  AreaChart,
  Users2,
  CalendarDays,
  FileText,
  Printer,
  Settings,
  LifeBuoy,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import MainContent from './MainContent';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface NavItem {
  id: string;
  name: string;
  icon: React.ElementType;
  title: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, title: 'Dashboard' },
  { id: 'payroll', name: 'Payroll Runner', icon: ReceiptText, title: 'Payroll Runner' },
  { id: 'onboarding', name: 'Onboarding', icon: UserPlus2, title: 'Onboarding Management' },
  { id: 'training', name: 'Training', icon: Presentation, title: 'Training Modules' },
  { id: 'employees', name: 'Employee Management', icon: BriefcaseBusiness, title: 'Employee Management' },
  { id: 'tasks', name: 'Task List', icon: ListTodo, title: 'Task List' },
  { id: 'inventory', name: 'Inventory', icon: PackageSearch, title: 'Inventory Management' },
  { id: 'vendors', name: 'Vendors', icon: Building, title: 'Vendor Management' },
  { id: 'financials', name: 'Financials', icon: TrendingUp, title: 'Financial Overview' },
  { id: 'salestax', name: 'Sales Tax', icon: Landmark, title: 'Sales Tax Management' },
  { id: 'analytics', name: 'Data Analytics', icon: AreaChart, title: 'Data Analytics' },
  { id: 'crm', name: 'CRM', icon: Users2, title: 'CRM Dashboard' },
  { id: 'events', name: 'Event Management', icon: CalendarDays, title: 'Event Management' },
  { id: 'invoicing', name: 'Invoicing', icon: FileText, title: 'Invoicing System' },
  { id: 'printer', name: 'Check & Envelope Printer', icon: Printer, title: 'Printing Services' },
];

export default function AppLayout() {
  const [activePageId, setActivePageId] = useState<string>('dashboard');

  const activePage = useMemo(() => {
    return navItems.find(item => item.id === activePageId) || navItems[0];
  }, [activePageId]);

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon" variant="sidebar" className="border-r">
        <SidebarHeader className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-primary">
              <path d="M12.378 1.602a.75.75 0 00-.756 0L3.366 6.002a.75.75 0 00-.366.648V16.5a.75.75 0 00.366.648l8.256 4.4a.75.75 0 00.756 0l8.256-4.4a.75.75 0 00.366-.648V6.65a.75.75 0 00-.366-.648L12.378 1.602zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" />
              <path d="M12 3.117L4.122 7.5l7.878 4.206 7.878-4.206L12 3.117zM19.5 7.878L12 12.084V19.5l6.75-3.622a.75.75 0 00.378-.648V7.878zM4.5 7.878v7.35a.75.75 0 00.378.648L12 19.5V12.084L4.5 7.878z" />
            </svg>
            <h1 className="text-xl font-semibold text-primary font-headline group-data-[collapsible=icon]:hidden">Journey Board</h1>
          </div>
          <SidebarTrigger className="group-data-[collapsible=icon]:hidden" />
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  onClick={() => setActivePageId(item.id)}
                  isActive={activePageId === item.id}
                  tooltip={{ children: item.name, side: 'right', className: "font-body" }}
                  className="font-body"
                >
                  <item.icon aria-hidden="true" />
                  <span>{item.name}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <div className="p-4 mt-auto border-t border-sidebar-border group-data-[collapsible=icon]:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://placehold.co/40x40.png" alt="User Avatar" data-ai-hint="user avatar" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-sidebar-foreground">Jane Doe</span>
                  <span className="text-xs text-muted-foreground">Admin</span>
                </div>
                <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56 font-body">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem><Settings className="mr-2 h-4 w-4" /><span>Settings</span></DropdownMenuItem>
              <DropdownMenuItem><LifeBuoy className="mr-2 h-4 w-4" /><span>Support</span></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem><LogOut className="mr-2 h-4 w-4" /><span>Log out</span></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="p-4 border-b bg-card flex items-center gap-2">
          <SidebarTrigger className="md:hidden" /> {/* Show trigger on mobile when sidebar is offcanvas */}
          <h2 className="text-2xl font-semibold text-foreground font-headline title-fade-in" key={activePage.title}>
            {activePage.title}
          </h2>
        </header>
        <MainContent activePage={activePage} />
      </SidebarInset>
    </SidebarProvider>
  );
}
