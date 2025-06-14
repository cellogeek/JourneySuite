
"use client";

import React, { useMemo } from 'react';
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger as AccordionPrimitiveTrigger } from '@/components/ui/accordion';
import {
  Settings,
  LifeBuoy,
  LogOut,
  ChevronDown,
  UserCircle,
  Coffee
} from 'lucide-react';
import MainContent from './MainContent';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAppContext, NavGroup, NavItemStructure } from '@/context/AppContext';
// Removed SheetTitle import as it's no longer used here

// Custom AccordionTrigger to avoid conflict with Sidebar's AccordionTrigger if any, and to better style
const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitiveTrigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitiveTrigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitiveTrigger
    ref={ref}
    className={className}
    {...props}
  >
    {children}
  </AccordionPrimitiveTrigger>
));
AccordionTrigger.displayName = "AccordionTrigger";


export default function AppLayout() {
  const { navGroups, activePageId, setActivePageId, getActivePage } = useAppContext();
  const activePageDetails = getActivePage();

  const defaultOpenAccordions = useMemo(() => {
    const activeGroup = navGroups.find(group => group.items.some(item => item.id === activePageId));
    return activeGroup ? [activeGroup.groupLabel] : [];
  }, [navGroups, activePageId]);

  // TODO: Fetch user data from Firebase to display name/avatar
  const userName = "Coffee Shop Admin";
  const userAvatarUrl = "https://placehold.co/40x40.png";


  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon" variant="sidebar" className="border-r bg-sidebar text-sidebar-foreground">
        {/* The SheetTitle for mobile sidebar accessibility is handled within Sidebar component itself */}
        <SidebarHeader className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2 ">
            <Coffee className="w-7 h-7 text-primary" />
            <h1 className="text-xl font-semibold text-primary font-headline group-data-[collapsible=icon]:hidden">
              Journey Suite
            </h1>
          </div>
          <SidebarTrigger className="group-data-[collapsible=icon]:hidden text-sidebar-foreground hover:text-sidebar-accent-foreground" />
        </SidebarHeader>
        <SidebarContent className="p-0">
          <Accordion type="multiple" defaultValue={defaultOpenAccordions} className="w-full">
            {navGroups.map((group: NavGroup) => (
              <AccordionItem value={group.groupLabel} key={group.groupLabel} className="border-b-0">
                <AccordionTrigger className="py-3 px-4 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm font-medium w-full flex justify-between group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-2 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <span className="group-data-[collapsible=icon]:hidden">{group.groupLabel}</span>
                  {/* Optional: Add an icon for group label if needed when collapsed */}
                   <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[collapsible=icon]:hidden group-data-[state=open]:rotate-180" />
                </AccordionTrigger>
                <AccordionContent className="pb-0 group-data-[collapsible=icon]:px-0">
                  <SidebarMenu className="px-2 py-1 group-data-[collapsible=icon]:px-0">
                    {group.items.map((item: NavItemStructure) => (
                      <SidebarMenuItem key={item.id} className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                        <SidebarMenuButton
                          onClick={() => setActivePageId(item.id)}
                          isActive={activePageId === item.id}
                          tooltip={{ children: item.name, side: 'right', className: "font-body bg-card text-card-foreground border-border shadow-md" }}
                          className="font-body w-full justify-start group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:justify-center"
                        >
                          <item.icon aria-hidden="true" className="group-data-[collapsible=icon]:mx-auto"/>
                          <span className="group-data-[collapsible=icon]:hidden">{item.name}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </SidebarContent>
        <div className="p-4 mt-auto border-t border-sidebar-border group-data-[collapsible=icon]:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2 px-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userAvatarUrl} alt={userName} data-ai-hint="user avatar" />
                  <AvatarFallback><UserCircle size={20}/></AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{userName}</span>
                </div>
                <ChevronDown className="ml-auto h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56 font-body bg-card text-card-foreground border-border shadow-xl">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border"/>
              <DropdownMenuItem className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"><Settings className="mr-2 h-4 w-4" /><span>Settings</span></DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"><LifeBuoy className="mr-2 h-4 w-4" /><span>Support</span></DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border"/>
              <DropdownMenuItem 
                className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                onClick={() => { /* TODO: Implement Firebase logout */ console.log("Logout clicked"); }}
              >
                <LogOut className="mr-2 h-4 w-4" /><span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Sidebar>
      <SidebarInset className="flex flex-col bg-background"> {/* Main content area background */}
        <header className="p-4 border-b border-border bg-card flex items-center gap-2 shadow-sm"> {/* Header background */}
          <SidebarTrigger className="md:hidden text-foreground hover:text-accent-foreground" />
          <h2 className="text-2xl font-semibold text-foreground font-headline title-fade-in" key={activePageDetails?.title}>
            {activePageDetails?.title || 'Dashboard'}
          </h2>
        </header>
        <MainContent />
      </SidebarInset>
    </SidebarProvider>
  );
}
