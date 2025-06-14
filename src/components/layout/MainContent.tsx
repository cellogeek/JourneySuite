
"use client";

import React from 'react';
import { useAppContext } from '@/context/AppContext';

export default function MainContent() {
  const { getActivePage, activePageId } = useAppContext();
  const activePageDetails = getActivePage();

  if (!activePageDetails) {
    // Fallback or loading state if needed
    return (
      <main className="flex-1 p-6 overflow-auto bg-background">
        <p>Page not found or loading...</p>
      </main>
    );
  }

  const PageComponent = activePageDetails.component;

  return (
    <main className="flex-1 p-6 overflow-auto bg-background">
      {/* Pass pageId to GenericPlaceholderPage if it's the active component */}
      <PageComponent pageId={activePageId} />
    </main>
  );
}
