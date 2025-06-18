
"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UploadCloud, AlertTriangle, CheckCircle2, FilePenLine, Trash2, Loader2 } from 'lucide-react'; // Removed LogIn, Info
import { useAppContext } from '@/context/AppContext';
import { db } from '@/lib/firebase'; 
import { collection, doc, getDocs, addDoc, setDoc, deleteDoc, onSnapshot, query, where, writeBatch } from 'firebase/firestore';

// --- Papa Parse Script URL ---
const PAPA_PARSE_URL = "https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js";

// --- Helper to generate a unique ID (Firebase will generate its own, but can be useful for client-side linking if needed before save) ---
function generateClientSideId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

// --- Default Employee Data (used to seed Firestore for a new user) ---
const defaultEmployeesDataSeed = [
    { firstName: 'Rylie', lastName: 'Bauman', gustoId: '69D61F', giftCardNumber: '8627358676938937' },
    { firstName: 'Lauren', lastName: 'Callahan', gustoId: '537DE5', giftCardNumber: '8627335609819194' },
    { firstName: 'Macy', lastName: 'Compton', gustoId: '73E0EE', giftCardNumber: '8627862991882928' },
    { firstName: 'Delaney', lastName: 'Darnell', gustoId: 'E42C1D', giftCardNumber: '8627819700302374' },
    { firstName: 'Jess', lastName: 'Dexter', gustoId: 'CP33RY', giftCardNumber: '8627657078851584' },
    { firstName: 'Angela', lastName: 'Earl', gustoId: 'JYFNBI', giftCardNumber: '8627847438717852' },
    { firstName: 'Emma', lastName: 'Earl', gustoId: 'KR92M5', giftCardNumber: '8627954378639284' },
    { firstName: 'Kelsey', lastName: 'Frost', gustoId: 'YT14BZ', giftCardNumber: '8627311200551569' },
    { firstName: 'AJ', lastName: 'Gieb', gustoId: 'ROCGJB', giftCardNumber: '8627670241783022' },
    { firstName: 'Skyla', lastName: 'Harr', gustoId: 'FCD1C3', giftCardNumber: '8627583977891200' },
    { firstName: 'Hannah', lastName: 'Minton', gustoId: '0D76C6', giftCardNumber: '8627351171154894' },
    { firstName: 'Jessica', lastName: 'Solis', gustoId: 'B47406', giftCardNumber: '8627472503745165' },
    { firstName: 'Trace', lastName: 'Thomas', gustoId: 'ABEE32', giftCardNumber: '8627335447542875' },
    { firstName: 'Abigail', lastName: 'Wolfe', gustoId: 'D8EB5E', giftCardNumber: '8627708778705131' },
    { firstName: 'Ellee', lastName: 'Reeves', gustoId: 'REEV15', giftCardNumber: '' },
];

const IGNORED_EMPLOYEE_NAMES = ["Stephanie Littlejohn"];

// --- Time and Date Helper Functions ---
const formatTime = (timeString24hr?: string): string => {
    if (!timeString24hr) return '';
    const parts = timeString24hr.split(':');
    if (parts.length !== 2) return 'Invalid';
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    if (isNaN(hours) || isNaN(minutes)) return 'Invalid';
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${String(formattedHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;
};

const parseTime = (timeStringAmPm?: string): string | null => {
    if (!timeStringAmPm) return null;
    const cleaned = timeStringAmPm.replace(/"/g, '').trim();
    const match = cleaned.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return null;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3] ? match[3].toUpperCase() : '';
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0; 
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const parseDateString = (dateStr?: string): Date | null => {
    if (!dateStr) return null;
    let match = dateStr.match(/([a-zA-Z]{3,})\s(\d{1,2}),\s(\d{4})/);
    if (match) {
        const d = new Date(dateStr); 
        return isNaN(d.getTime()) ? null : d;
    }
    match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
    if (match) {
        const month = parseInt(match[1], 10) - 1; 
        const day = parseInt(match[2], 10);
        let year = parseInt(match[3], 10);
        if (year < 100) { 
            year += 2000; 
        }
        const d = new Date(year, month, day);
        return isNaN(d.getTime()) ? null : d;
    }
    return null;
};

const extractAndFormatDate = (dateString?: string): string | null => {
    const dateObj = parseDateString(dateString);
    if (!dateObj) return null;
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};


const parseLegacyDateTime = (dateTimeStr?: string): { date: string | null; time: string | null } => {
    if (!dateTimeStr) return { date: null, time: null };
    const parts = dateTimeStr.trim().split(/\s+/);
    if (parts.length < 2) return { date: null, time: null };
    return {
        date: extractAndFormatDate(parts[0]),
        time: parseTime(parts.slice(1).join(' '))
    };
};


const calculateDurationInMinutes = (clockIn24hr?: string, clockOut24hr?: string): number => {
    if (!clockIn24hr || !clockOut24hr) return 0;
    const [inHours, inMinutes] = clockIn24hr.split(':').map(Number);
    const [outHours, outMinutes] = clockOut24hr.split(':').map(Number);

    if (isNaN(inHours) || isNaN(inMinutes) || isNaN(outHours) || isNaN(outMinutes)) return 0;

    let totalInMinutes = inHours * 60 + inMinutes;
    let totalOutMinutes = outHours * 60 + outMinutes;

    if (totalOutMinutes < totalInMinutes) {
        totalOutMinutes += 24 * 60; 
    }
    return totalOutMinutes - totalInMinutes;
};

const formatDuration = (minutes?: number): string => {
    if (minutes === null || minutes === undefined || isNaN(minutes)) return 'Invalid';
    return `${Math.floor(minutes / 60)}h ${Math.round(minutes % 60)}m`;
};


const SHIFT_DEFINITIONS: Record<string, Record<string, { in: string; out: string }[]>> = {
    'Canyon': {
        'Mon-Fri': [{ in: '06:30', out: '10:00' }, { in: '10:00', out: '14:30' }, { in: '14:30', out: '18:00' }],
        'Sat-Sun': [{ in: '06:30', out: '11:00' }, { in: '11:00', out: '14:30' }, { in: '14:30', out: '18:00' }]
    },
    'Polk Street': { 
        'Mon-Fri': [{ in: '06:45', out: '11:00' }, { in: '11:00', out: '15:00' }],
        'Sat-Sun': [{ in: '06:45', out: '11:00' }, { in: '11:00', out: '15:00' }]
    }
};

interface TimeEntry {
    id: string; // Firestore document ID
    employeeId: string; // Corresponds to Employee doc ID in Firestore
    date: string | null;
    clockIn: string | null;
    clockOut: string | null;
    jobTitle: string;
    location: string;
    status: 'Pending' | 'Approved' | 'Flagged';
    flags: string[];
    durationMinutes?: number;
    correctionMessage?: string;
    suggestedCorrectionIn?: string | null;
    suggestedCorrectionOut?: string | null;
}

interface Employee {
    id: string; // Firestore document ID
    firstName: string;
    lastName: string;
    gustoId: string;
    giftCardNumber: string;
}


const validateSingleEntry = (entry: Omit<TimeEntry, 'id' | 'durationMinutes' | 'status' | 'flags' | 'correctionMessage' | 'suggestedCorrectionIn' | 'suggestedCorrectionOut'> & Partial<TimeEntry>): TimeEntry => {
    const validated: TimeEntry = {
        id: entry.id || generateClientSideId(), // Use existing ID or generate if new
        ...entry,
        status: 'Pending', // Default status
        flags: [],
        correctionMessage: '',
        suggestedCorrectionIn: null,
        suggestedCorrectionOut: null,
        durationMinutes: 0,
    };
    
    let durationMinutes = calculateDurationInMinutes(validated.clockIn || undefined, validated.clockOut || undefined);
    validated.durationMinutes = durationMinutes;

    const { clockIn, clockOut, date, location } = validated;

    if (!date) {
        validated.flags.push('INVALID_DATE');
        validated.status = 'Flagged';
        validated.correctionMessage = 'Missing or invalid date.';
    } else if (!clockIn || !clockOut) {
        validated.flags.push('MISSING_TIME');
        validated.status = 'Flagged';
        validated.correctionMessage = `Missing ${!clockIn ? 'clock-in' : 'clock-out'}.`;
    }
    
    if (validated.status === 'Flagged' && (validated.flags.includes('INVALID_DATE') || validated.flags.includes('MISSING_TIME'))) {
        return validated;
    }
    
    if (clockOut === '04:00' && durationMinutes > 0 && date) { 
        validated.flags.push('AUTO_CLOCK_OUT');
        validated.status = 'Flagged';
        
        const dateObj = parseDateString(date);
        if (dateObj) {
            const dayOfWeek = dateObj.getDay(); 
            const dayType = (dayOfWeek === 0 || dayOfWeek === 6) ? 'Sat-Sun' : 'Mon-Fri';
            
            let locationKey = 'Canyon'; 
            if (location && location.toLowerCase().includes('polk')) {
                locationKey = 'Polk Street';
            }
            
            const locationShiftDefs = SHIFT_DEFINITIONS[locationKey]?.[dayType] || [];
            const lastShiftDef = locationShiftDefs.length > 0 ? locationShiftDefs[locationShiftDefs.length - 1].out : '18:00'; 
            
            validated.suggestedCorrectionOut = lastShiftDef;
            validated.correctionMessage = `Auto-clock-out detected. Suggested clock-out: ${formatTime(validated.suggestedCorrectionOut)}. Original duration: ${formatDuration(durationMinutes)}.`;
            if(clockIn) {
                validated.durationMinutes = calculateDurationInMinutes(clockIn, validated.suggestedCorrectionOut);
            }
        } else {
            validated.correctionMessage = 'Auto-clock-out detected, but could not determine day of week to suggest correction.';
        }
    }

    if (validated.flags.length > 0 && validated.status !== 'Flagged') { 
      validated.status = 'Flagged';
    } else if (validated.flags.length === 0) {
      validated.status = 'Approved'; // Set to approved if no flags
    }
    
    return validated;
};


const PayrollRunnerPage = ({ pageId }: { pageId: string }) => {
    const { currentUser, loadingAuth } = useAppContext(); // Removed devLogin, signInWithGoogle
    const [viewMode, setViewMode] = useState<'upload' | 'review'>('upload');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
    
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
    const [isLoadingTimeEntries, setIsLoadingTimeEntries] = useState(true);
    const [isProcessingCsv, setIsProcessingCsv] = useState(false); 
    const [isSaving, setIsSaving] = useState(false); 

    const [error, setError] = useState('');
    const [editEntry, setEditEntry] = useState<TimeEntry | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const scriptLoaded = useRef(false);

    useEffect(() => {
        if (!(window as any).Papa && !document.querySelector(`script[src="${PAPA_PARSE_URL}"]`)) {
            const script = document.createElement('script');
            script.src = PAPA_PARSE_URL;
            script.async = true;
            script.onload = () => { scriptLoaded.current = true; };
            script.onerror = () => { console.error("Failed to load PapaParse script"); setError("CSV Parser script failed to load.")}
            document.body.appendChild(script);
            return () => { if (script.parentNode) script.parentNode.removeChild(script); };
        } else if ((window as any).Papa) { 
            scriptLoaded.current = true; 
        }
    }, []);

    useEffect(() => {
        if (!currentUser) { // This check will always pass due to mock user in AppContext
            setEmployees([]);
            setIsLoadingEmployees(false);
            return;
        }
        setIsLoadingEmployees(true);
        const employeesColRef = collection(db, 'users', currentUser.uid, 'payrollEmployees');
        const unsubscribe = onSnapshot(employeesColRef, async (snapshot) => {
            if (snapshot.empty) {
                const batch = writeBatch(db);
                defaultEmployeesDataSeed.forEach(empData => {
                    const newEmpRef = doc(collection(db, 'users', currentUser.uid, 'payrollEmployees'));
                    batch.set(newEmpRef, empData);
                });
                try {
                    await batch.commit();
                } catch (e) {
                    console.error("Error seeding default employees:", e);
                    setError("Failed to set up initial employee data.");
                }
            } else {
                const fetchedEmployees = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Employee));
                setEmployees(fetchedEmployees);
            }
            setIsLoadingEmployees(false);
        }, (err) => {
            console.error("Error fetching employees:", err);
            setError("Failed to load employee data.");
            setIsLoadingEmployees(false);
        });
        return () => unsubscribe();
    }, [currentUser]);

    useEffect(() => {
        if (!currentUser) { // This check will always pass
            setTimeEntries([]);
            setIsLoadingTimeEntries(false);
            return;
        }
        setIsLoadingTimeEntries(true);
        const timeEntriesColRef = collection(db, 'users', currentUser.uid, 'payrollTimeEntries');
        const unsubscribe = onSnapshot(timeEntriesColRef, (snapshot) => {
            const fetchedEntries = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as TimeEntry));
            setTimeEntries(fetchedEntries);
            if (fetchedEntries.length > 0 && viewMode === 'upload' && !isLoadingEmployees && !isProcessingCsv) { 
                setViewMode('review');
            }
            setIsLoadingTimeEntries(false);
        }, (err) => {
            console.error("Error fetching time entries:", err);
            setError("Failed to load time entry data.");
            setIsLoadingTimeEntries(false);
        });
        return () => unsubscribe();
    }, [currentUser, viewMode, isLoadingEmployees, isProcessingCsv]);


    const handleUpdateEntry = async (updatedEntryData: Partial<TimeEntry>) => {
        if (!editEntry || !currentUser) return;
        setIsSaving(true);
        const currentEntry = timeEntries.find(e => e.id === editEntry.id);
        if (!currentEntry) {
             setIsSaving(false);
             setError("Original entry not found for update.");
             return;
        }

        const entryWithUpdates: TimeEntry = {
            ...currentEntry,
            date: updatedEntryData.date !== undefined ? updatedEntryData.date : currentEntry.date,
            clockIn: updatedEntryData.clockIn !== undefined ? updatedEntryData.clockIn : currentEntry.clockIn,
            clockOut: updatedEntryData.clockOut !== undefined ? updatedEntryData.clockOut : currentEntry.clockOut,
        };
        
        const validatedEntry = validateSingleEntry(entryWithUpdates); 
        
        try {
            const entryRef = doc(db, 'users', currentUser.uid, 'payrollTimeEntries', validatedEntry.id);
            await setDoc(entryRef, validatedEntry, { merge: true }); 
            setEditEntry(null); 
        } catch (e) {
            console.error("Error updating time entry:", e);
            setError("Failed to save changes. Please try again.");
        }
        setIsSaving(false);
    };

    const handleDeleteEntry = async (id: string) => {
        if (!currentUser) return;
        setIsSaving(true);
        try {
            const entryRef = doc(db, 'users', currentUser.uid, 'payrollTimeEntries', id);
            await deleteDoc(entryRef);
        } catch (e) {
            console.error("Error deleting time entry:", e);
            setError("Failed to delete entry. Please try again.");
        }
        setIsSaving(false);
    };
    
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) { setError('No file selected.'); return; }
        if (!scriptLoaded.current || typeof (window as any).Papa === 'undefined') {
            setError('CSV Parser not ready. Please try again in a moment.');
            return;
        }
        if (!currentUser) { // This check will always pass due to mock user
            setError('You must be logged in to upload files.'); // This message might not be seen.
            return;
        }
        if (employees.length === 0 && !isLoadingEmployees) {
            setError('Employee data is not loaded. Cannot process CSV.');
            return;
        }

        setIsProcessingCsv(true); setError('');
        
        (window as any).Papa.parse(file, {
            header: true, skipEmptyLines: true,
            complete: async (results: any) => {
                const parsedData = results.data as Record<string, string>[];
                const headers = (results.meta.fields || []).map((h: string) => h.toLowerCase());
                const isModern = headers.includes('time in') && headers.includes('time out') && headers.includes('date');
                const isLegacy = headers.includes('in date') && headers.includes('out date');

                if (!isModern && !isLegacy) {
                    setError('Could not determine CSV format. Headers might be missing or incorrect (Expected: "Date", "Time In", "Time Out" OR "In Date", "Out Date").');
                    setIsProcessingCsv(false);
                    return;
                }
                
                const newEntriesToValidate: Omit<TimeEntry, 'id' | 'status' | 'flags' | 'durationMinutes' | 'correctionMessage' | 'suggestedCorrectionIn' | 'suggestedCorrectionOut'>[] = parsedData.map(row => {
                    const normalizedRow = Object.fromEntries(Object.entries(row).map(([k, v]) => [k.toLowerCase(), v as string]));
                    const fullNameRaw = normalizedRow.employee;
                    if (!fullNameRaw || IGNORED_EMPLOYEE_NAMES.includes(fullNameRaw)) return null;
                    
                    let [firstName, ...lastNameParts] = fullNameRaw.includes(',') 
                        ? fullNameRaw.split(',').map(s => s.trim()).reverse() 
                        : fullNameRaw.split(' ');
                    const lastName = lastNameParts.join(' ');
                    
                    const employee = employees.find(e => e.firstName === firstName && e.lastName === lastName);
                    if (!employee) {
                        console.warn(`Employee not found, skipping entry: ${fullNameRaw}`);
                        return null; 
                    }

                    let date: string | null = null, clockIn: string | null = null, clockOut: string | null = null;

                    if (isModern) {
                        date = extractAndFormatDate(normalizedRow.date);
                        clockIn = parseTime(normalizedRow['time in']);
                        clockOut = parseTime(normalizedRow['time out']);
                    } else { 
                        const inDateTime = parseLegacyDateTime(normalizedRow['in date']);
                        const outDateTime = parseLegacyDateTime(normalizedRow['out date']);
                        date = inDateTime.date; 
                        clockIn = inDateTime.time;
                        clockOut = outDateTime.time;
                    }
                    
                    if (!date || !clockIn || !clockOut) {
                         console.warn("Skipping entry due to missing date/time:", {fullNameRaw, date, clockIn, clockOut});
                         return null; 
                    }

                    return {
                        employeeId: employee.id, date, clockIn, clockOut,
                        jobTitle: normalizedRow.job || normalizedRow['job title'] || 'N/A',
                        location: normalizedRow.location || 'N/A',
                    };
                }).filter((entry): entry is Omit<TimeEntry, 'id' | 'status' | 'flags' | 'durationMinutes' | 'correctionMessage' | 'suggestedCorrectionIn' | 'suggestedCorrectionOut'> => entry !== null);


                if (newEntriesToValidate.length === 0) {
                    setError("No valid time entries could be imported. Check CSV format and employee names.");
                } else {
                    const validatedEntries = newEntriesToValidate.map(validateSingleEntry);
                    const batch = writeBatch(db);
                    validatedEntries.forEach(entry => {
                        const entryRef = doc(collection(db, 'users', currentUser.uid, 'payrollTimeEntries'));
                        batch.set(entryRef, {...entry, id: entryRef.id}); 
                    });
                    try {
                        await batch.commit();
                        setViewMode('review'); 
                    } catch (e) {
                        console.error("Error saving new time entries to Firestore:", e);
                        setError("Failed to save imported time entries. Please try again.");
                    }
                }
                setIsProcessingCsv(false);
                if(fileInputRef.current) fileInputRef.current.value = ""; 
            },
            error: (err: any) => { setError(`CSV Parse Error: ${err.message}`); setIsProcessingCsv(false); }
        });
    };
    
    const sortedTimeEntries = useMemo(() => {
        return [...timeEntries].sort((a, b) => {
            const dateA = a.date || '';
            const dateB = b.date || '';
            if (dateA < dateB) return -1;
            if (dateA > dateB) return 1;
            return (a.clockIn || '').localeCompare(b.clockIn || '');
        });
    }, [timeEntries]);

    const [modalDate, setModalDate] = useState('');
    const [modalClockIn, setModalClockIn] = useState('');
    const [modalClockOut, setModalClockOut] = useState('');

    useEffect(() => {
        if (editEntry) {
            setModalDate(editEntry.date || '');
            setModalClockIn(editEntry.clockIn || '');
            setModalClockOut(editEntry.clockOut || '');
        }
    }, [editEntry]);

    // Since loadingAuth is now always false, this check is simplified
    // if (loadingAuth) { ... } 
    // The login prompt is removed as currentUser will always be the mock user.
    /*
    if (!currentUser) {
        return (
            <Card className="m-4 sm:m-8 lg:m-12">
                <CardHeader>
                    <CardTitle>Access Denied</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-slate-600 mb-4">Please log in to use the Payroll Runner.</p>
                    <Alert variant="default" className="text-left bg-sky-50 border-sky-200">
                        <Info className="h-5 w-5 text-sky-600" />
                        <AlertTitle className="text-sky-700">Developer Login</AlertTitle>
                        <AlertDescription className="text-sky-600">
                            For development, use the <code>devLogin('email', 'password')</code>
                            function available in the browser console.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }
    */
    
    const isLoading = isLoadingEmployees || isLoadingTimeEntries || loadingAuth; // loadingAuth is now always false

    const renderUploadSection = () => (
        <Card className="content-fade-in-up">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Manage Payroll with Confidence</CardTitle>
                <CardDescription className="text-lg text-slate-500 pt-1">Start by uploading a timeclock CSV file. We'll handle the rest.</CardDescription>
            </CardHeader>
            <CardContent className="max-w-xl mx-auto">
                 <label htmlFor="file-upload" className="relative block w-full h-48 border-2 border-dashed border-brand-slate-300 rounded-lg cursor-pointer hover:border-sky-500 transition-colors duration-200">
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                        <UploadCloud size={48} className="mb-2" />
                        <p className="mt-2 text-sm font-semibold">Click to upload or drag and drop</p>
                        <p className="text-xs">CSV files only</p>
                    </div>
                    <Input id="file-upload" ref={fileInputRef} type="file" className="opacity-0 w-full h-full absolute inset-0 cursor-pointer" accept=".csv" onChange={handleFileUpload} disabled={isProcessingCsv || isLoadingEmployees} />
                </label>
                {(isProcessingCsv || isLoading) && 
                    <div className="mt-4 text-center text-sky-600 font-semibold flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        {isProcessingCsv ? "Processing CSV..." : isLoadingEmployees ? "Loading employees..." : "Loading data..."}
                    </div>
                }
                {error && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                 <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full mt-6" 
                    onClick={() => setViewMode('review')}
                    disabled={timeEntries.length === 0 && !isLoadingTimeEntries}
                >
                    Go to Review Time Entries ({timeEntries.length})
                </Button>
            </CardContent>
        </Card>
    );

    const renderReviewSection = () => (
        <Card className="content-fade-in-up" style={{ animationDelay: '150ms' }}>
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <CardTitle className="text-2xl font-bold text-slate-900">Time Entry Review</CardTitle>
                    <Button variant="outline" onClick={() => { setViewMode('upload'); setError(''); }}>
                        <UploadCloud size={18} className="mr-2" /> Upload New File
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                     <div className="flex justify-center items-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
                        <p className="ml-3 text-slate-600">Loading Time Entries...</p>
                    </div>
                ) : (
                <div className="overflow-x-auto rounded-lg border border-brand-slate-200/80">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Date & Time</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Status & Message</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedTimeEntries.length > 0 ? sortedTimeEntries.map(entry => {
                                const employee = employees.find(e => e.id === entry.employeeId);
                                const isFlagged = entry.status === 'Flagged';
                                return (
                                <TableRow key={entry.id}>
                                    <TableCell>
                                        <div className="font-semibold text-slate-800">{employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown'}</div>
                                        <div className="text-xs text-slate-500">{entry.jobTitle} @ {entry.location}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div>{entry.date}</div>
                                        <div className="text-xs text-slate-500">{formatTime(entry.clockIn || undefined)} - {formatTime(entry.clockOut || undefined)}</div>
                                    </TableCell>
                                    <TableCell className="font-semibold">{formatDuration(entry.durationMinutes)}</TableCell>
                                    <TableCell className="max-w-xs">
                                        <div className="flex items-start gap-2">
                                            {isFlagged ? <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" /> : <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />}
                                            <div>
                                                <div className={`font-semibold ${isFlagged ? 'text-orange-600' : 'text-green-700'}`}>{entry.status}</div>
                                                {entry.correctionMessage && <p className="text-xs text-slate-500 whitespace-normal">{entry.correctionMessage}</p>}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => setEditEntry(entry)} aria-label="Edit entry" disabled={isSaving}>
                                                <FilePenLine className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteEntry(entry.id)} aria-label="Delete entry" disabled={isSaving}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                                );
                            }) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-16 text-slate-500">
                                        No time entries found for this user.
                                        <Button variant="link" className="ml-1" onClick={() => setViewMode('upload')}>Upload a file to get started.</Button>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                )}
            </CardContent>
        </Card>
    );
    
    const currentEditingEmployee = useMemo(() => {
        if (!editEntry) return null;
        return employees.find(e => e.id === editEntry.employeeId);
    }, [editEntry, employees]);


    return (
        <div className="space-y-8">
            {viewMode === 'upload' && renderUploadSection()}
            {viewMode === 'review' && renderReviewSection()}

            {editEntry && (
                <Dialog open={!!editEntry} onOpenChange={(isOpen) => !isOpen && setEditEntry(null)}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Edit Time Entry</DialogTitle>
                            <DialogDescription>
                                For {currentEditingEmployee ? `${currentEditingEmployee.firstName} ${currentEditingEmployee.lastName}` : 'Employee'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div>
                                <Label htmlFor="modal-date">Date</Label>
                                <Input id="modal-date" type="date" value={modalDate} onChange={e => setModalDate(e.target.value)} />
                            </div>
                            <div>
                                <Label htmlFor="modal-clockIn">Clock In (24hr format HH:mm)</Label>
                                <Input id="modal-clockIn" type="time" step="60" value={modalClockIn} onChange={e => setModalClockIn(e.target.value)} />
                            </div>
                            <div>
                                <Label htmlFor="modal-clockOut">Clock Out (24hr format HH:mm)</Label>
                                <Input id="modal-clockOut" type="time" step="60" value={modalClockOut} onChange={e => setModalClockOut(e.target.value)} />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline" disabled={isSaving}>Cancel</Button>
                            </DialogClose>
                            <Button 
                                type="button" 
                                onClick={() => handleUpdateEntry({ date: modalDate, clockIn: modalClockIn, clockOut: modalClockOut })}
                                disabled={isSaving}
                            >
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default PayrollRunnerPage;
