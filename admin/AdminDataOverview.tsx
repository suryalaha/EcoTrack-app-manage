import React from 'react';
import type { User, Payment, Complaint, Booking } from '../types';
import { Hourglass, Calendar, IndianRupee, UserCheck } from 'lucide-react';

interface AdminDataOverviewProps {
    users: User[];
    payments: Payment[];
    complaints: Complaint[];
    bookings: Booking[];
}

const getUserName = (householdId: string, users: User[]) => {
    return users.find(u => u.householdId === householdId)?.name || householdId;
}

const DataCard: React.FC<{ icon: React.ElementType, title: string, count: number, children: React.ReactNode, color: string }> = ({ icon: Icon, title, count, children, color }) => (
    <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-md border-t-4" style={{ borderColor: color }}>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-heading-light dark:text-heading-dark flex items-center">
                <Icon size={24} className="mr-3" style={{ color }} />
                {title}
            </h2>
            <span className="text-lg font-bold px-3 py-1 rounded-full text-white" style={{ backgroundColor: color }}>
                {count}
            </span>
        </div>
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {children}
        </div>
    </div>
);


const AdminDataOverview: React.FC<AdminDataOverviewProps> = ({ users, payments, complaints, bookings }) => {
    const pendingPayments = payments.filter(p => p.status === 'Pending Verification');
    const unresolvedComplaints = complaints.filter(c => c.status !== 'Resolved');
    const scheduledBookings = bookings.filter(b => b.status === 'Scheduled').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const recentPaidPayments = payments.filter(p => p.status === 'Paid').sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);
    const activeStaff = users.filter(u => (u.role === 'employee' || u.role === 'driver') && u.attendanceStatus === 'present');

    return (
        <div className="animate-fade-in-up">
            <h1 className="text-3xl font-bold text-heading-light dark:text-heading-dark mb-6">Data Overview</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                <DataCard icon={Hourglass} title="Pending Actions" count={pendingPayments.length + unresolvedComplaints.length} color="#f59e0b">
                    <div>
                        <h3 className="font-semibold text-md mb-2 text-heading-light dark:text-heading-dark">Pending Payment Verifications ({pendingPayments.length})</h3>
                        {pendingPayments.length > 0 ? (
                             <ul className="space-y-2 text-sm">
                                {pendingPayments.map(p => (
                                    <li key={p.id} className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-md flex justify-between">
                                        <span>{getUserName(p.householdId, users)}</span>
                                        <span className="font-bold text-amber-600 dark:text-amber-400">₹{p.amount.toFixed(2)}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-sm text-text-light dark:text-text-dark">No pending payments.</p>}
                    </div>
                     <div className="border-t border-border-light dark:border-border-dark my-4"></div>
                     <div>
                        <h3 className="font-semibold text-md mb-2 text-heading-light dark:text-heading-dark">Unresolved Complaints ({unresolvedComplaints.length})</h3>
                        {unresolvedComplaints.length > 0 ? (
                            <ul className="space-y-2 text-sm">
                                {unresolvedComplaints.map(c => (
                                    <li key={c.id} className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-md">
                                        <p className="font-medium">{c.issue}</p>
                                        <p className="text-xs text-slate-500">{getUserName(c.householdId, users)} - <span className="font-semibold">{c.status}</span></p>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-sm text-text-light dark:text-text-dark">No unresolved complaints.</p>}
                    </div>
                </DataCard>

                <DataCard icon={Calendar} title="Upcoming Special Collections" count={scheduledBookings.length} color="#3b82f6">
                    {scheduledBookings.length > 0 ? (
                        <ul className="space-y-2 text-sm">
                            {scheduledBookings.map(b => (
                                <li key={b.id} className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-md">
                                    <p className="font-medium">{new Date(b.date).toLocaleDateString(undefined, { timeZone: 'UTC', day: '2-digit', month: 'short', year: 'numeric' })} - {b.timeSlot}</p>
                                    <p className="text-xs text-slate-500">{getUserName(b.householdId, users)} - <span className="font-semibold">{b.wasteType}</span></p>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-sm text-text-light dark:text-text-dark">No upcoming bookings.</p>}
                </DataCard>

                <DataCard icon={IndianRupee} title="Recent Payments (Last 5)" count={recentPaidPayments.length} color="#22c55e">
                     {recentPaidPayments.length > 0 ? (
                        <ul className="space-y-2 text-sm">
                            {recentPaidPayments.map(p => (
                                <li key={p.id} className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-md flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">{getUserName(p.householdId, users)}</p>
                                        <p className="text-xs text-slate-500">{p.date.toLocaleDateString()}</p>
                                    </div>
                                    <span className="font-bold text-success">₹{p.amount.toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-sm text-text-light dark:text-text-dark">No recent payments.</p>}
                </DataCard>

                <DataCard icon={UserCheck} title="Active Staff Today" count={activeStaff.length} color="#8b5cf6">
                    {activeStaff.length > 0 ? (
                        <ul className="space-y-2 text-sm">
                            {activeStaff.map(s => (
                                <li key={s.householdId} className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-md flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">{s.name}</p>
                                        <p className="text-xs text-slate-500 capitalize">{s.role}</p>
                                    </div>
                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Logged in at {s.lastLoginTime?.toLocaleTimeString()}</span>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-sm text-text-light dark:text-text-dark">No staff members are currently active.</p>}
                </DataCard>

            </div>
        </div>
    );
};

export default AdminDataOverview;
