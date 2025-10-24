import React from 'react';
import type { Payment, User } from '../types';

interface AdminPaymentHistoryProps {
    payments: Payment[];
    users: User[];
}

const AdminPaymentHistory: React.FC<AdminPaymentHistoryProps> = ({ payments, users }) => {

    const getUserName = (householdId: string) => {
        return users.find(u => u.householdId === householdId)?.name || householdId;
    }

    return (
        <div className="animate-fade-in-up">
            <h1 className="text-3xl font-bold text-heading-light dark:text-heading-dark mb-6">All Payment History</h1>
            <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-md overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-border-light dark:border-border-dark">
                        <tr>
                            <th className="p-4 font-semibold text-text-light dark:text-text-dark">Transaction ID</th>
                            <th className="p-4 font-semibold text-text-light dark:text-text-dark">User</th>
                            <th className="p-4 font-semibold text-text-light dark:text-text-dark">Date</th>
                            <th className="p-4 font-semibold text-text-light dark:text-text-dark text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map((payment, index) => (
                             <tr key={payment.id} className={`border-b border-border-light dark:border-border-dark ${index % 2 === 0 ? 'bg-transparent' : 'bg-slate-50/50 dark:bg-slate-800/20'}`}>
                                <td className="p-4 text-text-light dark:text-text-dark font-mono text-xs">{payment.id}</td>
                                <td className="p-4 text-heading-light dark:text-heading-dark">{getUserName(payment.householdId)}</td>
                                <td className="p-4 text-text-light dark:text-text-dark">{payment.date.toLocaleString()}</td>
                                <td className="p-4 text-primary font-bold text-right">₹{payment.amount.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {payments.length === 0 && <p className="p-4 text-center text-text-light dark:text-text-dark">No payments found.</p>}
            </div>
        </div>
    );
};

export default AdminPaymentHistory;