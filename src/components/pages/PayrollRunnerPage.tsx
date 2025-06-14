
"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UploadCloud, AlertTriangle, CheckCircle2, FilePenLine, Trash2 } from 'lucide-react';
import { useAppContext } from '@/context/AppContext'; // To potentially set page title or breadcrumbs later

// --- Papa Parse Script URL ---
const PAPA_PARSE_URL = "https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js";

// --- localStorage Keys ---
const LOCAL_STORAGE_KEYS = {
    EMPLOYEES: 'payrollRunnerEmployees_v1.1.0', // Renamed
    TIME_ENTRIES: 'payrollRunnerTimeEntries_v1.1.0', // Renamed
};

// --- Helper to generate a unique ID ---
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

// --- Default Employee Data (TODO: Move to Firestore) ---
const defaultEmployeesData = [
    { id: generateId(), firstName: 'Rylie', lastName: 'Bauman', gustoId: '69D61F', giftCardNumber: '8627358676938937' },
    { id: generateId(), firstName: 'Lauren', lastName: 'Callahan', gustoId: '537DE5', giftCardNumber: '8627335609819194' },
    { id: generateId(), firstName: 'Macy', lastName: 'Compton', gustoId: '73E0EE', giftCardNumber: '8627862991882928' },
    { id: generateId(), firstName: 'Delaney', lastName: 'Darnell', gustoId: 'E42C1D', giftCardNumber: '8627819700302374' },
    { id: generateId(), firstName: 'Jess', lastName: 'Dexter', gustoId: 'CP33RY', giftCardNumber: '8627657078851584' },
    { id: generateId(), firstName: 'Angela', lastName: 'Earl', gustoId: 'JYFNBI', giftCardNumber: '8627847438717852' },
    { id: generateId(), firstName: 'Emma', lastName: 'Earl', gustoId: 'KR92M5', giftCardNumber: '8627954378639284' },
    { id: generateId(), firstName: 'Kelsey', lastName: 'Frost', gustoId: 'YT14BZ', giftCardNumber: '8627311200551569' },
    { id: generateId(), firstName: 'AJ', lastName: 'Gieb', gustoId: 'ROCGJB', giftCardNumber: '8627670241783022' },
    { id: generateId(), firstName: 'Skyla', lastName: 'Harr', gustoId: 'FCD1C3', giftCardNumber: '8627583977891200' },
    { id: generateId(), firstName: 'Hannah', lastName: 'Minton', gustoId: '0D76C6', giftCardNumber: '8627351171154894' },
    { id: generateId(), firstName: 'Jessica', lastName: 'Solis', gustoId: 'B47406', giftCardNumber: '8627472503745165' },
    { id: generateId(), firstName: 'Trace', lastName: 'Thomas', gustoId: 'ABEE32', giftCardNumber: '8627335447542875' },
    { id: generateId(), firstName: 'Abigail', lastName: 'Wolfe', gustoId: 'D8EB5E', giftCardNumber: '8627708778705131' },
    { id: generateId(), firstName: 'Ellee', lastName: 'Reeves', gustoId: 'REEV15', giftCardNumber: '' },
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
    if (ampm === 'AM' && hours === 12) hours = 0; // Midnight case
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const parseDateString = (dateStr?: string): Date | null => {
    if (!dateStr) return null;
    // Try "Month Day, Year" format first (e.g., "January 1, 2023")
    let match = dateStr.match(/([a-zA-Z]{3,})\s(\d{1,2}),\s(\d{4})/);
    if (match) {
        const d = new Date(dateStr); // Standard Date constructor handles this format well
        return isNaN(d.getTime()) ? null : d;
    }
    // Try "M/D/YY" or "M/D/YYYY" format (e.g., "1/1/23" or "01/01/2023")
    match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
    if (match) {
        const month = parseInt(match[1], 10) - 1; // JS months are 0-indexed
        const day = parseInt(match[2], 10);
        let year = parseInt(match[3], 10);
        if (year < 100) { // Handle 2-digit year
            year += 2000; // Assume 21st century
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
    return `${year}-${month}-${day}`; // YYYY-MM-DD
};


const parseLegacyDateTime = (dateTimeStr?: string): { date: string | null; time: string | null } => {
    if (!dateTimeStr) return { date: null, time: null };
    const parts = dateTimeStr.trim().split(/\s+/);
    if (parts.length < 2) return { date: null, time: null }; // Need at least date and time part
    // Assume first part is date, rest is time
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

    // Handle overnight shifts (e.g., clock out is on the next day)
    if (totalOutMinutes < totalInMinutes) {
        totalOutMinutes += 24 * 60; // Add 24 hours in minutes
    }
    return totalOutMinutes - totalInMinutes;
};

const formatDuration = (minutes?: number): string => {
    if (minutes === null || minutes === undefined || isNaN(minutes)) return 'Invalid';
    return `${Math.floor(minutes / 60)}h ${Math.round(minutes % 60)}m`;
};


// --- Shift Definitions & Validation (TODO: Move to Firestore/Settings page) ---
const SHIFT_DEFINITIONS: Record<string, Record<string, { in: string; out: string }[]>> = {
    'Canyon': {
        'Mon-Fri': [{ in: '06:30', out: '10:00' }, { in: '10:00', out: '14:30' }, { in: '14:30', out: '18:00' }],
        'Sat-Sun': [{ in: '06:30', out: '11:00' }, { in: '11:00', out: '14:30' }, { in: '14:30', out: '18:00' }]
    },
    'Polk Street': { // Assuming 'Polk Street' is a common way to refer to the location
        'Mon-Fri': [{ in: '06:45', out: '11:00' }, { in: '11:00', out: '15:00' }],
        'Sat-Sun': [{ in: '06:45', out: '11:00' }, { in: '11:00', out: '15:00' }]
    }
};

interface TimeEntry {
    id: string;
    employeeId: string;
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
    id: string;
    firstName: string;
    lastName: string;
    gustoId: string;
    giftCardNumber: string;
}


const validateSingleEntry = (entry: TimeEntry): TimeEntry => {
    let flags: string[] = [...entry.flags];
    let status: 'Pending' | 'Approved' | 'Flagged' = 'Approved';
    let correctionMessage = entry.correctionMessage || '';
    let suggestedCorrectionIn = entry.suggestedCorrectionIn || null;
    let suggestedCorrectionOut = entry.suggestedCorrectionOut || null;
    
    let durationMinutes = calculateDurationInMinutes(entry.clockIn || undefined, entry.clockOut || undefined);

    const { clockIn, clockOut, date, location } = entry;

    if (!date) {
        flags.push('INVALID_DATE');
        status = 'Flagged';
        correctionMessage = 'Missing or invalid date.';
    } else if (!clockIn || !clockOut) {
        flags.push('MISSING_TIME');
        status = 'Flagged';
        correctionMessage = `Missing ${!clockIn ? 'clock-in' : 'clock-out'}.`;
    }
    
    // If already flagged for basic missing data, return early
    if (status === 'Flagged' && flags.includes('INVALID_DATE') || flags.includes('MISSING_TIME')) {
        return { ...entry, durationMinutes, status, flags, correctionMessage, suggestedCorrectionIn, suggestedCorrectionOut };
    }
    
    // Auto-clock-out detection logic (e.g., Square's default 4 AM clock-out)
    if (clockOut === '04:00' && durationMinutes > 0 && date) { // Ensure date is valid for dayOfWeek calculation
        flags.push('AUTO_CLOCK_OUT');
        status = 'Flagged';
        
        const dateObj = parseDateString(date);
        if (dateObj) {
            const dayOfWeek = dateObj.getDay(); // 0 for Sunday, 6 for Saturday
            const dayType = (dayOfWeek === 0 || dayOfWeek === 6) ? 'Sat-Sun' : 'Mon-Fri';
            
            // Determine location key robustly
            let locationKey = 'Canyon'; // Default
            if (location && location.toLowerCase().includes('polk')) {
                locationKey = 'Polk Street';
            }
            
            const locationShiftDefs = SHIFT_DEFINITIONS[locationKey]?.[dayType] || [];
            const lastShiftDef = locationShiftDefs.length > 0 ? locationShiftDefs[locationShiftDefs.length - 1].out : '18:00'; // Default close time
            
            suggestedCorrectionOut = lastShiftDef;
            correctionMessage = `Auto-clock-out detected. Suggested clock-out: ${formatTime(suggestedCorrectionOut)}. Original duration: ${formatDuration(durationMinutes)}.`;
            // Recalculate duration based on suggested time if clockIn is valid
             if(clockIn) {
                durationMinutes = calculateDurationInMinutes(clockIn, suggestedCorrectionOut);
             }
        } else {
            correctionMessage = 'Auto-clock-out detected, but could not determine day of week to suggest correction.';
        }
    }

    if (flags.length > 0 && status !== 'Flagged') { // Ensure status is Flagged if any flags exist
      status = 'Flagged';
    }
    
    return { ...entry, durationMinutes, status, flags, correctionMessage, suggestedCorrectionIn, suggestedCorrectionOut };
};


const PayrollRunnerPage = ({ pageId }: { pageId: string }) => {
    const [viewMode, setViewMode] = useState<'upload' | 'review'>('upload');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [editEntry, setEditEntry] = useState<TimeEntry | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const scriptLoaded = useRef(false);

    useEffect(() => {
        // Load PapaParse script
        if (!(window as any).Papa && !document.querySelector(`script[src="${PAPA_PARSE_URL}"]`)) {
            const script = document.createElement('script');
            script.src = PAPA_PARSE_URL;
            script.async = true;
            script.onload = () => { scriptLoaded.current = true; };
            script.onerror = () => { console.error("Failed to load PapaParse script"); setError("CSV Parser script failed to load.")}
            document.body.appendChild(script);
        } else if ((window as any).Papa) { 
            scriptLoaded.current = true; 
        }
        
        // Load data from localStorage (TODO: Replace with Firestore)
        try {
            const loadedEmployees = localStorage.getItem(LOCAL_STORAGE_KEYS.EMPLOYEES);
            setEmployees(loadedEmployees ? JSON.parse(loadedEmployees) : defaultEmployeesData);
            const loadedEntries = localStorage.getItem(LOCAL_STORAGE_KEYS.TIME_ENTRIES);
            if(loadedEntries) {
                const parsedEntries: TimeEntry[] = JSON.parse(loadedEntries);
                setTimeEntries(parsedEntries);
                if (parsedEntries.length > 0) {
                    setViewMode('review');
                }
            }
        } catch(e) { console.error("Error loading data from localStorage", e); setError("Failed to load saved data."); }
    }, []);

    // Persist data to localStorage on change (TODO: Replace with Firestore)
    useEffect(() => { localStorage.setItem(LOCAL_STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees)); }, [employees]);
    useEffect(() => { localStorage.setItem(LOCAL_STORAGE_KEYS.TIME_ENTRIES, JSON.stringify(timeEntries)); }, [timeEntries]);

    const handleUpdateEntry = (updatedEntryData: Partial<TimeEntry>) => {
        if (!editEntry) return;
        const currentEntry = timeEntries.find(e => e.id === editEntry.id);
        if (!currentEntry) return;

        // Create a new object for the updated entry
        const entryWithUpdates: TimeEntry = {
            ...currentEntry,
            date: updatedEntryData.date !== undefined ? updatedEntryData.date : currentEntry.date,
            clockIn: updatedEntryData.clockIn !== undefined ? updatedEntryData.clockIn : currentEntry.clockIn,
            clockOut: updatedEntryData.clockOut !== undefined ? updatedEntryData.clockOut : currentEntry.clockOut,
        };

        const validatedEntry = validateSingleEntry(entryWithUpdates);
        setTimeEntries(prev => prev.map(e => e.id === validatedEntry.id ? validatedEntry : e));
        setEditEntry(null); // Close modal
    };

    const handleDeleteEntry = (id: string) => {
        setTimeEntries(prev => prev.filter(e => e.id !== id));
    };
    
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) { setError('No file selected.'); return; }
        if (!scriptLoaded.current || typeof (window as any).Papa === 'undefined') {
            setError('CSV Parser not ready. Please try again in a moment.');
            return;
        }

        setIsProcessing(true); setError('');
        
        (window as any).Papa.parse(file, {
            header: true, skipEmptyLines: true,
            complete: (results: any) => {
                const parsedData = results.data as Record<string, string>[];
                const headers = (results.meta.fields || []).map((h: string) => h.toLowerCase());
                const isModern = headers.includes('time in') && headers.includes('time out') && headers.includes('date');
                const isLegacy = headers.includes('in date') && headers.includes('out date'); // Legacy typically had date embedded

                if (!isModern && !isLegacy) {
                    setError('Could not determine CSV format. Headers might be missing or incorrect (Expected: "Date", "Time In", "Time Out" OR "In Date", "Out Date").');
                    setIsProcessing(false);
                    return;
                }
                
                const newEntries: TimeEntry[] = parsedData.map(row => {
                    const normalizedRow = Object.fromEntries(Object.entries(row).map(([k, v]) => [k.toLowerCase(), v as string]));
                    const fullNameRaw = normalizedRow.employee;
                    if (!fullNameRaw || IGNORED_EMPLOYEE_NAMES.includes(fullNameRaw)) return null;
                    
                    let [firstName, ...lastNameParts] = fullNameRaw.includes(',') 
                        ? fullNameRaw.split(',').map(s => s.trim()).reverse() // Handles "LastName, FirstName"
                        : fullNameRaw.split(' ');
                    const lastName = lastNameParts.join(' ');
                    
                    const employee = employees.find(e => e.firstName === firstName && e.lastName === lastName);
                    if (!employee) return null; // Skip if employee not found

                    let date: string | null = null, clockIn: string | null = null, clockOut: string | null = null;

                    if (isModern) {
                        date = extractAndFormatDate(normalizedRow.date);
                        clockIn = parseTime(normalizedRow['time in']);
                        clockOut = parseTime(normalizedRow['time out']);
                    } else { // Legacy Format
                        const inDateTime = parseLegacyDateTime(normalizedRow['in date']);
                        const outDateTime = parseLegacyDateTime(normalizedRow['out date']);
                        date = inDateTime.date; // Use in-date as the primary date for the shift
                        clockIn = inDateTime.time;
                        clockOut = outDateTime.time;
                         // If outDateTime.date exists and is different, it might indicate an overnight shift,
                         // but our duration calculation handles this. We mainly care about the start date of the shift.
                    }
                    
                    // Basic validation for date, clockIn, clockOut before creating entry
                    if (!date || !clockIn || !clockOut) {
                         console.warn("Skipping entry due to missing date/time:", {fullNameRaw, date, clockIn, clockOut});
                         return null; // Skip entries with missing critical time info
                    }

                    return {
                        id: generateId(), employeeId: employee.id, date, clockIn, clockOut,
                        jobTitle: normalizedRow.job || normalizedRow['job title'] || 'N/A',
                        location: normalizedRow.location || 'N/A',
                        status: 'Pending', flags: [], // Initial status
                    };
                }).filter((entry): entry is TimeEntry => entry !== null);


                if (newEntries.length === 0) {
                    setError("No valid time entries could be imported. Check CSV format and employee names.");
                } else {
                    setTimeEntries(newEntries.map(validateSingleEntry));
                    setViewMode('review');
                }
                setIsProcessing(false);
                if(fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
            },
            error: (err: any) => { setError(`CSV Parse Error: ${err.message}`); setIsProcessing(false); }
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

    // Temporary state for modal inputs
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
                    <Input id="file-upload" ref={fileInputRef} type="file" className="opacity-0 w-full h-full absolute inset-0 cursor-pointer" accept=".csv" onChange={handleFileUpload} />
                </label>
                {isProcessing && <p className="mt-4 text-center text-sky-600 font-semibold">Processing...</p>}
                {error && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );

    const renderReviewSection = () => (
        <Card className="content-fade-in-up" style={{ animationDelay: '150ms' }}>
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <CardTitle className="text-2xl font-bold text-slate-900">Time Entry Review</CardTitle>
                    <Button variant="outline" onClick={() => { setViewMode('upload'); setError(''); setTimeEntries([]); /* Clear entries to allow re-upload */ }}>
                        <UploadCloud size={18} className="mr-2" /> Upload New File
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
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
                                            <Button variant="ghost" size="icon" onClick={() => setEditEntry(entry)} aria-label="Edit entry">
                                                <FilePenLine className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteEntry(entry.id)} aria-label="Delete entry">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                                );
                            }) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-16 text-slate-500">
                                        No time entries loaded.
                                        <Button variant="link" className="ml-1" onClick={() => setViewMode('upload')}>Upload a file to get started.</Button>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                 {/* TODO: Add Export to Gusto CSV button here */}
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
                                <Button type="button" variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button 
                                type="button" 
                                onClick={() => handleUpdateEntry({ date: modalDate, clockIn: modalClockIn, clockOut: modalClockOut })}
                            >
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
            {/* TODO: Add a section for managing employees (add, edit, delete) - separate component/modal */}
            {/* TODO: Add a settings section for shift definitions - separate component/modal */}
        </div>
    );
};

export default PayrollRunnerPage;


    