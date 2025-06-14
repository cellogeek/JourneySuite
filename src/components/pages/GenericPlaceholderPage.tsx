
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/context/AppContext';
import Image from 'next/image'; // Keep next/image

const GenericPlaceholderPage = ({ pageId }: { pageId: string }) => {
  const { navGroups } = useAppContext();
  
  const pageDetails = navGroups.flatMap(g => g.items).find(item => item.id === pageId);

  if (!pageDetails) {
    return (
      <Card> {/* Glassmorphism applied by Card component */}
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-900">Page Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">The requested page could not be found.</p>
        </CardContent>
      </Card>
    );
  }
  
  // TODO: Fetch data from Firestore for this page or implement its specific functionality

  return (
    <Card> {/* Glassmorphism applied by Card component */}
      <CardHeader>
        <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">{pageDetails.title}</CardTitle>
        {pageDetails.description && (
          <CardDescription className="text-lg text-slate-500 pt-1">{pageDetails.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <p className="mb-6 text-slate-600">
          This is a placeholder for the <span className="font-semibold text-sky-600">{pageDetails.name}</span> page. 
          Functionality for this module will be implemented here.
        </p>
        <div className="aspect-[2/1] w-full overflow-hidden rounded-xl border border-brand-slate-200/50 shadow-md">
          <Image
            src={`https://placehold.co/800x400.png`} // Placeholder image
            alt={`Placeholder for ${pageDetails.name}`}
            width={800}
            height={400}
            className="object-cover w-full h-full"
            data-ai-hint="business workspace" // Keep AI hint
            priority // Consider adding priority for LCP images
          />
        </div>
         {/* // TODO: Call Firebase function for specific actions related to this page */}
      </CardContent>
    </Card>
  );
};

export default GenericPlaceholderPage;
