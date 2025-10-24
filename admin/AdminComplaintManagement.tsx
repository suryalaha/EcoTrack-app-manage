import React, { useState } from 'react';
import type { Complaint, User } from '../types';
import { Eye } from 'lucide-react';

interface AdminComplaintManagementProps {
    complaints: Complaint[];
    users: User[];
    updateComplaint: (complaint: Complaint) => void;
}

const AdminComplaintManagement: React.FC<AdminComplaintManagementProps> = ({ complaints, users, updateComplaint }) => {
    const [viewingComplaint, setViewingComplaint] = useState<Complaint | null>(null);

    const getUserName = (householdId: string) => {
        return users.find(u => u.householdId === householdId)?.name || householdId;
    }

    const handleStatusChange = (complaint: Complaint, newStatus: Complaint['status']) => {
        updateComplaint({ ...complaint, status: newStatus });
    }
    
    const getStatusColor = (status: Complaint['status']) => {
        switch (status) {
            case 'Pending': return 'bg-warning/10 text-warning-dark dark:bg-warning/20 dark:text-warning border-warning';
            case 'In Progress': return 'bg-info/10 text-info-dark dark:bg-info/20 dark:text-info border-info';
            case 'Resolved': return 'bg-success/10 text-success-dark dark:bg-success/20 dark:text-success border-success';
        }
    }

    return (
        <div className="animate-fade-in-up">
            <h1 className="text-3xl font-bold text-heading-light dark:text-heading-dark mb-6">Complaint Management</h1>
            <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-border-light dark:border-border-dark">
                        <tr>
                            <th className="p-4 font-semibold text-text-light dark:text-text-dark">Date</th>
                            <th className="p-4 font-semibold text-text-light dark:text-text-dark">User</th>
                            <th className="p-4 font-semibold text-text-light dark:text-text-dark">Issue</th>
                            <th className="p-4 font-semibold text-text-light dark:text-text-dark">Status</th>
                            <th className="p-4 font-semibold text-text-light dark:text-text-dark text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {complaints.map((complaint, index) => (
                             <tr key={complaint.id} className={`border-b border-border-light dark:border-border-dark ${index % 2 === 0 ? 'bg-transparent' : 'bg-slate-50/50 dark:bg-slate-800/20'}`}>
                                <td className="p-4 text-text-light dark:text-text-dark">{complaint.date.toLocaleDateString()}</td>
                                <td className="p-4 text-heading-light dark:text-heading-dark">{getUserName(complaint.householdId)}</td>
                                <td className="p-4 text-text-light dark:text-text-dark">{complaint.issue}</td>
                                <td className="p-4">
                                     <select 
                                        value={complaint.status} 
                                        onChange={(e) => handleStatusChange(complaint, e.target.value as Complaint['status'])}
                                        className={`text-xs font-bold px-2 py-1 rounded-full border bg-transparent ${getStatusColor(complaint.status)}`}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Resolved">Resolved</option>
                                    </select>
                                </td>
                                <td className="p-4 text-center">
                                    <button onClick={() => setViewingComplaint(complaint)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-primary rounded-full transition" title="View Details">
                                        <Eye size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {complaints.length === 0 && <p className="p-4 text-center text-text-light dark:text-text-dark">No complaints found.</p>}
            </div>

            {viewingComplaint && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-2xl w-full max-w-lg relative transform transition-all animate-scale-in">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-heading-light dark:text-heading-dark mb-1">Complaint Details</h3>
                            <p className="text-sm font-mono text-slate-400 mb-4">ID: {viewingComplaint.id}</p>
                             <div className="space-y-4 text-text-light dark:text-text-dark">
                                <p><strong className="font-semibold text-heading-light dark:text-heading-dark">User:</strong> {getUserName(viewingComplaint.householdId)}</p>
                                <p><strong className="font-semibold text-heading-light dark:text-heading-dark">Issue:</strong> {viewingComplaint.issue}</p>
                                <p><strong className="font-semibold text-heading-light dark:text-heading-dark">Details:</strong></p>
                                <p className="p-3 bg-slate-100 dark:bg-slate-800 rounded-md text-sm">{viewingComplaint.details}</p>
                                {viewingComplaint.photo && (
                                    <div>
                                        <strong className="font-semibold text-heading-light dark:text-heading-dark">Attached Photo:</strong>
                                        <img src={viewingComplaint.photo} alt="Complaint attachment" className="mt-2 rounded-md border border-border-light dark:border-border-dark max-h-64 w-auto"/>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 flex justify-end rounded-b-xl">
                            <button onClick={() => setViewingComplaint(null)} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 font-semibold">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminComplaintManagement;
