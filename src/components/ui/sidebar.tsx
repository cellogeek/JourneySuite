
"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { PanelLeft } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
// Input, Separator, Skeleton not directly used in this component's new styling approach.
// If needed for specific sidebar content, they'd be imported by the consumer.
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem" // Standard width
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "4rem" // Adjusted for better icon display with padding
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContext = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile()
    const [openMobile, setOpenMobile] = React.useState(false)

    const [_open, _setOpen] = React.useState(defaultOpen)
    const open = openProp ?? _open
    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === "function" ? value(open) : value
        if (setOpenProp) {
          setOpenProp(openState)
        } else {
          _setOpen(openState)
        }
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
      },
      [setOpenProp, open]
    )

    const toggleSidebar = React.useCallback(() => {
      return isMobile
        ? setOpenMobile((open) => !open)
        : setOpen((open) => !open)
    }, [isMobile, setOpen, setOpenMobile])

    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
          (event.metaKey || event.ctrlKey)
        ) {
          event.preventDefault()
          toggleSidebar()
        }
      }
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }, [toggleSidebar])

    const state = open ? "expanded" : "collapsed"

    const contextValue = React.useMemo<SidebarContext>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={100}>
          <div
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH,
                "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                ...style,
              } as React.CSSProperties
            }
            className={cn(
              "group/sidebar-wrapper flex min-h-svh w-full", // Removed has[...] for inset bg
              className
            )}
            ref={ref}
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    )
  }
)
SidebarProvider.displayName = "SidebarProvider"

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right"
    collapsible?: "offcanvas" | "icon" | "none" // Removed variant, sidebar is glassmorphic
  }
>(
  (
    {
      side = "left",
      collapsible = "offcanvas",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

    const sidebarBaseClasses = "bg-white/70 backdrop-blur-xl border-brand-slate-200/80 text-sidebar-foreground rounded-r-2xl" // For left sidebar
    const rightSidebarBaseClasses = "bg-white/70 backdrop-blur-xl border-brand-slate-200/80 text-sidebar-foreground rounded-l-2xl" // For right sidebar

    if (collapsible === "none") {
      return (
        <div
          className={cn(
            "flex h-full w-[--sidebar-width] flex-col",
            side === "left" ? sidebarBaseClasses : rightSidebarBaseClasses,
            side === "left" ? "border-r" : "border-l",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      )
    }

    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
          <SheetContent
            data-sidebar="sidebar"
            data-mobile="true"
            className={cn( // SheetContent already has glassmorphism
              "w-[--sidebar-width] p-0 text-sidebar-foreground [&>button]:hidden",
               // SheetContent applies its own rounding based on side
            )}
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
              } as React.CSSProperties
            }
            side={side}
          >
            {/* SheetTitle is now handled within SheetContent by default if no SheetTitle child is present */}
            <div className="flex h-full w-full flex-col">{children}</div>
          </SheetContent>
        </Sheet>
      )
    }

    // Desktop sidebar
    return (
      <div
        ref={ref}
        className={cn("group peer hidden md:block text-sidebar-foreground relative z-10")} // Added relative z-10
        data-state={state}
        data-collapsible={state === "collapsed" ? collapsible : ""}
        data-side={side}
      >
        {/* This is what handles the sidebar gap on desktop */}
        <div
          className={cn(
            "duration-200 relative h-svh transition-[width] ease-linear",
            "w-[--sidebar-width]",
            "group-data-[collapsible=offcanvas]:w-0",
            "group-data-[collapsible=icon]:w-[--sidebar-width-icon]", // No extra padding for icon state width
            "group-data-[side=right]:rotate-180", // This might not be needed if styling is symmetrical
          )}
        />
        <div
          data-sidebar="sidebar"
          className={cn(
            "duration-200 fixed inset-y-0 hidden h-[calc(100svh-2rem)] my-4 flex-col transition-[left,right,width] ease-linear md:flex", // Added my-4 for vertical spacing
            "w-[--sidebar-width]",
            side === "left"
              ? "left-4 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1_-_1rem)]" // Adjusted for margin
              : "right-4 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1_-_1rem)]",
            "group-data-[collapsible=icon]:w-[--sidebar-width-icon]",
            side === "left" ? cn(sidebarBaseClasses, "border-r") : cn(rightSidebarBaseClasses, "border-l"),
            className
          )}
          {...props}
        >
          {children}
        </div>
      </div>
    )
  }
)
Sidebar.displayName = "Sidebar"

const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      variant="ghost" // Ghost buttons updated to new theme
      size="icon"
      className={cn("h-8 w-8 text-slate-500 hover:text-sky-600", className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeft size={20} />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"


const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"main"> // Changed to main for semantic reasons
>(({ className, ...props }, ref) => {
  // Desktop: ml-[--sidebar-width] or ml-[--sidebar-width-icon]
  // Mobile: full width
  return (
    <main
      ref={ref}
      className={cn(
        "relative flex min-h-svh flex-1 flex-col", // Removed bg-background, inherited from body
        // Adjust margin based on sidebar state and side.
        "md:group-data-[state=expanded]:group-data-[side=left]/sidebar-wrapper:ml-[calc(var(--sidebar-width)_+_2rem)]", // sidebar width + sidebar margin + content margin
        "md:group-data-[state=collapsed]:group-data-[collapsible=icon]:group-data-[side=left]/sidebar-wrapper:ml-[calc(var(--sidebar-width-icon)_+_2rem)]",
        "md:group-data-[state=expanded]:group-data-[side=right]/sidebar-wrapper:mr-[calc(var(--sidebar-width)_+_2rem)]",
        "md:group-data-[state=collapsed]:group-data-[collapsible=icon]:group-data-[side=right]/sidebar-wrapper:mr-[calc(var(--sidebar-width-icon)_+_2rem)]",
        "md:group-data-[state=collapsed]:group-data-[collapsible=offcanvas]/sidebar-wrapper:ml-0 md:group-data-[state=collapsed]:group-data-[collapsible=offcanvas]/sidebar-wrapper:mr-0", // Handles offcanvas correctly
        "transition-[margin] duration-200 ease-linear",
        className
      )}
      {...props}
    />
  )
})
SidebarInset.displayName = "SidebarInset"


const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn("flex flex-col gap-3 p-4 border-b border-brand-slate-200/50", className)} // Adjusted padding and border
      {...props}
    />
  )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="footer"
      className={cn("flex flex-col gap-3 p-4 border-t border-brand-slate-200/50 mt-auto", className)} // Adjusted padding and border
      {...props}
    />
  )
})
SidebarFooter.displayName = "SidebarFooter"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden p-2 group-data-[collapsible=icon]:overflow-hidden", // Added p-2
        className
      )}
      {...props}
    />
  )
})
SidebarContent.displayName = "SidebarContent"


const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu"
    className={cn("flex w-full min-w-0 flex-col gap-1 px-2", className)} // Added px-2
    {...props}
  />
))
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-sidebar="menu-item"
    className={cn("group/menu-item relative", className)}
    {...props}
  />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2.5 overflow-hidden rounded-md p-2.5 text-left text-sm outline-none ring-sky-500 transition-colors duration-150 focus-visible:ring-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      isActive: {
        true: "bg-sidebar-active-background text-sidebar-active-foreground font-semibold",
        false: "text-sidebar-foreground hover:bg-sidebar-hover-background hover:text-sidebar-hover-foreground",
      },
      isCollapsed: {
        true: "justify-center !size-10 !p-0", // Adjusted for icon size, uses ! to override
        false: "",
      }
    },
    defaultVariants: {
      isActive: false,
      isCollapsed: false,
    },
  }
)

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    isActive?: boolean
    tooltip?: string | React.ComponentProps<typeof TooltipContent>
  }
>(
  (
    {
      asChild = false,
      isActive = false,
      tooltip,
      className,
      children, // Explicitly handle children to separate icon and text for collapsed state
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    const { isMobile, state } = useSidebar()
    const isCollapsed = !isMobile && state === "collapsed";

    const iconElement = React.Children.toArray(children).find(
      (child) => React.isValidElement(child) && (child.type as any)?.displayName?.includes("LucideIcon")
    );
    const textElement = React.Children.toArray(children).find(
      (child) => React.isValidElement(child) && child.type === "span"
    );


    const buttonContent = (
      <>
        {iconElement && React.cloneElement(iconElement as React.ReactElement, { className: cn((iconElement as React.ReactElement).props.className, "shrink-0 w-4 h-4 text-slate-400 group-hover/menu-item:text-sky-600", isActive && "!text-sky-600" )})}
        {!isCollapsed && textElement}
      </>
    );

    const button = (
      <Comp
        ref={ref}
        data-sidebar="menu-button"
        data-active={isActive}
        className={cn(sidebarMenuButtonVariants({ isActive, isCollapsed }), className)}
        {...props}
      >
        {buttonContent}
      </Comp>
    )

    if (!tooltip || isMobile || state === "expanded" ) { // Only show tooltip when collapsed and not mobile
      return button
    }
    
    const tooltipText = typeof tooltip === 'string' ? tooltip : (tooltip as React.ComponentProps<typeof TooltipContent>).children as string;


    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent
          side="right"
          align="center"
          className="bg-slate-800 text-white border-slate-700" // Custom tooltip style for better visibility
          {...(typeof tooltip === 'object' ? tooltip : {})} // Spread remaining tooltip props if object
        >
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    )
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

// Removed SidebarRail, SidebarInput, SidebarSeparator, SidebarGroup*, SidebarMenuAction, SidebarMenuBadge, SidebarMenuSkeleton, SidebarMenuSub* as they are not directly used or their styling is simplified
// The new design relies on Accordion for groups, and simpler menu items.

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  // SidebarGroup,
  // SidebarGroupAction,
  // SidebarGroupContent,
  // SidebarGroupLabel,
  SidebarHeader,
  // SidebarInput,
  SidebarInset,
  SidebarMenu,
  // SidebarMenuAction,
  // SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  // SidebarMenuSkeleton,
  // SidebarMenuSub,
  // SidebarMenuSubButton,
  // SidebarMenuSubItem,
  SidebarProvider,
  // SidebarRail,
  // SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}
