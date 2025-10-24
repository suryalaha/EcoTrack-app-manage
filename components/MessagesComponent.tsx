import React, { useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Inbox, MessageSquareText } from 'lucide-react';

const MessagesComponent: React.FC = () => {
    const { user } = useAuth();
    const { messages, markMessagesAsRead } = useData();

    useEffect(() => {
        if (user) {
            markMessagesAsRead(user.householdId);
        }
        // This effect should run only when the user changes,
        // to mark messages as read upon entering the component.
        // Adding markMessagesAsRead to dependency array for correctness.
    }, [user, markMessagesAsRead]);
    
    if (!user) return null;
    
    const userMessages = messages
        .filter(msg => msg.recipientId === user.householdId)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return (
        <div className="animate-fade-in-up">
            <h2 className="text-2xl font-bold text-heading-light dark:text-heading-dark mb-4">Your Inbox</h2>
            {userMessages.length === 0 ? (
                <div className="text-center py-10 bg-card-light dark:bg-card-dark rounded-lg shadow-sm border border-border-light dark:border-border-dark">
                    <Inbox className="mx-auto h-12 w-12 text-slate-400" />
                    <h3 className="mt-2 text-lg font-medium text-heading-light dark:text-heading-dark">No messages yet</h3>
                    <p className="mt-1 text-sm text-text-light dark:text-text-dark">Messages from the admin will appear here.</p>
                </div>
            ) : (
                <ul className="space-y-4">
                    {userMessages.map((msg, index) => (
                        <li 
                            key={msg.id} 
                            className="bg-card-light dark:bg-card-dark p-4 rounded-lg shadow-md border-l-4 border-primary transition-all hover:shadow-lg animate-fade-in-up"
                            style={{ animationDelay: `${index * 75}ms` }}
                        >
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 bg-primary/10 p-2 rounded-full mt-1">
                                    <MessageSquareText className="text-primary" size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-text-light dark:text-text-dark whitespace-pre-wrap">{msg.text}</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 text-right">
                                        {msg.timestamp.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default MessagesComponent;
