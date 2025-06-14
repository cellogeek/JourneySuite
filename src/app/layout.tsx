
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'Journey Suite',
  description: 'Internal business management suite for a coffee company',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Geist Sans is now imported via globals.css */}
      </head>
      <body className="font-body antialiased bg-slate-50 min-h-screen relative overflow-x-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          {/* Aurora Background Blobs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 sm:w-[40rem] sm:h-[40rem] lg:w-[50rem] lg:h-[50rem] bg-sky-300/30 rounded-full filter blur-3xl opacity-50 aurora-blob"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 sm:w-[40rem] sm:h-[40rem] lg:w-[60rem] lg:h-[60rem] bg-blue-300/30 rounded-full filter blur-3xl opacity-40 aurora-blob aurora-blob-delay-1"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 sm:w-[30rem] sm:h-[30rem] lg:w-[45rem] lg:h-[45rem] bg-orange-300/30 rounded-full filter blur-3xl opacity-30 aurora-blob aurora-blob-delay-2"></div>
           <div className="absolute top-1/3 right-1/3 w-72 h-72 sm:w-[35rem] sm:h-[35rem] lg:w-[40rem] lg:h-[40rem] bg-amber-300/20 rounded-full filter blur-3xl opacity-30 aurora-blob aurora-blob-delay-3"></div>
        </div>
        <div className="relative z-0">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
