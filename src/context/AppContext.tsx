
"use client";

import type { LucideIcon } from 'lucide-react';
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import {
  LayoutDashboard, Banknote, UserPlus2, GraduationCap, Users, ListTodo,
  Boxes, Truck, LayoutGrid, Percent, Printer, BarChart3, HeartHandshake,
  CalendarDays, FileText, Settings, LifeBuoy, LogOut, Coffee, HomeIcon, ClipboardList, Mail,
  ShoppingCart, ClipboardCheck, ListPlus, ListChecks
} from 'lucide-react';
// Firebase auth is not used for login/logout in this bypassed state, but db might be.
// import { auth } from '@/lib/firebase'; 
// import { type User, signInWithEmailAndPassword, type UserCredential, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import type { User } from 'firebase/auth'; // Keep User type for mock

// Import page components
import DashboardPage from '@/components/pages/DashboardPage';
import InventoryPage from '@/components/pages/InventoryPage';
import EventManagementPage from '@/components/pages/EventManagementPage';
import InvoicingPage from '@/components/pages/InvoicingPage';
import SalesTaxRunnerPage from '@/components/pages/SalesTaxRunnerPage';
import CheckWriterPage from '@/components/pages/CheckWriterPage';
import PayrollRunnerPage from '@/components/pages/PayrollRunnerPage';
import SpecialOrdersPage from '@/components/pages/SpecialOrdersPage';
import EnvelopePrinterPage from '@/components/pages/EnvelopePrinterPage';
import PurchaseOrdersPage from '@/components/pages/PurchaseOrdersPage';
import CreatePurchaseOrderPage from '@/components/pages/CreatePurchaseOrderPage';
import WeeklyInventoryPage from '@/components/pages/WeeklyInventoryPage';
import SportLifePoCreatorPage from '@/components/pages/SportLifePoCreatorPage';
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

// --- Purchase Order Interfaces (centralized here) ---
export interface PurchaseOrderItem {
  id: string; // This will be the inventory item's ID
  name: string;
  sku?: string;
  quantity: number;
  unit: string;
  isOrdered: boolean;
  // Potentially add wholesaleCost if needed for calculations on PO page later
}

export interface PurchaseOrder {
  id: string; // PO's own unique ID
  vendorName: string;
  orderDate: string;
  status: 'Draft' | 'Pending Ordering' | 'Partially Ordered' | 'Order Placed' | 'Cycle Complete';
  items: PurchaseOrderItem[];
}
// --- End Purchase Order Interfaces ---

interface AppContextType {
  activePageId: string;
  setActivePageId: (id: string) => void;
  navGroups: NavGroup[];
  getActivePage: () => NavItemStructure | undefined;
  currentUser: User | null; // Will be a mock user
  loadingAuth: boolean; // Will be false
  // devLogin: (email: string, pass: string) => Promise<UserCredential | void>; // Removed
  // signInWithGoogle: () => Promise<void>; // Removed
  activePurchaseOrder: PurchaseOrder | null;
  setActivePurchaseOrder: (po: PurchaseOrder | null) => void;
}

// TODO: Re-implement Firebase authentication. Currently bypassed with a mock user.
const MOCK_USER: User = {
  uid: 'mock-user-uid-001',
  email: 'dev@example.com',
  displayName: 'Dev User',
  photoURL: null,
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  providerId: 'mock',
  refreshToken: '',
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => '',
  getIdTokenResult: async () => ({} as any),
  reload: async () => {},
  toJSON: () => ({}),
};


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
      { id: 'inventory', name: 'Inventory Master', icon: Boxes, title: 'Inventory Master Data', component: InventoryPage },
      { id: 'weekly_inventory', name: 'Weekly Inventory', icon: ListChecks, title: 'Weekly Inventory Count', description: "Perform and record weekly inventory counts.", component: WeeklyInventoryPage },
      { id: 'create_purchase_order', name: 'Create PO', icon: ListPlus, title: 'Create Purchase Order', description: "Build a new purchase order for a vendor.", component: CreatePurchaseOrderPage },
      { id: 'purchase_orders', name: 'Manage POs', icon: ClipboardCheck, title: 'Purchase Orders', description: "Create, manage, and track vendor purchase orders.", component: PurchaseOrdersPage },
      { id: 'sportlife_po_creator', name: 'SportLife POs', icon: ShoppingCart, title: 'SportLife PO Creator', description: "Create and manage batched POs for SportLife Nutrition.", component: SportLifePoCreatorPage },
      { id: 'vendors', name: 'Vendors', icon: Truck, title: 'Vendor Management', description: "Manage vendor contracts, orders, and relationships.", component: GenericPlaceholderPage },
      { id: 'special_orders', name: 'Special Orders', icon: ClipboardList, title: 'Special Orders Management', description: "Manage unique, recurring, and custom orders.", component: SpecialOrdersPage },
    ],
  },
  {
    groupLabel: 'Financial & Clerical',
    items: [
      { id: 'financial_dashboard', name: 'Financial Dashboard', icon: LayoutGrid, title: 'Financial Overview', description: "View key financial metrics, sales reports, and expense tracking.", component: GenericPlaceholderPage },
      { id: 'sales_tax_runner', name: 'Sales Tax Runner', icon: Percent, title: 'Sales Tax Runner', description: "Calculate and prepare sales tax reports for remittance.", component: SalesTaxRunnerPage },
      { id: 'check_writer', name: 'Check Printer', icon: Printer, title: 'Check Printer', description: "Generate and print checks for vendors and other payees.", component: CheckWriterPage },
      { id: 'envelope_printer', name: 'Envelope Printer', icon: Mail, title: 'Envelope Printer', description: "Design and print #10 envelopes or simple name-only envelopes.", component: EnvelopePrinterPage },
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
  const [currentUser, setCurrentUser] = useState<User | null>(MOCK_USER); // Set mock user by default
  const [loadingAuth, setLoadingAuth] = useState(false); // Set to false by default
  const [activePurchaseOrder, setActivePurchaseOrder] = useState<PurchaseOrder | null>(null);

  // Firebase auth listener logic is removed for bypass.
  // Original useEffect for auth is commented out or removed.
  /*
  useEffect(() => {
    const initializeAuth = async () => {
      // ... original auth logic ...
    };
    const unsubscribePromise = initializeAuth();
    return () => {
      unsubscribePromise.then(unsubscribe => {
        if (unsubscribe) {
          console.log("AppProvider: Cleaning up onAuthStateChanged listener.");
          unsubscribe();
        }
      });
    };
  }, []);
  */

  // devLogin and signInWithGoogle are removed as auth is bypassed.
  /*
  const devLogin = async (email: string, pass: string): Promise<UserCredential | void> => { ... };
  const signInWithGoogle = async (): Promise<void> => { ... };
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      (window as any).devLogin = devLogin;
      // ...
    }
  }, [devLogin]);
  */

  const getActivePage = (): NavItemStructure | undefined => {
    for (const group of navGroupsData) {
      const item = group.items.find(navItem => navItem.id === activePageId);
      if (item) return item;
    }
    const firstGroup = navGroupsData[0];
    if (firstGroup && firstGroup.items.length > 0) {
        return firstGroup.items[0];
    }
    return undefined;
  };


  return (
    <AppContext.Provider value={{
      activePageId, setActivePageId,
      navGroups: navGroupsData, getActivePage,
      currentUser, loadingAuth,
      activePurchaseOrder, setActivePurchaseOrder
    }}>
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
