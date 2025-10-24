import React, { useState } from 'react';
import { ChevronDown, ArrowLeft } from 'lucide-react';
import { View, ViewType } from '../types';

interface HelpAndFaqProps {
    setCurrentView: (view: View) => void;
}

const faqContent = [
  {
    question: "How do I pay my monthly bill?",
    answer: "Navigate to the 'Pay' tab from the bottom navigation bar. You can pay using any UPI app or by scanning the QR code provided. After payment, you must upload a screenshot for verification.",
  },
  {
    question: "What should I do if my waste was not collected?",
    answer: "We're sorry for the inconvenience. Please file a complaint through the 'Profile' -> 'File a Complaint' section. Provide details like the date, and our team will look into it immediately.",
  },
  {
    question: "How can I book a special collection for bulk waste?",
    answer: "Go to the 'Book' tab. You can schedule a special pickup for event waste, bulk household items, or garden waste. Please note that additional charges may apply for these services.",
  },
    {
    question: "The tracking screen shows 'No active vehicle'. What does this mean?",
    answer: "This message appears when there is no collection vehicle currently operating in your designated area. The live tracking feature will automatically activate and show the driver's location as soon as they begin their route near you."
  },
  {
    question: "Why should I log my waste type every day?",
    answer: "Logging your daily waste helps us gather data to improve collection routes and promote better segregation habits. It also helps you track your household's waste patterns and avoid fines for improper segregation."
  },
  {
    question: "Can I be fined for not segregating waste?",
    answer: "Yes. To encourage proper waste segregation, a fine of ₹100 is automatically applied if 'Mixed Waste' is logged for three consecutive days. You can track your consecutive mixed waste logs on the Dashboard."
  },
  {
    question: "How can I update my profile information?",
    answer: "You can update your name, email, and profile picture in the 'Profile' section. Your household ID and identifier (mobile/email) cannot be changed through the app.",
  },
   {
    question: "How can I manage my notifications?",
    answer: "You have full control over your notifications. Go to the 'Profile' tab, find 'More Options', and tap on 'Notifications'. From there, you can toggle Push, Email, and SMS notifications on or off."
  },
  {
    question: "How is my login streak calculated?",
    answer: "Your login streak increases by one for each consecutive day you open the app. It's a fun way to stay engaged with your waste management responsibilities!",
  },
];

const HelpAndFaq: React.FC<HelpAndFaqProps> = ({ setCurrentView }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="animate-fade-in-up">
            <div className="flex items-center mb-4">
                <button onClick={() => setCurrentView(ViewType.Profile)} className="p-2 mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                    <ArrowLeft size={24} className="text-heading-light dark:text-heading-dark" />
                </button>
                <h2 className="text-2xl font-bold text-heading-light dark:text-heading-dark">Help & FAQ</h2>
            </div>
            
            <p className="text-text-light dark:text-text-dark mb-6">Find answers to common questions about the app and our services.</p>
            
            <div className="space-y-3">
                {faqContent.map((item, index) => (
                    <div 
                        key={index} 
                        className="bg-card-light dark:bg-card-dark rounded-lg shadow-md overflow-hidden border border-border-light dark:border-border-dark animate-fade-in-up"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <button 
                            onClick={() => toggleAccordion(index)}
                            className={`w-full flex justify-between items-center p-4 text-left font-semibold text-lg transition-colors duration-300 ${openIndex === index ? 'text-primary bg-primary/5 dark:bg-primary/10' : 'text-heading-light dark:text-heading-dark'}`}
                        >
                            <span className="pr-4">{item.question}</span>
                            <ChevronDown className={`transform transition-transform duration-300 flex-shrink-0 ${openIndex === index ? 'rotate-180' : ''}`} />
                        </button>
                        <div className={`transition-all duration-500 ease-in-out ${openIndex === index ? 'max-h-96' : 'max-h-0'}`}>
                            <div className="px-4 pb-4">
                                <p className="text-text-light dark:text-text-dark">{item.answer}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HelpAndFaq;