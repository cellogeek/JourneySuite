
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
  SidebarFooter, // Added SidebarFooter
} from '@/components/ui/sidebar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger as AccordionPrimitiveTrigger } from '@/components/ui/accordion';
import {
  Settings,
  LifeBuoy,
  LogOut,
  ChevronDown,
  UserCircle,
  Coffee,
  PanelLeft // For mobile trigger
} from 'lucide-react';
import MainContent from './MainContent';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAppContext, NavGroup, NavItemStructure } from '@/context/AppContext';
import { cn } from '@/lib/utils';

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitiveTrigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitiveTrigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitiveTrigger
    ref={ref}
    className={cn("py-2.5 px-3 hover:bg-sky-500/5 text-sm font-semibold w-full flex justify-between items-center text-slate-700 hover:text-sky-700 rounded-md group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-2 data-[state=open]:bg-sky-500/5 data-[state=open]:text-sky-700", className)}
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

  const userName = "Admin User"; // TODO: Fetch user data
  const userAvatarUrl = "https://placehold.co/40x40.png";


  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar side="left" collapsible="icon" className="shadow-2xl">
        <SidebarHeader className="border-b-0"> {/* Removed border-b for cleaner look in glass sidebar */}
          <div className="flex items-center gap-2.5 p-1 group-data-[collapsible=icon]:justify-center">
            <Coffee className="w-7 h-7 text-sky-600 group-data-[collapsible=icon]:mx-auto" />
            <h1 className="text-xl font-bold text-slate-900 group-data-[collapsible=icon]:hidden">
              Journey Suite
            </h1>
          </div>
          {/* SidebarTrigger is now part of the main header for desktop, and implicitly part of Sheet for mobile */}
        </SidebarHeader>
        <SidebarContent> {/* p-0 removed, padding handled by menu/accordion */}
          <Accordion type="multiple" defaultValue={defaultOpenAccordions} className="w-full">
            {navGroups.map((group: NavGroup) => (
              <AccordionItem value={group.groupLabel} key={group.groupLabel} className="border-b-0 px-2">
                <AccordionTrigger>
                  <span className="group-data-[collapsible=icon]:hidden">{group.groupLabel}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 text-slate-400 group-data-[collapsible=icon]:hidden group-data-[state=open]:rotate-180" />
                </AccordionTrigger>
                <AccordionContent className="pb-1 group-data-[collapsible=icon]:px-0">
                  <SidebarMenu className="group-data-[collapsible=icon]:px-0">
                    {group.items.map((item: NavItemStructure) => (
                      <SidebarMenuItem key={item.id} className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                        <SidebarMenuButton
                          onClick={() => setActivePageId(item.id)}
                          isActive={activePageId === item.id}
                          tooltip={{ 
                            children: item.name, 
                            side: 'right', 
                            className: "font-sans bg-slate-800 text-white border-slate-700 shadow-md" // Custom tooltip style
                          }}
                        >
                          <item.icon aria-hidden="true" className="w-4 h-4"/> {/* Icon size and color handled by SidebarMenuButton */}
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
        <SidebarFooter className="p-3 border-t border-brand-slate-200/50 group-data-[collapsible=icon]:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2.5 px-2.5 py-2 text-slate-600 hover:bg-sky-500/10 hover:text-sky-700 rounded-md">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userAvatarUrl} alt={userName} data-ai-hint="user avatar" />
                  <AvatarFallback><UserCircle size={18}/></AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-semibold">{userName}</span>
                </div>
                <ChevronDown className="ml-auto h-4 w-4 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              side="top" 
              align="start" 
              className="w-56 font-sans rounded-xl border-brand-slate-200/80 bg-white/80 text-slate-600 shadow-xl backdrop-blur-lg" // Glassmorphism for dropdown
            >
              <DropdownMenuLabel className="text-slate-900">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-brand-slate-200/80"/>
              <DropdownMenuItem className="hover:bg-sky-500/10 hover:text-sky-700 focus:bg-sky-500/10 focus:text-sky-700"><Settings className="mr-2 h-4 w-4 text-slate-400" /><span>Settings</span></DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-sky-500/10 hover:text-sky-700 focus:bg-sky-500/10 focus:text-sky-700"><LifeBuoy className="mr-2 h-4 w-4 text-slate-400" /><span>Support</span></DropdownMenuItem>
              <DropdownMenuSeparator className="bg-brand-slate-200/80"/>
              <DropdownMenuItem 
                className="hover:bg-sky-500/10 hover:text-sky-700 focus:bg-sky-500/10 focus:text-sky-700"
                onClick={() => { /* TODO: Implement Firebase logout */ console.log("Logout clicked"); }}
              >
                <LogOut className="mr-2 h-4 w-4 text-slate-400" /><span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-md"> {/* Sticky header with glassmorphism */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> {/* Consistent with main content max-width */}
            <div className="flex items-center justify-between h-16 border-b border-brand-slate-200/80">
              <div className="flex items-center">
                <SidebarTrigger className="md:hidden mr-2 text-slate-500 hover:text-sky-600" aria-label="Open sidebar">
                   <PanelLeft size={20} />
                </SidebarTrigger>
                <h2 className="text-2xl font-bold text-slate-900 title-fade-in" key={activePageDetails?.title}>
                  {activePageDetails?.title || 'Dashboard'}
                </h2>
              </div>
              <div className="hidden md:block">
                {/* Desktop User profile / actions could go here if not in sidebar footer */}
              </div>
            </div>
          </div>
        </header>
        <MainContent />
      </SidebarInset>
    </SidebarProvider>
  );
}
