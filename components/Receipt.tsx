import React from 'react';
import jsPDF from 'jspdf';
import { CheckCircle, Download, History } from 'lucide-react';

import type { Payment, View } from '../types';
import { ViewType } from '../types';
import { NGO_NAME, UPI_ID } from '../constants';

interface ReceiptProps {
    payment: Payment;
    setCurrentView: (view: View) => void;
}

const Receipt: React.FC<ReceiptProps> = ({ payment, setCurrentView }) => {
    
    const generatePDF = () => {
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

        doc.text("Payment To:", 20, 80);
        doc.text(NGO_NAME, 80, 80);

        doc.text("UPI ID:", 20, 90);
        doc.text(UPI_ID, 80, 90);

        doc.text("Status:", 20, 100);
        doc.setTextColor(34, 197, 94);
        doc.text("SUCCESSFUL", 80, 100);
        doc.setTextColor(0, 0, 0);

        doc.line(20, 110, 190, 110);
        doc.setFontSize(10);
        doc.text("This is a computer-generated receipt and does not require a signature.", 105, 120, { align: 'center' });

        doc.save(`Receipt-${payment.id}.pdf`);
    };

    return (
        <div className="text-center p-4 flex flex-col items-center justify-center h-full animate-scale-in">
            <div className="relative w-24 h-24 flex items-center justify-center mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full animate-pulse blur-lg opacity-50"></div>
                <CheckCircle className="w-20 h-20 text-white bg-green-500 rounded-full p-2 relative" />
            </div>
            <h2 className="text-3xl font-bold text-heading-light dark:text-heading-dark">Payment Successful!</h2>
            <p className="text-text-light dark:text-text-dark mt-2 mb-6">Thank you for your timely payment.</p>

            <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-md w-full max-w-sm text-left mb-8 border border-border-light dark:border-border-dark">
                <h3 className="font-bold text-lg mb-4 border-b pb-2 text-heading-light dark:text-heading-dark border-border-light dark:border-border-dark">Receipt Summary</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Transaction ID:</span>
                        <span className="font-mono text-xs text-text-light dark:text-text-dark">{payment.id}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Date:</span>
                        <span className="font-medium text-text-light dark:text-text-dark">{payment.date.toLocaleDateString()}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Time:</span>
                        <span className="font-medium text-text-light dark:text-text-dark">{payment.date.toLocaleTimeString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t mt-2 border-border-light dark:border-border-dark">
                        <span className="font-bold text-slate-600 dark:text-slate-300">Amount Paid:</span>
                        <span className="font-bold text-primary text-lg">₹{payment.amount.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="space-y-3 w-full max-w-sm">
                <button
                    onClick={generatePDF}
                    className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center text-lg shadow-lg hover:shadow-glow-primary transition-all transform hover:scale-105"
                >
                    <Download className="mr-3" /> Download Receipt
                </button>
                 <button
                    onClick={() => setCurrentView(ViewType.History)}
                    className="w-full bg-gradient-to-r from-secondary to-slate-700 dark:from-slate-600 dark:to-slate-800 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center text-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                >
                    <History className="mr-3" /> View All History
                </button>
            </div>
        </div>
    );
};

export default Receipt;