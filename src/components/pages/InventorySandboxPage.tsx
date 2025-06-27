"use client";

import React, { useState, useEffect, useMemo } from 'react';

// ================================================================= //
// STYLES & CONFIGURATION
// This section sets up the global styles and animations as per the 
// "Journey Suite - Brand Guidelines".
// =================================================================
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.cdnfonts.com/css/geist-sans');
    
    body {
      font-family: 'Geist Sans', 'SF Pro Text', sans-serif;
    }

    @keyframes blob {
      0% { transform: translate(0px, 0px) scale(1); }
      33% { transform: translate(30px, -50px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
      100% { transform: translate(0px, 0px) scale(1); }
    }

    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .animate-fade-in-up {
      animation: fade-in-up 0.5s ease-out forwards;
      opacity: 0;
    }
  `}</style>
);

// ================================================================= //
// MOCK API LAYER (lib/api.js)
// This simulates calls to a backend like Firestore. Connecting this
// to your actual database would be the next step.
// =================================================================
const PILOT_TENANT_ID = 'journey-canyon-llc';

const mockInventoryItems = [
    { id: 'item-1', name: 'Whole Milk', unit: 'Gallon' },
    { id: 'item-2', name: 'Espresso Beans', unit: 'lbs' },
    { id: 'item-3', name: 'Vanilla Syrup', unit: 'Bottle (750ml)' },
    { id: 'item-4', name: '12oz Hot Cups', unit: 'Case (1000)' },
    { id: 'item-5', name: 'Croissants', unit: 'Each' },
    { id: 'item-6', name: 'Cleaning Spray', unit: 'Bottle' },
];

const mockLocations = [
    { id: 'loc-1', name: 'Canyon Cafe - Downtown' },
    { id: 'loc-2', name: 'The Grind - University' },
    { id: 'loc-3', name: 'Journey Roastery & HQ' },
];

const api = {
  getInventoryItems: async () => {
    console.log(`API: Fetching inventory items for tenant: ${PILOT_TENANT_ID}`);
    return new Promise(resolve => setTimeout(() => resolve(mockInventoryItems), 500));
  },
  getLocations: async () => {
    console.log(`API: Fetching locations for tenant: ${PILOT_TENANT_ID}`);
    return new Promise(resolve => setTimeout(() => resolve(mockLocations), 500));
  },
  submitInventoryCount: async (countData: any) => {
    console.log(`API: Submitting inventory count for tenant: ${PILOT_TENANT_ID}`, countData);
    return new Promise(resolve => setTimeout(resolve, 1000));
  },
  submitInventoryTransfer: async (transferData: any) => {
    console.log(`API: Submitting inventory transfer for tenant: ${PILOT_TENANT_ID}`, transferData);
    return new Promise(resolve => setTimeout(resolve, 1000));
  }
};

// ================================================================= //
// HELPER & GENERIC COMPONENTS
// Reusable components styled according to the brand guidelines.
// =================================================================

/**
 * Icon component for rendering SVG paths.
 * @param {object} props - Component properties.
 * @param {string} props.path - The SVG path data.
 * @param {string} [props.className="w-6 h-6"] - Additional CSS classes.
 */
const Icon = ({ path, className = "w-6 h-6" }: { path: string, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d={path} />
    </svg>
);

// A central repository for SVG icon paths.
const Icons = {
    clipboard: "M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z",
    transfer: "M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-7.5a2.25 2.25 0 00-2.25-2.25h-.75m0-3l-3-3m0 0l-3 3m3-3v11.25m6 3l3 3m0 0l3-3m-3 3V7.5",
    settings: "M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.25 0H1.5M12 4.5v.75m0 15v.75m3.75-18v.75m-7.5 0v.75M7.5 12h.008v.008H7.5V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0h.008v.008h-.008V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z",
    backArrow: "M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18",
    plus: "M12 4.5v15m7.5-7.5h-15",
    trash: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
};

/**
 * Primary action button styled per brand guidelines.
 */
const PrimaryButton = ({ children, onClick, disabled = false, className = '' }: { children: React.ReactNode, onClick: () => void, disabled?: boolean, className?: string }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold 
      py-3 px-10 rounded-full text-lg shadow-lg shadow-sky-500/20 
      transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95
      disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-lg
      ${className}
    `}
  >
    {children}
  </button>
);

/**
 * A container with the "glass morphism" effect.
 */
const GlassCard = ({ children, className = '', style = {} }: { children: React.ReactNode, className?: string, style?: React.CSSProperties }) => (
    <div
        className={`bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/80 ${className}`}
        style={style}
    >
        {children}
    </div>
);

/**
 * An animated section wrapper for the fade-in-up effect.
 */
const AnimatedSection = ({ children, delay = 0, className = '' }: { children: React.ReactNode, delay?: number, className?: string }) => (
    <div className={`animate-fade-in-up ${className}`} style={{ animationDelay: `${delay}ms` }}>
        {children}
    </div>
);

// A simple modal for alerts, as window.alert() is not recommended.
const AlertModal = ({ message, onClose }: { message: string, onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <GlassCard className="p-8 max-w-sm w-full">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Alert</h3>
            <p className="text-slate-600 mb-6">{message}</p>
            <div className="flex justify-end">
                <PrimaryButton onClick={onClose}>Close</PrimaryButton>
            </div>
        </GlassCard>
    </div>
);

// ================================================================= //
// INVENTORY COMPONENTS
// These are the specific components for the inventory module.
// ================================================================= //

/**
 * InventoryDashboard: The central hub for all inventory-related tasks.
 */
function InventoryDashboard({ setActiveView }: { setActiveView: (view: string) => void }) {
  const overviewCards = [
    { view: 'count', title: 'Start Inventory Count', description: 'Perform a full or partial "shelf-to-sheet" count.', icon: Icons.clipboard },
    { view: 'transfer', title: 'Create a Transfer', description: 'Move inventory between your locations.', icon: Icons.transfer },
    { view: 'manage_items', title: 'Manage Items', description: 'Add or edit ingredients, packaging, and consumables.', icon: Icons.settings },
  ];
  const futureCards = [
    { title: "Suggested Orders", description: "AI-powered suggestions for vendor purchase orders."},
    { title: "Log Waste & Production", description: "Track spoilage and yields to get a true COGS." },
    { title: "Perishables Watchlist", description: "Manage near-expiration items and log events." },
  ];

  return (
    <AnimatedSection>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {overviewCards.map((card, index) => (
                <AnimatedSection delay={index * 100} key={card.view}>
                    <GlassCard 
                        className="p-6 cursor-pointer group transition-all duration-300 hover:scale-105 hover:shadow-sky-500/30"
                        onClick={() => setActiveView(card.view)}
                    >
                        <div className="flex items-center gap-4">
                           <div className="bg-gradient-to-br from-sky-100 to-blue-200 p-3 rounded-full">
                                <Icon path={card.icon} className="w-6 h-6 text-sky-700" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">{card.title}</h2>
                        </div>
                        <p className="text-slate-600 mt-2 text-base">{card.description}</p>
                    </GlassCard>
                </AnimatedSection>
            ))}
            {futureCards.map((card, index) => (
               <AnimatedSection delay={(index + overviewCards.length) * 100} key={card.title}>
                 <GlassCard className="p-6 opacity-60">
                     <h2 className="text-xl font-semibold text-slate-800">{card.title}</h2>
                     <p className="text-slate-500 mt-2">{card.description}</p>
                      <span className="inline-block mt-3 bg-slate-200 text-slate-600 text-xs font-semibold px-2 py-1 rounded-full">Coming Soon</span>
                 </GlassCard>
               </AnimatedSection>
            ))}
        </div>
    </AnimatedSection>
  );
}


/**
 * InventoryCountSheet: Component for performing a physical inventory count.
 */
function InventoryCountSheet({ setActiveView }: { setActiveView: (view: string) => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const inventoryItems: any = await api.getInventoryItems();
        setItems(inventoryItems);
        const initialCounts = inventoryItems.reduce((acc: any, item: any) => {
          acc[item.id] = '';
          return acc;
        }, {});
        setCounts(initialCounts);
        setLoading(false);
      } catch (err) {
        setError('Failed to load inventory items.');
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const handleCountChange = (itemId: string, value: string) => {
    setCounts(prevCounts => ({
      ...prevCounts,
      [itemId]: value,
    }));
  };

  const handleSubmit = async () => {
    const finalCounts = Object.entries(counts)
      .filter(([_, value]) => value !== '' && !isNaN(parseFloat(value)))
      .map(([itemId, value]) => ({
        itemId,
        quantity: parseFloat(value),
      }));

    if (finalCounts.length === 0) {
      setAlertMessage("Please enter at least one count.");
      return;
    }

    setSubmitting(true);
    try {
      await api.submitInventoryCount({
        date: new Date().toISOString(),
        counts: finalCounts,
      });
      setActiveView('overview');
    } catch (err) {
      setAlertMessage('Failed to submit inventory count.');
      setSubmitting(false);
    }
  };
  
  if (loading) return <div className="text-center p-8 text-slate-500">Loading inventory...</div>;
  if (error) return <div className="text-red-700 bg-red-100 p-4 rounded-lg border border-red-300">{error}</div>;

  return (
    <AnimatedSection>
      {alertMessage && <AlertModal message={alertMessage} onClose={() => setAlertMessage('')} />}
      <GlassCard className="p-6 md:p-8">
        <h2 className="text-3xl font-bold text-slate-900">Inventory Count</h2>
        <p className="text-slate-600 mt-2 mb-8">Enter the physical count for each item. Leave fields blank if you are not counting them.</p>
        
        <div className="space-y-4">
          {items.map((item, index) => (
            <AnimatedSection delay={index * 50} key={item.id}>
                <div className="grid grid-cols-5 gap-4 items-center border-b border-slate-200/80 pb-4">
                    <label htmlFor={`item-${item.id}`} className="font-semibold text-slate-800 col-span-5 sm:col-span-2">
                    {item.name}
                    </label>
                    <div className="col-span-3 sm:col-span-2">
                        <input
                            id={`item-${item.id}`}
                            type="number"
                            value={counts[item.id] || ''}
                            onChange={(e) => handleCountChange(item.id, e.target.value)}
                            placeholder="Enter count"
                            className="w-full p-3 bg-white/50 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300"
                        />
                    </div>
                    <span className="text-slate-500 text-right sm:text-left col-span-2 sm:col-span-1">
                        {item.unit}
                    </span>
                </div>
            </AnimatedSection>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
            <PrimaryButton onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Count'}
            </PrimaryButton>
        </div>
      </GlassCard>
    </AnimatedSection>
  );
}

/**
 * InventoryTransferForm: Component for creating inter-location transfers.
 */
function InventoryTransferForm({ setActiveView }: { setActiveView: (view: string) => void }) {
    const [items, setItems] = useState<any[]>([]);
    const [locations, setLocations] = useState<any[]>([]);
    const [transferItems, setTransferItems] = useState([{ id: 1, itemId: '', quantity: '' }]);
    const [fromLocation, setFromLocation] = useState('');
    const [toLocation, setToLocation] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [inventoryItems, companyLocations]: [any, any] = await Promise.all([
                api.getInventoryItems(),
                api.getLocations()
            ]);
            setItems(inventoryItems);
            setLocations(companyLocations);
            if (companyLocations.length > 0) {
                setFromLocation(companyLocations[0].id);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleItemChange = (transferId: number, field: string, value: string) => {
        const newTransferItems = transferItems.map(item => 
             item.id === transferId ? { ...item, [field]: value } : item
        );
        setTransferItems(newTransferItems);
    };

    const addTransferItem = () => {
        setTransferItems([...transferItems, { id: Date.now(), itemId: '', quantity: '' }]);
    };
    
    const removeTransferItem = (transferId: number) => {
        setTransferItems(transferItems.filter(item => item.id !== transferId));
    };

    const handleSubmit = async () => {
        if (!fromLocation || !toLocation) {
            setAlertMessage("Please select 'from' and 'to' locations.");
            return;
        }
        if (fromLocation === toLocation) {
            setAlertMessage("'From' and 'to' locations cannot be the same.");
            return;
        }

        const validItems = transferItems
            .filter(item => item.itemId && item.quantity && parseFloat(item.quantity) > 0)
            .map(item => ({...item, quantity: parseFloat(item.quantity)}));
            
        if (validItems.length === 0) {
            setAlertMessage("Please add at least one item with a valid quantity to transfer.");
            return;
        }

        setSubmitting(true);
        try {
            await api.submitInventoryTransfer({
                fromLocationId: fromLocation,
                toLocationId: toLocation,
                items: validItems,
                date: new Date().toISOString(),
            });
            setActiveView('overview');
        } catch (err) {
            setAlertMessage('Failed to submit inventory transfer.');
            setSubmitting(false);
        }
    };

    const availableToLocations = useMemo(() => {
        return locations.filter(loc => loc.id !== fromLocation);
    }, [locations, fromLocation]);

    if (loading) return <div className="text-center p-8 text-slate-500">Loading data...</div>;

    return (
        <AnimatedSection>
            {alertMessage && <AlertModal message={alertMessage} onClose={() => setAlertMessage('')} />}
            <GlassCard className="p-6 md:p-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-6">Create Inventory Transfer</h2>

                <fieldset className="border border-slate-200/80 p-4 rounded-xl mb-6">
                    <legend className="text-lg font-semibold px-2 text-[#005A9C]">Locations</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="fromLocation" className="block text-sm font-medium text-slate-600 mb-1">From Location</label>
                            <select id="fromLocation" value={fromLocation} onChange={e => setFromLocation(e.target.value)} className="w-full p-3 bg-white/50 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300">
                                {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="toLocation" className="block text-sm font-medium text-slate-600 mb-1">To Location</label>
                            <select id="toLocation" value={toLocation} onChange={e => setToLocation(e.target.value)} className="w-full p-3 bg-white/50 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300">
                                <option value="">Select destination...</option>
                                {availableToLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                            </select>
                        </div>
                    </div>
                </fieldset>
                
                <fieldset className="border border-slate-200/80 p-4 rounded-xl">
                    <legend className="text-lg font-semibold px-2 text-[#005A9C]">Items to Transfer</legend>
                    <div className="space-y-4">
                        {transferItems.map((item, index) => (
                            <AnimatedSection delay={index * 100} key={item.id}>
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-50/50 p-4 rounded-lg">
                                    <div className="md:col-span-6">
                                        <label className="block text-sm font-medium text-slate-600 mb-1 sr-only">Item</label>
                                        <select value={item.itemId} onChange={e => handleItemChange(item.id, 'itemId', e.target.value)} className="w-full p-3 bg-white/50 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300">
                                            <option value="">Select an item...</option>
                                            {items.map(invItem => <option key={invItem.id} value={invItem.id}>{invItem.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="md:col-span-4">
                                        <label className="block text-sm font-medium text-slate-600 mb-1 sr-only">Quantity</label>
                                        <input type="number" min="0" value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', e.target.value)} className="w-full p-3 bg-white/50 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300" placeholder="0" />
                                    </div>
                                    <div className="md:col-span-2 flex items-end justify-end h-full">
                                      {transferItems.length > 1 && (
                                        <button onClick={() => removeTransferItem(item.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors">
                                            <Icon path={Icons.trash} className="w-6 h-6" />
                                        </button>
                                      )}
                                    </div>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                    <button onClick={addTransferItem} className="font-semibold text-sky-600 hover:text-sky-800 mt-4 flex items-center gap-1">
                        <Icon path={Icons.plus} className="w-5 h-5" />
                        Add Another Item
                    </button>
                </fieldset>

                <div className="mt-8 flex justify-end">
                    <PrimaryButton onClick={handleSubmit} disabled={submitting}>
                        {submitting ? 'Submitting...' : 'Submit Transfer'}
                    </PrimaryButton>
                </div>
            </GlassCard>
        </AnimatedSection>
    );
}

/**
 * InventoryItemManager: STUB component for a future feature.
 */
function InventoryItemManager({ setActiveView }: { setActiveView: (view: string) => void }) {
  return (
    <AnimatedSection>
        <GlassCard className="p-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Item Library Management</h2>
          <p className="text-slate-600 mb-6">This feature is currently under development and will be available in a future update.</p>
          <div className="opacity-70 border-t border-slate-200/80 pt-6">
            <h3 className="font-semibold text-slate-800">Planned Features:</h3>
            <ul className="list-disc list-inside mt-2 text-slate-600 space-y-1">
              <li>Add new inventory items (food, packaging, consumables).</li>
              <li>Define item categories (e.g., "Dairy," "Dry Goods," "Cleaning Supplies").</li>
              <li>Set default units of measure (e.g., lbs, oz, case, each).</li>
              <li>Link items to vendors and track purchase prices.</li>
              <li>Connect to the Recipe & Costing Engine.</li>
              <li>Define items as "in-house production" vs "externally purchased".</li>
            </ul>
          </div>
        </GlassCard>
    </AnimatedSection>
  );
}

// ================================================================= //
// Main Application Component
// This brings all the components together and manages the view state.
// ================================================================= //
export default function InventorySandboxPage({ pageId }: { pageId: string }) {
  const [activeView, setActiveView] = useState('overview');

  // Router function to display the correct component based on state
  const renderActiveView = () => {
    switch (activeView) {
      case 'count':
        return <InventoryCountSheet setActiveView={setActiveView} />;
      case 'transfer':
        return <InventoryTransferForm setActiveView={setActiveView} />;
      case 'manage_items':
        return <InventoryItemManager setActiveView={setActiveView} />;
      default:
        return <InventoryDashboard setActiveView={setActiveView} />;
    }
  };

  // Back button component shown on sub-views
  const BackButton = () => (
    <button 
         onClick={() => setActiveView('overview')} 
         className="flex items-center gap-2 mb-6 text-slate-600 hover:text-slate-900 font-semibold transition-colors group animate-fade-in-up"
    >
        <Icon path={Icons.backArrow} className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
        Back to Inventory Overview
    </button>
  );

  return (
    <>
      <GlobalStyles />
      {/* Background "Aurora" Effect from Brand Guidelines */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-sky-300 rounded-full opacity-40 blur-3xl animate-[blob_12s_infinite]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-300 rounded-full opacity-30 blur-3xl animate-[blob_15s_infinite_reverse]"></div>
      </div>

      {/* Main content area, styled per brand guidelines */}
      <main className="relative bg-slate-50/50 min-h-screen text-slate-800 p-4 sm:p-8 lg:p-12">
        <div className="max-w-4xl mx-auto">
          
          <AnimatedSection>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
                Inventory Co-Pilot
              </h1>
              <p className="text-slate-500 mt-2 text-lg">
                Your central hub for managing inventory at Journey Canyon LLC.
              </p>
          </AnimatedSection>
          
          <div className="mt-10">
            {activeView !== 'overview' && <BackButton />}
            {renderActiveView()}
          </div>
        </div>
      </main>
    </>
  );
}
