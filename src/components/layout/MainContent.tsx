
"use client";

import React from 'react';
import { useAppContext } from '@/context/AppContext';

export default function MainContent() {
  const { getActivePage, activePageId } = useAppContext();
  const activePageDetails = getActivePage();

  if (!activePageDetails) {
    return (
      <main className="flex-1 p-4 sm:p-8 lg:p-12 max-w-7xl mx-auto w-full"> {/* Adjusted padding and max-width */}
        <div className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-brand-slate-200/80">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Page Not Found</h1>
          <p className="text-slate-600">The page you are looking for could not be found or is loading...</p>
        </div>
      </main>
    );
  }

  const PageComponent = activePageDetails.component;

  return (
    // Max width and padding applied here to center content and provide spacing
    <main className="flex-1 p-4 sm:p-8 lg:p-12 max-w-7xl mx-auto w-full">
      <div className="content-fade-in-up" style={{ animationDelay: '100ms' }}> {/* Animation for page content */}
        <PageComponent pageId={activePageId} />
      </div>
    </main>
  );
}
