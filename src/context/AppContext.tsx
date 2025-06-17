
"use client";

import type { LucideIcon } from 'lucide-react';
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import {
  LayoutDashboard, Banknote, UserPlus2, GraduationCap, Users, ListTodo,
  Boxes, Truck, LayoutGrid, Percent, Printer, BarChart3, HeartHandshake,
  CalendarDays, FileText, Settings, LifeBuoy, LogOut, Coffee, HomeIcon, ClipboardList, Mail
} from 'lucide-react';
import { auth } from '@/lib/firebase'; // Import Firebase auth
import { type User, signInWithEmailAndPassword, type UserCredential, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth'; // Import User type and auth functions

// Import page components
import DashboardPage from '@/components/pages/DashboardPage';
import InventoryPage from '@/components/pages/InventoryPage';
import EventManagementPage from '@/components/pages/EventManagementPage';
import InvoicingPage from '@/components/pages/InvoicingPage';
import SalesTaxRunnerPage from '@/components/pages/SalesTaxRunnerPage';
import CheckWriterPage from '@/components/pages/CheckWriterPage';
import PayrollRunnerPage from '@/components/pages/PayrollRunnerPage';
import SpecialOrdersPage from '@/components/pages/SpecialOrdersPage';
import EnvelopePrinterPage from '@/components/pages/EnvelopePrinterPage'; // Import new page
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
  devLogin: (email: string, pass: string) => Promise<UserCredential | void>; 
  signInWithGoogle: () => Promise<void>;
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      console.log("AppProvider: Initializing auth. Checking for redirect result...");
      try {
        // Check for redirect result first
        const result = await getRedirectResult(auth);
        if (result) {
          // This means the user has just signed in via redirect.
          // onAuthStateChanged will shortly fire with the user.
          console.log("AppProvider: Google Sign-In redirect result processed for user:", result.user?.uid);
          // No need to setCurrentUser or setLoadingAuth here, onAuthStateChanged will handle it.
        } else {
          console.log("AppProvider: No redirect result found. User might be already signed in or not signed in at all.");
        }
      } catch (error) {
        console.error("AppProvider: Error processing Google Sign-In redirect result:", error);
        // Potentially set an error state or alert the user
      }
      // Regardless of redirect, set up the onAuthStateChanged listener.
      // This listener is the source of truth for the user's auth state.
      console.log("AppProvider: Setting up onAuthStateChanged listener.");
      const unsubscribe = auth.onAuthStateChanged(user => {
        if (user) {
          console.log("AppProvider: User is signed in (onAuthStateChanged). UID:", user.uid);
        } else {
          console.log("AppProvider: User is signed out (onAuthStateChanged).");
        }
        setCurrentUser(user);
        setLoadingAuth(false); // Auth state is definitively determined here.
      });
      return unsubscribe; // Return the unsubscribe function for cleanup
    };

    const unsubscribePromise = initializeAuth();

    // Cleanup function for the useEffect hook
    return () => {
      unsubscribePromise.then(unsubscribe => {
        if (unsubscribe) {
          console.log("AppProvider: Cleaning up onAuthStateChanged listener.");
          unsubscribe();
        }
      });
    };
  }, []);


  const devLogin = async (email: string, pass: string): Promise<UserCredential | void> => {
    if (process.env.NODE_ENV === 'development') {
      try {
        console.log(`Attempting dev login for: ${email}`);
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        console.log("Dev login successful:", userCredential.user);
        // onAuthStateChanged will handle setCurrentUser and setLoadingAuth
        return userCredential;
      } catch (error) {
        console.error("Dev login error:", error);
        alert(`Dev Login Failed: ${(error as Error).message}`);
      }
    } else {
      console.warn("devLogin is only available in development mode.");
      alert("This function is for development purposes only.");
    }
  };
  
  const signInWithGoogle = async (): Promise<void> => {
    const provider = new GoogleAuthProvider();
    try {
      console.log("Attempting Google Sign-In with redirect...");
      await signInWithRedirect(auth, provider);
      // After this, the page will redirect to Google.
      // The result will be handled by getRedirectResult in the useEffect above when the user returns.
    } catch (error) {
      console.error("Google Sign-In with redirect error:", error);
      alert(`Google Sign-In Failed: ${(error as Error).message}`);
    }
  };

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      (window as any).devLogin = devLogin;
      console.log("devLogin function exposed on window object for development. Usage: await window.devLogin('email', 'password')");
      return () => {
        delete (window as any).devLogin;
      };
    }
  }, [devLogin]); // Added devLogin to dependency array


  const getActivePage = (): NavItemStructure | undefined => {
    for (const group of navGroupsData) {
      const item = group.items.find(navItem => navItem.id === activePageId);
      if (item) return item;
    }
    // Fallback to the first item of the first group if activePageId is somehow invalid
    const firstGroup = navGroupsData[0];
    if (firstGroup && firstGroup.items.length > 0) {
        // console.warn(`Active page ID "${activePageId}" not found. Falling back to "${firstGroup.items[0].id}".`);
        // setActivePageId(firstGroup.items[0].id); // Optionally auto-correct, or just return it
        const fallbackId = firstGroup.items[0].id;
        // If you decide to auto-correct, ensure this doesn't cause infinite loops
        // For now, just return it as a potential active page without changing state here
        return firstGroup.items[0];
    }
    return undefined;
  };


  return (
    <AppContext.Provider value={{ activePageId, setActivePageId, navGroups: navGroupsData, getActivePage, currentUser, loadingAuth, devLogin, signInWithGoogle }}>
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

    

    