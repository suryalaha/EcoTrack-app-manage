import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface WarningModalProps {
    message: string;
    onAcknowledge: () => void;
}

const WarningModal: React.FC<WarningModalProps> = ({ message, onAcknowledge }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100] p-4 animate-fade-in">
            <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-2xl w-full max-w-md relative transform transition-all animate-scale-in text-center overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
                    <AlertTriangle size={40} className="mx-auto" />
                    <h3 className="text-2xl font-bold mt-3">An Important Message</h3>
                </div>
                
                <div className="p-6">
                    <p className="text-lg text-text-light dark:text-text-dark whitespace-pre-wrap">{message}</p>
                </div>

                <div className="p-4 bg-slate-100 dark:bg-slate-800/50">
                     <button 
                        onClick={onAcknowledge}
                        className="w-full max-w-[200px] mx-auto bg-gradient-to-r from-secondary to-slate-700 dark:from-slate-600 dark:to-slate-800 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all"
                    >
                        I Understand
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WarningModal;