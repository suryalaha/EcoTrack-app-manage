import React from 'react';
import { Megaphone, X } from 'lucide-react';

interface BroadcastModalProps {
    message: string;
    onDismiss: () => void;
}

const BroadcastModal: React.FC<BroadcastModalProps> = ({ message, onDismiss }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] p-4 animate-fade-in">
            <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-2xl w-full max-w-md relative transform transition-all animate-scale-in text-center overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-accent p-6 text-white">
                    <Megaphone size={40} className="mx-auto" />
                    <h3 className="text-2xl font-bold mt-3">A Message from EcoTrack</h3>
                </div>
                
                <button
                    onClick={onDismiss}
                    className="absolute top-2 right-2 p-2 text-white/70 hover:bg-black/20 rounded-full"
                    aria-label="Close Message"
                >
                    <X size={24} />
                </button>
                
                <div className="p-6">
                    <p className="text-lg text-text-light dark:text-text-dark whitespace-pre-wrap">{message}</p>
                </div>

                <div className="p-4 bg-slate-100 dark:bg-slate-800/50">
                     <button 
                        onClick={onDismiss}
                        className="w-full max-w-[200px] mx-auto bg-gradient-to-r from-secondary to-slate-700 dark:from-slate-600 dark:to-slate-800 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all"
                    >
                        Got it!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BroadcastModal;