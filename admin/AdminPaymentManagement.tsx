import React, { useState, useMemo } from 'react';
import type { Payment } from '../types';
import { useData } from '../context/DataContext';
import { Eye, CheckCircle, XCircle, Clock, Search } from 'lucide-react';

const AdminPaymentManagement: React.FC = () => {
    const { payments, users, updatePayment } = useData();
    const [reviewingPayment, setReviewingPayment] = useState<Payment | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const getUserName = (householdId: string) => {
        return users.find(u => u.householdId === householdId)?.name || householdId;
    }

    const handleApprove = (payment: Payment) => {
        updatePayment({ ...payment, status: 'Paid' });
        setReviewingPayment(null);
    }
    
    const handleReject = (payment: Payment) => {
        // In a real app, you'd prompt for a reason
        updatePayment({ ...payment, status: 'Rejected', rejectionReason: 'Screenshot unclear or invalid.' });
        setReviewingPayment(null);
    }

    const getStatusChip = (status: Payment['status']) => {
        switch (status) {
            case 'Paid':
                return <span className="flex items-center text-xs font-semibold text-success bg-success/10 px-2 py-1 rounded-full"><CheckCircle size={14} className="mr-1.5"/>Paid</span>;
            case 'Pending Verification':
                return <span className="flex items-center text-xs font-semibold text-warning-dark dark:text-warning bg-warning/10 px-2 py-1 rounded-full"><Clock size={14} className="mr-1.5"/>Pending</span>;
            case 'Rejected':
                return <span className="flex items-center text-xs font-semibold text-red-600 bg-red-500/10 px-2 py-1 rounded-full"><XCircle size={14} className="mr-1.5"/>Rejected</span>;
        }
    }

    const processedPayments = useMemo(() => {
        const sorted = [...payments].sort((a, b) => {
            if (a.status === 'Pending Verification' && b.status !== 'Pending Verification') return -1;
            if (a.status !== 'Pending Verification' && b.status === 'Pending Verification') return 1;
            return b.date.getTime() - a.date.getTime();
        });

        if (!searchQuery) {
            return sorted;
        }

        return sorted.filter(payment =>
            getUserName(payment.householdId).toLowerCase().includes(searchQuery.toLowerCase()) ||
            payment.id.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [payments, searchQuery, users]);

    return (
        <div className="animate-fade-in-up">
            <h1 className="text-3xl font-bold text-heading-light dark:text-heading-dark mb-6">Payment Management</h1>
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by User Name or TXN ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-72 p-2 pl-10 border border-border-light dark:border-border-dark bg-card-light dark:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </div>
            <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-border-light dark:border-border-dark">
                        <tr>
                            <th className="p-4 font-semibold text-text-light dark:text-text-dark">Date</th>
                            <th className="p-4 font-semibold text-text-light dark:text-text-dark">User</th>
                            <th className="p-4 font-semibold text-text-light dark:text-text-dark text-right">Amount</th>
                            <th className="p-4 font-semibold text-text-light dark:text-text-dark">Status</th>
                            <th className="p-4 font-semibold text-text-light dark:text-text-dark text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {processedPayments.map((payment, index) => (
                             <tr key={payment.id} className={`border-b border-border-light dark:border-border-dark ${index % 2 === 0 ? 'bg-transparent' : 'bg-slate-50/50 dark:bg-slate-800/20'}`}>
                                <td className="p-4 text-text-light dark:text-text-dark">{payment.date.toLocaleDateString()}</td>
                                <td className="p-4 text-heading-light dark:text-heading-dark">{getUserName(payment.householdId)}</td>
                                <td className="p-4 font-bold text-primary text-right">₹{payment.amount.toFixed(2)}</td>
                                <td className="p-4">{getStatusChip(payment.status)}</td>
                                <td className="p-4 text-center">
                                    {payment.status === 'Pending Verification' && (
                                        <button onClick={() => setReviewingPayment(payment)} className="bg-primary/10 text-primary font-semibold py-1 px-3 rounded-full text-sm hover:bg-primary/20 transition">
                                            Review
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {processedPayments.length === 0 && <p className="p-6 text-center text-text-light dark:text-text-dark">No payments found matching your criteria.</p>}
            </div>

            {reviewingPayment && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-2xl w-full max-w-lg relative transform transition-all animate-scale-in">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-heading-light dark:text-heading-dark mb-4">Review Payment</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-semibold mb-2">Details</h4>
                                    <div className="space-y-2 text-sm">
                                        <p><strong>User:</strong> {getUserName(reviewingPayment.householdId)}</p>
                                        <p><strong>Date:</strong> {reviewingPayment.date.toLocaleString()}</p>
                                        <p><strong>Amount:</strong> ₹{reviewingPayment.amount.toFixed(2)}</p>
                                        <p><strong>Transaction ID:</strong> {reviewingPayment.id}</p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">Screenshot</h4>
                                    {reviewingPayment.screenshot ? (
                                        <a href={reviewingPayment.screenshot} target="_blank" rel="noopener noreferrer">
                                            <img src={reviewingPayment.screenshot} alt="Payment Screenshot" className="rounded-md border border-border-light dark:border-border-dark max-h-80 w-auto object-contain cursor-pointer"/>
                                        </a>
                                    ) : (
                                        <p className="text-sm text-slate-500">No screenshot uploaded.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 flex justify-end space-x-3 rounded-b-xl">
                            <button onClick={() => setReviewingPayment(null)} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 font-semibold">Cancel</button>
                            <button onClick={() => handleReject(reviewingPayment)} className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold flex items-center"><XCircle size={16} className="mr-2"/> Reject</button>
                            <button onClick={() => handleApprove(reviewingPayment)} className="px-4 py-2 bg-gradient-to-r from-green-500 to-primary text-white rounded-lg font-semibold flex items-center"><CheckCircle size={16} className="mr-2"/> Approve</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPaymentManagement;