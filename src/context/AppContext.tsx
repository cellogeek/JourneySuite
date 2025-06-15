
"use client";

import type { LucideIcon } from 'lucide-react';
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import {
  LayoutDashboard, Banknote, UserPlus2, GraduationCap, Users, ListTodo,
  Boxes, Truck, LayoutGrid, Percent, Printer, BarChart3, HeartHandshake,
  CalendarDays, FileText, Settings, LifeBuoy, LogOut, Coffee, HomeIcon
} from 'lucide-react';
import { auth } from '@/lib/firebase'; // Import Firebase auth
import { type User, signInWithEmailAndPassword, type UserCredential } from 'firebase/auth'; // Import User type and signInWithEmailAndPassword

// Import page components
import DashboardPage from '@/components/pages/DashboardPage';
import InventoryPage from '@/components/pages/InventoryPage';
import EventManagementPage from '@/components/pages/EventManagementPage';
import InvoicingPage from '@/components/pages/InvoicingPage';
import SalesTaxRunnerPage from '@/components/pages/SalesTaxRunnerPage';
import CheckWriterPage from '@/components/pages/CheckWriterPage';
import PayrollRunnerPage from '@/components/pages/PayrollRunnerPage';
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
  currentUser: User | null;
  loadingAuth: boolean;
  devLogin: (email: string, pass: string) => Promise<UserCredential | void>; // For development login
}

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
      { id: 'payroll_runner', name: 'Payroll Runner', icon: Banknote, title: 'Payroll Runner', description: "Validate time entries and calculate tip pooling before exporting to Gusto.", component: PayrollRunnerPage },
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
      { id: 'sales_tax_runner', name: 'Sales Tax Runner', icon: Percent, title: 'Sales Tax Runner', description: "Calculate and prepare sales tax reports for remittance.", component: SalesTaxRunnerPage },
      { id: 'check_writer', name: 'Check Writer', icon: Printer, title: 'Check & Envelope Printer', description: "Generate and print checks for vendors and other payees.", component: CheckWriterPage },
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    console.log("AppProvider: Setting up onAuthStateChanged listener...");
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        console.log("AppProvider: User is signed in. UID:", user.uid);
      } else {
        console.log("AppProvider: User is signed out.");
      }
      setCurrentUser(user);
      setLoadingAuth(false);
    });
    return () => {
      console.log("AppProvider: Cleaning up onAuthStateChanged listener.");
      unsubscribe();
    }
  }, []);

  // Development-only login function
  const devLogin = async (email: string, pass: string): Promise<UserCredential | void> => {
    // IMPORTANT: This function is for development purposes only and should be removed for production.
    if (process.env.NODE_ENV === 'development') {
      try {
        console.log(`Attempting dev login for: ${email}`);
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        console.log("Dev login successful:", userCredential.user);
        return userCredential;
      } catch (error) {
        console.error("Dev login error:", error);
        // It's better to throw or return an error object rather than using alert in context.
        // For dev convenience, an alert might be okay, but typically avoid UI side-effects here.
        alert(`Dev Login Failed: ${(error as Error).message}`);
      }
    } else {
      console.warn("devLogin is only available in development mode.");
      alert("This function is for development purposes only and should not be called in production.");
    }
  };

  // Expose devLogin on window object in development mode
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      (window as any).devLogin = devLogin;
      console.log("devLogin function exposed on window object for development. Usage: await window.devLogin('email', 'password')");
      return () => {
        // Clean up the global function when the component unmounts or in production
        delete (window as any).devLogin;
      };
    }
  }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount.


  const getActivePage = (): NavItemStructure | undefined => {
    for (const group of navGroupsData) {
      const item = group.items.find(navItem => navItem.id === activePageId);
      if (item) return item;
    }
    const firstGroup = navGroupsData[0];
    if (firstGroup && firstGroup.items.length > 0) {
        const fallbackId = firstGroup.items[0].id;
        if (activePageId !== fallbackId) {
            // setActivePageId(fallbackId); // Potentially problematic if called during render.
        }
        return firstGroup.items[0];
    }
    return undefined;
  };


  return (
    <AppContext.Provider value={{ activePageId, setActivePageId, navGroups: navGroupsData, getActivePage, currentUser, loadingAuth, devLogin }}>
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

    