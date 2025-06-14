
"use client";

import type { LucideIcon } from 'lucide-react';
import React, { createContext, useState, useContext, ReactNode } from 'react'; // Removed useMemo as it's not used here
import {
  LayoutDashboard, Banknote, UserPlus2, GraduationCap, Users, ListTodo,
  Boxes, Truck, LayoutGrid, Percent, Printer, BarChart3, HeartHandshake,
  CalendarDays, FileText, Settings, LifeBuoy, LogOut, Coffee, HomeIcon // Added HomeIcon
} from 'lucide-react';

// Import page components
import DashboardPage from '@/components/pages/DashboardPage';
import InventoryPage from '@/components/pages/InventoryPage';
import EventManagementPage from '@/components/pages/EventManagementPage';
import InvoicingPage from '@/components/pages/InvoicingPage';
import GenericPlaceholderPage from '@/components/pages/GenericPlaceholderPage';


export interface NavItemStructure {
  id: string;
  name: string;
  icon: LucideIcon;
  title: string;
  description?: string;
  component: React.ComponentType<{ pageId: string }>;
}

export interface NavGroup {
  groupLabel: string;
  items: NavItemStructure[];
}

interface AppContextType {
  activePageId: string;
  setActivePageId: (id: string) => void;
  navGroups: NavGroup[];
  getActivePage: () => NavItemStructure | undefined;
}

// Updated icon usage as per new guidelines (will be styled in SidebarMenuButton)
const navGroupsData: NavGroup[] = [
  {
    groupLabel: 'Core',
    items: [
      { id: 'dashboard', name: 'Dashboard', icon: HomeIcon, title: 'Dashboard', component: DashboardPage },
    ],
  },
  {
    groupLabel: 'HR & Staff',
    items: [
      { id: 'payroll', name: 'Payroll Runner', icon: Banknote, title: 'Payroll Runner', description: "Validate time entries and calculate tip pooling before exporting to Gusto.", component: GenericPlaceholderPage },
      { id: 'onboarding', name: 'Onboarding', icon: UserPlus2, title: 'Onboarding Management', description: "Streamline new hire paperwork, training assignments, and initial setup.", component: GenericPlaceholderPage },
      { id: 'training', name: 'Training', icon: GraduationCap, title: 'Training Modules', description: "Manage and track employee training programs and certifications.", component: GenericPlaceholderPage },
      { id: 'employees', name: 'Employee Management', icon: Users, title: 'Employee Management', description: "Central hub for employee records, performance reviews, and HR information.", component: GenericPlaceholderPage },
      { id: 'tasks', name: 'Task List', icon: ListTodo, title: 'Task List', description: "Assign, track, and manage tasks across different teams and projects.", component: GenericPlaceholderPage },
    ],
  },
  {
    groupLabel: 'Operations & Inventory',
    items: [
      { id: 'inventory', name: 'Inventory', icon: Boxes, title: 'Inventory Management', component: InventoryPage },
      { id: 'vendors', name: 'Vendors', icon: Truck, title: 'Vendor Management', description: "Manage vendor contracts, orders, and relationships.", component: GenericPlaceholderPage },
    ],
  },
  {
    groupLabel: 'Financial & Clerical',
    items: [
      { id: 'financial_dashboard', name: 'Financial Dashboard', icon: LayoutGrid, title: 'Financial Overview', description: "View key financial metrics, sales reports, and expense tracking.", component: GenericPlaceholderPage },
      { id: 'sales_tax', name: 'Sales Tax Runner', icon: Percent, title: 'Sales Tax Management', description: "Calculate and prepare sales tax reports for remittance.", component: GenericPlaceholderPage },
      { id: 'printer', name: 'Check & Envelope Printer', icon: Printer, title: 'Printing Services', description: "Print checks, envelopes, and other necessary documents.", component: GenericPlaceholderPage },
      { id: 'analytics', name: 'Data Analytics', icon: BarChart3, title: 'Data Analytics', description: "Analyze sales trends, customer behavior, and operational efficiency.", component: GenericPlaceholderPage },
    ],
  },
  {
    groupLabel: 'Sales & Customers',
    items: [
      { id: 'crm', name: 'CRM', icon: HeartHandshake, title: 'CRM Dashboard', description: "Manage customer relationships, track interactions, and oversee sales pipelines.", component: GenericPlaceholderPage },
      { id: 'events', name: 'Event Management', icon: CalendarDays, title: 'Event Management', component: EventManagementPage },
      { id: 'invoicing', name: 'Invoicing', icon: FileText, title: 'Invoicing System', component: InvoicingPage },
    ],
  },
];


const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [activePageId, setActivePageId] = useState<string>('dashboard');

  const getActivePage = (): NavItemStructure | undefined => {
    for (const group of navGroupsData) {
      const item = group.items.find(navItem => navItem.id === activePageId);
      if (item) return item;
    }
    return navGroupsData[0].items[0]; // Default to dashboard
  };

  // TODO: Add Firebase onAuthStateChanged listener here

  return (
    <AppContext.Provider value={{ activePageId, setActivePageId, navGroups: navGroupsData, getActivePage }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
