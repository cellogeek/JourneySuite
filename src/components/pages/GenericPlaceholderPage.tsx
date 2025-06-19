
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/context/AppContext';
import Image from 'next/image'; 
import { Users } from 'lucide-react';

// Sample vendor list for the "Vendors" page display
const sampleVendorsList = [
  'N/A', 'Coffee Roasters Inc.', 'Dairy Delights', 'Paper Goods Co.', 'Food Services LLC',
  'Office Supplies Co.', 'Vegan Milk Co.', 'Flavor Syrups Inc.', 'Beverage Blends',
  'Green Tea Co.', 'Local Bakery', 'Specialty Coffee Importers', 'Cleaning Supply Co.',
  'Hardware Store Inc.', 'Espresso Tech Solutions', 'Uniforms R Us', 'Local Print Shop',
  'Dough Distributors', 'Frozen Treats Ltd.', 'Water Filter Co.', 'Polk Coffee Supply',
  'Polk Paper Co.', 'Polk Dairy', 'Cart Beverages', 'Cart Snacks'
].sort();

const GenericPlaceholderPage = ({ pageId }: { pageId: string }) => {
  const { navGroups } = useAppContext();
  
  const pageDetails = navGroups.flatMap(g => g.items).find(item => item.id === pageId);

  if (!pageDetails) {
    return (
      <Card> 
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-900">Page Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">The requested page could not be found.</p>
        </CardContent>
      </Card>
    );
  }

  if (pageId === 'vendors') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 flex items-center">
            <Users size={32} className="mr-3 text-sky-600" /> Vendor Management
          </CardTitle>
          <CardDescription className="text-lg text-slate-500 pt-1">
            List of current vendors. (Future: Add/Edit functionality)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sampleVendorsList.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
              {sampleVendorsList.map((vendor, index) => (
                <li key={index} className="text-slate-700 text-sm p-2 border-b border-brand-slate-200/50">
                  {vendor}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500">No vendors listed yet.</p>
          )}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card> 
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
            src={`https://placehold.co/800x400.png`} 
            alt={`Placeholder for ${pageDetails.name}`}
            width={800}
            height={400}
            className="object-cover w-full h-full"
            data-ai-hint="business workspace" 
            priority 
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default GenericPlaceholderPage;
