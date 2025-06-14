
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

interface NavItem {
  id: string;
  name: string;
  icon: React.ElementType;
  title: string;
}

interface MainContentProps {
  activePage: NavItem;
}

export default function MainContent({ activePage }: MainContentProps) {
  return (
    <main className="flex-1 p-6 overflow-auto bg-background">
      {activePage.id === 'dashboard' ? (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-headline">Welcome to Journey Board!</CardTitle>
            <CardDescription className="text-lg">Your central hub for managing all aspects of Journey Suite.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Navigate through your business modules using the sidebar. Each section is designed to streamline your workflow and provide critical insights.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline text-xl">Quick Start</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Explore the <span className="font-semibold">Dashboard</span> for an overview.</li>
                    <li>Manage employees in <span className="font-semibold">Employee Management</span>.</li>
                    <li>Track tasks with the <span className="font-semibold">Task List</span>.</li>
                    <li>Process payroll through <span className="font-semibold">Payroll Runner</span>.</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                  <Image 
                    src="https://placehold.co/600x400.png" 
                    alt="Placeholder image for dashboard feature" 
                    width={600} 
                    height={400}
                    className="rounded-lg object-cover aspect-video"
                    data-ai-hint="business team collaboration"
                  />
              </Card>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg">
          <CardHeader>
             <CardTitle className="text-3xl font-headline">{activePage.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Content for {activePage.name} goes here.</p>
            <Image 
              src="https://placehold.co/800x300.png" 
              alt={`Placeholder for ${activePage.name}`}
              width={800} 
              height={300}
              className="mt-4 rounded-lg object-cover w-full"
              data-ai-hint="office workspace"
            />
          </CardContent>
        </Card>
      )}
    </main>
  );
}
