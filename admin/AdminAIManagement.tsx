import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { UploadCloud, Bot, Loader2, UserCheck, UserX, FileText, Type, UserPlus, UserCog } from 'lucide-react';
import type { User } from '../types';

const AdminAIManagement: React.FC = () => {
    const { users, addUser, updateUser } = useData();
    const [mode, setMode] = useState<'upload' | 'manual'>('upload');
    const [fileName, setFileName] = useState<string | null>(null);
    const [manualInput, setManualInput] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<{
        created: User[],
        updated: { user: User, changes: string[] }[],
        activated: User[],
        deactivated: User[]
    } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const allowedTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
                'application/pdf',
            ];
            if (allowedTypes.includes(file.type)) {
                setFileName(file.name);
                setError(null);
                setAnalysisResult(null);
            } else {
                setError('Invalid file type. Please upload an Excel, Word, or PDF document.');
                setFileName(null);
            }
        }
    };
    
    const handleAnalyze = () => {
        setIsAnalyzing(true);
        setAnalysisResult(null);
        setError(null);
        
        // --- AI Simulation ---
        setTimeout(() => {
            let staffDataFromInput: { identifier: string; name?: string; role?: 'employee' | 'driver' }[] = [];
            
            if (mode === 'upload') {
                if (!fileName) {
                    setError("Please select a file to analyze.");
                    setIsAnalyzing(false);
                    return;
                }
                // Simulate AI parsing a file. It finds two staff members.
                // One is existing (Ravi), one is new (Priya). Suresh is not on the list.
                staffDataFromInput = [
                    { identifier: '8888888888', name: 'Ravi Kumar', role: 'employee' }, // Existing
                    { identifier: '7777777777', name: 'Priya Sharma', role: 'driver' } // New
                ];

            } else { // Manual mode
                 if (!manualInput.trim()) {
                    setError("Please enter staff data.");
                    setIsAnalyzing(false);
                    return;
                }
                 // Parse manual input: mobile, name, role
                staffDataFromInput = manualInput
                    .split('\n')
                    .map(line => line.trim())
                    .filter(line => line.length > 0)
                    .map(line => {
                        const parts = line.split(',').map(p => p.trim());
                        const identifier = parts[0].replace(/\D/g, '');
                        if (identifier.length < 10) return null; // Basic validation
                        
                        let role: 'employee' | 'driver' = 'employee';
                        if (parts[2]?.toLowerCase() === 'driver') {
                            role = 'driver';
                        }

                        return {
                            identifier: identifier.slice(0, 10),
                            name: parts[1] || undefined,
                            role: role
                        };
                    })
                    .filter((item): item is { identifier: string; name?: string; role: 'employee' | 'driver' } => item !== null);
            }

            if (staffDataFromInput.length === 0) {
                setError("No valid staff data found in the input.");
                setIsAnalyzing(false);
                return;
            }

            const inputIdentifiers = new Set(staffDataFromInput.map(s => s.identifier));
            const allStaff = users.filter(u => u.role === 'employee' || u.role === 'driver');
            
            const results = {
                created: [] as User[],
                updated: [] as { user: User, changes: string[] }[],
                activated: [] as User[],
                deactivated: [] as User[]
            };

            // Process staff from the input list (create, update, activate)
            staffDataFromInput.forEach(inputStaff => {
                const existingUser = users.find(u => u.identifier === inputStaff.identifier);

                if (existingUser) { // User exists: check for updates or reactivation
                    const changes: string[] = [];
                    let updatedUser = { ...existingUser };

                    if (inputStaff.name && inputStaff.name !== existingUser.name) {
                        changes.push(`Name changed to "${inputStaff.name}"`);
                        updatedUser.name = inputStaff.name;
                    }
                    
                    if (inputStaff.role && inputStaff.role !== existingUser.role) {
                         changes.push(`Role changed to "${inputStaff.role}"`);
                         updatedUser.role = inputStaff.role;
                    }

                    if (existingUser.status === 'blocked') {
                        updatedUser.status = 'active';
                        results.activated.push(updatedUser);
                    }
                    
                    if (changes.length > 0) {
                        results.updated.push({ user: updatedUser, changes });
                    }

                    if (changes.length > 0 || existingUser.status === 'blocked') {
                        updateUser(updatedUser);
                    }

                } else { // User does not exist: create them
                    const newUser: User = {
                        name: inputStaff.name || `Staff ${inputStaff.identifier.slice(-4)}`,
                        householdId: `${inputStaff.role === 'driver' ? 'DRV' : 'EMP'}-${inputStaff.identifier.slice(-4)}-${Date.now().toString().slice(-4)}`,
                        identifier: inputStaff.identifier,
                        password: `password${Math.floor(1000 + Math.random() * 9000)}`, // Random temp password
                        role: inputStaff.role || 'employee',
                        status: 'active',
                        createdAt: new Date(),
                        outstandingBalance: 0,
                        familySize: 1, // Default for staff
                        address: { area: 'N/A', landmark: 'N/A', pincode: 'N/A' },
                    };
                    addUser(newUser);
                    results.created.push(newUser);
                }
            });
            
            // Process existing staff not on the input list (deactivate)
            allStaff.forEach(staffMember => {
                if (!inputIdentifiers.has(staffMember.identifier)) {
                    if (staffMember.status !== 'blocked') {
                        const deactivatedUser = { ...staffMember, status: 'blocked' as 'blocked' };
                        updateUser(deactivatedUser);
                        results.deactivated.push(deactivatedUser);
                    }
                }
            });

            setAnalysisResult(results);
            setIsAnalyzing(false);
        }, 2000); // 2 second simulation
    };
    
    const isAnalyzeDisabled = isAnalyzing || (mode === 'upload' && !fileName) || (mode === 'manual' && !manualInput.trim());

    return (
        <div className="animate-fade-in-up">
            <h1 className="text-3xl font-bold text-heading-light dark:text-heading-dark mb-2">AI Staff Management</h1>
            <p className="text-text-light dark:text-text-dark mb-6">Use AI to analyze a staff roster and automatically create, update, and manage system access for employees and drivers.</p>
            
            <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-md">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center justify-center p-1 rounded-full bg-slate-100 dark:bg-slate-700 mb-6">
                        <button onClick={() => setMode('upload')} className={`w-1/2 p-2 rounded-full font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${mode === 'upload' ? 'bg-white dark:bg-slate-800 shadow text-primary' : 'text-slate-500'}`}><FileText size={16} /> Upload File</button>
                        <button onClick={() => setMode('manual')} className={`w-1/2 p-2 rounded-full font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${mode === 'manual' ? 'bg-white dark:bg-slate-800 shadow text-primary' : 'text-slate-500'}`}><Type size={16} /> Manual Entry</button>
                    </div>
                    
                    {mode === 'upload' ? (
                        <div className="animate-fade-in">
                            <label htmlFor="file-upload" className="cursor-pointer block w-full p-8 text-center border-2 border-dashed border-border-light dark:border-border-dark rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
                                <span className="mt-2 block text-sm font-semibold text-primary">
                                    {fileName ? `Selected: ${fileName}` : 'Upload a document'}
                                </span>
                                <p className="mt-1 block text-xs text-text-light dark:text-text-dark">XLSX, DOCX, or PDF</p>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".xlsx,.docx,.pdf" />
                            </label>
                        </div>
                    ) : (
                         <div className="animate-fade-in">
                            <textarea
                                value={manualInput}
                                onChange={(e) => setManualInput(e.target.value)}
                                rows={6}
                                className="w-full p-3 border border-border-light dark:border-border-dark bg-background-light dark:bg-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                                placeholder="Enter one staff member per line.&#10;Format: mobile_number, full_name, role&#10;Example: 9876543210, John Doe, driver"
                            />
                        </div>
                    )}

                    {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
                    
                    <div className="mt-6 text-center">
                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzeDisabled}
                            className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent text-white font-bold py-3 px-8 rounded-lg flex items-center justify-center text-lg shadow-lg hover:shadow-glow-primary transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="animate-spin mr-3" /> Analyzing...
                                </>
                            ) : (
                                <>
                                    <Bot className="mr-3" /> Analyze & Update Roster
                                </>
                            )}
                        </button>
                    </div>

                    {analysisResult && (
                        <div className="mt-8 border-t border-border-light dark:border-border-dark pt-6 animate-fade-in">
                            <h3 className="text-xl font-bold text-heading-light dark:text-heading-dark text-center mb-4">Analysis Complete</h3>
                            <div className="space-y-4">
                                <div className="bg-blue-500/10 p-4 rounded-lg">
                                    <h4 className="font-semibold text-blue-700 dark:text-blue-300 flex items-center">
                                        <UserPlus className="mr-2"/> New Staff Created ({analysisResult.created.length})
                                    </h4>
                                    {analysisResult.created.length > 0 ? (
                                        <ul className="list-disc pl-5 mt-2 text-sm text-blue-800 dark:text-blue-200">
                                            {analysisResult.created.map(u => <li key={u.householdId}>{u.name} ({u.identifier}) - Role: {u.role}</li>)}
                                        </ul>
                                    ) : <p className="text-sm text-blue-800 dark:text-blue-200 mt-2">No new staff members were created.</p>}
                                </div>

                                <div className="bg-yellow-500/10 p-4 rounded-lg">
                                    <h4 className="font-semibold text-yellow-700 dark:text-yellow-300 flex items-center">
                                        <UserCog className="mr-2"/> Staff Details Updated ({analysisResult.updated.length})
                                    </h4>
                                    {analysisResult.updated.length > 0 ? (
                                        <ul className="space-y-1 mt-2 text-sm text-yellow-800 dark:text-yellow-200">
                                            {analysisResult.updated.map(item => (
                                                <li key={item.user.householdId}>
                                                    <span className="font-semibold">{item.user.name}</span>: {item.changes.join(', ')}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-2">No staff details were updated.</p>}
                                </div>

                                <div className="bg-green-500/10 p-4 rounded-lg">
                                    <h4 className="font-semibold text-green-700 dark:text-green-300 flex items-center">
                                        <UserCheck className="mr-2"/> Access Granted / Re-enabled ({analysisResult.activated.length})
                                    </h4>
                                    {analysisResult.activated.length > 0 ? (
                                        <ul className="list-disc pl-5 mt-2 text-sm text-green-800 dark:text-green-200">
                                            {analysisResult.activated.map(u => <li key={u.householdId}>{u.name} ({u.identifier})</li>)}
                                        </ul>
                                    ) : <p className="text-sm text-green-800 dark:text-green-200 mt-2">No staff required activation.</p>}
                                </div>

                                <div className="bg-red-500/10 p-4 rounded-lg">
                                    <h4 className="font-semibold text-red-700 dark:text-red-300 flex items-center">
                                        <UserX className="mr-2"/> Access Revoked ({analysisResult.deactivated.length})
                                    </h4>
                                     {analysisResult.deactivated.length > 0 ? (
                                        <ul className="list-disc pl-5 mt-2 text-sm text-red-800 dark:text-red-200">
                                            {analysisResult.deactivated.map(u => <li key={u.householdId}>{u.name} ({u.identifier})</li>)}
                                        </ul>
                                    ) : <p className="text-sm text-red-800 dark:text-red-200 mt-2">No staff required deactivation.</p>}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminAIManagement;