import React from 'react';
import type { Payment } from '../types';
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import { NGO_NAME } from '../constants';

interface HistoryComponentProps {
  payments: Payment[];
}

const HistoryComponent: React.FC<HistoryComponentProps> = ({ payments }) => {
    
    const generatePDF = (payment: Payment) => {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text(`${NGO_NAME}`, 105, 20, { align: 'center' });
        doc.setFontSize(16);
        doc.text("Payment Receipt", 105, 30, { align: 'center' });
        doc.setLineWidth(0.5);
        doc.line(20, 35, 190, 35);
        doc.setFontSize(12);
        doc.text("Transaction ID:", 20, 50);
        doc.text(payment.id, 80, 50);
        doc.text("Date & Time:", 20, 60);
        doc.text(payment.date.toLocaleString(), 80, 60);
        doc.text("Amount Paid:", 20, 70);
        doc.setFont("helvetica", "bold");
        doc.text(`INR ${payment.amount.toFixed(2)}`, 80, 70);
        doc.setFont("helvetica", "normal");
        doc.text("Status:", 20, 80);
        doc.setTextColor(34, 197, 94);
        doc.text("SUCCESSFUL", 80, 80);
        doc.setTextColor(0, 0, 0);
        doc.line(20, 90, 190, 90);
        doc.save(`Receipt-${payment.id}.pdf`);
    };
    
    const getStatusInfo = (status: Payment['status']) => {
        switch(status) {
            case 'Paid':
                return { 
                    icon: <CheckCircle className="text-success" size={20}/>, 
                    borderColor: 'border-success',
                    textColor: 'text-success'
                };
            case 'Pending Verification':
                return { 
                    icon: <Clock className="text-warning" size={20}/>,
                    borderColor: 'border-warning',
                    textColor: 'text-warning'
                };
            case 'Rejected':
                return { 
                    icon: <XCircle className="text-red-500" size={20}/>,
                    borderColor: 'border-red-500',
                    textColor: 'text-red-500'
                };
            default:
                return {
                    icon: <Clock size={20}/>,
                    borderColor: 'border-slate-400',
                    textColor: 'text-slate-400'
                };
        }
    };

    return (
        <div className="animate-fade-in-up">
            <h2 className="text-2xl font-bold text-heading-light dark:text-heading-dark mb-4">Payment History</h2>
            {payments.length === 0 ? (
                <div className="text-center py-10">
                    <FileText className="mx-auto h-12 w-12 text-slate-400" />
                    <h3 className="mt-2 text-lg font-medium text-heading-light dark:text-heading-dark">No payments yet</h3>
                    <p className="mt-1 text-sm text-text-light dark:text-text-dark">Your payment history will appear here.</p>
                </div>
            ) : (
                <ul className="space-y-3">
                    {payments.map((payment, index) => {
                        const { icon, borderColor, textColor } = getStatusInfo(payment.status);
                        return (
                            <li 
                                key={payment.id} 
                                className={`bg-card-light dark:bg-card-dark p-4 rounded-lg shadow-md flex justify-between items-center border-l-4 ${borderColor} transition-all hover:shadow-lg animate-fade-in-up`}
                                style={{ animationDelay: `${index * 75}ms` }}
                            >
                                <div className="flex items-center space-x-4">
                                    {icon}
                                    <div>
                                        <p className={`font-bold text-lg ${textColor}`}>₹{payment.amount.toFixed(2)}</p>
                                        <p className="text-sm text-text-light dark:text-text-dark">{payment.date.toLocaleDateString()}</p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">{payment.status}</p>
                                    </div>
                                </div>
                                {payment.status === 'Paid' && (
                                     <button onClick={() => generatePDF(payment)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-primary rounded-full transition">
                                        <FileText size={24} />
                                    </button>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default HistoryComponent;