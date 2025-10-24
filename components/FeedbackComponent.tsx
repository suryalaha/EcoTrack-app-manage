import React, { useState } from 'react';
import { Star, Send, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { View, ViewType, Feedback } from '../types';

interface FeedbackComponentProps {
    setCurrentView: (view: View) => void;
}

const FeedbackComponent: React.FC<FeedbackComponentProps> = ({ setCurrentView }) => {
    const { user } = useAuth();
    const { addFeedback } = useData();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [feedbackText, setFeedbackText] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || (feedbackText.trim() === '' && rating === 0)) {
            return;
        }

        const newFeedback: Feedback = {
            id: `FB-${Date.now()}`,
            householdId: user.householdId,
            date: new Date(),
            feedbackText,
            rating,
        };

        addFeedback(newFeedback);
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <div className="text-center p-4 flex flex-col items-center justify-center h-full animate-scale-in">
                <CheckCircle className="w-20 h-20 text-primary mb-4" />
                <h2 className="text-3xl font-bold text-heading-light dark:text-heading-dark">Thank You!</h2>
                <p className="text-text-light dark:text-text-dark mt-2 mb-6 max-w-sm">Your feedback has been submitted successfully. We appreciate you taking the time to help us improve.</p>
                <button
                    onClick={() => setCurrentView(ViewType.Profile)}
                    className="w-full max-w-sm bg-gradient-to-r from-primary to-accent text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center text-lg shadow-lg hover:shadow-glow-primary transition-all transform hover:scale-105"
                >
                    Back to Profile
                </button>
            </div>
        );
    }

    return (
        <div className="animate-fade-in-up">
            <div className="flex items-center mb-4">
                <button onClick={() => setCurrentView(ViewType.Profile)} className="p-2 mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                    <ArrowLeft size={24} className="text-heading-light dark:text-heading-dark" />
                </button>
                <h2 className="text-2xl font-bold text-heading-light dark:text-heading-dark">Provide Feedback</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-md border border-border-light dark:border-border-dark space-y-6">
                <div>
                    <label className="block text-lg font-medium text-center text-text-light dark:text-text-dark mb-3">
                        How would you rate your experience?
                    </label>
                    <div className="flex justify-center space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                                className="p-1 transition-transform transform hover:scale-125"
                            >
                                <Star 
                                    size={40} 
                                    className={`
                                        ${(hoverRating || rating) >= star 
                                            ? 'text-yellow-400 fill-current' 
                                            : 'text-slate-300 dark:text-slate-600'
                                        }
                                    `}
                                />
                            </button>
                        ))}
                    </div>
                </div>
                
                <div>
                    <label htmlFor="feedbackText" className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
                        Any comments or suggestions? (Optional)
                    </label>
                    <textarea
                        id="feedbackText"
                        rows={5}
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        className="w-full p-3 border border-border-light dark:border-border-dark bg-background-light dark:bg-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Tell us what you loved or what we can improve..."
                    />
                </div>
                
                <button 
                    type="submit"
                    disabled={feedbackText.trim() === '' && rating === 0}
                    className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-3 rounded-lg flex items-center justify-center text-lg shadow-lg hover:shadow-glow-primary transition-all disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed"
                >
                    <Send className="mr-3" /> Submit Feedback
                </button>
            </form>
        </div>
    );
};

export default FeedbackComponent;