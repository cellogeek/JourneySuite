
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/context/AppContext';
import Image from 'next/image';

const GenericPlaceholderPage = ({ pageId }: { pageId: string }) => {
  const { navGroups } = useAppContext();
  
  const pageDetails = navGroups.flatMap(g => g.items).find(item => item.id === pageId);

  if (!pageDetails) {
    return (
      <Card className="shadow-lg bg-card text-card-foreground rounded-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-primary-text">Page Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-primary-text">The requested page could not be found.</p>
        </CardContent>
      </Card>
    );
  }
  
  // TODO: Fetch data from Firestore for this page or implement its specific functionality

  return (
    <Card className="shadow-lg bg-card text-card-foreground rounded-lg">
      <CardHeader>
        <CardTitle className="text-3xl font-headline text-primary-text">{pageDetails.title}</CardTitle>
        {pageDetails.description && (
          <CardDescription className="text-lg text-muted-foreground">{pageDetails.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-primary-text">
          This is a placeholder for the <span className="font-semibold text-primary">{pageDetails.name}</span> page. 
          Functionality for this module will be implemented here.
        </p>
        <Image
          src={`https://placehold.co/800x400.png`}
          alt={`Placeholder for ${pageDetails.name}`}
          width={800}
          height={400}
          className="mt-4 rounded-lg object-cover w-full shadow-md"
          data-ai-hint="business workspace"
        />
         {/* // TODO: Call Firebase function for specific actions related to this page */}
      </CardContent>
    </Card>
  );
};

export default GenericPlaceholderPage;
