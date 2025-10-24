import React from 'react';
import type { Booking, User } from '../types';
import { Check, Clock, Edit } from 'lucide-react';

interface AdminBookingManagementProps {
    bookings: Booking[];
    users: User[];
    updateBooking: (booking: Booking) => void;
}

const AdminBookingManagement: React.FC<AdminBookingManagementProps> = ({ bookings, users, updateBooking }) => {
    
    const getUserName = (householdId: string) => {
        return users.find(u => u.householdId === householdId)?.name || householdId;
    }

    const handleStatusChange = (booking: Booking, newStatus: Booking['status']) => {
        updateBooking({ ...booking, status: newStatus });
    }
    
    const getStatusChip = (status: Booking['status']) => {
        if (status === 'Scheduled') {
            return <div className="flex items-center text-xs font-semibold text-info bg-info/10 dark:bg-info/20 px-2 py-1 rounded-full"><Clock size={12} className="mr-1"/>{status}</div>
        }
        return <div className="flex items-center text-xs font-semibold text-success bg-success/10 dark:bg-success/20 px-2 py-1 rounded-full"><Check size={12} className="mr-1"/>{status}</div>
    }

    return (
        <div className="animate-fade-in-up">
            <h1 className="text-3xl font-bold text-heading-light dark:text-heading-dark mb-6">Booking Management</h1>
            <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-border-light dark:border-border-dark">
                        <tr>
                            <th className="p-4 font-semibold text-text-light dark:text-text-dark">Booking ID</th>
                            <th className="p-4 font-semibold text-text-light dark:text-text-dark">User</th>
                            <th className="p-4 font-semibold text-text-light dark:text-text-dark">Date</th>
                            <th className="p-4 font-semibold text-text-light dark:text-text-dark">Waste Type</th>
                            <th className="p-4 font-semibold text-text-light dark:text-text-dark">Status</th>
                            <th className="p-4 font-semibold text-text-light dark:text-text-dark text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((booking, index) => (
                             <tr key={booking.id} className={`border-b border-border-light dark:border-border-dark ${index % 2 === 0 ? 'bg-transparent' : 'bg-slate-50/50 dark:bg-slate-800/20'}`}>
                                <td className="p-4 text-text-light dark:text-text-dark font-mono text-xs">{booking.id}</td>
                                <td className="p-4 text-heading-light dark:text-heading-dark">{getUserName(booking.householdId)}</td>
                                <td className="p-4 text-text-light dark:text-text-dark">{new Date(booking.date).toLocaleDateString(undefined, { timeZone: 'UTC' })}</td>
                                <td className="p-4 text-text-light dark:text-text-dark">{booking.wasteType}</td>
                                <td className="p-4">{getStatusChip(booking.status)}</td>
                                <td className="p-4 text-center">
                                    {booking.status === 'Scheduled' && (
                                        <button onClick={() => handleStatusChange(booking, 'Completed')} className="p-2 text-green-500 bg-green-500/10 hover:bg-green-500/20 rounded-full transition" title="Mark as Completed">
                                            <Check size={18} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {bookings.length === 0 && <p className="p-4 text-center text-text-light dark:text-text-dark">No bookings found.</p>}
            </div>
        </div>
    );
};

export default AdminBookingManagement;
